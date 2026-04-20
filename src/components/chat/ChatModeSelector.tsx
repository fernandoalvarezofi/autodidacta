import { MessageCircle, Sparkles, Brain } from "lucide-react";
import type { ChatMode } from "@/lib/chat-sessions";

interface ChatModeSelectorProps {
  mode: ChatMode;
  onChange: (mode: ChatMode) => void;
  disabled?: boolean;
}

interface ModeMeta {
  key: ChatMode;
  label: string;
  description: string;
  icon: typeof MessageCircle;
}

const MODES: ModeMeta[] = [
  {
    key: "normal",
    label: "Normal",
    description: "Respuesta breve, directa al punto",
    icon: MessageCircle,
  },
  {
    key: "deep",
    label: "Profundo",
    description: "Respuesta detallada, con estructura y citas extensas",
    icon: Sparkles,
  },
  {
    key: "socratic",
    label: "Socrático",
    description: "Te guío con preguntas, sin darte la respuesta",
    icon: Brain,
  },
];

export function ChatModeSelector({ mode, onChange, disabled }: ChatModeSelectorProps) {
  return (
    <div className="inline-flex items-center gap-0.5 p-0.5 bg-cream/60 border border-ink/15 rounded-md">
      {MODES.map((m) => {
        const active = mode === m.key;
        const Icon = m.icon;
        return (
          <button
            key={m.key}
            type="button"
            onClick={() => onChange(m.key)}
            disabled={disabled}
            title={m.description}
            className={`relative inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium rounded-[5px] transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              active
                ? "bg-paper text-ink shadow-soft border border-ink/15"
                : "text-ink/60 hover:text-ink hover:bg-paper/60"
            }`}
          >
            <Icon
              className={`w-3.5 h-3.5 ${active ? "text-orange" : ""}`}
              strokeWidth={active ? 2.25 : 2}
            />
            <span>{m.label}</span>
          </button>
        );
      })}
    </div>
  );
}
