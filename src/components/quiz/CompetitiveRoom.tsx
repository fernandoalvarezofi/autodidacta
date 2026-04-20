import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Crown,
  Users,
  Loader2,
  Trophy,
  Copy,
  Check,
  Play,
  X,
  Zap,
  ShieldAlert,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import confetti from "canvas-confetti";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import {
  type RoomQuestion,
  type RoomAnswer,
  type AntiCheatEvent,
  calcPoints,
} from "@/lib/quiz-room";

interface RoomRow {
  id: string;
  code: string;
  status: "lobby" | "active" | "finished";
  host_user_id: string;
  quiz_title: string;
  questions: RoomQuestion[];
  current_question_index: number;
  question_started_at: string | null;
  seconds_per_question: number;
  max_participants: number;
  anti_cheat_enabled: boolean;
}

interface ParticipantRow {
  id: string;
  user_id: string;
  display_name: string;
  avatar_emoji: string;
  score: number;
  rank: number | null;
  is_ready: boolean;
  answers: RoomAnswer[];
  anti_cheat_events: AntiCheatEvent[];
}

interface CompetitiveRoomProps {
  roomId: string;
}

export function CompetitiveRoom({ roomId }: CompetitiveRoomProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [room, setRoom] = useState<RoomRow | null>(null);
  const [participants, setParticipants] = useState<ParticipantRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [revealAnswer, setRevealAnswer] = useState(false);
  const answerLockedRef = useRef(false);
  const answerStartRef = useRef<number>(0);

  const isHost = !!user && !!room && user.id === room.host_user_id;
  const myParticipant = useMemo(
    () => participants.find((p) => p.user_id === user?.id) ?? null,
    [participants, user?.id],
  );

  // ===== Load + subscribe =====
  useEffect(() => {
    let alive = true;

    const load = async () => {
      const [{ data: r }, { data: ps }] = await Promise.all([
        supabase.from("quiz_rooms").select("*").eq("id", roomId).maybeSingle(),
        supabase.from("quiz_room_participants").select("*").eq("room_id", roomId),
      ]);
      if (!alive) return;
      if (!r) {
        toast.error("Sala no encontrada");
        navigate({ to: "/play" });
        return;
      }
      setRoom(r as unknown as RoomRow);
      setParticipants((ps ?? []) as unknown as ParticipantRow[]);
      setLoading(false);
    };
    load();

    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "quiz_rooms", filter: `id=eq.${roomId}` },
        (payload) => {
          if (payload.eventType === "DELETE") {
            toast.error("La sala fue cerrada");
            navigate({ to: "/play" });
            return;
          }
          setRoom(payload.new as unknown as RoomRow);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "quiz_room_participants",
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          setParticipants((curr) => {
            if (payload.eventType === "DELETE") {
              return curr.filter((p) => p.id !== (payload.old as { id: string }).id);
            }
            const next = payload.new as unknown as ParticipantRow;
            const idx = curr.findIndex((p) => p.id === next.id);
            if (idx === -1) return [...curr, next];
            const copy = [...curr];
            copy[idx] = next;
            return copy;
          });
        },
      )
      .subscribe();

    return () => {
      alive = false;
      void supabase.removeChannel(channel);
    };
  }, [roomId, navigate]);

  // ===== Tick clock for timer =====
  useEffect(() => {
    if (room?.status !== "active") return;
    const id = window.setInterval(() => setNow(Date.now()), 100);
    return () => window.clearInterval(id);
  }, [room?.status]);

  // ===== Reset selection on new question =====
  useEffect(() => {
    if (!room) return;
    setSelectedAnswer(null);
    setRevealAnswer(false);
    answerLockedRef.current = false;
    answerStartRef.current = room.question_started_at
      ? new Date(room.question_started_at).getTime()
      : Date.now();
  }, [room?.current_question_index, room?.question_started_at, room]);

  // ===== Anti-cheat: log blur / visibility =====
  const logAntiCheat = useCallback(
    async (type: AntiCheatEvent["type"]) => {
      if (!myParticipant || !room || room.status !== "active") return;
      const event: AntiCheatEvent = {
        type,
        question_index: room.current_question_index,
        at: new Date().toISOString(),
      };
      const events = [...(myParticipant.anti_cheat_events ?? []), event].slice(-20);
      await supabase
        .from("quiz_room_participants")
        .update({ anti_cheat_events: events as unknown as never })
        .eq("id", myParticipant.id);
    },
    [myParticipant, room],
  );

  useEffect(() => {
    if (!room?.anti_cheat_enabled || room.status !== "active" || isHost) return;
    const onBlur = () => void logAntiCheat("blur");
    const onVis = () => {
      if (document.visibilityState === "hidden") void logAntiCheat("visibility_hidden");
    };
    window.addEventListener("blur", onBlur);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [room?.anti_cheat_enabled, room?.status, isHost, logAntiCheat]);

  // ===== Auto-finish on last question timeout (host only) =====
  // ===== Auto-reveal when timer expires =====
  const totalMs = (room?.seconds_per_question ?? 25) * 1000;
  const elapsed = answerStartRef.current ? now - answerStartRef.current : 0;
  const remaining = Math.max(0, totalMs - elapsed);
  const timerExpired = room?.status === "active" && elapsed >= totalMs;

  useEffect(() => {
    if (timerExpired && !revealAnswer) {
      setRevealAnswer(true);
      // Si no respondió, registrar respuesta vacía
      if (!answerLockedRef.current && myParticipant && room) {
        answerLockedRef.current = true;
        const ans: RoomAnswer = {
          question_index: room.current_question_index,
          selected_index: null,
          correct: false,
          time_ms: totalMs,
          points: 0,
        };
        const newAnswers = [...(myParticipant.answers ?? []), ans];
        void supabase
          .from("quiz_room_participants")
          .update({ answers: newAnswers as unknown as never })
          .eq("id", myParticipant.id);
      }
    }
  }, [timerExpired, revealAnswer, myParticipant, room, totalMs]);

  // ===== Confetti on finish =====
  useEffect(() => {
    if (room?.status === "finished") {
      const fire = (origin: { x: number; y: number }) =>
        confetti({
          particleCount: 80,
          spread: 70,
          origin,
          colors: ["#ff6b35", "#f4a261", "#1a1a1a", "#fff5eb"],
        });
      fire({ x: 0.2, y: 0.6 });
      setTimeout(() => fire({ x: 0.8, y: 0.6 }), 200);
      setTimeout(() => fire({ x: 0.5, y: 0.4 }), 400);
    }
  }, [room?.status]);

  // ===== Actions =====
  const copyCode = () => {
    if (!room) return;
    navigator.clipboard.writeText(room.code);
    setCopied(true);
    toast.success("Código copiado");
    setTimeout(() => setCopied(false), 1500);
  };

  const startGame = async () => {
    if (!room || !isHost) return;
    if (participants.length < 1) {
      toast.error("Necesitás al menos 1 jugador");
      return;
    }
    await supabase
      .from("quiz_rooms")
      .update({
        status: "active",
        current_question_index: 0,
        question_started_at: new Date().toISOString(),
      })
      .eq("id", room.id);
  };

  const nextQuestion = async () => {
    if (!room || !isHost) return;
    const next = room.current_question_index + 1;
    if (next >= room.questions.length) {
      // Calcular ranking final
      const sorted = [...participants].sort((a, b) => b.score - a.score);
      await Promise.all(
        sorted.map((p, idx) =>
          supabase
            .from("quiz_room_participants")
            .update({ rank: idx + 1 })
            .eq("id", p.id),
        ),
      );
      await supabase
        .from("quiz_rooms")
        .update({ status: "finished", finished_at: new Date().toISOString() })
        .eq("id", room.id);
    } else {
      await supabase
        .from("quiz_rooms")
        .update({
          current_question_index: next,
          question_started_at: new Date().toISOString(),
        })
        .eq("id", room.id);
    }
  };

  const submitAnswer = async (idx: number) => {
    if (!room || !myParticipant || answerLockedRef.current || revealAnswer) return;
    answerLockedRef.current = true;
    setSelectedAnswer(idx);

    const q = room.questions[room.current_question_index];
    const correct = idx === q.correct_index;
    const timeMs = Date.now() - answerStartRef.current;
    const points = calcPoints(correct, timeMs, totalMs);

    const ans: RoomAnswer = {
      question_index: room.current_question_index,
      selected_index: idx,
      correct,
      time_ms: timeMs,
      points,
    };
    const newAnswers = [...(myParticipant.answers ?? []), ans];
    const newScore = myParticipant.score + points;

    await supabase
      .from("quiz_room_participants")
      .update({
        answers: newAnswers as unknown as never,
        score: newScore,
      })
      .eq("id", myParticipant.id);
  };

  const leaveRoom = async () => {
    if (!myParticipant) {
      navigate({ to: "/play" });
      return;
    }
    if (isHost && room?.status === "lobby") {
      await supabase.from("quiz_rooms").delete().eq("id", roomId);
    } else {
      await supabase.from("quiz_room_participants").delete().eq("id", myParticipant.id);
    }
    navigate({ to: "/play" });
  };

  // ===== Render =====
  if (loading || !room) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-ink/40" />
      </div>
    );
  }

  // ===== LOBBY =====
  if (room.status === "lobby") {
    return <LobbyView room={room} participants={participants} isHost={isHost} onCopy={copyCode} copied={copied} onStart={startGame} onLeave={leaveRoom} />;
  }

  // ===== FINISHED =====
  if (room.status === "finished") {
    return <PodiumView participants={participants} room={room} />;
  }

  // ===== ACTIVE =====
  const currentQ = room.questions[room.current_question_index];
  const sortedParticipants = [...participants].sort((a, b) => b.score - a.score);
  const allAnswered = participants.every((p) =>
    (p.answers ?? []).some((a) => a.question_index === room.current_question_index),
  );

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-orange/10 text-orange-deep text-[11px] font-mono uppercase tracking-wider">
            <span className="w-1.5 h-1.5 bg-orange rounded-full animate-pulse" />
            En vivo
          </span>
          <span className="font-mono text-xs text-ink/60">
            Pregunta {room.current_question_index + 1} / {room.questions.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-ink/40" strokeWidth={1.75} />
          <span className="text-sm font-mono">{participants.length}</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_280px] gap-6">
        {/* Pregunta + opciones */}
        <div className="space-y-5">
          <TimerBar remaining={remaining} total={totalMs} />

          <motion.h2
            key={room.current_question_index}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-2xl md:text-3xl font-semibold leading-tight text-ink"
          >
            {currentQ.question}
          </motion.h2>

          <div className="grid sm:grid-cols-2 gap-3">
            {currentQ.options.map((opt, i) => {
              const isSelected = selectedAnswer === i;
              const isCorrect = i === currentQ.correct_index;
              const showState = revealAnswer;
              return (
                <motion.button
                  key={i}
                  whileHover={!revealAnswer && !answerLockedRef.current ? { y: -2 } : {}}
                  whileTap={{ scale: 0.98 }}
                  disabled={revealAnswer || answerLockedRef.current || isHost}
                  onClick={() => submitAnswer(i)}
                  className={`group relative text-left p-4 border-2 transition-all ${
                    showState && isCorrect
                      ? "border-green-600 bg-green-50"
                      : showState && isSelected && !isCorrect
                        ? "border-red-500 bg-red-50"
                        : isSelected
                          ? "border-orange bg-orange/5"
                          : "border-border bg-paper hover:border-ink hover:shadow-sm"
                  } ${revealAnswer || answerLockedRef.current || isHost ? "cursor-default" : "cursor-pointer"}`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`shrink-0 inline-flex items-center justify-center w-7 h-7 text-xs font-mono font-medium border-2 ${
                        showState && isCorrect
                          ? "border-green-600 bg-green-600 text-white"
                          : showState && isSelected && !isCorrect
                            ? "border-red-500 bg-red-500 text-white"
                            : isSelected
                              ? "border-orange bg-orange text-paper"
                              : "border-ink/20 bg-paper text-ink/60"
                      }`}
                    >
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="text-sm leading-relaxed pt-0.5">{opt}</span>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {revealAnswer && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-l-4 border-orange bg-cream/40 p-4"
            >
              <p className="text-[11px] font-mono uppercase tracking-wider text-orange-deep mb-1">
                Explicación
              </p>
              <p className="text-sm leading-relaxed text-ink/85">{currentQ.explanation}</p>
            </motion.div>
          )}

          {isHost && (revealAnswer || allAnswered) && (
            <button
              onClick={nextQuestion}
              className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-ink text-paper font-medium hover:shadow-orange transition-all active:scale-95"
            >
              {room.current_question_index + 1 >= room.questions.length
                ? "Ver resultados"
                : "Siguiente pregunta"}
              <ArrowRight className="w-4 h-4" strokeWidth={2} />
            </button>
          )}
        </div>

        {/* Leaderboard live */}
        <LiveLeaderboard participants={sortedParticipants} currentUserId={user?.id ?? ""} />
      </div>
    </div>
  );
}

// =====================================================
// SUB-COMPONENTS
// =====================================================

function LobbyView({
  room,
  participants,
  isHost,
  onCopy,
  copied,
  onStart,
  onLeave,
}: {
  room: RoomRow;
  participants: ParticipantRow[];
  isHost: boolean;
  onCopy: () => void;
  copied: boolean;
  onStart: () => void;
  onLeave: () => void;
}) {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-orange/10 text-orange-deep text-[11px] font-mono uppercase tracking-[0.2em]">
          <span className="w-1.5 h-1.5 bg-orange rounded-full animate-pulse" />
          Sala abierta
        </span>
        <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight">
          {room.quiz_title}
        </h1>
        <p className="text-sm text-ink/55">
          {room.questions.length} preguntas · {room.seconds_per_question}s por pregunta
        </p>
      </div>

      {/* Código grande para compartir */}
      <div className="max-w-md mx-auto">
        <p className="text-center text-[11px] font-mono uppercase tracking-[0.2em] text-ink/50 mb-3">
          Código de sala
        </p>
        <button
          onClick={onCopy}
          className="group w-full bg-gradient-warm border-2 border-ink py-6 px-8 hover:shadow-orange transition-all"
        >
          <div className="flex items-center justify-center gap-4">
            <span className="font-display text-5xl md:text-6xl font-bold tracking-[0.3em] text-ink">
              {room.code}
            </span>
            {copied ? (
              <Check className="w-6 h-6 text-orange shrink-0" strokeWidth={2} />
            ) : (
              <Copy
                className="w-6 h-6 text-ink/40 group-hover:text-ink transition-colors shrink-0"
                strokeWidth={1.75}
              />
            )}
          </div>
        </button>
        <p className="text-center text-xs text-ink/50 mt-3">
          Compartí este código o el link de esta página
        </p>
      </div>

      {/* Participantes */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-medium">
            Jugadores
            <span className="ml-2 text-ink/50 font-mono text-sm">
              {participants.length}/{room.max_participants}
            </span>
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          <AnimatePresence>
            {participants.map((p) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                className={`relative border-2 p-4 text-center bg-paper ${
                  p.user_id === room.host_user_id ? "border-orange" : "border-border"
                }`}
              >
                {p.user_id === room.host_user_id && (
                  <Crown
                    className="absolute -top-2 -right-2 w-5 h-5 text-orange bg-paper rounded-full p-0.5"
                    strokeWidth={2}
                    fill="currentColor"
                  />
                )}
                <div className="text-3xl mb-1.5">{p.avatar_emoji}</div>
                <p className="text-xs font-medium truncate">{p.display_name}</p>
              </motion.div>
            ))}
          </AnimatePresence>
          {participants.length === 0 && (
            <p className="col-span-full text-center text-sm text-ink/40 py-8">
              Esperando jugadores...
            </p>
          )}
        </div>
      </div>

      {/* Acciones */}
      <div className="flex items-center justify-center gap-3 pt-4">
        <button
          onClick={onLeave}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm border-2 border-border hover:border-ink transition-colors"
        >
          <X className="w-4 h-4" strokeWidth={1.75} />
          {isHost ? "Cancelar sala" : "Salir"}
        </button>
        {isHost && (
          <button
            onClick={onStart}
            disabled={participants.length === 0}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-ink text-paper font-medium hover:shadow-orange transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
          >
            <Play className="w-4 h-4" strokeWidth={2} fill="currentColor" />
            Empezar partida
          </button>
        )}
      </div>
    </div>
  );
}

