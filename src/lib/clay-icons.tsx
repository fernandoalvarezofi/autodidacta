/**
 * Clay Icons — Sistema unificado de iconos custom estilo claymorphism.
 *
 * Reemplaza emojis genéricos en toda la app con SVGs propios, diseñados con:
 *  - Gradiente principal (paleta a elegir)
 *  - Highlight superior (mate satinado)
 *  - Sombra interior + sombra externa para sensación 3D
 *  - Strokes redondeados, look táctil
 *
 * Uso:
 *   <ClayIcon icon="book" size={48} palette="orange" />
 *   <ClayIcon icon="brain" size={32} />
 *
 * Categorías de iconos (~28 piezas, suficiente para la app):
 *  - Estudio:      book, notebook, pencil, highlighter, bookmark, library
 *  - Pensamiento:  brain, lightbulb, sparkles, target, compass
 *  - Ciencia:      atom, flask, dna, microscope, calculator
 *  - Lenguaje:     globe, languages, quote, scroll
 *  - Productividad:calendar, clock, checklist, flag, trophy
 *  - Multimedia:   headphones, image, video, mic
 *  - Naturaleza:   leaf, flame, mountain, drop
 */

import { useMemo } from "react";

export type ClayPalette =
  | "orange"
  | "amber"
  | "rose"
  | "indigo"
  | "purple"
  | "cyan"
  | "teal"
  | "green"
  | "slate"
  | "ink";

export type ClayIconKey =
  // Estudio
  | "book"
  | "notebook"
  | "pencil"
  | "highlighter"
  | "bookmark"
  | "library"
  // Pensamiento
  | "brain"
  | "lightbulb"
  | "sparkles"
  | "target"
  | "compass"
  // Ciencia
  | "atom"
  | "flask"
  | "dna"
  | "microscope"
  | "calculator"
  // Lenguaje
  | "globe"
  | "languages"
  | "quote"
  | "scroll"
  // Productividad
  | "calendar"
  | "clock"
  | "checklist"
  | "flag"
  | "trophy"
  // Multimedia
  | "headphones"
  | "image"
  | "video"
  | "mic"
  // Naturaleza
  | "leaf"
  | "flame"
  | "mountain"
  | "drop";

interface PaletteSpec {
  light: string; // top
  mid: string;
  deep: string; // bottom
  shadow: string; // outer shadow rgba
  highlight: string; // top inner highlight
}

export const CLAY_PALETTES: Record<ClayPalette, PaletteSpec> = {
  orange: { light: "#fbb98a", mid: "#f17a3d", deep: "#c44515", shadow: "rgba(196,69,21,0.35)", highlight: "rgba(255,255,255,0.55)" },
  amber:  { light: "#fde08a", mid: "#f5b13a", deep: "#b87808", shadow: "rgba(184,120,8,0.32)", highlight: "rgba(255,255,255,0.55)" },
  rose:   { light: "#fbb6c5", mid: "#ee6b8a", deep: "#b03457", shadow: "rgba(176,52,87,0.32)", highlight: "rgba(255,255,255,0.55)" },
  indigo: { light: "#b4bdf6", mid: "#6b78e0", deep: "#3a47a8", shadow: "rgba(58,71,168,0.32)", highlight: "rgba(255,255,255,0.5)" },
  purple: { light: "#d4b9f5", mid: "#9b6ed8", deep: "#5e36a0", shadow: "rgba(94,54,160,0.32)", highlight: "rgba(255,255,255,0.5)" },
  cyan:   { light: "#a4e9ee", mid: "#3fb8c8", deep: "#137a89", shadow: "rgba(19,122,137,0.32)", highlight: "rgba(255,255,255,0.55)" },
  teal:   { light: "#9ae0c8", mid: "#3aa885", deep: "#15664c", shadow: "rgba(21,102,76,0.32)", highlight: "rgba(255,255,255,0.5)" },
  green:  { light: "#bce69a", mid: "#7bbf4f", deep: "#3f7d18", shadow: "rgba(63,125,24,0.32)", highlight: "rgba(255,255,255,0.55)" },
  slate:  { light: "#cfd6df", mid: "#8a96a6", deep: "#475061", shadow: "rgba(71,80,97,0.3)", highlight: "rgba(255,255,255,0.5)" },
  ink:    { light: "#5c4f44", mid: "#3a322b", deep: "#1e1814", shadow: "rgba(30,24,20,0.4)", highlight: "rgba(255,255,255,0.18)" },
};

