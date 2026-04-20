import { motion } from "framer-motion";

export function FinalCTA() {
  return (
    <section className="relative py-32 overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-mesh animate-mesh-move opacity-90"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, transparent, oklch(12% 0.02 264) 80%)",
        }}
      />

      <div className="container mx-auto px-6 max-w-3xl text-center relative">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="font-display font-bold tracking-tight"
          style={{ fontSize: "clamp(2.25rem, 6vw, 4.5rem)" }}
        >
          ¿Listo para estudiar{" "}
          <span className="text-gradient-brand">diferente</span>?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-5 text-lg text-muted-foreground"
        >
          Sin tarjeta de crédito. Sin instalar nada. En 30 segundos tenés tu
          primer notebook.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-9"
        >
          <a
            href="/auth"
            className="inline-flex items-center justify-center px-8 py-4 rounded-2xl font-semibold text-lg text-primary-foreground bg-gradient-brand animate-pulse-glow active:scale-[0.97] hover:scale-[1.03] transition-transform"
          >
            Crear mi cuenta gratis
            <span className="ml-2">→</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border py-14">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-brand shadow-glow-brand" />
              <span className="font-display font-bold text-xl">
                Autodidactas
              </span>
            </div>
            <p className="mt-3 text-muted-foreground max-w-sm">
              Convertí cualquier cosa en conocimiento. Estudiá como nunca antes.
            </p>
          </div>

          <FooterCol
            title="Producto"
            links={[
              { l: "Features", h: "#demo" },
              { l: "Precios", h: "#pricing" },
              { l: "Notebooks públicos", h: "#" },
              { l: "Cambios", h: "#" },
            ]}
          />
          <FooterCol
            title="Compañía"
            links={[
              { l: "Sobre nosotros", h: "#" },
              { l: "Blog", h: "#" },
              { l: "Contacto", h: "#" },
              { l: "Términos", h: "#" },
            ]}
          />
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-3 text-sm text-muted-foreground">
          <span>© {new Date().getFullYear()} Autodidactas. Hecho con ⚡.</span>
          <div className="flex gap-4">
            {["Twitter", "Instagram", "TikTok", "GitHub"].map((s) => (
              <a key={s} href="#" className="hover:text-foreground transition-colors">
                {s}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { l: string; h: string }[];
}) {
  return (
    <div>
      <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-4">
        {title}
      </div>
      <ul className="space-y-2.5 text-sm">
        {links.map((link) => (
          <li key={link.l}>
            <a
              href={link.h}
              className="text-foreground/80 hover:text-foreground transition-colors"
            >
              {link.l}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
