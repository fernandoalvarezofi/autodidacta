import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/landing/Navbar";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Política de Privacidad — Autodidactas" },
      { name: "description", content: "Cómo Autodidactas recolecta, usa y protege tus datos personales." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <Navbar />
      <main className="container mx-auto px-6 lg:px-10 max-w-[760px] py-14">
        <h1 className="font-display text-3xl lg:text-4xl tracking-tight">Política de Privacidad</h1>
        <p className="text-ink/55 text-sm mt-2 font-mono">Última actualización: 26 de abril de 2026</p>

        <div className="prose prose-ink mt-8 space-y-6 text-[15px] leading-relaxed text-ink/85">
          <section>
            <h2 className="font-display text-xl text-ink">1. Responsable del tratamiento</h2>
            <p>
              <strong>Fernando Daniel Alvarez</strong> ("nosotros") es el responsable del tratamiento 
              de tus datos personales para los fines descritos en esta política. 
              Contacto: a través del formulario disponible en la aplicación.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-ink">2. Datos que recolectamos</h2>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li><strong>Datos de cuenta:</strong> nombre, email, contraseña (cifrada), foto de perfil.</li>
              <li><strong>Datos de uso:</strong> documentos que subís, notas, flashcards, sesiones de chat, resultados de tests.</li>
              <li><strong>Datos técnicos:</strong> dirección IP, tipo de dispositivo, navegador, identificadores de sesión, telemetría de uso.</li>
              <li><strong>Datos de evaluaciones:</strong> respuestas, puntajes y resultados de los tests de coeficiente intelectual.</li>
              <li><strong>Comunicaciones:</strong> mensajes que nos envíes para soporte.</li>
            </ul>
            <p className="mt-2">
              Los datos relacionados con el pago (número de tarjeta, dirección de facturación) son recolectados 
              y procesados directamente por Paddle — nosotros no los almacenamos.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-ink">3. Finalidades y bases legales</h2>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li><strong>Prestar el servicio</strong> (ejecución del contrato): cuenta, procesamiento de documentos, IA, almacenamiento de notas.</li>
              <li><strong>Cobros y facturación</strong> (ejecución del contrato): a través de Paddle.</li>
              <li><strong>Seguridad y prevención de fraude</strong> (interés legítimo): logs, detección de abusos.</li>
              <li><strong>Mejora del producto</strong> (interés legítimo): analítica agregada y anonimizada.</li>
              <li><strong>Soporte al cliente</strong> (ejecución del contrato): responder a tus consultas.</li>
              <li><strong>Marketing</strong> (consentimiento): solo si lo aceptás explícitamente.</li>
              <li><strong>Cumplimiento legal</strong>: cuando la ley nos lo exija.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl text-ink">4. Con quién compartimos tus datos</h2>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li><strong>Paddle.com</strong> — Comerciante Registrado para venta del producto, gestión de suscripciones, pagos, cumplimiento fiscal y facturación.</li>
              <li><strong>Proveedores de infraestructura:</strong> Supabase (base de datos y hosting), Cloudflare (CDN y edge computing), Lovable (plataforma).</li>
              <li><strong>Proveedores de IA:</strong> Google y OpenAI (procesan los textos que enviamos para generar resúmenes, mapas, flashcards y respuestas de chat).</li>
              <li><strong>Asesores profesionales:</strong> contables y legales cuando sea necesario.</li>
              <li><strong>Autoridades competentes:</strong> cuando la ley lo requiera.</li>
            </ul>
            <p className="mt-2">No vendemos tus datos personales a terceros.</p>
          </section>

          <section>
            <h2 className="font-display text-xl text-ink">5. Retención</h2>
            <p>
              Conservamos tus datos mientras tengas una cuenta activa. Si eliminás tu cuenta, borramos tus 
              datos personales en un plazo de 90 días, salvo aquellos que debamos conservar por obligaciones 
              legales (por ejemplo, registros contables y fiscales).
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-ink">6. Tus derechos</h2>
            <p>
              Según la ley aplicable (incluida la Ley 25.326 de Protección de Datos Personales de Argentina), 
              tenés derecho a:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Acceder a tus datos;</li>
              <li>Rectificar datos inexactos;</li>
              <li>Solicitar la eliminación;</li>
              <li>Oponerte al tratamiento o restringirlo;</li>
              <li>Solicitar portabilidad;</li>
              <li>Retirar el consentimiento cuando sea la base legal;</li>
              <li>Presentar reclamos ante la autoridad de protección de datos competente.</li>
            </ul>
            <p className="mt-2">
              Para ejercer estos derechos, contactanos desde la aplicación. Responderemos dentro de los 30 días.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-ink">7. Seguridad</h2>
            <p>
              Aplicamos medidas técnicas y organizativas apropiadas: cifrado en tránsito (HTTPS) y en reposo, 
              control de accesos, autenticación segura, copias de respaldo y monitoreo de seguridad. 
              Ningún sistema es 100% seguro: no podemos garantizar seguridad absoluta.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-ink">8. Transferencias internacionales</h2>
            <p>
              Algunos de nuestros proveedores procesan datos fuera de Argentina (Estados Unidos, Unión Europea). 
              Estos proveedores ofrecen garantías adecuadas (cláusulas contractuales tipo o decisiones de 
              adecuación) para proteger tus datos.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-ink">9. Cookies</h2>
            <p>
              Usamos cookies esenciales para mantener tu sesión, almacenar preferencias y proteger contra abusos. 
              No usamos cookies de marketing ni publicidad de terceros sin tu consentimiento.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-ink">10. Menores</h2>
            <p>
              Si sos menor de 13 años, no podés usar Autodidactas sin autorización de tu representante legal. 
              No recolectamos a sabiendas datos de menores sin esa autorización.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-ink">11. Cambios</h2>
            <p>
              Podemos actualizar esta política. Te notificaremos los cambios sustanciales por email 
              o dentro de la aplicación.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
