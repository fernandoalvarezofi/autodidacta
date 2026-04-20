// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
  documentId: string;
}

interface DocumentRow {
  id: string;
  user_id: string;
  notebook_id: string;
  type: "pdf" | "docx" | "text" | "youtube" | "audio" | "image" | "tiktok";
  storage_path: string | null;
  // For youtube/url-based docs we stash the URL in storage_path
}

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

// @ts-ignore - EdgeRuntime is available in Deno Deploy
declare const EdgeRuntime: { waitUntil: (p: Promise<unknown>) => void };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = (await req.json()) as RequestBody;
    const documentId = body.documentId;
    if (!documentId) throw new Error("documentId requerido");

    console.log(`[process-document] Encolando ${documentId}`);

    // Offload heavy work so we return immediately and avoid CPU time limit
    EdgeRuntime.waitUntil(processDocument(documentId));

    return new Response(JSON.stringify({ ok: true, queued: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[process-document] Error inicial:", message);
    return new Response(JSON.stringify({ ok: false, error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function processDocument(documentId: string) {
  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    console.log(`[process-document] Iniciando ${documentId}`);

    const { data: doc, error: docErr } = await admin
      .from("documents")
      .select("*")
      .eq("id", documentId)
      .single();
    if (docErr || !doc) throw new Error(`Documento no encontrado: ${docErr?.message}`);

    await admin.from("documents").update({ status: "processing", progress: 10 }).eq("id", documentId);

    // === Extract text by document type ===
    const fullText = await extractByType(admin, doc as DocumentRow);
    if (!fullText || fullText.trim().length < 50) {
      throw new Error("No se pudo extraer suficiente texto del documento");
    }

    await admin.from("documents").update({ progress: 35 }).eq("id", documentId);

    // Cap total text to avoid CPU blowup on huge PDFs (keep first ~80k chars for chunks)
    const text = fullText.slice(0, 80000);
    console.log(`[process-document] Texto extraído: ${fullText.length} chars (usando ${text.length})`);

    await admin.from("documents").update({ progress: 45 }).eq("id", documentId);

    // Chunk (limit number of chunks)
    const chunks = chunkText(text, 1500).slice(0, 50);
    const chunkRows = chunks.map((content, idx) => ({
      document_id: documentId,
      user_id: doc.user_id,
      chunk_index: idx,
      content,
    }));
    const { error: chunkErr } = await admin.from("document_chunks").insert(chunkRows);
    if (chunkErr) throw new Error(`Insert chunks: ${chunkErr.message}`);

    await admin
      .from("documents")
      .update({ status: "chunked", progress: 60 })
      .eq("id", documentId);

    // Truncate input for AI (first ~12k chars)
    const aiInput = text.slice(0, 12000);

    await admin.from("documents").update({ status: "generating", progress: 75 }).eq("id", documentId);

    // Necesitamos los chunk_ids reales para anclar los nodos del mindmap
    const { data: chunkRowsWithIds } = await admin
      .from("document_chunks")
      .select("id, chunk_index, content")
      .eq("document_id", documentId)
      .order("chunk_index", { ascending: true });

    const chunkRefs = (chunkRowsWithIds ?? []).map((c) => ({
      id: c.id as string,
      index: c.chunk_index as number,
      preview: String(c.content).slice(0, 200),
    }));

    const [summaryRes, flashcardsRes, quizRes, mindmapRes] = await Promise.allSettled([
      generateSummary(aiInput),
      generateFlashcards(aiInput),
      generateQuiz(aiInput),
      generateMindmap(aiInput, chunkRefs),
    ]);

    if (summaryRes.status === "fulfilled" && summaryRes.value) {
      await admin.from("document_outputs").insert({
        document_id: documentId,
        user_id: doc.user_id,
        type: "summary",
        content: { markdown: summaryRes.value },
      });
    } else if (summaryRes.status === "rejected") {
      console.error("Summary failed:", summaryRes.reason);
    }

    if (flashcardsRes.status === "fulfilled" && flashcardsRes.value.length > 0) {
      const cards = flashcardsRes.value;
      await admin.from("document_outputs").insert({
        document_id: documentId,
        user_id: doc.user_id,
        type: "flashcards",
        content: cards,
      });
      await admin.from("flashcards").insert(
        cards.map((c) => ({
          user_id: doc.user_id,
          notebook_id: doc.notebook_id,
          document_id: documentId,
          front: c.front,
          back: c.back,
          difficulty: c.difficulty ?? 2,
        })),
      );
    } else if (flashcardsRes.status === "rejected") {
      console.error("Flashcards failed:", flashcardsRes.reason);
    }

    if (quizRes.status === "fulfilled" && quizRes.value.length > 0) {
      await admin.from("document_outputs").insert({
        document_id: documentId,
        user_id: doc.user_id,
        type: "quiz",
        content: quizRes.value,
      });
    } else if (quizRes.status === "rejected") {
      console.error("Quiz failed:", quizRes.reason);
    }

    if (mindmapRes.status === "fulfilled" && mindmapRes.value && mindmapRes.value.nodes.length >= 3) {
      await admin.from("document_outputs").insert({
        document_id: documentId,
        user_id: doc.user_id,
        type: "mindmap",
        content: mindmapRes.value,
      });
    } else if (mindmapRes.status === "rejected") {
      console.error("Mindmap failed:", mindmapRes.reason);
    }

    await admin
      .from("documents")
      .update({ status: "ready", progress: 100, error_message: null })
      .eq("id", documentId);

    console.log(`[process-document] OK ${documentId}`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[process-document] Error:", message);
    await admin
      .from("documents")
      .update({ status: "error", error_message: message })
      .eq("id", documentId);
  }
}

// =====================================================
// Dispatcher por tipo de documento
// =====================================================
async function extractByType(admin: any, doc: DocumentRow): Promise<string> {
  switch (doc.type) {
    case "pdf": {
      if (!doc.storage_path) throw new Error("PDF sin storage_path");
      const { data: blob, error } = await admin.storage.from("documents").download(doc.storage_path);
      if (error || !blob) throw new Error(`Descarga PDF fallida: ${error?.message}`);
      return await extractPdfText(blob);
    }
    case "docx": {
      if (!doc.storage_path) throw new Error("DOCX sin storage_path");
      const { data: blob, error } = await admin.storage.from("documents").download(doc.storage_path);
      if (error || !blob) throw new Error(`Descarga DOCX fallida: ${error?.message}`);
      return await extractDocxText(blob);
    }
    case "text": {
      if (!doc.storage_path) throw new Error("TXT sin storage_path");
      const { data: blob, error } = await admin.storage.from("documents").download(doc.storage_path);
      if (error || !blob) throw new Error(`Descarga TXT fallida: ${error?.message}`);
      return await blob.text();
    }
    case "youtube": {
      // Para youtube, guardamos la URL en storage_path (sin upload a Storage)
      const url = doc.storage_path ?? "";
      if (!url) throw new Error("URL de YouTube vacía");
      return await extractYoutubeTranscript(url);
    }
    default:
      throw new Error(`Tipo de documento no soportado todavía: ${doc.type}`);
  }
}

// =====================================================
// PDF text extraction (using unpdf - works in Deno)
// =====================================================
async function extractPdfText(blob: Blob): Promise<string> {
  const { extractText, getDocumentProxy } = await import("https://esm.sh/unpdf@0.12.1");
  const buffer = new Uint8Array(await blob.arrayBuffer());
  const pdf = await getDocumentProxy(buffer);
  const totalPages = pdf.numPages ?? 0;
  const MAX_PAGES = 30;
  const pagesToExtract = Math.min(totalPages, MAX_PAGES);
  console.log(`[extractPdfText] PDF tiene ${totalPages} páginas, extrayendo ${pagesToExtract}`);

  const parts: string[] = [];
  for (let i = 1; i <= pagesToExtract; i++) {
    try {
      const { text } = await extractText(pdf, { mergePages: false, page: i } as any);
      const pageText = Array.isArray(text) ? text.join(" ") : String(text);
      parts.push(pageText);
      if (parts.join("\n\n").length > 100000) {
        console.log(`[extractPdfText] Cap de 100k chars alcanzado en página ${i}`);
        break;
      }
    } catch (e) {
      console.error(`[extractPdfText] Error página ${i}:`, e);
    }
  }
  return parts.join("\n\n");
}

// =====================================================
// DOCX text extraction (mammoth via esm.sh)
// =====================================================
async function extractDocxText(blob: Blob): Promise<string> {
  const mammoth: any = await import("https://esm.sh/mammoth@1.8.0?bundle");
  const buffer = await blob.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer: buffer });
  console.log(`[extractDocxText] Extraído ${result.value.length} chars`);
  return result.value;
}

// =====================================================
// YouTube transcript extraction
// Usa youtubetotranscript.com (sin API key, sin subprocess)
// =====================================================
async function extractYoutubeTranscript(url: string): Promise<string> {
  const videoId = parseYoutubeId(url);
  if (!videoId) throw new Error("URL de YouTube inválida");
  console.log(`[extractYoutubeTranscript] Video ID: ${videoId}`);

  const langs = ["es", "en", ""];
  let lastError = "";
  for (const lang of langs) {
    try {
      const apiUrl = `https://youtubetotranscript.com/transcript?v=${videoId}${lang ? `&lang=${lang}` : ""}`;
      const res = await fetch(apiUrl, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; Autodidactas/1.0)" },
      });
      if (!res.ok) {
        lastError = `HTTP ${res.status}`;
        continue;
      }
      const html = await res.text();
      const matches = [
        ...html.matchAll(/<span[^>]*class="[^"]*transcript-segment[^"]*"[^>]*>([\s\S]*?)<\/span>/gi),
      ];
      const text = matches
        .map((m) =>
          m[1]
            .replace(/<[^>]+>/g, "")
            .replace(/&amp;/g, "&")
            .replace(/&#39;/g, "'")
            .replace(/&quot;/g, '"')
            .trim(),
        )
        .filter(Boolean)
        .join(" ");
      if (text.length > 200) {
        console.log(`[extractYoutubeTranscript] Lang=${lang || "auto"} OK, ${text.length} chars`);
        return text;
      }
      lastError = "Transcript vacío";
    } catch (e) {
      lastError = e instanceof Error ? e.message : String(e);
    }
  }
  throw new Error(
    `No se pudo obtener el transcript de YouTube (${lastError}). El video debe tener subtítulos disponibles.`,
  );
}

function parseYoutubeId(url: string): string | null {
  const m = url.match(
    /(?:youtube\.com\/watch\?(?:.*&)?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  );
  return m ? m[1] : null;
}

// =====================================================
// Chunking
// =====================================================
function chunkText(text: string, maxChars: number): string[] {
  const clean = text.replace(/\s+/g, " ").trim();
  const chunks: string[] = [];
  const sentences = clean.split(/(?<=[.!?])\s+/);
  let buf = "";
  for (const s of sentences) {
    if ((buf + " " + s).length > maxChars && buf.length > 0) {
      chunks.push(buf.trim());
      buf = s;
    } else {
      buf += " " + s;
    }
  }
  if (buf.trim()) chunks.push(buf.trim());
  return chunks;
}

// =====================================================
// AI calls via Lovable AI Gateway
// =====================================================
async function callAi(messages: any[], tools?: any[]): Promise<any> {
  const body: any = {
    model: "google/gemini-2.5-flash",
    messages,
  };
  if (tools) {
    body.tools = tools;
    body.tool_choice = { type: "function", function: { name: tools[0].function.name } };
  }

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`AI Gateway ${res.status}: ${t}`);
  }
  return await res.json();
}

async function generateSummary(text: string): Promise<string> {
  const data = await callAi([
    {
      role: "system",
      content: `Sos un asistente académico experto. Generás resúmenes editoriales en español rioplatense, con tono profesional y claro. Formato Markdown estricto:
- Usá ## para secciones principales (máx 5)
- Usá ### para subsecciones cuando aporten claridad
- Resaltá conceptos clave con **negrita**
- Usá > para citas o ideas centrales
- Listas con - cuando corresponda
- Máximo 700 palabras
- Empezá directo con el primer ##, sin introducciones meta`,
    },
    {
      role: "user",
      content: `Generá un resumen estructurado de este texto:\n\n${text}`,
    },
  ]);
  return data.choices?.[0]?.message?.content ?? "";
}

interface FlashcardOut {
  front: string;
  back: string;
  difficulty: 1 | 2 | 3;
}

async function generateFlashcards(text: string): Promise<FlashcardOut[]> {
  const data = await callAi([
    {
      role: "system",
      content: `Sos un experto en aprendizaje activo. Creás flashcards efectivas en español rioplatense. Respondé SOLO JSON válido con este formato exacto:
{
  "cards": [
    { "front": "¿Pregunta?", "back": "Respuesta breve", "difficulty": 2 }
  ]
}
Reglas:
- Generá entre 10 y 15 cards
- front: string corto y específico
- back: string preciso y breve
- difficulty: 1, 2 o 3
- Sin markdown
- Sin texto extra fuera del JSON`,
    },
    {
      role: "user",
      content: `Texto fuente:\n\n${text}`,
    },
  ]);

  const raw = data.choices?.[0]?.message?.content ?? "{}";

  try {
    const parsed = JSON.parse(extractJson(raw));
    const cards = Array.isArray(parsed?.cards) ? parsed.cards : [];
    return cards
      .filter((card: any) => typeof card?.front === "string" && typeof card?.back === "string")
      .map((card: any) => ({
        front: String(card.front).slice(0, 200),
        back: String(card.back).slice(0, 350),
        difficulty: card.difficulty === 1 || card.difficulty === 3 ? card.difficulty : 2,
      }))
      .slice(0, 15);
  } catch (error) {
    console.error("[generateFlashcards] JSON inválido:", raw, error);
    return [];
  }
}

// Strips markdown code fences and extracts the first JSON object/array.
function extractJson(raw: string): string {
  let s = raw.trim();
  // Remove ```json ... ``` or ``` ... ``` wrappers
  s = s.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
  // Fallback: slice between first { or [ and last } or ]
  const firstBrace = s.indexOf("{");
  const firstBracket = s.indexOf("[");
  let start = -1;
  if (firstBrace === -1) start = firstBracket;
  else if (firstBracket === -1) start = firstBrace;
  else start = Math.min(firstBrace, firstBracket);
  if (start > 0) s = s.slice(start);
  const lastBrace = s.lastIndexOf("}");
  const lastBracket = s.lastIndexOf("]");
  const end = Math.max(lastBrace, lastBracket);
  if (end >= 0 && end < s.length - 1) s = s.slice(0, end + 1);
  return s;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

async function generateQuiz(text: string): Promise<QuizQuestion[]> {
  const data = await callAi([
    {
      role: "system",
      content: `Sos un docente experto creando quizzes de opción múltiple en español rioplatense. Respondé SOLO JSON válido con este formato exacto:
{
  "questions": [
    {
      "question": "¿Pregunta clara?",
      "options": ["Opción A", "Opción B", "Opción C", "Opción D"],
      "correct_index": 0,
      "explanation": "Por qué esta es la correcta, breve."
    }
  ]
}
Reglas:
- Generá entre 6 y 10 preguntas
- Exactamente 4 opciones por pregunta
- correct_index: número entre 0 y 3
- Distractores plausibles, no obvios
- explanation: 1-2 oraciones
- Sin markdown, sin texto fuera del JSON`,
    },
    {
      role: "user",
      content: `Texto fuente:\n\n${text}`,
    },
  ]);

  const raw = data.choices?.[0]?.message?.content ?? "{}";
  try {
    const parsed = JSON.parse(extractJson(raw));
    const qs = Array.isArray(parsed?.questions) ? parsed.questions : [];
    return qs
      .filter(
        (q: any) =>
          typeof q?.question === "string" &&
          Array.isArray(q?.options) &&
          q.options.length === 4 &&
          typeof q?.correct_index === "number" &&
          q.correct_index >= 0 &&
          q.correct_index <= 3,
      )
      .map((q: any) => ({
        question: String(q.question).slice(0, 300),
        options: q.options.slice(0, 4).map((o: any) => String(o).slice(0, 200)),
        correct_index: q.correct_index,
        explanation: String(q.explanation ?? "").slice(0, 400),
      }))
      .slice(0, 10);
  } catch (error) {
    console.error("[generateQuiz] JSON inválido:", raw, error);
    return [];
  }
}