/* ─────────────────────────── Mapeo icono → paleta sugerida ─────────────────────────── */
export const DEFAULT_PALETTE: Record<ClayIconKey, ClayPalette> = {
  book: "orange", notebook: "amber", pencil: "rose", highlighter: "amber", bookmark: "rose", library: "orange",
  brain: "purple", lightbulb: "amber", sparkles: "indigo", target: "rose", compass: "teal",
  atom: "indigo", flask: "cyan", dna: "purple", microscope: "teal", calculator: "slate",
  globe: "cyan", languages: "indigo", quote: "slate", scroll: "amber",
  calendar: "rose", clock: "indigo", checklist: "green", flag: "orange", trophy: "amber",
  headphones: "purple", image: "teal", video: "rose", mic: "orange",
  leaf: "green", flame: "orange", mountain: "slate", drop: "cyan",
};

/* ─────────────────────────── Etiquetas humanas para UI ─────────────────────────── */
export const ICON_LABEL: Record<ClayIconKey, string> = {
  book: "Libro", notebook: "Cuaderno", pencil: "Lápiz", highlighter: "Marcador", bookmark: "Marcapáginas", library: "Biblioteca",
  brain: "Cerebro", lightbulb: "Idea", sparkles: "Brillo", target: "Objetivo", compass: "Brújula",
  atom: "Átomo", flask: "Matraz", dna: "ADN", microscope: "Microscopio", calculator: "Calculadora",
  globe: "Globo", languages: "Idiomas", quote: "Cita", scroll: "Pergamino",
  calendar: "Calendario", clock: "Reloj", checklist: "Checklist", flag: "Bandera", trophy: "Trofeo",
  headphones: "Audífonos", image: "Imagen", video: "Video", mic: "Micrófono",
  leaf: "Hoja", flame: "Llama", mountain: "Montaña", drop: "Gota",
};

/* ─────────────────────────── Categorías para el picker ─────────────────────────── */
export const ICON_CATEGORIES: { id: string; label: string; icons: ClayIconKey[] }[] = [
  { id: "study",     label: "Estudio",       icons: ["book", "notebook", "pencil", "highlighter", "bookmark", "library"] },
  { id: "think",     label: "Pensamiento",   icons: ["brain", "lightbulb", "sparkles", "target", "compass"] },
  { id: "science",   label: "Ciencia",       icons: ["atom", "flask", "dna", "microscope", "calculator"] },
  { id: "language",  label: "Lenguaje",      icons: ["globe", "languages", "quote", "scroll"] },
  { id: "productive",label: "Productividad", icons: ["calendar", "clock", "checklist", "flag", "trophy"] },
  { id: "media",     label: "Multimedia",    icons: ["headphones", "image", "video", "mic"] },
  { id: "nature",    label: "Naturaleza",    icons: ["leaf", "flame", "mountain", "drop"] },
];

export const ALL_ICONS: ClayIconKey[] = ICON_CATEGORIES.flatMap((c) => c.icons);

/* ─────────────────────────── Componente principal ─────────────────────────── */
interface ClayIconProps {
  icon: ClayIconKey;
  size?: number;
  palette?: ClayPalette;
  className?: string;
  /** Reduce sombra externa para usos en chips pequeños */
  flat?: boolean;
}

