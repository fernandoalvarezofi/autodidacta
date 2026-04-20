import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search, BookMarked, FileText, LayoutGrid, Gamepad2, Sparkles, ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";

interface NotebookOpt {
  id: string;
  title: string;
  emoji: string | null;
}

interface DocumentOpt {
  id: string;
  title: string;
  notebook_id: string;
  status: string;
}

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ItemKind = "nav" | "notebook" | "document";

interface Item {
  kind: ItemKind;
  label: string;
  hint?: string;
  icon: React.ReactNode;
  action: () => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [notebooks, setNotebooks] = useState<NotebookOpt[]>([]);
  const [documents, setDocuments] = useState<DocumentOpt[]>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!user || !open) return;
    void (async () => {
      const [nb, docs] = await Promise.all([
        supabase.from("notebooks").select("id, title, emoji").order("updated_at", { ascending: false }).limit(20),
        supabase
          .from("documents")
          .select("id, title, notebook_id, status")
          .eq("status", "ready")
          .order("created_at", { ascending: false })
          .limit(40),
      ]);
      setNotebooks((nb.data ?? []) as NotebookOpt[]);
      setDocuments((docs.data ?? []) as DocumentOpt[]);
    })();
  }, [user, open]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
    }
  }, [open]);

  const items = useMemo<Item[]>(() => {
    const navItems: Item[] = [
      {
        kind: "nav",
        label: "Ir a Cuadernos",
        hint: "Dashboard",
        icon: <LayoutGrid className="w-4 h-4" strokeWidth={1.75} />,
        action: () => navigate({ to: "/dashboard" }),
      },
      {
        kind: "nav",
        label: "Unirme a una sala de quiz",
        hint: "Multijugador",
        icon: <Gamepad2 className="w-4 h-4" strokeWidth={1.75} />,
        action: () => navigate({ to: "/play" }),
      },
    ];

    const nbItems: Item[] = notebooks.map((n) => ({
      kind: "notebook",
      label: n.title,
      hint: "Cuaderno",
      icon: <BookMarked className="w-4 h-4 text-orange" strokeWidth={1.75} />,
      action: () => navigate({ to: "/notebook/$id", params: { id: n.id } }),
    }));

    const docItems: Item[] = documents.map((d) => ({
      kind: "document",
      label: d.title,
      hint: "Documento",
      icon: <FileText className="w-4 h-4 text-ink/50" strokeWidth={1.75} />,
      action: () => navigate({ to: "/document/$id", params: { id: d.id } }),
    }));

    const all = [...navItems, ...nbItems, ...docItems];
    if (!query.trim()) return all.slice(0, 12);
    const q = query.toLowerCase();
    return all.filter((i) => i.label.toLowerCase().includes(q)).slice(0, 20);
  }, [notebooks, documents, query, navigate]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onOpenChange(false);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((i) => Math.min(items.length - 1, i + 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((i) => Math.max(0, i - 1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const it = items[active];
        if (it) {
          it.action();
          onOpenChange(false);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, items, active, onOpenChange]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4 animate-fade-in"
      onClick={() => onOpenChange(false)}
    >
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl bg-paper border border-ink/20 shadow-elevated animate-scale-in"
        style={{ borderRadius: 8 }}
      >
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border">
          <Search className="w-4 h-4 text-ink/40" strokeWidth={1.75} />
          <input
            autoFocus
            type="text"
            placeholder="Buscar cuadernos, documentos o navegar…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm placeholder-ink/40 focus:outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-ink/50 border border-border rounded-sm">
            Esc
          </kbd>
        </div>

        <div className="max-h-[50vh] overflow-y-auto py-1.5">
          {items.length === 0 ? (
            <div className="py-12 text-center">
              <Sparkles className="w-5 h-5 mx-auto text-ink/30 mb-2" strokeWidth={1.5} />
              <p className="text-xs font-mono uppercase tracking-wider text-ink/40">
                Sin resultados
              </p>
            </div>
          ) : (
            items.map((item, i) => (
              <button
                key={`${item.kind}-${item.label}-${i}`}
                onMouseEnter={() => setActive(i)}
                onClick={() => {
                  item.action();
                  onOpenChange(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                  i === active ? "bg-cream" : "hover:bg-cream/50"
                }`}
              >
                <span className="w-7 h-7 inline-flex items-center justify-center bg-paper border border-border flex-shrink-0">
                  {item.icon}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm text-ink truncate">{item.label}</span>
                  {item.hint && (
                    <span className="block text-[10px] uppercase tracking-wider font-mono text-ink/40 mt-0.5">
                      {item.hint}
                    </span>
                  )}
                </span>
                {i === active && (
                  <ArrowRight className="w-3.5 h-3.5 text-orange flex-shrink-0" strokeWidth={2} />
                )}
              </button>
            ))
          )}
        </div>

        <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-cream/40 text-[10px] font-mono uppercase tracking-wider text-ink/50">
          <span className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1 border border-border bg-paper rounded-sm">↑</kbd>
              <kbd className="px-1 border border-border bg-paper rounded-sm">↓</kbd>
              navegar
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1 border border-border bg-paper rounded-sm">↵</kbd>
              abrir
            </span>
          </span>
          <span className="text-ink/40">Autodidactas</span>
        </div>
      </div>
    </div>
  );
}
