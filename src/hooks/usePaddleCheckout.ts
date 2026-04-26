import { useState, useCallback } from "react";
import { initializePaddle, getPaddlePriceId } from "@/lib/paddle";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

interface OpenCheckoutOptions {
  priceId: "pro_monthly" | "pro_yearly";
  successUrl?: string;
}

export function usePaddleCheckout() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const openCheckout = useCallback(
    async ({ priceId, successUrl }: OpenCheckoutOptions) => {
      if (!user) {
        toast.error("Tenés que iniciar sesión para suscribirte");
        return;
      }
      setLoading(true);
      try {
        await initializePaddle();
        const paddlePriceId = await getPaddlePriceId(priceId);

        window.Paddle.Checkout.open({
          items: [{ priceId: paddlePriceId, quantity: 1 }],
          customer: user.email ? { email: user.email } : undefined,
          customData: { userId: user.id },
          settings: {
            displayMode: "overlay",
            successUrl:
              successUrl || `${window.location.origin}/dashboard?checkout=success`,
            allowLogout: false,
            variant: "one-page",
            theme: "light",
            locale: "es",
          },
        });
      } catch (e) {
        console.error("Checkout error:", e);
        toast.error(
          e instanceof Error ? e.message : "No se pudo abrir el checkout"
        );
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  return { openCheckout, loading };
}
