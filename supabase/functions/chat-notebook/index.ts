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

interface RequestBody {
  notebookId: string;
  question: string;
  sessionId: string;
  mode?: "normal" | "socratic";
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
  document_id: string;
}

interface DocMeta {
  id: string;
  title: string;
}

function scoreChunks(question: string, chunks: ChunkRow[]) {
  const qTokens = tokenize(question);
  const qSet = new Set(qTokens);
  const qBigrams = new Set<string>();
  for (let i = 0; i < qTokens.length - 1; i++) qBigrams.add(`${qTokens[i]} ${qTokens[i + 1]}`);

  return chunks
    .map((chunk) => {
      const tokens = tokenize(chunk.content);
      const tokenSet = new Set(tokens);
      let hits = 0;
      for (const t of qSet) if (tokenSet.has(t)) hits += 1;
      const lower = chunk.content.toLowerCase();
      let bigramBonus = 0;
      for (const bg of qBigrams) if (lower.includes(bg)) bigramBonus += 1;
      const score = (hits + bigramBonus * 2) / Math.max(1, Math.sqrt(tokens.length));
      return { chunk, score };
    })
    .sort((a, b) => b.score - a.score);
}

function systemNormal(nbTitle: string, count: number, titles: string) {
  return `Sos un tutor experto que ayuda a un estudiante a estudiar el cuaderno "${nbTitle}", que contiene ${count} documento${count === 1 ? "" : "s"}: ${titles}.

REGLAS DE RESPUESTA:
1. Si los fragmentos cubren la pregunta → respondé basándote en ellos y citá así: (Fragmento 2). Cuando la info venga de varios documentos, indicá de cuál.
2. Si cubren parcialmente → mezclá documento + conocimiento general, marcando:
   - "Según el cuaderno: …" / "(Fragmento N · Documento X)"
   - "Como contexto adicional (no está en el cuaderno): …"
3. Si no cubren la pregunta pero está relacionada con el tema → respondé con conocimiento general.
4. Si la pregunta es totalmente ajena al tema, decilo amablemente.

ESTILO:
- Español rioplatense, conversacional y claro.
- Usá ejemplos y analogías para enseñar, no solo recitar.
- No inventes datos específicos (fechas, cifras, nombres) que no estén en el material.
- Máximo 300 palabras.
- Markdown ligero (**negrita**, listas con -, no headings).`;
}

