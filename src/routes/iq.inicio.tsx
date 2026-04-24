import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import { NeuralBackground } from "@/components/NeuralBackground";
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
      return setError("Edad debe estar entre 10 y 99.");
    if (!consent) return setError("Necesitamos tu consentimiento para continuar.");

    setLoading(true);
    try {
      // 0) verificar que hay preguntas disponibles
      const { count, error: countError } = await supabase
        .from("iq_questions")
        .select("id", { count: "exact", head: true })
        .eq("is_active", true);

      if (countError || !count || count < 20) {
        setError("El banco de preguntas no está disponible. Intentá más tarde.");
        setLoading(false);
        return;
      }

      // 1) crear intento
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
      if (errAtt || !attempt) throw errAtt ?? new Error("No se pudo crear el intento");

      // 2) intentamos dejar precargado el orden, pero no bloqueamos la navegación si esto falla
      try {
        const { data: qs } = await supabase
          .from("iq_questions")
          .select("id, area, dificultad")
          .eq("is_active", true);

        if (qs?.length) {
          const ordered = buildIQQuestionOrder(
            qs.map((q) => ({
              id: q.id,
              area: q.area as Area,
              dificultad: q.dificultad as Dif,
            })),
          );

          sessionStorage.setItem(
            "iq_session_questions",
            JSON.stringify({ attemptId: attempt.id, questionIds: ordered }),
          );
        }
      } catch (sessionError) {
        console.warn("[iq/inicio] No se pudo guardar la sesión local del test", sessionError);
      }

      navigate({ to: "/iq/test/$intentoId", params: { intentoId: attempt.id } });
    } catch (err) {
      console.error(err);
      setError("No pudimos iniciar el test. Probá de nuevo.");
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-paper text-ink">
      <NeuralBackground />
      <Navbar />

      <main className="container mx-auto px-6 lg:px-10 max-w-[560px] py-16">
        <h1 className="font-display text-4xl lg:text-5xl tracking-tight">Antes de empezar</h1>
        <p className="text-ink/60 mt-3 text-[15px]">
          Tomate ~20 minutos en un lugar tranquilo. Una vez iniciado el timer corre.
        </p>

        <form
          onSubmit={onSubmit}
          className="mt-10 space-y-5 rounded-xl border border-border bg-paper/90 backdrop-blur-sm p-6 shadow-soft"
        >
          <Field label="Nombre" required>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              maxLength={80}
              className="w-full h-11 px-3 rounded-md border border-border bg-paper focus:outline-none focus:border-orange transition-colors"
            />
          </Field>
          <Field label="Edad" required>
            <input
              type="number"
              min={10}
              max={99}
              value={edad}
              onChange={(e) => setEdad(e.target.value)}
              className="w-full h-11 px-3 rounded-md border border-border bg-paper focus:outline-none focus:border-orange transition-colors"
            />
          </Field>
          <Field label="Email (opcional)">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              maxLength={255}
              className="w-full h-11 px-3 rounded-md border border-border bg-paper focus:outline-none focus:border-orange transition-colors"
            />
          </Field>

          <label className="flex items-start gap-3 text-[13px] text-ink/70 cursor-pointer">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-[var(--orange)]"
            />
            <span>
              Entiendo que este test es una herramienta de autoconocimiento, no un diagnóstico
              clínico, y autorizo el uso anónimo de mis respuestas para mejorar la calidad del banco
              de preguntas.
            </span>
          </label>

          {error && (
            <p className="text-[13px] text-destructive bg-destructive/5 border border-destructive/30 rounded-md p-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="group w-full inline-flex items-center justify-center gap-2 h-11 bg-ink text-paper font-medium rounded-md hover:bg-orange transition-colors disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Iniciar test
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
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
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-[13px] font-medium text-ink/80 mb-1.5">
        {label} {required && <span className="text-orange">*</span>}
      </span>
      {children}
    </label>
  );
}
