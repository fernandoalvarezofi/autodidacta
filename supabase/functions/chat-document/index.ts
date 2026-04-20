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
  "where","this","that","these","those","it","its"
]);

function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics
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
  const qTokens = new Set(tokenize(question));
  if (qTokens.size === 0) {
    // No useful keywords — return first chunks as fallback
    return chunks.slice(0, 5).map((c) => ({ chunk: c, score: 0 }));
  }
  return chunks
    .map((chunk) => {
      const tokens = tokenize(chunk.content);
      let hits = 0;
      for (const t of tokens) if (qTokens.has(t)) hits += 1;
      // Normalize a bit by chunk length to avoid bias toward huge chunks
      const score = hits / Math.max(1, Math.sqrt(tokens.length));
      return { chunk, score };
    })
    .filter((r) => r.score > 0)
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

    // RLS guarantees the user can only read their own chunks
    const { data: chunks, error: chunkErr } = await supabase
      .from("document_chunks")
      .select("id, content, chunk_index, page_number")
      .eq("document_id", documentId)
      .order("chunk_index", { ascending: true })
      .limit(200);

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

    const ranked = scoreChunks(question, chunks as ChunkRow[]).slice(0, 5);
    const context = ranked
      .map(
        (r, i) =>
          `[Fragmento ${i + 1}${r.chunk.page_number ? ` · pág. ${r.chunk.page_number}` : ""}]\n${r.chunk.content}`,
      )
      .join("\n\n---\n\n");

    const messages: any[] = [
      {
        role: "system",
        content: `Sos un tutor experto que responde preguntas SOLO con información del documento del estudiante. Reglas:
- Respondé en español rioplatense, claro y conciso.
- Si la respuesta no está en los fragmentos, decí: "No encuentro eso en el documento" y sugerí qué buscar.
- Citá los fragmentos relevantes así: (Fragmento 2).
- No inventes datos, fechas ni cifras.
- Máximo 250 palabras.`,
      },
      ...history.slice(-6).map((m) => ({ role: m.role, content: m.content })),
      {
        role: "user",
        content: `Fragmentos del documento:\n\n${context}\n\n---\n\nPregunta: ${question}`,
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

    if (!aiRes.ok) {
      const t = await aiRes.text();
      throw new Error(`AI Gateway ${aiRes.status}: ${t}`);
    }

    const aiData = await aiRes.json();
    const answer = aiData.choices?.[0]?.message?.content ?? "Sin respuesta.";

    return new Response(
      JSON.stringify({
        answer,
        sources: ranked.map((r, i) => ({
          index: i + 1,
          page: r.chunk.page_number,
          excerpt: r.chunk.content.slice(0, 220),
        })),
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
