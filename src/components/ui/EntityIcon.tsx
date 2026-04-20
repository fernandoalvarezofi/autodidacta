import {
  ClayIcon,
  legacyEmojiToClay,
  type ClayIconKey,
  type ClayPalette,
} from "@/lib/clay-icons";

interface EntityIconProps {
  /** Valor que viene de la DB (campo `emoji`). Puede ser un ClayIconKey nuevo o un emoji legacy */
  value: string | null | undefined;
  /** Fallback si no hay valor */
  fallback?: ClayIconKey;
  size?: number;
  palette?: ClayPalette;
  className?: string;
  flat?: boolean;
}

/**
 * Renderiza el icono de una entidad. Compatible hacia atrás: si `value` es un
 * emoji clásico ("📓"), lo mapea al ClayIcon equivalente. Si ya es un key
 * ("notebook"), lo usa directo.
 */
export function EntityIcon({
  value,
  fallback = "notebook",
  size = 40,
  palette,
  className,
  flat,
}: EntityIconProps) {
  const key = resolveIconKey(value, fallback);
  return (
    <ClayIcon
      icon={key}
      size={size}
      palette={palette}
      className={className}
      flat={flat}
    />
  );
}

export function resolveIconKey(
  value: string | null | undefined,
  fallback: ClayIconKey = "notebook",
): ClayIconKey {
  if (!value) return fallback;
  // Si parece un emoji unicode, mapear
  if (/[\p{Emoji}]/u.test(value)) {
    return legacyEmojiToClay(value) ?? fallback;
  }
  // Asumimos que es un key (no validamos exhaustivamente para mantenerlo liviano)
  return value as ClayIconKey;
}
