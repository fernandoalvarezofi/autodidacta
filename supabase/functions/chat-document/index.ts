// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface RequestBody {
  documentId: string;
  question: string;
  history?: ChatMessage[];
}

const STOPWORDS = new Set([
  "el","la","los","las","un","una","unos","unas","de","del","y","o","u","en","a","al","que","qué",
  "como","cómo","es","son","ser","por","para","con","sin","sobre","entre","cuando","cuándo","donde",
  "dónde","muy","más","menos","pero","si","no","se","lo","le","les","mi","tu","su","sus","mis","tus",
  "the","a","an","of","and","or","in","on","to","for","with","is","are","be","what","how","why","when",
  "where","this","that","these","those","it","its","puedo","puede","podes","podés","podrías","quiero",
  "necesito","explicame","explícame","decime","contame","hace","hacé","dame"
]);

function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
}

interface ChunkRow {
  id: string;
  content: string;
  chunk_index: number;
  page_number: number | null;
}

function scoreChunks(question: string, chunks: ChunkRow[]): { chunk: ChunkRow; score: number }[] {
  const qTokens = tokenize(question);
  const qSet = new Set(qTokens);
  // Bigrams para frases cortas
  const qBigrams = new Set<string>();
  for (let i = 0; i < qTokens.length - 1; i++) qBigrams.add(`${qTokens[i]} ${qTokens[i + 1]}`);

  return chunks
    .map((chunk) => {
      const tokens = tokenize(chunk.content);
      const tokenSet = new Set(tokens);
      let hits = 0;
      for (const t of qSet) if (tokenSet.has(t)) hits += 1;

      // Bonus por bigramas
      const lower = chunk.content.toLowerCase();
      let bigramBonus = 0;
      for (const bg of qBigrams) if (lower.includes(bg)) bigramBonus += 1;

      const score =
        (hits + bigramBonus * 2) / Math.max(1, Math.sqrt(tokens.length));
      return { chunk, score };
    })
    .sort((a, b) => b.score - a.score);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) throw new Error("No autenticado");

    const { documentId, question, history = [] } = (await req.json()) as RequestBody;
    if (!documentId || !question) throw new Error("documentId y question requeridos");

    // Get document title for general context
    const { data: docMeta } = await supabase
      .from("documents")
      .select("title")
      .eq("id", documentId)
      .maybeSingle();
    const docTitle = docMeta?.title ?? "el documento";

    const { data: chunks, error: chunkErr } = await supabase
      .from("document_chunks")
      .select("id, content, chunk_index, page_number")
      .eq("document_id", documentId)
      .order("chunk_index", { ascending: true })
      .limit(300);

    if (chunkErr) throw new Error(`Chunks: ${chunkErr.message}`);
    if (!chunks || chunks.length === 0) {
      return new Response(
        JSON.stringify({
          answer:
            "Todavía no puedo responder porque este documento no tiene contenido procesado. Reintentalo desde el cuaderno.",
          sources: [],
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Always pick top N — keep some context even if score is 0
    const ranked = scoreChunks(question, chunks as ChunkRow[]);
    const top = ranked.slice(0, 6);
    const hasGoodHits = top.some((r) => r.score >= 0.3);

    const context = top
      .map(
        (r, i) =>
          `[Fragmento ${i + 1}${r.chunk.page_number ? ` · pág. ${r.chunk.page_number}` : ""}]\n${r.chunk.content}`,
      )
      .join("\n\n---\n\n");

    const messages: any[] = [
      {
        role: "system",
        content: `Sos un tutor experto que ayuda a un estudiante a entender el documento "${docTitle}". Tu objetivo es enseñar, no solo citar.

REGLAS DE RESPUESTA:
1. Si los fragmentos cubren la pregunta → respondé basándote en ellos y citá así: (Fragmento 2). Empezá con la respuesta directa, después contextualizá.
2. Si los fragmentos cubren parcialmente → mezclá: usá lo que está en el documento + completá con conocimiento general del tema. Marcá claramente qué viene de cada lado:
   - "Según el documento: …" / "(Fragmento N)"
   - "Como contexto adicional (no está en el documento): …"
3. Si los fragmentos no cubren la pregunta pero está relacionada con el tema del documento → respondé con conocimiento general, aclarando "Esto no está en el documento, pero como contexto general te cuento…".
4. Si la pregunta no tiene NADA que ver con el tema, decí amablemente que está fuera de alcance.
5. Sinónimos y reformulaciones cuentan: si el usuario pregunta con otras palabras, encontrá el concepto equivalente.

ESTILO:
- Español rioplatense, conversacional pero claro.
- Usá ejemplos, analogías, listas cuando ayuden.
- No inventes datos específicos (fechas, cifras, nombres) que no estén en el documento. Si no los tenés, decilo.
- Máximo 280 palabras.
- Usá markdown ligero (**negrita**, listas con -, no headings).`,
      },
      ...history.slice(-6).map((m) => ({ role: m.role, content: m.content })),
      {
        role: "user",
        content: hasGoodHits
          ? `Fragmentos relevantes del documento:\n\n${context}\n\n---\n\nPregunta: ${question}`
          : `Fragmentos del documento (puede que no cubran exactamente la pregunta):\n\n${context}\n\n---\n\nPregunta: ${question}\n\nSi no está en los fragmentos, igual ayudame con conocimiento general del tema, marcando claramente que es contexto adicional.`,
      },
    ];

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model: "google/gemini-2.5-flash", messages }),
    });

    if (aiRes.status === 429) {
      return new Response(
        JSON.stringify({ error: "Demasiadas consultas seguidas. Probá en un minuto." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (aiRes.status === 402) {
      return new Response(
        JSON.stringify({ error: "Se agotaron los créditos del workspace de IA." }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (!aiRes.ok) {
      const t = await aiRes.text();
      throw new Error(`AI Gateway ${aiRes.status}: ${t}`);
    }

    const aiData = await aiRes.json();
    const answer = aiData.choices?.[0]?.message?.content ?? "Sin respuesta.";

    return new Response(
      JSON.stringify({
        answer,
        sources: top
          .filter((r) => r.score > 0)
          .map((r, i) => ({
            index: i + 1,
            page: r.chunk.page_number,
            excerpt: r.chunk.content.slice(0, 220),
          })),
        usedGeneralKnowledge: !hasGoodHits,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[chat-document] Error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
