import { useMemo } from "react";

interface Node {
  x: number;
  y: number;
  r: number;
}

interface Props {
  nodeCount?: number;
  width?: number;
  height?: number;
  maxDistance?: number;
  seed?: number;
}

/** PRNG determinista (mulberry32) para layout estable entre renders y SSR. */
function makeRng(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = t;
    r = Math.imul(r ^ (r >>> 15), r | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Fondo decorativo de "red neuronal": nodos crimson tenues
 * conectados por líneas finas. SSR-safe (layout determinista).
 *
 * Position: fixed inset-0, z -1, sin interacción.
 */
export function NeuralBackground({
  nodeCount = 80,
  width = 1600,
  height = 1000,
  maxDistance = 150,
  seed = 42,
}: Props) {
  const { nodes, edges } = useMemo(() => {
    const rng = makeRng(seed);
    const nodes: Node[] = Array.from({ length: nodeCount }, () => ({
      x: rng() * width,
      y: rng() * height,
      r: 3 + rng() * 2,
    }));
    const edges: Array<[number, number]> = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        if (dx * dx + dy * dy <= maxDistance * maxDistance) {
          edges.push([i, j]);
        }
      }
    }
    return { nodes, edges };
  }, [nodeCount, width, height, maxDistance, seed]);

  return (
    <svg
      aria-hidden
      className="fixed inset-0 -z-10 pointer-events-none w-full h-full"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid slice"
    >
      <g stroke="var(--ink)" strokeOpacity="0.06" strokeWidth="1">
        {edges.map(([a, b], i) => {
          const na = nodes[a];
          const nb = nodes[b];
          return <line key={i} x1={na.x} y1={na.y} x2={nb.x} y2={nb.y} />;
        })}
      </g>
      <g fill="var(--orange)" fillOpacity="0.15">
        {nodes.map((n, i) => (
          <circle key={i} cx={n.x} cy={n.y} r={n.r} />
        ))}
      </g>
    </svg>
  );
}
