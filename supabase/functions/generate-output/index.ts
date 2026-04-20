// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

type OutputType = "study_guide" | "timeline" | "faq" | "business_plan";

interface RequestBody {
  documentId: string;
  type: OutputType;
}

const PROMPTS: Record<OutputType, { system: string; user: (text: string) => string }> = {
  study_guide: {
    system:
      "Sos un experto en pedagogía. Generás guías de estudio claras, completas y accionables en español rioplatense. Usás Markdown.",
    user: (text) =>
      `A partir del siguiente material, generá una **guía de estudio** completa con esta estructura en Markdown:\n\n` +
      `# Guía de estudio\n## Objetivos de aprendizaje\n(3-6 bullets, qué vas a poder hacer al terminar)\n\n` +
      `## Conceptos clave\n(lista con definición corta de cada uno)\n\n` +
      `## Resumen por temas\n(secciones con ## por cada tema principal)\n\n` +
      `## Preguntas de repaso\n(8-12 preguntas abiertas)\n\n` +
      `## Ejercicios sugeridos\n(3-5 ejercicios prácticos)\n\n` +
      `Material:\n"""\n${text}\n"""`,
  },
  timeline: {
    system:
      "Sos un historiador y analista. Extraés líneas de tiempo precisas en formato JSON. Respondé SOLO con JSON válido.",
    user: (text) =>
      `Extraé la línea de tiempo del siguiente material. Devolvé SOLO un JSON con esta forma exacta:\n` +
      `{"title": "string", "events": [{"date": "string (año, fecha o periodo)", "title": "string", "description": "string (1-3 oraciones)", "category": "string opcional"}]}\n\n` +
      `Reglas:\n- Ordená cronológicamente.\n- Mínimo 5 eventos, máximo 25.\n- Si no hay fechas explícitas, usá orden lógico ("Inicio", "Etapa 1", etc).\n` +
      `- Las descripciones en español rioplatense.\n\nMaterial:\n"""\n${text}\n"""`,
  },
  faq: {
    system:
      "Sos un experto en didáctica. Generás FAQs claras y útiles en JSON. Respondé SOLO con JSON válido.",
    user: (text) =>
      `Generá una sección de Preguntas Frecuentes a partir del material. Devolvé SOLO JSON:\n` +
      `{"title": "string", "items": [{"question": "string", "answer": "string (2-5 oraciones, claro)", "category": "string opcional"}]}\n\n` +
      `Reglas:\n- Entre 8 y 15 preguntas.\n- Anticipá las dudas reales de alguien que recién leyó el material.\n` +
      `- Mezclá preguntas de comprensión, aplicación y casos límite.\n- Español rioplatense.\n\nMaterial:\n"""\n${text}\n"""`,
  },
  business_plan: {
    system:
      "Sos un consultor de negocios. Generás planes de negocio estructurados en Markdown, en español rioplatense.",
    user: (text) =>
      `A partir del material, generá un **plan de negocios** en Markdown con esta estructura:\n\n` +
      `# Plan de negocios\n## Resumen ejecutivo\n## Problema y oportunidad\n## Solución propuesta\n## Mercado objetivo\n` +
      `## Modelo de negocio\n## Propuesta de valor\n## Análisis competitivo\n## Estrategia go-to-market\n` +
      `## Métricas clave (KPIs)\n## Riesgos y mitigaciones\n## Próximos pasos\n\n` +
      `Si el material no da datos suficientes para alguna sección, usá supuestos razonables y marcalos con *(supuesto)*.\n\n` +
      `Material:\n"""\n${text}\n"""`,
  },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No autenticado");

    const userClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await userClient.auth.getUser();
    const user = userData.user;
    if (!user) throw new Error("Sesión inválida");

    const body = (await req.json()) as RequestBody;
    if (!body.documentId || !body.type) throw new Error("documentId y type requeridos");
    if (!PROMPTS[body.type]) throw new Error("Tipo de output inválido");

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Verificar ownership
    const { data: doc } = await admin
      .from("documents")
      .select("id, user_id, title, status")
      .eq("id", body.documentId)
      .maybeSingle();
    if (!doc || doc.user_id !== user.id) throw new Error("Documento no encontrado");
    if (doc.status !== "ready") throw new Error("El documento todavía se está procesando");

    // Traer chunks
    const { data: chunks } = await admin
      .from("document_chunks")
      .select("content")
      .eq("document_id", body.documentId)
      .order("chunk_index", { ascending: true })
      .limit(80);
    if (!chunks || chunks.length === 0) throw new Error("No hay contenido procesado");

    const fullText = chunks
      .map((c: any) => c.content)
      .join("\n\n")
      .slice(0, 60000);

    const prompt = PROMPTS[body.type];
    const isJson = body.type === "timeline" || body.type === "faq";

    console.log(`[generate-output] ${body.type} para doc ${body.documentId}`);

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: prompt.system },
          { role: "user", content: prompt.user(fullText) },
        ],
        ...(isJson ? { response_format: { type: "json_object" } } : {}),
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      console.error(`[generate-output] AI error ${aiRes.status}:`, errText);
      if (aiRes.status === 429) throw new Error("Límite de uso alcanzado, probá en un rato");
      if (aiRes.status === 402) throw new Error("Sin créditos de IA. Agregá créditos al workspace.");
      throw new Error("Error generando el contenido");
    }

    const aiJson = await aiRes.json();
    const content = aiJson.choices?.[0]?.message?.content ?? "";
    if (!content) throw new Error("Respuesta vacía de la IA");

    let outputContent: any;
    if (isJson) {
      try {
        outputContent = JSON.parse(content);
      } catch {
        throw new Error("La IA devolvió JSON inválido");
      }
    } else {
      outputContent = { markdown: content };
    }

    // Upsert
    const { data: existing } = await admin
      .from("document_outputs")
      .select("id")
      .eq("document_id", body.documentId)
      .eq("type", body.type)
      .maybeSingle();

    if (existing) {
      await admin
        .from("document_outputs")
        .update({ content: outputContent })
        .eq("id", existing.id);
    } else {
      await admin.from("document_outputs").insert({
        user_id: user.id,
        document_id: body.documentId,
        type: body.type,
        content: outputContent,
      });
    }

    return new Response(
      JSON.stringify({ ok: true, type: body.type, content: outputContent }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[generate-output] Error:", message);
    return new Response(JSON.stringify({ ok: false, error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