export function ClayIcon({ icon, size = 40, palette, className, flat = false }: ClayIconProps) {
  const pal = CLAY_PALETTES[palette ?? DEFAULT_PALETTE[icon]];
  // ID único por instancia para evitar colisiones de defs SVG
  const uid = useMemo(() => `clay-${icon}-${Math.random().toString(36).slice(2, 8)}`, [icon]);
  const gradId = `${uid}-grad`;
  const highlightId = `${uid}-hl`;
  const innerShadowId = `${uid}-ins`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      style={{
        filter: flat ? undefined : `drop-shadow(0 6px 14px ${pal.shadow})`,
      }}
      aria-hidden
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={pal.light} />
          <stop offset="55%" stopColor={pal.mid} />
          <stop offset="100%" stopColor={pal.deep} />
        </linearGradient>
        <radialGradient id={highlightId} cx="50%" cy="22%" r="55%">
          <stop offset="0%" stopColor={pal.highlight} />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
        <filter id={innerShadowId} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="1.4" />
          <feOffset dx="0" dy="1.5" result="offsetblur" />
          <feFlood floodColor={pal.deep} floodOpacity="0.45" />
          <feComposite in2="offsetblur" operator="in" />
          <feComposite in2="SourceGraphic" operator="over" />
        </filter>
      </defs>

      {/* Cápsula base con gradiente + highlight superior */}
      <g>
        <rect x="4" y="4" width="56" height="56" rx="16" fill={`url(#${gradId})`} />
        <rect x="4" y="4" width="56" height="56" rx="16" fill={`url(#${highlightId})`} />
        {/* Borde interior sutil para definición */}
        <rect
          x="5"
          y="5"
          width="54"
          height="54"
          rx="15"
          fill="none"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth="0.8"
        />
      </g>

      {/* Glifo central — todos en blanco con stroke 2.4 sobre 64x64 */}
      <g
        stroke="#ffffff"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        style={{ filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.25))" }}
      >
        {renderGlyph(icon)}
      </g>
    </svg>
  );
}

