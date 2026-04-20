import { useState } from "react";
import { RotateCw } from "lucide-react";

export interface FlashcardOutput {
  front: string;
  back: string;
}

export function FlashcardDeck({ cards }: { cards: FlashcardOutput[] }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  if (cards.length === 0) {
    return <p className="text-ink/50 text-sm">No hay flashcards disponibles.</p>;
  }
  const card = cards[index];

  return (
    <div className="max-w-2xl mx-auto">
      <p className="text-xs uppercase tracking-wider font-mono text-ink/50 text-center mb-4">
        Tarjeta {index + 1} de {cards.length}
      </p>
      <button
        onClick={() => setFlipped((f) => !f)}
        className="block w-full bg-cream/40 border-2 border-ink p-10 md:p-14 min-h-[280px] text-left hover:bg-cream/60 transition-colors"
      >
        <p className="text-xs uppercase tracking-[0.3em] text-orange font-mono mb-4">
          {flipped ? "Respuesta" : "Pregunta"}
        </p>
        <p className="font-display text-2xl md:text-3xl text-ink leading-snug">
          {flipped ? card.back : card.front}
        </p>
        <p className="text-xs text-ink/40 mt-8 font-mono uppercase tracking-wider">
          Click para {flipped ? "ver pregunta" : "revelar"}
        </p>
      </button>
      <div className="flex justify-end mt-6">
        <button
          onClick={() => {
            setFlipped(false);
            setIndex((i) => (i + 1) % cards.length);
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium border border-ink text-ink hover:bg-ink hover:text-paper transition-colors"
        >
          <RotateCw className="w-4 h-4" strokeWidth={1.75} />
          Siguiente
        </button>
      </div>
    </div>
  );
}
