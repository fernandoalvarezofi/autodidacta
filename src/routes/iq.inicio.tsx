import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Loader2, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { buildIQQuestionOrder } from "@/lib/iq-scoring";

export const Route = createFileRoute("/iq/inicio")({
  head: () => ({
    meta: [
      { title: "Comenzar Test de IQ — Autodidactas" },
      { name: "description", content: "Datos previos para iniciar tu test cognitivo." },
    ],
  }),
  component: IQInicio,
});

type Area = "logica" | "numerico" | "espacial" | "verbal";
type Dif = "facil" | "medio" | "dificil";

async function ensureIQProfile(user: ReturnType<typeof useAuth>["user"]) {
  if (!user) return;
  const metadata = user.user_metadata ?? {};
  const fullName =
    typeof metadata.full_name === "string"
      ? metadata.full_name
      : typeof metadata.name === "string"
        ? metadata.name
        : user.email?.split("@")[0] ?? "Usuario";
  await supabase.from("profiles").upsert(
    {
      id: user.id,
      email: user.email ?? null,
      full_name: fullName,
      avatar_url: typeof metadata.avatar_url === "string" ? metadata.avatar_url : null,
    },
    { onConflict: "id", ignoreDuplicates: true },
  );
}

function IQInicio() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [nombre, setNombre] = useState("");
  const [edad, setEdad] = useState<string>("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!nombre.trim()) return setError("Ingresá tu nombre.");
    const edadN = parseInt(edad, 10);
    if (!Number.isFinite(edadN) || edadN < 10 || edadN > 99)
      return setError("La edad debe estar entre 10 y 99.");
    if (!consent) return setError("Necesitamos tu consentimiento para continuar.");

    setLoading(true);
    try {
      const { count, error: countError } = await supabase
        .from("iq_questions")
        .select("id", { count: "exact", head: true })
        .eq("is_active", true);
      if (countError) throw new Error(`Banco de preguntas: ${countError.message}`);
      if (!count || count < 20)
        throw new Error(`El banco no está disponible (${count ?? 0} preguntas).`);

      await ensureIQProfile(user ?? null);

      const { data: attempt, error: errAtt } = await supabase
        .from("iq_attempts")
        .insert({
          user_id: user?.id ?? null,
          nombre: nombre.trim(),
          edad: edadN,
          email: email.trim() || null,
          total_preguntas: 60,
        })
        .select("id")
        .single();
      if (errAtt) throw new Error(`No se pudo crear el intento: ${errAtt.message}`);
      if (!attempt) throw new Error("El intento no devolvió ID.");

      try {
        const { data: qs } = await supabase
          .from("iq_questions")
          .select("id, area, dificultad")
          .eq("is_active", true);
        if (qs?.length) {
          const ordered = buildIQQuestionOrder(
            qs.map((q) => ({ id: q.id, area: q.area as Area, dificultad: q.dificultad as Dif })),
          );
          sessionStorage.setItem(
            "iq_session_questions",
            JSON.stringify({ attemptId: attempt.id, questionIds: ordered }),
          );
        }
      } catch (sessionError) {
        console.warn("[iq/inicio] sessionStorage falló, seguimos igual", sessionError);
      }

      navigate({ to: "/iq/test/$intentoId", params: { intentoId: attempt.id } });
    } catch (err) {
      console.error("[iq/inicio]", err);
      setError(err instanceof Error ? err.message : "Error desconocido al iniciar el test.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper text-ink">
      {/* Top bar brutalista */}
      <header className="border-b-2 border-ink bg-paper">
        <div className="container mx-auto px-6 lg:px-10 max-w-[1200px] h-14 flex items-center justify-between">
          <Link to="/iq" className="inline-flex items-center gap-2 text-[12px] font-mono uppercase tracking-[0.2em] text-ink/70 hover:text-orange transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2.25} /> Volver
          </Link>
          <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-ink/50">
            Test de IQ · Paso 1 de 2
          </span>
          <span className="w-[60px]" />
        </div>
      </header>

      <main className="container mx-auto px-6 lg:px-10 max-w-[680px] py-16 lg:py-24">
        <div className="border-l-4 border-ink pl-5 mb-12">
          <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-orange mb-3">
            Antes de comenzar
          </p>
          <h1 className="font-display leading-[0.95] tracking-[-0.02em]" style={{ fontSize: "clamp(2.4rem, 5.5vw, 3.8rem)" }}>
            Datos del<br/>evaluado.
          </h1>
          <p className="text-ink/70 mt-5 text-[15px] leading-relaxed max-w-[50ch]">
            Una vez iniciado, el cronómetro corre durante <strong className="text-ink">20 minutos exactos</strong>. Buscá un lugar tranquilo, silenciá el teléfono y sentate cómodo.
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="border-2 border-ink bg-paper p-7 lg:p-9 space-y-6 shadow-[6px_6px_0_0_var(--ink)]"
        >
          <Field label="Nombre" required num="01">
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              maxLength={80}
              placeholder="María González"
              className="w-full h-12 px-4 border-2 border-ink/20 bg-paper text-[15px] focus:outline-none focus:border-ink transition-colors"
            />
          </Field>
          <Field label="Edad" required num="02">
            <input
              type="number"
              min={10}
              max={99}
              value={edad}
              onChange={(e) => setEdad(e.target.value)}
              placeholder="25"
              className="w-full h-12 px-4 border-2 border-ink/20 bg-paper text-[15px] focus:outline-none focus:border-ink transition-colors"
            />
          </Field>
          <Field label="Email" num="03" optional>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              maxLength={255}
              placeholder="opcional, para enviarte el resultado"
              className="w-full h-12 px-4 border-2 border-ink/20 bg-paper text-[15px] focus:outline-none focus:border-ink transition-colors"
            />
          </Field>

          <label className="flex items-start gap-3 text-[13px] text-ink/80 cursor-pointer pt-2">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-[var(--orange)] flex-shrink-0"
            />
            <span className="leading-relaxed">
              Entiendo que este test es una herramienta de autoconocimiento, no un diagnóstico clínico, y autorizo el uso anónimo de mis respuestas para mejorar el banco de preguntas.
            </span>
          </label>

          {error && (
            <div className="border-l-4 border-destructive bg-destructive/5 p-4">
              <p className="text-[11px] font-mono uppercase tracking-wider text-destructive mb-1">Error</p>
              <p className="text-[13px] text-ink/90">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="group w-full inline-flex items-center justify-center gap-3 h-13 py-3.5 bg-ink text-paper font-mono text-[13px] uppercase tracking-[0.2em] hover:bg-orange transition-colors disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Preparando…
              </>
            ) : (
              <>
                Iniciar test
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" strokeWidth={2.25} />
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  );
}

function Field({
  label,
  required,
  optional,
  num,
  children,
}: {
  label: string;
  required?: boolean;
  optional?: boolean;
  num: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <label className="flex items-baseline gap-2.5">
          <span className="font-mono text-[10px] text-ink/40">{num}</span>
          <span className="text-[13px] font-medium text-ink uppercase tracking-wider">
            {label}
            {required && <span className="text-orange ml-1">*</span>}
          </span>
        </label>
        {optional && <span className="text-[10px] font-mono uppercase tracking-wider text-ink/40">Opcional</span>}
      </div>
      {children}
    </div>
  );
}
