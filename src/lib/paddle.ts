import { supabase } from "@/integrations/supabase/client";

const clientToken = import.meta.env.VITE_PAYMENTS_CLIENT_TOKEN as string | undefined;

declare global {
  interface Window {
    Paddle: any;
  }
}

export function getPaddleEnvironment(): "sandbox" | "live" {
  return clientToken?.startsWith("test_") ? "sandbox" : "live";
}

let paddleInitialized = false;
let initPromise: Promise<void> | null = null;

export async function initializePaddle(): Promise<void> {
  if (paddleInitialized) return;
  if (initPromise) return initPromise;

  if (!clientToken) {
    throw new Error("VITE_PAYMENTS_CLIENT_TOKEN no está configurado");
  }

  initPromise = new Promise<void>((resolve, reject) => {
    // Si Paddle ya está cargado (script reutilizado)
    if (typeof window !== "undefined" && window.Paddle) {
      try {
        const paddleJsEnv = getPaddleEnvironment() === "sandbox" ? "sandbox" : "production";
        window.Paddle.Environment.set(paddleJsEnv);
        window.Paddle.Initialize({ token: clientToken });
        paddleInitialized = true;
        resolve();
        return;
      } catch (e) {
        reject(e);
        return;
      }
    }

    const script = document.createElement("script");
    script.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
    script.async = true;
    script.onload = () => {
      try {
        const paddleJsEnv = getPaddleEnvironment() === "sandbox" ? "sandbox" : "production";
        window.Paddle.Environment.set(paddleJsEnv);
        window.Paddle.Initialize({ token: clientToken });
        paddleInitialized = true;
        resolve();
      } catch (e) {
        reject(e);
      }
    };
    script.onerror = () => reject(new Error("No se pudo cargar Paddle.js"));
    document.head.appendChild(script);
  });

  return initPromise;
}

const priceCache = new Map<string, string>();

export async function getPaddlePriceId(priceId: string): Promise<string> {
  const cached = priceCache.get(priceId);
  if (cached) return cached;

  const environment = getPaddleEnvironment();
  const { data, error } = await supabase.functions.invoke("get-paddle-price", {
    body: { priceId, environment },
  });
  if (error || !data?.paddleId) {
    throw new Error(`No se pudo resolver el precio: ${priceId}`);
  }
  priceCache.set(priceId, data.paddleId);
  return data.paddleId;
}
