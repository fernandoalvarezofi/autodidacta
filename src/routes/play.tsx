import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Loader2,
  Sparkles,
  Trophy,
  Users,
  ArrowLeft,
  Hash,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { findRoomByCode, joinRoom, pickAvatar } from "@/lib/quiz-room";
import { toast } from "sonner";

export const Route = createFileRoute("/play")({
  component: PlayPage,
});

function PlayPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [joining, setJoining] = useState(false);
  const [openRooms, setOpenRooms] = useState<Array<{ id: string; code: string; quiz_title: string; participants: number }>>([]);

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/auth" });
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle();
      if (profile?.full_name) setName(profile.full_name.split(" ")[0]);
    })();
  }, [user]);

  // Buscar salas abiertas
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: rooms } = await supabase
        .from("quiz_rooms")
        .select("id, code, quiz_title")
        .eq("status", "lobby")
        .order("created_at", { ascending: false })
        .limit(8);
      if (!rooms) return;
      const counts = await Promise.all(
        rooms.map(async (r) => {
          const { count } = await supabase
            .from("quiz_room_participants")
            .select("*", { count: "exact", head: true })
            .eq("room_id", r.id);
          return { ...r, participants: count ?? 0 };
        }),
      );
      setOpenRooms(counts);
    })();
  }, [user]);

  const handleJoin = async (targetCode?: string) => {
    if (!user) return;
    const useCode = (targetCode ?? code).trim().toUpperCase();
    if (useCode.length !== 6) {
      toast.error("El código debe tener 6 caracteres");
      return;
    }
    if (!name.trim()) {
      toast.error("Ingresá un nombre visible");
      return;
    }
    setJoining(true);
    try {
      const room = await findRoomByCode(useCode);
      if (!room) {
        toast.error("Sala no encontrada");
        return;
      }
      if (room.status === "finished") {
        toast.error("Esta sala ya terminó");
        return;
      }
      await joinRoom({
        roomId: room.id,
        userId: user.id,
        displayName: name.trim().slice(0, 30),
        avatar: pickAvatar(),
      });
      navigate({ to: "/play/$roomId", params: { roomId: room.id } });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo unir");
    } finally {
      setJoining(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <Loader2 className="w-6 h-6 animate-spin text-ink/40" />
      </div>
    );
  }

  return (
    <DashboardShell>
      <div className="container mx-auto px-6 lg:px-10 max-w-[900px] py-10">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-ink/60 hover:text-ink mb-6 transition-colors group"
        >
          <ArrowLeft
            className="w-4 h-4 group-hover:-translate-x-1 transition-transform"
            strokeWidth={1.75}
          />
          Volver al panel
        </Link>

        <div className="mb-10 pb-8 border-b-2 border-ink animate-fade-up">
          <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.25em] text-orange font-mono mb-3">
            <Trophy className="w-3 h-3" strokeWidth={2} />
            Multijugador
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight leading-tight">
            Quiz competitivo
          </h1>
          <p className="text-base text-ink/60 mt-3 max-w-xl">
            Creá una sala desde cualquiera de tus quizzes o uníte con un código que te pasaron.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* JOIN */}
          <div className="space-y-5">
            <div>
              <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-ink/50 font-mono mb-2">
                <Hash className="w-3 h-3" strokeWidth={2} />
                Unirme
              </span>
              <h2 className="font-display text-xl font-medium">Tengo un código</h2>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre visible"
                maxLength={30}
                className="w-full bg-paper border-2 border-border px-4 py-3 text-sm focus:border-ink focus:outline-none"
              />
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 6))}
                placeholder="ABCDEF"
                maxLength={6}
                className="w-full bg-paper border-2 border-border px-4 py-4 text-2xl font-display font-bold tracking-[0.4em] text-center focus:border-orange focus:outline-none uppercase"
                onKeyDown={(e) => {
                  if (e.key === "Enter") void handleJoin();
                }}
              />
              <button
                onClick={() => handleJoin()}
                disabled={joining || code.length !== 6 || !name.trim()}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-ink text-paper font-medium hover:shadow-orange transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
              >
                {joining ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4" strokeWidth={2} />
                )}
                Entrar a la sala
              </button>
            </div>
          </div>

          {/* CREATE */}
          <div className="space-y-5">
            <div>
              <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-orange font-mono mb-2">
                <Sparkles className="w-3 h-3" strokeWidth={2} />
                Crear
              </span>
              <h2 className="font-display text-xl font-medium">Soy el host</h2>
            </div>
            <div className="border-2 border-dashed border-border bg-cream/30 p-6 text-center space-y-3">
              <p className="text-sm text-ink/70 leading-relaxed">
                Para crear una sala, abrí cualquier documento procesado, andá al tab{" "}
                <span className="font-medium text-ink">Quiz</span> y tocá{" "}
                <span className="font-medium text-ink">"Jugar contra otros"</span>.
              </p>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm border-2 border-ink hover:bg-ink hover:text-paper transition-colors"
              >
                Ver mis documentos
                <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
              </Link>
            </div>
          </div>
        </div>

        {/* Salas abiertas */}
        {openRooms.length > 0 && (
          <div className="mt-12">
            <h3 className="font-display text-sm font-medium uppercase tracking-wider text-ink/60 mb-4">
              Salas abiertas
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {openRooms.map((r) => (
                <button
                  key={r.id}
                  onClick={() => handleJoin(r.code)}
                  className="group flex items-center justify-between gap-3 p-4 border-2 border-border hover:border-ink hover:shadow-sm transition-all bg-paper text-left"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-xs text-ink/50 mb-1">{r.code}</p>
                    <p className="text-sm font-medium truncate">{r.quiz_title}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-ink/60 shrink-0">
                    <Users className="w-3.5 h-3.5" strokeWidth={1.75} />
                    {r.participants}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