/* ─────────────────────────── Glifos (todos en 64×64, centro 32,32) ─────────────────────────── */
function renderGlyph(icon: ClayIconKey): React.ReactNode {
  switch (icon) {
    case "book":
      return (
        <>
          <path d="M20 18h18a4 4 0 0 1 4 4v22a3 3 0 0 1-3 3H22a4 4 0 0 1-4-4V20a2 2 0 0 1 2-2Z" />
          <path d="M22 47a4 4 0 0 1 4-4h16" />
          <path d="M28 26h10M28 32h8" />
        </>
      );
    case "notebook":
      return (
        <>
          <path d="M20 16h22a2 2 0 0 1 2 2v28a2 2 0 0 1-2 2H20a2 2 0 0 1-2-2V18a2 2 0 0 1 2-2Z" />
          <path d="M24 22v22M28 24h12M28 30h12M28 36h8" />
        </>
      );
    case "pencil":
      return (
        <>
          <path d="M40 16 16 40l-2 10 10-2 24-24-8-8Z" />
          <path d="M36 20l8 8M14 50l4-1 5 5" />
        </>
      );
    case "highlighter":
      return (
        <>
          <path d="M22 38l14-22 10 6-12 22-12 0Z" />
          <path d="M22 38l8 6M18 50h28" />
        </>
      );
    case "bookmark":
      return (
        <>
          <path d="M22 14h20v36l-10-7-10 7Z" />
        </>
      );
    case "library":
      return (
        <>
          <path d="M14 18h6v32h-6zM26 18h6v32h-6zM38 22l8-2 4 30-8 2Z" />
        </>
      );
    case "brain":
      return (
        <>
          <path d="M28 16a6 6 0 0 0-6 6 5 5 0 0 0-4 8 5 5 0 0 0 2 8 5 5 0 0 0 4 8 6 6 0 0 0 6 4V16Z" />
          <path d="M36 16a6 6 0 0 1 6 6 5 5 0 0 1 4 8 5 5 0 0 1-2 8 5 5 0 0 1-4 8 6 6 0 0 1-6 4V16Z" />
          <path d="M28 24h2M34 24h2M28 32h2M34 32h2M28 40h2M34 40h2" />
        </>
      );
    case "lightbulb":
      return (
        <>
          <path d="M32 14a12 12 0 0 0-7 21c1.5 1.4 2 3 2 5v2h10v-2c0-2 .5-3.6 2-5a12 12 0 0 0-7-21Z" />
          <path d="M27 46h10M29 50h6" />
        </>
      );
    case "sparkles":
      return (
        <>
          <path d="M32 14v8M32 42v8M14 32h8M42 32h8M22 22l4 4M38 38l4 4M22 42l4-4M38 26l4-4" />
          <circle cx="32" cy="32" r="3" fill="#fff" stroke="none" />
        </>
      );
    case "target":
      return (
        <>
          <circle cx="32" cy="32" r="16" />
          <circle cx="32" cy="32" r="9" />
          <circle cx="32" cy="32" r="3" fill="#fff" stroke="none" />
        </>
      );
    case "compass":
      return (
        <>
          <circle cx="32" cy="32" r="18" />
          <path d="M38 26 30 30l-4 8 8-4 4-8Z" fill="#fff" stroke="none" />
        </>
      );
    case "atom":
      return (
        <>
          <circle cx="32" cy="32" r="3" fill="#fff" stroke="none" />
          <ellipse cx="32" cy="32" rx="18" ry="7" />
          <ellipse cx="32" cy="32" rx="18" ry="7" transform="rotate(60 32 32)" />
          <ellipse cx="32" cy="32" rx="18" ry="7" transform="rotate(120 32 32)" />
        </>
      );
    case "flask":
      return (
        <>
          <path d="M26 14h12M28 14v12L18 46a4 4 0 0 0 4 6h20a4 4 0 0 0 4-6L36 26V14" />
          <path d="M22 40h20" />
        </>
      );
    case "dna":
      return (
        <>
          <path d="M22 14c0 8 20 16 20 24s-20 6-20 12" />
          <path d="M42 14c0 8-20 16-20 24s20 6 20 12" />
          <path d="M24 22h16M24 30h16M24 38h16M24 46h16" />
        </>
      );
    case "microscope":
      return (
        <>
          <path d="M28 16h8l4 4-4 4-8 0-4-4 4-4Z" />
          <path d="M28 24v6a8 8 0 0 0 4 14" />
          <path d="M20 50h28M24 44h8" />
        </>
      );
    case "calculator":
      return (
        <>
          <rect x="18" y="14" width="28" height="36" rx="3" />
          <path d="M22 22h20v6H22zM24 36h2M30 36h2M38 36h2M24 42h2M30 42h2M38 42h2" />
        </>
      );
    case "globe":
      return (
        <>
          <circle cx="32" cy="32" r="18" />
          <path d="M14 32h36M32 14c5 6 5 30 0 36M32 14c-5 6-5 30 0 36" />
        </>
      );
    case "languages":
      return (
        <>
          <path d="M14 16h16M22 16v6c0 6-4 10-8 10" />
          <path d="M14 26c4 6 12 8 18 6" />
          <path d="M30 50l8-20 8 20M34 42h8" />
        </>
      );
    case "quote":
      return (
        <>
          <path d="M18 36c0-8 4-14 10-16M18 36h8v8h-8zM34 36c0-8 4-14 10-16M34 36h8v8h-8z" />
        </>
      );
    case "scroll":
      return (
        <>
          <path d="M20 16h20a4 4 0 0 1 4 4v4h-6v-4M20 16a4 4 0 0 0-4 4v4h6v-4M20 16a4 4 0 0 1 4 4v24a4 4 0 0 0 4 4h16a4 4 0 0 1-4-4V24" />
          <path d="M28 30h12M28 36h10" />
        </>
      );
    case "calendar":
      return (
        <>
          <rect x="14" y="18" width="36" height="32" rx="3" />
          <path d="M14 28h36M22 14v8M42 14v8" />
          <circle cx="24" cy="36" r="2" fill="#fff" stroke="none" />
          <circle cx="32" cy="36" r="2" fill="#fff" stroke="none" />
          <circle cx="40" cy="36" r="2" fill="#fff" stroke="none" />
        </>
      );
    case "clock":
      return (
        <>
          <circle cx="32" cy="32" r="18" />
          <path d="M32 22v10l7 4" />
        </>
      );
    case "checklist":
      return (
        <>
          <rect x="16" y="14" width="32" height="36" rx="3" />
          <path d="M22 22l3 3 5-5M22 32l3 3 5-5M22 42l3 3 5-5M34 23h10M34 33h10M34 43h8" />
        </>
      );
    case "flag":
      return (
        <>
          <path d="M20 14v36" />
          <path d="M20 16h22l-4 6 4 6H20" />
        </>
      );
    case "trophy":
      return (
        <>
          <path d="M22 14h20v8a10 10 0 0 1-20 0v-8Z" />
          <path d="M22 18h-6v4a6 6 0 0 0 6 6M42 18h6v4a6 6 0 0 1-6 6" />
          <path d="M28 32v6h8v-6M24 44h16M28 50h8" />
        </>
      );
    case "headphones":
      return (
        <>
          <path d="M14 36a18 18 0 0 1 36 0v8" />
          <rect x="12" y="36" width="8" height="12" rx="2" />
          <rect x="44" y="36" width="8" height="12" rx="2" />
        </>
      );
    case "image":
      return (
        <>
          <rect x="14" y="16" width="36" height="32" rx="3" />
          <circle cx="24" cy="26" r="3" fill="#fff" stroke="none" />
          <path d="M14 42l10-10 10 8 6-4 10 6" />
        </>
      );
    case "video":
      return (
        <>
          <rect x="14" y="20" width="28" height="24" rx="3" />
          <path d="M42 28l8-4v16l-8-4Z" />
        </>
      );
    case "mic":
      return (
        <>
          <rect x="26" y="14" width="12" height="22" rx="6" />
          <path d="M18 32a14 14 0 0 0 28 0M32 46v6M26 52h12" />
        </>
      );
    case "leaf":
      return (
        <>
          <path d="M16 48c0-16 16-32 32-32 0 16-16 32-32 32Z" />
          <path d="M16 48l24-24" />
        </>
      );
    case "flame":
      return (
        <>
          <path d="M32 14c-2 6-10 10-10 20a10 10 0 0 0 20 0c0-6-4-10-4-14 0 4-4 6-6 0Z" />
        </>
      );
    case "mountain":
      return (
        <>
          <path d="M10 48 26 22l8 12 6-8 14 22Z" />
          <path d="M22 30l4 4" />
        </>
      );
    case "drop":
      return (
        <>
          <path d="M32 12c-6 8-14 16-14 24a14 14 0 0 0 28 0c0-8-8-16-14-24Z" />
        </>
      );
    default:
      return null;
  }
}