function TimerBar({ remaining, total }: { remaining: number; total: number }) {
  const pct = (remaining / total) * 100;
  const seconds = Math.ceil(remaining / 1000);
  const urgent = pct < 25;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs font-mono">
        <span className="text-ink/50 uppercase tracking-wider">Tiempo</span>
        <span className={urgent ? "text-orange-deep font-medium" : "text-ink/60"}>{seconds}s</span>
      </div>
      <div className="h-2 bg-cream overflow-hidden">
        <motion.div
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.1, ease: "linear" }}
          className={`h-full ${urgent ? "bg-orange" : "bg-ink"}`}
        />
      </div>
    </div>
  );
}

function LiveLeaderboard({
  participants,
  currentUserId,
}: {
  participants: ParticipantRow[];
  currentUserId: string;
}) {
  return (
    <div className="bg-cream/40 border-2 border-border p-4 lg:sticky lg:top-24 self-start">
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-border">
        <h3 className="font-display text-sm font-medium uppercase tracking-wider">Ranking</h3>
        <Zap className="w-4 h-4 text-orange" strokeWidth={1.75} />
      </div>
      <LayoutGroup>
        <div className="space-y-2">
          {participants.map((p, idx) => {
            const isMe = p.user_id === currentUserId;
            return (
              <motion.div
                key={p.id}
                layout
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className={`flex items-center gap-3 p-2 ${
                  isMe ? "bg-orange/10 border border-orange/40" : "bg-paper border border-transparent"
                }`}
              >
                <span
                  className={`shrink-0 w-6 text-center font-mono text-xs font-medium ${
                    idx === 0
                      ? "text-orange-deep"
                      : idx === 1
                        ? "text-ink"
                        : idx === 2
                          ? "text-ink/70"
                          : "text-ink/40"
                  }`}
                >
                  {idx + 1}
                </span>
                <span className="text-lg shrink-0">{p.avatar_emoji}</span>
                <span className="text-xs font-medium truncate flex-1">{p.display_name}</span>
                <span className="font-mono text-xs font-semibold text-ink shrink-0">
                  {p.score.toLocaleString("es")}
                </span>
              </motion.div>
            );
          })}
        </div>
      </LayoutGroup>
    </div>
  );
}

