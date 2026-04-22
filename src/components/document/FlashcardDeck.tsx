import { useState, useEffect, useCallback, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  RotateCw,
  Shuffle,
  Check,
  X,
} from "lucide-react";

export interface FlashcardOutput {
  front: string;
  back: string;
}

type SwipeDir = "left" | "right" | null;

export function FlashcardDeck({ cards: initialCards }: { cards: FlashcardOutput[] }) {
  const [cards, setCards] = useState(initialCards);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [swipe, setSwipe] = useState<SwipeDir>(null);
  const [known, setKnown] = useState<Set<number>>(new Set());
  const [unknown, setUnknown] = useState<Set<number>>(new Set());
  const touchStartX = useRef<number | null>(null);

  // Sync when parent regenerates
  useEffect(() => {
    setCards(initialCards);
    setIndex(0);
    setFlipped(false);
    setKnown(new Set());
    setUnknown(new Set());
  }, [initialCards]);

  const goNext = useCallback(() => {
    if (cards.length <= 1) return;
    setSwipe("left");
    setFlipped(false);
    window.setTimeout(() => {
      setIndex((i) => (i + 1) % cards.length);
      setSwipe(null);
    }, 220);
  }, [cards.length]);

  const goPrev = useCallback(() => {
    if (cards.length <= 1) return;
    setSwipe("right");
    setFlipped(false);
    window.setTimeout(() => {
      setIndex((i) => (i - 1 + cards.length) % cards.length);
      setSwipe(null);
    }, 220);
  }, [cards.length]);

  const toggleFlip = useCallback(() => {
    setFlipped((f) => !f);
  }, []);

  const markKnown = useCallback(() => {
    setKnown((s) => new Set(s).add(index));
    setUnknown((s) => {
      const n = new Set(s);
      n.delete(index);
      return n;
    });
    goNext();
  }, [index, goNext]);

  const markUnknown = useCallback(() => {
    setUnknown((s) => new Set(s).add(index));
    setKnown((s) => {
      const n = new Set(s);
      n.delete(index);
      return n;
    });
    goNext();
  }, [index, goNext]);

  const shuffle = useCallback(() => {
    const arr = [...cards];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    setCards(arr);
    setIndex(0);
    setFlipped(false);
    setKnown(new Set());
    setUnknown(new Set());
  }, [cards]);

  // Keyboard nav
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        toggleFlip();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "1") {
        markUnknown();
      } else if (e.key === "2") {
        markKnown();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goNext, goPrev, toggleFlip, markKnown, markUnknown]);

  if (cards.length === 0) {
    return <p className="text-ink/50 text-sm">No hay flashcards disponibles.</p>;
  }

  const card = cards[index];
  const progress = ((index + 1) / cards.length) * 100;
  const knownCount = known.size;
  const unknownCount = unknown.size;

  // Touch / swipe handlers
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) > 60) {
      if (dx < 0) goNext();
      else goPrev();
    }
  };

  const swipeClass =
    swipe === "left"
      ? "translate-x-[-30%] opacity-0 rotate-[-4deg]"
      : swipe === "right"
        ? "translate-x-[30%] opacity-0 rotate-[4deg]"
        : "translate-x-0 opacity-100 rotate-0";

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header: counter + status */}
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <p className="text-xs uppercase tracking-[0.25em] font-mono text-ink/50">
          Tarjeta <span className="text-ink font-medium">{index + 1}</span>
          <span className="text-ink/30"> / {cards.length}</span>
        </p>
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="inline-flex items-center gap-1 text-emerald-700">
            <Check className="w-3 h-3" strokeWidth={2.5} />
            {knownCount}
          </span>
          <span className="inline-flex items-center gap-1 text-rose-700">
            <X className="w-3 h-3" strokeWidth={2.5} />
            {unknownCount}
          </span>
          <button
            onClick={shuffle}
            className="inline-flex items-center gap-1 px-2 py-1 border border-border rounded hover:border-ink/40 hover:bg-cream transition-colors text-ink/60 hover:text-ink"
            title="Mezclar mazo"
          >
            <Shuffle className="w-3 h-3" strokeWidth={2} />
            Mezclar
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 bg-border mb-6 overflow-hidden rounded-full">
        <div
          className="h-full bg-gradient-orange transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* 3D Card */}
      <div
        className="perspective-1000 mb-6 select-none"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div
          role="button"
          tabIndex={0}
          aria-label="Tarjeta de estudio. Click o espacio para girar."
          onClick={toggleFlip}
          onKeyDown={(e) => {
            if (e.key === " " || e.key === "Enter") {
              e.preventDefault();
              toggleFlip();
            }
          }}
          className={`relative w-full min-h-[300px] sm:min-h-[340px] preserve-3d cursor-pointer group outline-none transition-all duration-300 ease-out ${swipeClass}`}
          style={{
            transition:
              swipe !== null
                ? "transform 220ms cubic-bezier(0.4,0,0.2,1), opacity 220ms"
                : "transform 600ms cubic-bezier(0.4,0,0.2,1), opacity 220ms",
            transform: `${flipped ? "rotateY(180deg)" : "rotateY(0deg)"} ${
              swipe === "left"
                ? "translateX(-30%) rotate(-4deg)"
                : swipe === "right"
                  ? "translateX(30%) rotate(4deg)"
                  : ""
            }`,
            opacity: swipe ? 0 : 1,
          }}
        >
          {/* Front face */}
          <div className="absolute inset-0 backface-hidden bg-paper border-2 border-ink p-8 sm:p-12 flex flex-col justify-between text-left shadow-elevated group-hover:shadow-orange transition-shadow rounded-md">
            <div>
              <p className="text-[10px] uppercase tracking-[0.35em] text-orange font-mono mb-4 inline-flex items-center gap-2">
                <span className="w-6 h-px bg-orange" />
                Pregunta
              </p>
              <p className="font-display text-xl sm:text-2xl md:text-3xl text-ink leading-snug">
                {card.front}
              </p>
            </div>
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
              <p className="text-[11px] text-ink/40 font-mono uppercase tracking-wider">
                Tocá para revelar
              </p>
              <div className="w-7 h-7 inline-flex items-center justify-center border border-border group-hover:border-orange group-hover:bg-orange/5 transition-all rounded">
                <RotateCw
                  className="w-3 h-3 text-ink/40 group-hover:text-orange group-hover:rotate-180 transition-all duration-500"
                  strokeWidth={2}
                />
              </div>
            </div>
          </div>

          {/* Back face */}
          <div
            className="absolute inset-0 backface-hidden bg-cream/70 border-2 border-orange p-8 sm:p-12 flex flex-col justify-between text-left shadow-orange rounded-md"
            style={{ transform: "rotateY(180deg)" }}
          >
            <div>
              <p className="text-[10px] uppercase tracking-[0.35em] text-orange-deep font-mono mb-4 inline-flex items-center gap-2">
                <span className="w-6 h-px bg-orange-deep" />
                Respuesta
                <Sparkles className="w-3 h-3" strokeWidth={2.5} />
              </p>
              <p className="font-display text-xl sm:text-2xl md:text-3xl text-ink leading-snug">
                {card.back}
              </p>
            </div>
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-orange/30">
              <p className="text-[11px] text-ink/50 font-mono uppercase tracking-wider">
                ← / → navegar · 1 / 2 calificar
              </p>
              <p className="text-[11px] text-orange-deep font-mono uppercase tracking-wider">
                Tocá para volver
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Self-rating buttons (only after flip) */}
      <div
        className={`grid grid-cols-2 gap-2 mb-4 transition-all duration-300 ${
          flipped ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
        }`}
      >
        <button
          onClick={markUnknown}
          className="inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium border-2 border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100 hover:border-rose-400 transition-all rounded-md min-h-[44px] active:scale-[0.97]"
        >
          <X className="w-4 h-4" strokeWidth={2.5} />
          No la sabía
          <kbd className="text-[10px] font-mono opacity-60 ml-1">1</kbd>
        </button>
        <button
          onClick={markKnown}
          className="inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium border-2 border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-400 transition-all rounded-md min-h-[44px] active:scale-[0.97]"
        >
          <Check className="w-4 h-4" strokeWidth={2.5} />
          La sabía
          <kbd className="text-[10px] font-mono opacity-60 ml-1">2</kbd>
        </button>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={goPrev}
          disabled={cards.length <= 1}
          className="inline-flex items-center gap-2 px-3 sm:px-4 py-2.5 text-sm font-medium border border-border hover:border-ink hover:bg-cream/40 transition-all disabled:opacity-30 rounded-md min-h-[44px]"
        >
          <ChevronLeft className="w-4 h-4" strokeWidth={2} />
          <span className="hidden sm:inline">Anterior</span>
        </button>

        {/* Dot indicators (max 12) */}
        <div className="flex items-center gap-1.5 flex-1 justify-center">
          {cards.length <= 12 ? (
            cards.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setFlipped(false);
                  setIndex(i);
                }}
                className={`h-1.5 transition-all rounded-full ${
                  i === index
                    ? "w-6 bg-orange"
                    : known.has(i)
                      ? "w-1.5 bg-emerald-500"
                      : unknown.has(i)
                        ? "w-1.5 bg-rose-500"
                        : i < index
                          ? "w-1.5 bg-orange/40"
                          : "w-1.5 bg-border hover:bg-ink/30"
                }`}
                aria-label={`Tarjeta ${i + 1}`}
              />
            ))
          ) : (
            <p className="text-xs font-mono text-ink/40">
              {index + 1} / {cards.length}
            </p>
          )}
        </div>

        <button
          onClick={goNext}
          className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 text-sm font-medium bg-gradient-ink text-paper hover:shadow-orange transition-all active:scale-95 rounded-md min-h-[44px]"
        >
          <span className="hidden sm:inline">Siguiente</span>
          <ChevronRight className="w-4 h-4" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
