import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/landing/Navbar";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Términos y Condiciones — Autodidactas" },
      { name: "description", content: "Términos y condiciones de uso del servicio Autodidactas." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <Navbar />
      <main className="container mx-auto px-6 lg:px-10 max-w-[760px] py-14">
        <h1 className="font-display text-3xl lg:text-4xl tracking-tight">Términos y Condiciones</h1>
        <p className="text-ink/55 text-sm mt-2 font-mono">Última actualización: 26 de abril de 2026</p>

        <div className="prose prose-ink mt-8 space-y-6 text-[15px] leading-relaxed text-ink/85">
          <section>
            <h2 className="font-display text-xl text-ink">1. Quiénes somos</h2>
            <p>
              Autodidactas es operado por <strong>Fernando Daniel Alvarez</strong> ("nosotros", "nuestro", el "Vendedor"). 
              Al utilizar este servicio, contratás directamente con Fernando Daniel Alvarez.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-ink">2. Aceptación de los términos</h2>
            <p>
              Al acceder o usar Autodidactas aceptás estos Términos y Condiciones. Si no estás de acuerdo, 
              por favor no utilices el servicio.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-ink">3. Descripción del servicio</h2>
            <p>
              Autodidactas es una plataforma de estudio impulsada por inteligencia artificial que ofrece: 
              procesamiento de documentos, generación de resúmenes, mapas conceptuales, flashcards con repetición espaciada, 
              cuestionarios, evaluaciones de coeficiente intelectual y un asistente de chat sobre tus materiales.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-ink">4. Cuenta de usuario</h2>
            <p>
              Debés brindar información veraz y mantener la confidencialidad de tus credenciales. 
              Sos responsable de toda actividad realizada bajo tu cuenta. Si sos menor de edad, necesitás 
              autorización de tu representante legal.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-ink">5. Uso aceptable</h2>
            <p>No podés usar Autodidactas para:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Actividades ilegales, fraudulentas o engañosas;</li>
              <li>Enviar spam, malware o contenido malicioso;</li>
              <li>Infringir derechos de propiedad intelectual de terceros;</li>
              <li>Interferir con la seguridad del servicio (escaneos, scraping masivo, ingeniería inversa);</li>
              <li>Generar contenido de odio, violento, sexualmente explícito sobre menores, o que viole leyes aplicables;</li>
              <li>Usar las salidas de la IA para tomar decisiones médicas, legales o financieras críticas sin supervisión profesional.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl text-ink">6. Funcionalidad de IA</h2>
            <p>
              El servicio utiliza modelos de inteligencia artificial. Sos responsable de tus prompts, 
              de cómo usás las salidas y de verificar su exactitud. Los resultados de la IA pueden 
              contener errores y no constituyen asesoramiento profesional. Tenemos derecho a moderar, 
              filtrar o rechazar contenido a nuestra discreción.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-ink">7. Propiedad intelectual</h2>
            <p>
              El servicio, su software, marca y documentación son propiedad de Fernando Daniel Alvarez. 
              Te otorgamos una licencia limitada, no exclusiva y no transferible para usar Autodidactas 
              dentro del plan contratado. Vos conservás los derechos sobre el contenido que subís.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-ink">8. Pagos y suscripciones</h2>
            <p>
              Nuestro proceso de pago es gestionado por nuestro reseller online <strong>Paddle.com</strong>. 
              Paddle.com es el Comerciante Registrado (Merchant of Record) de todas nuestras órdenes. 
              Paddle gestiona todas las consultas de servicio al cliente y maneja las devoluciones. 
              Para los términos completos de pago, facturación, impuestos, cancelación y reembolsos, 
              consultá los{" "}
              <a
                href="https://www.paddle.com/legal/checkout-buyer-terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange underline"
              >
                Términos de Comprador de Paddle
              </a>.
            </p>
            <p>
              El Plan Pro se renueva automáticamente al final de cada período (mensual o anual) hasta 
              que lo cancelés. Podés cancelar en cualquier momento desde tu cuenta.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-ink">9. Garantías</h2>
            <p>
              El servicio se brinda "tal cual". No garantizamos un funcionamiento ininterrumpido o 
              libre de errores. Renunciamos a toda garantía implícita en la máxima medida permitida por ley.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-ink">10. Limitación de responsabilidad</h2>
            <p>
              Nuestra responsabilidad agregada se limita al monto pagado por vos en los últimos 12 meses. 
              No respondemos por daños indirectos, consecuentes o especiales (lucro cesante, pérdida de datos, etc.), 
              salvo en casos de dolo o cuando la ley lo prohíba.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-ink">11. Suspensión y terminación</h2>
            <p>
              Podemos suspender o terminar tu acceso por: incumplimiento material de estos términos, 
              falta de pago, riesgo de seguridad o fraude, o violaciones repetidas. 
              Cuando termine tu acceso, tendrás un período razonable para exportar tus datos antes de su eliminación.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-ink">12. Modificaciones</h2>
            <p>
              Podemos modificar estos términos. Te notificaremos por email o dentro de la aplicación. 
              El uso continuado tras la notificación implica aceptación.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-ink">13. Ley aplicable</h2>
            <p>
              Estos términos se rigen por las leyes de la República Argentina. Cualquier disputa será 
              resuelta en los tribunales competentes de Argentina.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-ink">14. Contacto</h2>
            <p>
              Para consultas sobre estos términos: <Link to="/privacy" className="text-orange underline">ver Política de Privacidad</Link> 
              {" "}para datos de contacto.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
