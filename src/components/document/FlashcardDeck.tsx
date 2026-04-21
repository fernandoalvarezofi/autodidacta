import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Sparkles, Eye, RotateCw } from "lucide-react";

export interface FlashcardOutput {
  front: string;
  back: string;
}

export function FlashcardDeck({ cards }: { cards: FlashcardOutput[] }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [direction, setDirection] = useState<"next" | "prev" | null>(null);

  // Reset flip when changing card
  useEffect(() => {
    setFlipped(false);
  }, [index]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (e.key === "ArrowRight") {
        goNext();
      } else if (e.key === "ArrowLeft") {
        goPrev();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cards.length]);

  if (cards.length === 0) {
    return <p className="text-ink/50 text-sm">No hay flashcards disponibles.</p>;
  }
  const card = cards[index];

  const goNext = () => {
    setDirection("next");
    setIndex((i) => (i + 1) % cards.length);
  };
  const goPrev = () => {
    setDirection("prev");
    setIndex((i) => (i - 1 + cards.length) % cards.length);
  };

  const progress = ((index + 1) / cards.length) * 100;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header: counter + progress */}
      <div className="flex items-center justify-between mb-5">
        <p className="text-xs uppercase tracking-[0.25em] font-mono text-ink/50">
          Tarjeta <span className="text-ink font-medium">{index + 1}</span>
          <span className="text-ink/30"> / {cards.length}</span>
        </p>
        <p className="text-xs uppercase tracking-[0.2em] font-mono text-orange flex items-center gap-1.5">
          <Sparkles className="w-3 h-3" strokeWidth={2.5} />
          Memoria activa
        </p>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 bg-border mb-8 overflow-hidden">
        <div
          className="h-full bg-gradient-orange transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* 3D Card */}
      <div className="perspective-1000 mb-8">
        <button
          key={index}
          onClick={() => setFlipped((f) => !f)}
          className={`relative w-full min-h-[320px] preserve-3d transition-transform duration-700 cursor-pointer group ${
            flipped ? "rotate-y-180" : ""
          } ${direction === "next" ? "animate-fade-up" : direction === "prev" ? "animate-fade-up" : ""}`}
          style={{ transitionTimingFunction: "cubic-bezier(0.4, 0.0, 0.2, 1)" }}
        >
          {/* Front face */}
          <div className="absolute inset-0 backface-hidden bg-paper border-2 border-ink p-10 md:p-14 flex flex-col justify-between text-left shadow-elevated group-hover:shadow-orange transition-shadow">
            <div>
              <p className="text-[10px] uppercase tracking-[0.35em] text-orange font-mono mb-5 inline-flex items-center gap-2">
                <span className="w-6 h-px bg-orange" />
                Pregunta
              </p>
              <p className="font-display text-2xl md:text-3xl text-ink leading-snug">
                {card.front}
              </p>
            </div>
            <div className="flex items-center justify-between mt-8 pt-5 border-t border-border">
              <p className="text-[11px] text-ink/40 font-mono uppercase tracking-wider inline-flex items-center gap-1.5">
                <Eye className="w-3 h-3" strokeWidth={2} />
                Click o espacio para revelar
              </p>
              <div className="w-7 h-7 inline-flex items-center justify-center border border-border group-hover:border-orange group-hover:bg-orange/5 transition-all">
                <RotateCw
                  className="w-3 h-3 text-ink/40 group-hover:text-orange group-hover:rotate-180 transition-all duration-500"
                  strokeWidth={2}
                />
              </div>
            </div>
          </div>

          {/* Back face */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-warm border-2 border-orange p-10 md:p-14 flex flex-col justify-between text-left shadow-orange">
            <div>
              <p className="text-[10px] uppercase tracking-[0.35em] text-orange-deep font-mono mb-5 inline-flex items-center gap-2">
                <span className="w-6 h-px bg-orange-deep" />
                Respuesta
              </p>
              <p className="font-display text-2xl md:text-3xl text-ink leading-snug">
                {card.back}
              </p>
            </div>
            <div className="flex items-center justify-between mt-8 pt-5 border-t border-orange/30">
              <p className="text-[11px] text-ink/50 font-mono uppercase tracking-wider">
                ← / → para navegar
              </p>
              <p className="text-[11px] text-orange-deep font-mono uppercase tracking-wider">
                Pregunta {card.front.length > 30 ? `${card.front.slice(0, 30)}…` : card.front}
              </p>
            </div>
          </div>
        </button>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={goPrev}
          disabled={cards.length <= 1}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border border-border hover:border-ink hover:bg-cream/40 transition-all disabled:opacity-30"
        >
          <ChevronLeft className="w-4 h-4" strokeWidth={2} />
          Anterior
        </button>

        {/* Dot indicators (max 12) */}
        <div className="flex items-center gap-1.5">
          {cards.length <= 12 ? (
            cards.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`h-1.5 transition-all rounded-full ${
                  i === index
                    ? "w-6 bg-orange"
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
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium bg-gradient-ink text-paper hover:shadow-orange transition-all active:scale-95"
        >
          Siguiente
          <ChevronRight className="w-4 h-4" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
