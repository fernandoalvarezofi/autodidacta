import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/landing/Navbar";

export const Route = createFileRoute("/refund-policy")({
  head: () => ({
    meta: [
      { title: "Política de Reembolsos — Autodidactas" },
      { name: "description", content: "Política de reembolsos del Plan Pro de Autodidactas." },
    ],
  }),
  component: RefundPage,
});

function RefundPage() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <Navbar />
      <main className="container mx-auto px-6 lg:px-10 max-w-[760px] py-14">
        <h1 className="font-display text-3xl lg:text-4xl tracking-tight">Política de Reembolsos</h1>
        <p className="text-ink/55 text-sm mt-2 font-mono">Última actualización: 26 de abril de 2026</p>

        <div className="prose prose-ink mt-8 space-y-6 text-[15px] leading-relaxed text-ink/85">
          <section>
            <h2 className="font-display text-xl text-ink">Garantía de satisfacción de 30 días</h2>
            <p>
              Ofrecemos una <strong>garantía de devolución de 30 días</strong> sobre todas las suscripciones 
              al Plan Pro de Autodidactas. Si no quedás satisfecho con tu compra, podés solicitar un reembolso 
              completo dentro de los 30 días posteriores a la fecha del cargo.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-ink">Cómo solicitar un reembolso</h2>
            <p>
              Los reembolsos son procesados por nuestro proveedor de pagos, <strong>Paddle</strong>, 
              que actúa como Comerciante Registrado (Merchant of Record) de todas nuestras transacciones.
            </p>
            <p>Para solicitar un reembolso podés:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>
                Visitar{" "}
                <a
                  href="https://paddle.net"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange underline"
                >
                  paddle.net
                </a>{" "}
                con el email asociado a tu compra y solicitarlo desde el portal de cliente; o
              </li>
              <li>
                Contactarnos directamente y nosotros gestionaremos la solicitud junto a Paddle.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl text-ink">Renovaciones</h2>
            <p>
              Las renovaciones automáticas también pueden reembolsarse dentro de los 30 días si no las usaste. 
              Para evitar futuras renovaciones, cancelá tu suscripción desde tu cuenta o desde paddle.net 
              antes del próximo ciclo de facturación. La cancelación detiene los cargos futuros pero conservás 
              acceso hasta el final del período pago.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-ink">Procesamiento</h2>
            <p>
              Una vez aprobado, el reembolso se procesa en el método de pago original. Puede tardar entre 
              5 y 10 días hábiles en aparecer en tu estado de cuenta, dependiendo de tu banco o emisor de tarjeta.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-ink">Más información</h2>
            <p>
              Consultá la{" "}
              <a
                href="https://www.paddle.com/legal/refund-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange underline"
              >
                política de reembolsos completa de Paddle
              </a>{" "}
              para detalles adicionales.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
