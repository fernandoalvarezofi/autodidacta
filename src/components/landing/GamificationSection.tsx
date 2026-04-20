import { motion } from "framer-motion";
import { useCountUp } from "@/hooks/use-count-up";
import { SectionHeader } from "./ConverterDemo";

function Stat({
  value,
  label,
  suffix = "",
  prefix = "",
}: {
  value: number;
  label: string;
  suffix?: string;
  prefix?: string;
}) {
  const { ref, value: v } = useCountUp(value);
  return (
    <div className="text-center">
      <div
        className="font-display font-bold text-gradient-brand"
        style={{ fontSize: "clamp(2.5rem, 6vw, 4rem)" }}
      >
        <span ref={ref}>
          {prefix}
          {v.toLocaleString("es-AR")}
          {suffix}
        </span>
      </div>
      <div className="text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

const BADGES = [
  { name: "Primera clase", rarity: "common", icon: "🎓", color: "oklch(70% 0.05 264)" },
  { name: "Racha 7 días", rarity: "rare", icon: "🔥", color: "oklch(75% 0.18 55)" },
  { name: "Quiz perfecto", rarity: "epic", icon: "💎", color: "oklch(72% 0.20 195)" },
  { name: "Maestro SM-2", rarity: "legendary", icon: "👑", color: "oklch(78% 0.22 142)" },
];

export function GamificationSection() {
  return (
    <section
      className="py-28 relative overflow-hidden"
      style={{
        backgroundImage:
          "radial-gradient(circle, oklch(30% 0.04 264 / 0.4) 1px, transparent 1px)",
        backgroundSize: "26px 26px",
      }}
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 30%, oklch(12% 0.02 264) 70%)",
        }}
      />

      <div className="container mx-auto px-6 max-w-7xl relative">
        <SectionHeader
          eyebrow="Gamificación"
          title={
            <>
              Estudiar puede ser{" "}
              <span className="text-gradient-brand">adictivo</span>.
            </>
          }
          subtitle="Streaks, XP, badges, salas competitivas. Estudiar deja de ser una obligación."
        />

        {/* Stats */}
        <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-8">
          <Stat value={430000} label="estudiantes activos" suffix="+" />
          <Stat value={12} label="millones de flashcards" suffix="M" />
          <Stat value={98} label="% satisfacción" suffix="%" />
        </div>

        {/* 3 columnas */}
        <div className="mt-20 grid lg:grid-cols-3 gap-6">
          {/* Streak */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl p-8 bg-gradient-card border border-border shadow-card text-center"
          >
            <div className="text-7xl animate-flame inline-block">🔥</div>
            <div
              className="mt-4 font-display font-bold"
              style={{ fontSize: "clamp(2.5rem, 5vw, 3.5rem)" }}
            >
              42
            </div>
            <div className="text-muted-foreground">días de racha</div>
            <div
              className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
              style={{
                background: "oklch(75% 0.18 55 / 0.18)",
                color: "oklch(82% 0.18 55)",
              }}
            >
              ★ Récord personal
            </div>
          </motion.div>

          {/* Quiz live */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-2xl p-8 bg-gradient-card border border-border shadow-card"
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-[oklch(78%_0.22_142)] animate-pulse" />
              <span className="text-xs font-mono uppercase tracking-wider">
                Sala en vivo · 18 jugadores
              </span>
            </div>
            <div className="space-y-2">
              {[
                { name: "Lu 🦊", score: 1840, you: false },
                { name: "Vos", score: 1720, you: true },
                { name: "Mateo", score: 1580, you: false },
                { name: "Ana", score: 1410, you: false },
              ].map((p, i) => (
                <div
                  key={p.name}
                  className="flex items-center justify-between rounded-lg px-3 py-2.5 transition-all"
                  style={{
                    background: p.you
                      ? "oklch(65% 0.25 264 / 0.18)"
                      : "oklch(18% 0.025 264)",
                    border: p.you
                      ? "1px solid oklch(65% 0.25 264 / 0.5)"
                      : "1px solid transparent",
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm font-mono text-muted-foreground w-5">
                      #{i + 1}
                    </span>
                    <span className="font-medium">{p.name}</span>
                  </div>
                  <span className="font-mono font-bold text-gradient-brand">
                    {p.score}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-2xl p-8 bg-gradient-card border border-border shadow-card"
          >
            <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-4">
              Badges desbloqueables
            </div>
            <div className="grid grid-cols-2 gap-3">
              {BADGES.map((b) => (
                <div
                  key={b.name}
                  className="rounded-xl p-3 text-center border border-border transition-transform hover:scale-105"
                  style={{
                    background: "oklch(15% 0.02 264 / 0.6)",
                    boxShadow:
                      b.rarity === "legendary"
                        ? `0 0 20px ${b.color}`
                        : undefined,
                  }}
                >
                  <div className="text-3xl">{b.icon}</div>
                  <div className="text-xs font-semibold mt-1.5">{b.name}</div>
                  <div
                    className="text-[10px] uppercase font-mono mt-0.5"
                    style={{ color: b.color }}
                  >
                    {b.rarity}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
