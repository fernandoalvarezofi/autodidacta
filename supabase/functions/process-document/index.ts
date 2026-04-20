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

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  let documentId = "";

  try {
    const body = (await req.json()) as RequestBody;
    documentId = body.documentId;
    if (!documentId) throw new Error("documentId requerido");

    console.log(`[process-document] Iniciando ${documentId}`);

    // Fetch document
    const { data: doc, error: docErr } = await admin
      .from("documents")
      .select("*")
      .eq("id", documentId)
      .single();
    if (docErr || !doc) throw new Error(`Documento no encontrado: ${docErr?.message}`);

    await admin.from("documents").update({ status: "processing", progress: 10 }).eq("id", documentId);

    // Download file
    const { data: fileBlob, error: dlErr } = await admin.storage
      .from("documents")
      .download(doc.storage_path);
    if (dlErr || !fileBlob) throw new Error(`Descarga fallida: ${dlErr?.message}`);

    await admin.from("documents").update({ progress: 25 }).eq("id", documentId);

    // Extract text from PDF
    const text = await extractPdfText(fileBlob);
    if (!text || text.trim().length < 50) {
      throw new Error("No se pudo extraer suficiente texto del PDF");
    }

    console.log(`[process-document] Texto extraído: ${text.length} chars`);
    await admin.from("documents").update({ progress: 45 }).eq("id", documentId);

    // Chunk
    const chunks = chunkText(text, 1500);
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

    // Truncate input for AI (use first ~12k chars to stay safe)
    const aiInput = text.slice(0, 12000);

    // Generate summary + flashcards in parallel
    await admin.from("documents").update({ status: "generating", progress: 75 }).eq("id", documentId);

    const [summaryRes, flashcardsRes] = await Promise.allSettled([
      generateSummary(aiInput),
      generateFlashcards(aiInput),
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
      // Also insert into flashcards table
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

    await admin
      .from("documents")
      .update({ status: "ready", progress: 100, error_message: null })
      .eq("id", documentId);

    console.log(`[process-document] OK ${documentId}`);
    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[process-document] Error:", message);
    if (documentId) {
      await admin
        .from("documents")
        .update({ status: "error", error_message: message })
        .eq("id", documentId);
    }
    return new Response(JSON.stringify({ ok: false, error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// =====================================================
// PDF text extraction (using unpdf - works in Deno)
// =====================================================
async function extractPdfText(blob: Blob): Promise<string> {
  const { extractText, getDocumentProxy } = await import("https://esm.sh/unpdf@0.12.1");
  const buffer = new Uint8Array(await blob.arrayBuffer());
  const pdf = await getDocumentProxy(buffer);
  const { text } = await extractText(pdf, { mergePages: true });
  return Array.isArray(text) ? text.join("\n\n") : String(text);
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
  const data = await callAi(
    [
      {
        role: "system",
        content:
          "Sos un experto en aprendizaje activo. Creás flashcards efectivas siguiendo principios de recuperación activa: preguntas específicas y atómicas, respuestas concisas y precisas. Español rioplatense.",
      },
      {
        role: "user",
        content: `Generá entre 10 y 15 flashcards de alta calidad sobre este texto:\n\n${text}`,
      },
    ],
    [
      {
        type: "function",
        function: {
          name: "create_flashcards",
          description: "Devuelve un array de flashcards de estudio activo.",
          parameters: {
            type: "object",
            properties: {
              cards: {
                type: "array",
                minItems: 8,
                maxItems: 15,
                items: {
                  type: "object",
                  properties: {
                    front: { type: "string", description: "Pregunta atómica, máx 200 chars" },
                    back: { type: "string", description: "Respuesta precisa, máx 350 chars" },
                    difficulty: {
                      type: "integer",
                      enum: [1, 2, 3],
                      description: "1=fácil, 2=media, 3=difícil",
                    },
                  },
                  required: ["front", "back", "difficulty"],
                  additionalProperties: false,
                },
              },
            },
            required: ["cards"],
            additionalProperties: false,
          },
        },
      },
    ],
  );

  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
  if (!toolCall) return [];
  const args = JSON.parse(toolCall.function.arguments);
  return (args.cards ?? []) as FlashcardOut[];
}