function PodiumView({ participants, room }: { participants: ParticipantRow[]; room: RoomRow }) {
  const navigate = useNavigate();
  const sorted = [...participants].sort((a, b) => b.score - a.score);
  const podium = sorted.slice(0, 3);
  const rest = sorted.slice(3);
  // Order: 2, 1, 3 for visual podium
  const visualPodium = [podium[1], podium[0], podium[2]].filter(Boolean);
  const heights = ["h-32", "h-44", "h-24"];
  const medals = ["🥈", "🏆", "🥉"];

  return (
    <div className="space-y-10 py-6">
      <div className="text-center space-y-3">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-orange/10 text-orange-deep text-[11px] font-mono uppercase tracking-[0.2em]">
          <Trophy className="w-3 h-3" strokeWidth={2} />
          Partida finalizada
        </span>
        <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight">
          ¡Excelente partida!
        </h1>
        <p className="text-sm text-ink/55">{room.quiz_title}</p>
      </div>

      {/* Podio */}
      <div className="flex items-end justify-center gap-3 max-w-2xl mx-auto px-4">
        {visualPodium.map((p, idx) => {
          if (!p) return null;
          const isWinner = idx === 1;
          return (
            <motion.div
              key={p.id}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: idx * 0.2, type: "spring" }}
              className="flex-1 max-w-[180px] flex flex-col items-center gap-2"
            >
              <div className="text-3xl">{medals[idx]}</div>
              <div className={`text-4xl ${isWinner ? "text-5xl" : ""}`}>{p.avatar_emoji}</div>
              <p className="text-sm font-medium text-center truncate w-full">{p.display_name}</p>
              <p className="font-mono text-xs text-ink/60">
                {p.score.toLocaleString("es")} pts
              </p>
              <div
                className={`w-full ${heights[idx]} ${isWinner ? "bg-gradient-orange shadow-orange" : "bg-ink"} flex items-start justify-center pt-3 border-t-2 border-ink`}
              >
                <span className={`font-display text-2xl font-bold ${isWinner ? "text-paper" : "text-paper"}`}>
                  {idx === 0 ? 2 : idx === 1 ? 1 : 3}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Resto de participantes */}
      {rest.length > 0 && (
        <div className="max-w-md mx-auto space-y-2">
          {rest.map((p, idx) => (
            <div
              key={p.id}
              className="flex items-center gap-3 p-3 bg-paper border border-border"
            >
              <span className="font-mono text-xs text-ink/50 w-6 text-center">{idx + 4}</span>
              <span className="text-xl">{p.avatar_emoji}</span>
              <span className="flex-1 text-sm font-medium">{p.display_name}</span>
              <span className="font-mono text-xs text-ink/70">
                {p.score.toLocaleString("es")} pts
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Anti-cheat warnings */}
      {room.anti_cheat_enabled && (
        <AntiCheatReport participants={sorted} />
      )}

      <div className="flex items-center justify-center gap-3 pt-4">
        <button
          onClick={() => navigate({ to: "/play" })}
          className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-border hover:border-ink transition-colors text-sm"
        >
          <RotateCcw className="w-4 h-4" strokeWidth={1.75} />
          Otra partida
        </button>
        <button
          onClick={() => navigate({ to: "/dashboard" })}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-ink text-paper text-sm font-medium hover:shadow-orange transition-all active:scale-95"
        >
          Volver al panel
        </button>
      </div>
    </div>
  );
}

function AntiCheatReport({ participants }: { participants: ParticipantRow[] }) {
  const flagged = participants.filter((p) => (p.anti_cheat_events ?? []).length > 0);
  if (flagged.length === 0) return null;
  return (
    <div className="max-w-md mx-auto border-2 border-dashed border-orange/40 bg-orange/5 p-4">
      <div className="flex items-center gap-2 mb-2">
        <ShieldAlert className="w-4 h-4 text-orange-deep" strokeWidth={1.75} />
        <h4 className="text-xs font-mono uppercase tracking-wider text-orange-deep">
          Eventos de actividad sospechosa
        </h4>
      </div>
      <ul className="space-y-1.5 text-xs">
        {flagged.map((p) => (
          <li key={p.id} className="flex justify-between text-ink/70">
            <span>
              {p.avatar_emoji} {p.display_name}
            </span>
            <span className="font-mono">{(p.anti_cheat_events ?? []).length} evento(s)</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
