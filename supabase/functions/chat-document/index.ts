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
  documentId: string;
  question: string;
  sessionId: string;
  mode?: "normal" | "deep" | "socratic";
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

function systemPromptNormal(docTitle: string) {
  return `Sos un tutor experto que ayuda a un estudiante a entender el documento "${docTitle}". Tu objetivo es enseñar, no solo citar.

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
- Usá markdown ligero (**negrita**, listas con -, no headings).`;
}

function systemPromptDeep(docTitle: string) {
  return `Sos un tutor experto y exhaustivo que ayuda a un estudiante a dominar el documento "${docTitle}". El estudiante eligió MODO PROFUNDO: tu respuesta debe ser detallada, estructurada y rigurosa.

REGLAS DE RESPUESTA:
1. Empezá con la respuesta directa al toque (1-2 líneas), después desarrollá.
2. Estructurá la respuesta con headings cortos (##) y subsecciones claras.
3. Citá fragmentos de forma constante: (Fragmento 2), (Fragmento 3 · pág. 14). Cada afirmación importante debe tener su cita.
4. Si los fragmentos no cubren algo, marcalo: "Esto no está en el documento, pero como contexto general…".
5. Cerrá con un bloque "**Para recordar:**" con 3-5 puntos clave en bullets.
6. Usá ejemplos, analogías, contraejemplos y conexiones con otros conceptos del documento.
7. No inventes datos específicos (fechas, cifras, nombres). Si no los tenés, decilo.

ESTILO:
- Español rioplatense, técnico pero accesible.
- Markdown completo (## headings, **negrita**, listas, tablas si ayudan, > citas).
- Hasta 600 palabras. Profundidad sobre brevedad.`;
}

function systemPromptSocratic(docTitle: string) {
  return `Sos un tutor SOCRÁTICO que ayuda a un estudiante a estudiar el documento "${docTitle}". JAMÁS le das la respuesta directa. Tu único método es hacer preguntas que lo guíen a deducirla por sí mismo.

REGLAS ESTRICTAS:
1. NUNCA respondas la pregunta del estudiante. Tu misión es que ÉL llegue a la respuesta solo.
2. Hacé entre 1 y 3 preguntas guía a la vez. Empezá por lo más básico, después subí en complejidad.
3. Si el estudiante responde algo correcto → reforzalo brevemente ("Bien, vas por ahí…") y hacé la próxima pregunta que lo lleve un paso más allá.
4. Si responde algo incorrecto → no lo corrijas frontalmente. Hacé una contra-pregunta que lo haga notar el error.
5. Podés citar fragmentos del documento como pista: "Mirá el Fragmento 2, ¿qué te dice sobre…?". Pero nunca les explices qué dice el fragmento.
6. Si el estudiante insiste con "decime la respuesta" → recordale gentilmente que estás en modo socrático y reformulá tu última pregunta de forma más fácil.
7. Cuando el estudiante haya construido la respuesta correcta → confirmalo con entusiasmo y resumí en 1-2 líneas lo que él mismo construyó.

ESTILO:
- Español rioplatense, cálido y paciente.
- Preguntas cortas, claras, abiertas (que no se respondan con sí/no cuando sea posible).
- Markdown ligero (**negrita** para resaltar palabras clave de tus preguntas).
- Máximo 150 palabras por respuesta.`;
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

    const { documentId, question, sessionId, mode = "normal" } =
      (await req.json()) as RequestBody;
    if (!documentId || !question || !sessionId)
      throw new Error("documentId, question y sessionId requeridos");

    // Document title
    const { data: docMeta } = await supabase
      .from("documents")
      .select("title")
      .eq("id", documentId)
      .maybeSingle();
    const docTitle = docMeta?.title ?? "el documento";

    // Past messages of the session (for context)
    const { data: pastMessages } = await supabase
      .from("chat_messages")
      .select("role, content")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true })
      .limit(20);

    const history = (pastMessages ?? []).filter(
      (m) => m.role === "user" || m.role === "assistant",
    );

    // Persist the user message immediately
    await supabase.from("chat_messages").insert({
      user_id: userId,
      session_id: sessionId,
      role: "user",
      content: question,
    });

    // Retrieve chunks
    const { data: chunks } = await supabase
      .from("document_chunks")
      .select("id, content, chunk_index, page_number")
      .eq("document_id", documentId)
      .order("chunk_index", { ascending: true })
      .limit(300);

    const ranked = scoreChunks(question, (chunks ?? []) as ChunkRow[]);
    const top = ranked.slice(0, 6);
    const hasGoodHits = top.some((r) => r.score >= 0.3);

    const context = top
      .map(
        (r, i) =>
          `[Fragmento ${i + 1}${r.chunk.page_number ? ` · pág. ${r.chunk.page_number}` : ""}]\n${r.chunk.content}`,
      )
      .join("\n\n---\n\n");

    const systemContent =
      mode === "socratic"
        ? systemPromptSocratic(docTitle)
        : mode === "deep"
          ? systemPromptDeep(docTitle)
          : systemPromptNormal(docTitle);

    const messages: any[] = [
      { role: "system", content: systemContent },
      ...history.slice(-6).map((m) => ({ role: m.role, content: m.content })),
      {
        role: "user",
        content: hasGoodHits
          ? `Fragmentos relevantes del documento:\n\n${context}\n\n---\n\nPregunta: ${question}`
          : `Fragmentos del documento (puede que no cubran exactamente la pregunta):\n\n${context}\n\n---\n\nPregunta: ${question}\n\nSi no está en los fragmentos, igual ayudame con conocimiento general del tema.`,
      },
    ];

    const sources = top
      .filter((r) => r.score > 0)
      .map((r, i) => ({
        index: i + 1,
        page: r.chunk.page_number,
        documentId,
        documentTitle: docTitle,
        excerpt: r.chunk.content.slice(0, 220),
        chunkId: r.chunk.id,
      }));

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: mode === "deep" ? "google/gemini-2.5-pro" : "google/gemini-2.5-flash",
        messages,
        stream: true,
      }),
    });

    if (aiRes.status === 429) {
      return sseError("Demasiadas consultas seguidas. Probá en un minuto.", 429);
    }
    if (aiRes.status === 402) {
      return sseError("Se agotaron los créditos del workspace de IA.", 402);
    }
    if (!aiRes.ok || !aiRes.body) {
      const t = await aiRes.text();
      throw new Error(`AI Gateway ${aiRes.status}: ${t}`);
    }

    // Stream SSE proxy + persist final assistant message at the end
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    let assistantContent = "";

    const stream = new ReadableStream({
      async start(controller) {
        // Send initial metadata event with sources
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
                // ignore parse errors
              }
            }
          }

          // Persist the assistant message
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
    console.error("[chat-document] Error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function sseError(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
