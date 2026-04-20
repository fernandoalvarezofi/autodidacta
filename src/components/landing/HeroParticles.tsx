import { useMemo } from "react";

/**
 * Partículas flotantes para el hero — 20 puntos con animación CSS.
 */
export function HeroParticles({ count = 20 }: { count?: number }) {
  const particles = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: 80 + Math.random() * 30,
        size: 2 + Math.random() * 4,
        delay: Math.random() * 12,
        duration: 14 + Math.random() * 10,
        dx: (Math.random() - 0.5) * 200,
        color:
          i % 3 === 0
            ? "oklch(72% 0.20 195)"
            : i % 3 === 1
              ? "oklch(65% 0.25 264)"
              : "oklch(78% 0.22 142)",
      })),
    [count],
  );

  return (
    <div
      aria-hidden
      className="absolute inset-0 overflow-hidden pointer-events-none"
    >
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: p.size,
            height: p.size,
            background: p.color,
            boxShadow: `0 0 ${p.size * 4}px ${p.color}`,
            // @ts-expect-error CSS custom prop
            "--dx": `${p.dx}px`,
            animation: `particle-drift ${p.duration}s linear ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
