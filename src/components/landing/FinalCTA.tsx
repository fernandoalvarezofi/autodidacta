import { motion } from "framer-motion";
import { ArrowRight, BookMarked } from "lucide-react";

export function FinalCTA() {
  return (
    <section className="py-28 lg:py-36 border-t border-border">
      <div className="container mx-auto px-6 lg:px-10 max-w-[1200px] text-center">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-[10px] font-mono uppercase tracking-[0.2em] text-ink/55 mb-8"
        >
          Colofón
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="font-display font-semibold tracking-tight leading-[1.05] max-w-4xl mx-auto"
          style={{ fontSize: "clamp(2.25rem, 5.5vw, 4.25rem)" }}
        >
          El estudio merece{" "}
          <span className="italic text-orange font-normal">una herramienta</span>{" "}
          a su altura.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mt-6 text-lg text-ink/70 max-w-xl mx-auto"
        >
          Crear una cuenta es gratis y toma menos de un minuto. No requiere
          tarjeta de crédito.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-10"
        >
          <a
            href="/auth"
            className="group inline-flex items-center gap-2 px-7 py-4 bg-ink text-paper text-sm font-medium hover:bg-orange-deep transition-colors"
          >
            Comenzar a estudiar
            <ArrowRight
              className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
              strokeWidth={1.75}
            />
          </a>
        </motion.div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-cream">
      <div className="container mx-auto px-6 lg:px-10 max-w-[1200px] py-14">
        <div className="grid md:grid-cols-12 gap-10">
          <div className="md:col-span-5">
            <div className="flex items-center gap-2.5">
              <BookMarked className="w-5 h-5 text-orange" strokeWidth={1.75} />
              <span className="font-display font-semibold text-xl">
                Autodidactas
              </span>
            </div>
            <p className="mt-4 text-sm text-ink/65 max-w-sm leading-relaxed">
              Plataforma de estudio activo para estudiantes universitarios,
              profesionales y educadores.
            </p>
            <p className="mt-6 text-[11px] font-mono uppercase tracking-[0.15em] text-ink/45">
              Establecida en 2025
            </p>
          </div>

          <FooterCol
            title="Producto"
            links={["Método", "Capacidades", "Evidencia", "Planes"]}
          />
          <FooterCol
            title="Recursos"
            links={["Documentación", "Blog académico", "Investigación", "Centro de ayuda"]}
          />
          <FooterCol
            title="Compañía"
            links={["Sobre nosotros", "Contacto", "Términos", "Privacidad"]}
          />
        </div>

        <div className="mt-14 pt-6 rule-thin flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-ink/55">
          <span>© {new Date().getFullYear()} Autodidactas. Todos los derechos reservados.</span>
          <div className="font-mono uppercase tracking-[0.15em]">
            Hecho con rigor académico
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: string[] }) {
  return (
    <div className="md:col-span-2">
      <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-ink/55 mb-4">
        {title}
      </div>
      <ul className="space-y-2.5 text-sm">
        {links.map((l) => (
          <li key={l}>
            <a href="#" className="text-ink/80 hover:text-orange transition-colors">
              {l}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
