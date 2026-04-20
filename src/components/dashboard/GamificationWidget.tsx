import { useEffect, useState } from "react";
import { Flame, Sparkles, Trophy, TrendingUp } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { useCountUp } from "@/hooks/use-count-up";

interface ProfileStats {
  xp: number;
  streak_days: number;
  level: string;
}

const LEVEL_THRESHOLDS: Array<{ level: string; min: number; next: number | null }> = [
  { level: "Aprendiz", min: 0, next: 200 },
  { level: "Estudioso", min: 200, next: 700 },
  { level: "Erudito", min: 700, next: 2000 },
  { level: "Maestro", min: 2000, next: 5000 },
  { level: "Sabio", min: 5000, next: null },
];

export function GamificationWidget() {
  const { user } = useAuth();
  const [stats, setStats] = useState<ProfileStats | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("xp, streak_days, level")
        .eq("id", user.id)
        .maybeSingle();
      if (data) setStats(data as ProfileStats);
    })();
  }, [user]);

  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-[124px] border border-border bg-cream/20 animate-pulse rounded-md" />
        ))}
      </div>
    );
  }

  const tier = LEVEL_THRESHOLDS.find((t) => t.level === stats.level) ?? LEVEL_THRESHOLDS[0];
  const progress =
    tier.next === null
      ? 100
      : Math.min(100, Math.round(((stats.xp - tier.min) / (tier.next - tier.min)) * 100));

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
      <StatCard
        icon={<Flame className="w-4 h-4 text-orange" strokeWidth={2} />}
        label="Racha actual"
        target={stats.streak_days}
        suffix={stats.streak_days === 1 ? " día" : " días"}
        accent={stats.streak_days > 0}
        sublabel={stats.streak_days >= 7 ? "🔥 ¡Imparable!" : stats.streak_days > 0 ? "Seguí así" : "Empezá hoy"}
      />
      <StatCard
        icon={<Sparkles className="w-4 h-4 text-orange" strokeWidth={2} />}
        label="XP acumulado"
        target={stats.xp}
        sublabel="Cada repaso suma"
      />
      <div className="relative border border-border bg-paper p-5 hover:border-ink/30 transition-all rounded-md group overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 -z-0 opacity-40 bg-radial-orange pointer-events-none" />
        <div className="relative">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-orange" strokeWidth={2} />
              <p className="text-[10px] uppercase tracking-[0.2em] font-mono text-ink/50">Nivel</p>
            </div>
            {tier.next !== null && (
              <span className="text-[10px] font-mono text-ink/40">{progress}%</span>
            )}
          </div>
          <p className="font-display text-2xl font-semibold text-ink mb-3 leading-none">
            {stats.level}
          </p>
          <div className="h-1 bg-border overflow-hidden rounded-full">
            <div
              className="h-full bg-gradient-orange transition-all duration-1000 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-[10px] uppercase tracking-wider font-mono text-ink/50 mt-2.5">
            {tier.next === null
              ? "Nivel máximo alcanzado"
              : `${(tier.next - stats.xp).toLocaleString("es")} XP para subir`}
          </p>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  target,
  suffix = "",
  sublabel,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  target: number;
  suffix?: string;
  sublabel?: string;
  accent?: boolean;
}) {
  const { ref, value } = useCountUp(target, 1400);
  return (
    <div className="relative border border-border bg-paper p-5 hover:border-ink/30 transition-all rounded-md group overflow-hidden">
      {accent && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-orange opacity-80" />
      )}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {icon}
          <p className="text-[10px] uppercase tracking-[0.2em] font-mono text-ink/50">{label}</p>
        </div>
        {target > 0 && (
          <TrendingUp className="w-3.5 h-3.5 text-ink/30 group-hover:text-orange transition-colors" strokeWidth={2} />
        )}
      </div>
      <p className="font-display text-3xl font-semibold text-ink leading-none tabular-nums">
        <span ref={ref}>{value.toLocaleString("es")}</span>
        <span className="text-base text-ink/50 font-normal">{suffix}</span>
      </p>
      {sublabel && (
        <p className="text-[10px] uppercase tracking-wider font-mono text-ink/40 mt-2.5">
          {sublabel}
        </p>
      )}
    </div>
  );
}