function systemSocratic(nbTitle: string) {
  return `Sos un tutor SOCRÁTICO que ayuda a un estudiante a estudiar el cuaderno "${nbTitle}". JAMÁS le das la respuesta directa. Tu único método es hacer preguntas que lo guíen a deducirla.

REGLAS ESTRICTAS:
1. NUNCA respondas directamente. Hacé que ÉL llegue a la respuesta.
2. Hacé entre 1 y 3 preguntas guía a la vez, de menor a mayor complejidad.
3. Si responde correcto → reforzá brevemente y hacé la próxima pregunta más profunda.
4. Si responde incorrecto → no lo corrijas frontalmente, hacé una contra-pregunta que lo haga notar el error.
5. Podés citar fragmentos como pista pero nunca explicar qué dicen.
6. Si insiste con "decime la respuesta" → recordale gentilmente el modo socrático.
7. Cuando construyó la respuesta correcta → confirmalo con entusiasmo y resumí en 1-2 líneas.

ESTILO:
- Español rioplatense, cálido y paciente.
- Preguntas cortas, claras, abiertas.
- Markdown ligero. Máximo 150 palabras.`;
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
    const userId = userData.user.id;

    const { notebookId, question, sessionId, mode = "normal" } =
      (await req.json()) as RequestBody;
    if (!notebookId || !question || !sessionId)
      throw new Error("notebookId, question y sessionId requeridos");

    const { data: nbMeta } = await supabase
      .from("notebooks")
      .select("title")
      .eq("id", notebookId)
      .maybeSingle();
    const nbTitle = nbMeta?.title ?? "el cuaderno";

    const { data: docs } = await supabase
      .from("documents")
      .select("id, title")
      .eq("notebook_id", notebookId)
      .eq("status", "ready");

    if (!docs || docs.length === 0) {
      // Persist user msg + canned reply
      await supabase.from("chat_messages").insert({
        user_id: userId,
        session_id: sessionId,
        role: "user",
        content: question,
      });
      const canned =
        "Este cuaderno todavía no tiene documentos procesados. Subí un PDF y esperá a que termine.";
      await supabase.from("chat_messages").insert({
        user_id: userId,
        session_id: sessionId,
        role: "assistant",
        content: canned,
      });
      return jsonResponse({ answer: canned, sources: [] });
    }

    const docIds = (docs as DocMeta[]).map((d) => d.id);
    const docMap = new Map<string, string>(
      (docs as DocMeta[]).map((d) => [d.id, d.title]),
    );

    // Past messages
    const { data: pastMessages } = await supabase
      .from("chat_messages")
      .select("role, content")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true })
      .limit(20);

    const history = (pastMessages ?? []).filter(
      (m) => m.role === "user" || m.role === "assistant",
    );

    // Persist user question
    await supabase.from("chat_messages").insert({
      user_id: userId,
      session_id: sessionId,
      role: "user",
      content: question,
    });

    const { data: chunks } = await supabase
      .from("document_chunks")
      .select("id, content, chunk_index, page_number, document_id")
      .in("document_id", docIds)
      .limit(800);

    const ranked = scoreChunks(question, (chunks ?? []) as ChunkRow[]);
    const top = ranked.slice(0, 7);
    const hasGoodHits = top.some((r) => r.score >= 0.3);

    const context = top
      .map((r, i) => {
        const title = docMap.get(r.chunk.document_id) ?? "Documento";
        const page = r.chunk.page_number ? ` · pág. ${r.chunk.page_number}` : "";
        return `[Fragmento ${i + 1} · "${title}"${page}]\n${r.chunk.content}`;
      })
      .join("\n\n---\n\n");

    const docTitles = (docs as DocMeta[]).map((d) => `"${d.title}"`).join(", ");
    const systemContent =
      mode === "socratic"
        ? systemSocratic(nbTitle)
        : systemNormal(nbTitle, docs.length, docTitles);

    const messages: any[] = [
      { role: "system", content: systemContent },
      ...history.slice(-6).map((m) => ({ role: m.role, content: m.content })),
      {
        role: "user",
        content: hasGoodHits
          ? `Fragmentos relevantes del cuaderno:\n\n${context}\n\n---\n\nPregunta: ${question}`
          : `Fragmentos del cuaderno (puede que no cubran exactamente la pregunta):\n\n${context}\n\n---\n\nPregunta: ${question}\n\nSi no está en los fragmentos, igual ayudame con conocimiento general.`,
      },
    ];

    const sources = top
      .filter((r) => r.score > 0)
      .map((r, i) => ({
        index: i + 1,
        page: r.chunk.page_number,
        documentId: r.chunk.document_id,
        documentTitle: docMap.get(r.chunk.document_id) ?? "Documento",
        excerpt: r.chunk.content.slice(0, 220),
      }));

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        stream: true,
      }),
    });

    if (aiRes.status === 429) return jsonError("Demasiadas consultas seguidas.", 429);
    if (aiRes.status === 402) return jsonError("Se agotaron los créditos del workspace de IA.", 402);
    if (!aiRes.ok || !aiRes.body) {
      const t = await aiRes.text();
      throw new Error(`AI Gateway ${aiRes.status}: ${t}`);
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    let assistantContent = "";

    const stream = new ReadableStream({
      async start(controller) {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "meta", sources, usedGeneralKnowledge: !hasGoodHits })}\n\n`,
          ),
        );

        const reader = aiRes.body!.getReader();
        let buffer = "";
        try {
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";
            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed.startsWith("data:")) continue;
              const payload = trimmed.slice(5).trim();
              if (payload === "[DONE]") continue;
              try {
                const json = JSON.parse(payload);
                const delta = json.choices?.[0]?.delta?.content ?? "";
                if (delta) {
                  assistantContent += delta;
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ type: "delta", content: delta })}\n\n`),
                  );
                }
              } catch {
                // ignore
              }
            }
          }

          if (assistantContent.trim()) {
            await supabase.from("chat_messages").insert({
              user_id: userId,
              session_id: sessionId,
              role: "assistant",
              content: assistantContent,
              citations: sources as never,
            });
          }

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`));
          controller.close();
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "error", message: msg })}\n\n`),
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[chat-notebook] Error:", message);
    return jsonError(message, 500);
  }
});

function jsonError(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
