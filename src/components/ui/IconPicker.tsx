import { useState } from "react";
import { X, Search } from "lucide-react";
import {
  ClayIcon,
  ICON_CATEGORIES,
  ICON_LABEL,
  type ClayIconKey,
} from "@/lib/clay-icons";

interface IconPickerProps {
  open: boolean;
  value?: ClayIconKey | null;
  onPick: (icon: ClayIconKey) => void;
  onClose: () => void;
  title?: string;
}

/**
 * Modal con grid categorizado de iconos clay.
 * Sustituye al input de emoji en toda la app.
 */
export function IconPicker({
  open,
  value,
  onPick,
  onClose,
  title = "Elegí un icono",
}: IconPickerProps) {
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState<string>("all");

  if (!open) return null;

  const q = query.trim().toLowerCase();

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center px-4 animate-fade-in">
      <div
        className="absolute inset-0 bg-ink/55 backdrop-blur-md"
        onClick={onClose}
      />
      <div className="relative w-full max-w-3xl max-h-[85vh] flex flex-col bg-paper border border-ink/20 shadow-elevated animate-scale-in rounded-2xl overflow-hidden">
        {/* Header */}
        <header className="flex items-start justify-between px-6 py-5 border-b border-border">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-orange font-mono mb-1">
              Galería
            </p>
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-ink/40 hover:text-ink hover:bg-cream/60 transition-all rounded-md"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4" strokeWidth={1.75} />
          </button>
        </header>

        {/* Search + categorías */}
        <div className="px-6 py-3 border-b border-border bg-cream/30 space-y-3">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink/40"
              strokeWidth={2}
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar icono…"
              className="w-full pl-9 pr-3 py-2 text-[13px] bg-paper border border-border rounded-full focus:border-ink/40 focus:ring-2 focus:ring-ink/5 focus:outline-none placeholder:text-ink/40"
              autoFocus
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            <CatChip
              active={activeCat === "all"}
              onClick={() => setActiveCat("all")}
              label="Todos"
            />
            {ICON_CATEGORIES.map((c) => (
              <CatChip
                key={c.id}
                active={activeCat === c.id}
                onClick={() => setActiveCat(c.id)}
                label={c.label}
              />
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {ICON_CATEGORIES.filter(
            (c) => activeCat === "all" || c.id === activeCat,
          ).map((cat) => {
            const filtered = cat.icons.filter(
              (i) =>
                !q ||
                i.includes(q) ||
                ICON_LABEL[i].toLowerCase().includes(q),
            );
            if (filtered.length === 0) return null;
            return (
              <section key={cat.id} className="mb-6 last:mb-0">
                {activeCat === "all" && (
                  <h3 className="text-[10px] font-mono uppercase tracking-[0.22em] text-ink/45 mb-2.5">
                    {cat.label}
                  </h3>
                )}
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-7 gap-2">
                  {filtered.map((icon, idx) => {
                    const active = value === icon;
                    return (
                      <button
                        key={icon}
                        onClick={() => {
                          onPick(icon);
                          onClose();
                        }}
                        className={`group relative flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all hover:-translate-y-0.5 ${
                          active
                            ? "border-orange/60 bg-orange/[0.06] shadow-soft"
                            : "border-transparent hover:border-border hover:bg-paper"
                        }`}
                        title={ICON_LABEL[icon]}
                        style={{ animationDelay: `${idx * 15}ms` }}
                      >
                        <ClayIcon icon={icon} size={44} />
                        <span className="text-[10px] text-ink/55 group-hover:text-ink/80 truncate w-full text-center">
                          {ICON_LABEL[icon]}
                        </span>
                        {active && (
                          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-orange shadow-orange" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function CatChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 text-[11.5px] rounded-full transition-all ${
        active
          ? "bg-ink text-paper shadow-soft"
          : "bg-paper text-ink/65 border border-border hover:border-ink/30 hover:text-ink"
      }`}
    >
      {label}
    </button>
  );
}
