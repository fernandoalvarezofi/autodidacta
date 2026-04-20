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
  notebookId: string;
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
  document_id: string;
}

interface DocMeta {
  id: string;
  title: string;
}

function scoreChunks(
  question: string,
  chunks: ChunkRow[],
): { chunk: ChunkRow; score: number }[] {
  const qTokens = new Set(tokenize(question));
  if (qTokens.size === 0) return chunks.slice(0, 6).map((c) => ({ chunk: c, score: 0 }));
  return chunks
    .map((chunk) => {
      const tokens = tokenize(chunk.content);
      let hits = 0;
      for (const t of tokens) if (qTokens.has(t)) hits += 1;
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

    const { notebookId, question, history = [] } = (await req.json()) as RequestBody;
    if (!notebookId || !question) throw new Error("notebookId y question requeridos");

    // 1. Get all ready documents in this notebook
    const { data: docs, error: docsErr } = await supabase
      .from("documents")
      .select("id, title")
      .eq("notebook_id", notebookId)
      .eq("status", "ready");

    if (docsErr) throw new Error(`Documents: ${docsErr.message}`);
    if (!docs || docs.length === 0) {
      return new Response(
        JSON.stringify({
          answer:
            "Este cuaderno todavía no tiene documentos procesados. Subí un PDF y esperá a que termine de procesarse.",
          sources: [],
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const docIds = (docs as DocMeta[]).map((d) => d.id);
    const docMap = new Map<string, string>(
      (docs as DocMeta[]).map((d) => [d.id, d.title]),
    );

    // 2. Pull chunks across all docs (capped to keep memory bounded)
    const { data: chunks, error: chunkErr } = await supabase
      .from("document_chunks")
      .select("id, content, chunk_index, page_number, document_id")
      .in("document_id", docIds)
      .limit(500);

    if (chunkErr) throw new Error(`Chunks: ${chunkErr.message}`);
    if (!chunks || chunks.length === 0) {
      return new Response(
        JSON.stringify({
          answer: "No encuentro contenido procesado en este cuaderno todavía.",
          sources: [],
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const ranked = scoreChunks(question, chunks as ChunkRow[]).slice(0, 6);
    const context = ranked
      .map((r, i) => {
        const title = docMap.get(r.chunk.document_id) ?? "Documento";
        const page = r.chunk.page_number ? ` · pág. ${r.chunk.page_number}` : "";
        return `[Fragmento ${i + 1} · "${title}"${page}]\n${r.chunk.content}`;
      })
      .join("\n\n---\n\n");

    const messages: any[] = [
      {
        role: "system",
        content: `Sos un tutor experto que responde preguntas SOLO con información de los documentos del cuaderno del estudiante. Reglas:
- Respondé en español rioplatense, claro y conciso.
- Si la respuesta no está en los fragmentos, decí: "No encuentro eso en el cuaderno" y sugerí qué buscar o subir.
- Cuando la información venga de varios documentos, indicá de cuál proviene cada idea.
- Citá los fragmentos relevantes así: (Fragmento 2).
- No inventes datos, fechas ni cifras.
- Máximo 280 palabras.`,
      },
      ...history.slice(-6).map((m) => ({ role: m.role, content: m.content })),
      {
        role: "user",
        content: `Fragmentos del cuaderno (${docs.length} documento${docs.length === 1 ? "" : "s"}):\n\n${context}\n\n---\n\nPregunta: ${question}`,
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
        sources: ranked.map((r, i) => ({
          index: i + 1,
          page: r.chunk.page_number,
          documentId: r.chunk.document_id,
          documentTitle: docMap.get(r.chunk.document_id) ?? "Documento",
          excerpt: r.chunk.content.slice(0, 220),
        })),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[chat-notebook] Error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
