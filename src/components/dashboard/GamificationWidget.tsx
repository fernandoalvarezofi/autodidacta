import { useEffect, useState } from "react";
import { Flame, Sparkles, Trophy } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";

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

  if (!stats) return null;

  const tier = LEVEL_THRESHOLDS.find((t) => t.level === stats.level) ?? LEVEL_THRESHOLDS[0];
  const progress =
    tier.next === null
      ? 100
      : Math.min(100, Math.round(((stats.xp - tier.min) / (tier.next - tier.min)) * 100));

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
      <Stat
        icon={<Flame className="w-5 h-5 text-orange" strokeWidth={1.75} />}
        label="Racha"
        value={`${stats.streak_days} ${stats.streak_days === 1 ? "día" : "días"}`}
      />
      <Stat
        icon={<Sparkles className="w-5 h-5 text-orange" strokeWidth={1.75} />}
        label="XP total"
        value={stats.xp.toLocaleString("es")}
      />
      <div className="border border-border bg-cream/30 p-5">
        <div className="flex items-center gap-2 mb-2">
          <Trophy className="w-5 h-5 text-orange" strokeWidth={1.75} />
          <p className="text-xs uppercase tracking-wider font-mono text-ink/60">Nivel</p>
        </div>
        <p className="font-display text-xl font-semibold text-ink mb-3">{stats.level}</p>
        <div className="h-1 bg-border overflow-hidden">
          <div
            className="h-full bg-orange transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-[10px] uppercase tracking-wider font-mono text-ink/50 mt-2">
          {tier.next === null ? "Nivel máximo" : `${tier.next - stats.xp} XP para subir`}
        </p>
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="border border-border bg-cream/30 p-5">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <p className="text-xs uppercase tracking-wider font-mono text-ink/60">{label}</p>
      </div>
      <p className="font-display text-2xl font-semibold text-ink">{value}</p>
    </div>
  );
}
