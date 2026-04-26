import { getPaddleEnvironment } from "@/lib/paddle";

export function PaymentTestModeBanner() {
  if (getPaddleEnvironment() !== "sandbox") return null;

  return (
    <div className="w-full bg-orange/10 border-b border-orange/30 px-4 py-2 text-center text-[12.5px] text-ink/85 font-mono">
      <span className="inline-flex items-center gap-1.5">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-orange animate-pulse" />
        Modo prueba — los pagos en la preview no son reales.{" "}
        <a
          href="https://docs.lovable.dev/features/payments#test-and-live-environments"
          target="_blank"
          rel="noopener noreferrer"
          className="underline font-medium text-orange"
        >
          Más info
        </a>
      </span>
    </div>
  );
}
