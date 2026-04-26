import { Crown, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import { usePaddleCheckout } from "@/hooks/usePaddleCheckout";
import { useSubscription } from "@/hooks/useSubscription";

const DISMISS_KEY = "upgrade-banner-dismissed";

export function UpgradeBanner() {
  const { isActive, loading } = useSubscription();
  const { openCheckout, loading: checkoutLoading } = usePaddleCheckout();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const v = sessionStorage.getItem(DISMISS_KEY);
    if (v === "1") setDismissed(true);
  }, []);

  if (loading || isActive || dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    if (typeof window !== "undefined") {
      sessionStorage.setItem(DISMISS_KEY, "1");
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-orange bg-gradient-to-br from-cream/40 via-paper to-cream/30 p-5 lg:p-6 shadow-orange">
      {/* Decorative dots */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage:
            "radial-gradient(circle, var(--ink) 1px, transparent 1px)",
          backgroundSize: "16px 16px",
        }}
      />

      <button
        type="button"
        onClick={handleDismiss}
        className="absolute top-3 right-3 inline-flex items-center justify-center w-7 h-7 rounded-md text-ink/40 hover:text-ink hover:bg-cream transition-colors"
        title="Ocultar"
      >
        <X className="w-3.5 h-3.5" strokeWidth={2.5} />
      </button>

      <div className="relative flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-full bg-orange/10 inline-flex items-center justify-center flex-shrink-0">
            <Crown className="w-5 h-5 text-orange" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-display text-lg lg:text-xl tracking-tight text-ink">
                Desbloqueá Autodidactas Pro
              </h3>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-orange/10 border border-orange/30 text-orange text-[10px] font-mono uppercase tracking-wider rounded">
                <Sparkles className="w-2.5 h-2.5" strokeWidth={2.5} />
                Recomendado
              </span>
            </div>
            <p className="text-ink/65 text-[13.5px] mt-1 leading-relaxed">
              Tests de IQ ilimitados con análisis detallado, certificado PDF,
              flashcards con repetición espaciada y todo el estudio activo con IA.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0 lg:flex-col lg:items-stretch">
          <button
            type="button"
            disabled={checkoutLoading}
            onClick={() =>
              openCheckout({ priceId: "pro_monthly" })
            }
            className="inline-flex items-center justify-center gap-2 h-10 px-4 bg-ink text-paper text-[13px] font-medium rounded-md hover:bg-orange transition-colors disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {checkoutLoading ? "Cargando…" : "$12/mes"}
          </button>
          <button
            type="button"
            disabled={checkoutLoading}
            onClick={() =>
              openCheckout({ priceId: "pro_yearly" })
            }
            className="inline-flex items-center justify-center gap-2 h-10 px-4 bg-paper border border-ink/15 hover:border-ink/40 text-ink text-[13px] font-medium rounded-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
          >
            $108/año
            <span className="text-[10px] font-mono text-orange uppercase">-25%</span>
          </button>
        </div>
      </div>
    </div>
  );
}