/* ─────────────────────────── Resolver para legacy emoji → ClayIcon ─────────────────────────── */
/** Convierte emojis viejos a un clay icon equivalente. Devuelve null si no hay match. */
export function legacyEmojiToClay(emoji: string | null | undefined): ClayIconKey | null {
  if (!emoji) return null;
  const map: Record<string, ClayIconKey> = {
    "📓": "notebook", "📔": "notebook", "📕": "book", "📗": "book", "📘": "book", "📙": "book", "📖": "book",
    "📝": "pencil", "✏️": "pencil", "🖊️": "pencil",
    "🎓": "library", "🏫": "library",
    "🗂️": "checklist", "🗃️": "library",
    "🕸️": "compass", "🧭": "compass",
    "⚡": "flame", "🔥": "flame",
    "📅": "calendar", "📆": "calendar",
    "⚖️": "target",
    "🧠": "brain", "💡": "lightbulb", "✨": "sparkles",
    "🎯": "target",
    "⚛️": "atom", "🧪": "flask", "🧬": "dna", "🔬": "microscope", "🧮": "calculator",
    "🌍": "globe", "🌎": "globe", "🌏": "globe", "🗣️": "languages",
    "⏰": "clock", "⏱️": "clock",
    "🏆": "trophy", "🚩": "flag",
    "🎧": "headphones", "🎵": "headphones", "🎬": "video", "🎤": "mic", "📷": "image", "🖼️": "image",
    "🌿": "leaf", "🍃": "leaf", "⛰️": "mountain", "💧": "drop",
  };
  return map[emoji] ?? null;
}
