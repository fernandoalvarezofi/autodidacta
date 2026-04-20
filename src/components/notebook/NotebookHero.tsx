import { Sparkles, Calendar, BookText } from "lucide-react";
import { Link } from "@tanstack/react-router";

interface NotebookHeroProps {
  title: string;
  description: string | null;
  emoji: string;
  coverColor: string | null;
  createdAt: string;
  documentsCount: number;
  readyDocsCount: number;
  notebookId: string;
}

const COVER_THEMES: Record<
  string,
  { bg: string; orb1: string; orb2: string; pattern: string }
> = {
  orange: {
    bg: "from-cream via-paper to-cream",
    orb1: "bg-orange/15",
    orb2: "bg-orange/10",
    pattern: "rgba(165,28,48,0.06)",
  },
  cream: {
    bg: "from-cream via-paper to-cream",
    orb1: "bg-orange/12",
    orb2: "bg-ink/8",
    pattern: "rgba(165,28,48,0.05)",
  },
  ink: {
    bg: "from-ink/10 via-cream to-paper",
    orb1: "bg-ink/15",
    orb2: "bg-orange/12",
    pattern: "rgba(30,20,15,0.06)",
  },
};

export function NotebookHero({
  title,
  description,
  emoji,
  coverColor,
  createdAt,
  documentsCount,
  readyDocsCount,
  notebookId,
}: NotebookHeroProps) {
  const theme = COVER_THEMES[coverColor ?? "orange"] ?? COVER_THEMES.orange;
  const created = new Date(createdAt).toLocaleDateString("es", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <section className="relative mb-10 overflow-hidden rounded-2xl border border-border shadow-elevated animate-fade-up">
      {/* Cover ilustrado */}
      <div className={`relative h-[260px] md:h-[300px] bg-gradient-to-br ${theme.bg}`}>
        {/* Orb 1 — gran círculo difuso */}
        <div
          className={`absolute -top-24 -right-16 w-[420px] h-[420px] ${theme.orb1} rounded-full blur-3xl opacity-70 animate-pulse-slow`}
          style={{ animationDuration: "8s" }}
        />
        {/* Orb 2 — segundo círculo */}
        <div
          className={`absolute -bottom-32 -left-20 w-[340px] h-[340px] ${theme.orb2} rounded-full blur-3xl opacity-60 animate-pulse-slow`}
          style={{ animationDuration: "11s", animationDelay: "1s" }}
        />
        {/* Trama de puntos sutil */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `radial-gradient(circle, ${theme.pattern} 1px, transparent 1px)`,
            backgroundSize: "22px 22px",
          }}
        />
        {/* Líneas decorativas tipo cuaderno */}
        <div className="absolute inset-0 opacity-[0.06]">
          <div
            className="h-full"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, transparent, transparent 31px, var(--color-ink) 31px, var(--color-ink) 32px)",
            }}
          />
        </div>

        {/* Lomo de cuaderno (línea vertical en el lado izq) */}
        <div className="absolute left-10 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-orange/40 to-transparent" />

        {/* Sticker de fecha — esquina sup. derecha */}
        <div className="absolute top-5 right-5 inline-flex items-center gap-1.5 px-3 py-1.5 bg-paper/90 backdrop-blur-sm border border-border rounded-full text-[10px] font-mono uppercase tracking-[0.18em] text-ink/60 shadow-soft">
          <Calendar className="w-3 h-3" strokeWidth={2} />
          {created}
        </div>

        {/* Etiqueta tipo lomo */}
        <div className="absolute top-5 left-5 inline-flex items-center gap-1.5 px-3 py-1.5 bg-ink text-paper text-[10px] font-mono uppercase tracking-[0.22em] rounded-full shadow-ink">
          <BookText className="w-3 h-3" strokeWidth={2} />
          Cuaderno
        </div>

        {/* Emoji XL flotante */}
        <div className="absolute bottom-0 right-10 translate-y-1/3 select-none pointer-events-none">
          <div className="text-[160px] md:text-[200px] leading-none drop-shadow-[0_20px_40px_rgba(0,0,0,0.18)] rotate-[-6deg] hover:rotate-0 transition-transform duration-700">
            {emoji}
          </div>
        </div>
      </div>

      {/* Banda inferior con título superpuesto */}
      <div className="relative bg-paper px-6 md:px-10 pt-6 pb-7">
        {/* Acento naranja izquierdo */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-orange" />

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5">
          <div className="flex-1 min-w-0 max-w-3xl">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.02] text-ink">
              {title}
            </h1>
            {description && (
              <p className="text-ink/65 leading-relaxed mt-3 max-w-2xl text-[15px]">
                {description}
              </p>
            )}
          </div>

          {readyDocsCount > 0 && (
            <Link
              to="/review/$notebookId"
              params={{ notebookId }}
              className="group inline-flex items-center gap-2 px-5 py-3 text-sm font-medium bg-gradient-ink text-paper hover:shadow-orange transition-all active:scale-95 self-start md:self-auto rounded-md"
            >
              <Sparkles
                className="w-4 h-4 group-hover:rotate-12 transition-transform"
                strokeWidth={2}
              />
              Repasar ahora
              <span className="text-[10px] font-mono uppercase tracking-wider text-paper/60 ml-1">
                {documentsCount} docs
              </span>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
