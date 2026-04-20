import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { X, BookOpen, ExternalLink, Loader2, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { ChatStreamSource } from "@/lib/chat-stream";

interface SourcePanelProps {
  source: ChatStreamSource | null;
  onClose: () => void;
}

interface ChunkRow {
  id: string;
  content: string;
  page_number: number | null;
  chunk_index: number;
  document_id: string;
}

interface NeighborChunk {
  chunk_index: number;
  page_number: number | null;
  content: string;
}

export function SourcePanel({ source, onClose }: SourcePanelProps) {
  const [chunk, setChunk] = useState<ChunkRow | null>(null);
  const [neighbors, setNeighbors] = useState<NeighborChunk[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!source) {
      setChunk(null);
      setNeighbors([]);
      return;
    }
    void (async () => {
      setLoading(true);
      try {
        // Si tenemos chunkId, traemos el chunk exacto + 2 vecinos
        if (source.chunkId) {
          const { data: c } = await supabase
            .from("document_chunks")
            .select("id, content, page_number, chunk_index, document_id")
            .eq("id", source.chunkId)
            .maybeSingle();
          if (c) {
            setChunk(c as ChunkRow);
            const { data: nbrs } = await supabase
              .from("document_chunks")
              .select("chunk_index, page_number, content")
              .eq("document_id", c.document_id)
              .gte("chunk_index", Math.max(0, c.chunk_index - 1))
              .lte("chunk_index", c.chunk_index + 1)
              .order("chunk_index", { ascending: true });
            setNeighbors((nbrs ?? []) as NeighborChunk[]);
          }
        } else {
          // fallback: usar el excerpt
          setChunk(null);
          setNeighbors([]);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [source]);

  if (!source) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-ink/30 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      {/* Panel */}
      <aside className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-paper border-l border-ink/15 shadow-paper animate-slide-in-right flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between gap-3 px-5 py-4 border-b border-ink/10 bg-cream/40">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-orange/10 text-orange-deep border border-orange/30 flex-shrink-0">
              <BookOpen className="w-4 h-4" strokeWidth={2} />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-ink/50">
                Fragmento {source.index}
                {source.page ? ` · pág. ${source.page}` : ""}
              </p>
              <p className="font-display text-base text-ink font-semibold truncate">
                {source.documentTitle ?? "Documento"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-ink/50 hover:text-ink hover:bg-paper rounded-md transition-colors flex-shrink-0"
            title="Cerrar"
          >
            <X className="w-4 h-4" strokeWidth={2} />
          </button>
        </header>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-5 h-5 animate-spin text-ink/40" />
            </div>
          ) : neighbors.length > 0 && chunk ? (
            <div className="p-5 space-y-3">
              <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-ink/40 mb-3">
                Contexto del documento
              </p>
              {neighbors.map((n) => {
                const isMain = n.chunk_index === chunk.chunk_index;
                return (
                  <div
                    key={n.chunk_index}
                    className={`relative rounded-md p-4 text-[13.5px] leading-relaxed transition-colors ${
                      isMain
                        ? "bg-orange/5 border-l-2 border-orange text-ink"
                        : "bg-cream/30 border-l-2 border-ink/10 text-ink/65"
                    }`}
                  >
                    {isMain && (
                      <span className="absolute -top-2 left-3 inline-flex items-center gap-1 text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 bg-orange text-paper rounded-sm">
                        Cita
                      </span>
                    )}
                    {n.page_number !== null && (
                      <p className="text-[10px] font-mono uppercase tracking-wider text-ink/40 mb-1.5">
                        pág. {n.page_number}
                      </p>
                    )}
                    <p className="whitespace-pre-wrap">{n.content}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-5">
              <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-ink/40 mb-3">
                Extracto
              </p>
              <div className="rounded-md p-4 bg-orange/5 border-l-2 border-orange text-[13.5px] leading-relaxed text-ink whitespace-pre-wrap">
                {source.excerpt}
                {source.excerpt.length >= 220 && "…"}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {source.documentId && (
          <footer className="border-t border-ink/10 px-5 py-3 bg-cream/40">
            <Link
              to="/document/$id"
              params={{ id: source.documentId }}
              onClick={onClose}
              className="inline-flex items-center gap-2 text-sm font-medium text-ink hover:text-orange transition-colors group"
            >
              <FileText className="w-4 h-4" strokeWidth={1.75} />
              Abrir documento completo
              <ExternalLink className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" strokeWidth={1.75} />
            </Link>
          </footer>
        )}
      </aside>
    </>
  );
}
