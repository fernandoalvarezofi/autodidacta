import { useRef, useState } from "react";
import {
  Upload,
  Loader2,
  FileText,
  FileType2,
  Youtube,
  Type,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type SourceType = "pdf" | "docx" | "text" | "youtube";

interface SourceUploaderProps {
  notebookId: string;
  onUploaded?: () => void;
}

const TABS: Array<{ key: SourceType; label: string; icon: typeof Upload; hint: string }> = [
  { key: "pdf", label: "PDF", icon: FileText, hint: "Hasta 10MB" },
  { key: "docx", label: "Word", icon: FileType2, hint: "Documentos .docx" },
  { key: "text", label: "Texto", icon: Type, hint: "Pegá o subí .txt" },
  { key: "youtube", label: "YouTube", icon: Youtube, hint: "Con subtítulos" },
];

export function SourceUploader({ notebookId, onUploaded }: SourceUploaderProps) {
  const { user } = useAuth();
  const [tab, setTab] = useState<SourceType>("pdf");
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [textContent, setTextContent] = useState("");
  const [textTitle, setTextTitle] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");

  const acceptByTab: Record<SourceType, string> = {
    pdf: "application/pdf",
    docx: ".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    text: ".txt,.md,text/plain,text/markdown",
    youtube: "",
  };

  const insertDocumentRow = async (params: {
    title: string;
    type: SourceType;
    storage_path: string;
    size_bytes: number | null;
  }) => {
    if (!user) throw new Error("No autenticado");
    const { data, error } = await supabase
      .from("documents")
      .insert({
        user_id: user.id,
        notebook_id: notebookId,
        title: params.title,
        type: params.type,
        storage_path: params.storage_path,
        size_bytes: params.size_bytes,
        status: "pending",
      })
      .select()
      .single();
    if (error || !data) throw error ?? new Error("No se pudo crear el documento");
    return data;
  };

  const triggerProcessing = (documentId: string) => {
    void supabase.functions.invoke("process-document", { body: { documentId } });
  };

  const uploadFile = async (file: File, type: "pdf" | "docx" | "text") => {
    if (!user) return;

    // Validaciones por tipo
    if (type === "pdf" && file.type !== "application/pdf") {
      toast.error("El archivo no es un PDF válido");
      return;
    }
    if (type === "docx" && !file.name.toLowerCase().endsWith(".docx")) {
      toast.error("El archivo debe ser .docx");
      return;
    }
    if (type === "text") {
      const ok =
        file.name.toLowerCase().endsWith(".txt") ||
        file.name.toLowerCase().endsWith(".md") ||
        file.type.startsWith("text/");
      if (!ok) {
        toast.error("El archivo debe ser .txt o .md");
        return;
      }
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Máximo 10MB en plan Free");
      return;
    }

    setUploading(true);
    try {
      const ext =
        type === "pdf" ? "pdf" : type === "docx" ? "docx" : file.name.split(".").pop() || "txt";
      const storagePath = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("documents").upload(storagePath, file);
      if (upErr) throw upErr;

      const titleClean = file.name.replace(/\.[^.]+$/, "");
      const doc = await insertDocumentRow({
        title: titleClean,
        type,
        storage_path: storagePath,
        size_bytes: file.size,
      });
      triggerProcessing(doc.id);
      toast.success(`${type.toUpperCase()} subido. Procesando...`);
      onUploaded?.();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al subir");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const submitText = async () => {
    if (!user) return;
    const content = textContent.trim();
    if (content.length < 100) {
      toast.error("Pegá al menos 100 caracteres de texto");
      return;
    }
    if (content.length > 200000) {
      toast.error("Máximo 200.000 caracteres por documento");
      return;
    }
    setUploading(true);
    try {
      const blob = new Blob([content], { type: "text/plain" });
      const storagePath = `${user.id}/${crypto.randomUUID()}.txt`;
      const { error: upErr } = await supabase.storage.from("documents").upload(storagePath, blob);
      if (upErr) throw upErr;

      const title = textTitle.trim() || `Nota — ${new Date().toLocaleDateString("es")}`;
      const doc = await insertDocumentRow({
        title,
        type: "text",
        storage_path: storagePath,
        size_bytes: blob.size,
      });
      triggerProcessing(doc.id);
      toast.success("Texto guardado. Procesando...");
      setTextContent("");
      setTextTitle("");
      onUploaded?.();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al guardar texto");
    } finally {
      setUploading(false);
    }
  };

  const submitYoutube = async () => {
    if (!user) return;
    const url = youtubeUrl.trim();
    if (!parseYoutubeId(url)) {
      toast.error("URL inválida. Usá un link de youtube.com o youtu.be");
      return;
    }
    setUploading(true);
    try {
      // No subimos nada al storage; guardamos la URL en storage_path
      const doc = await insertDocumentRow({
        title: `YouTube — ${parseYoutubeId(url)}`,
        type: "youtube",
        storage_path: url,
        size_bytes: null,
      });
      triggerProcessing(doc.id);
      toast.success("Video encolado. Buscando transcript...");
      setYoutubeUrl("");
      onUploaded?.();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error con el video");
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (tab === "pdf" || tab === "docx" || tab === "text")) {
      void uploadFile(file, tab);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file && (tab === "pdf" || tab === "docx" || tab === "text")) {
      void uploadFile(file, tab);
    }
  };

  return (
    <div className="border-2 border-dashed border-border bg-paper hover:border-ink/40 transition-colors">
      {/* Tabs */}
      <div className="grid grid-cols-2 sm:flex sm:flex-wrap border-b border-border">
        {TABS.map((t) => {
          const active = tab === t.key;
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 sm:min-w-[120px] inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-3.5 text-sm transition-all border-b-2 -mb-px min-h-[44px] ${
                active
                  ? "border-orange text-ink font-medium bg-cream/30"
                  : "border-transparent text-ink/50 hover:text-ink hover:bg-cream/20"
              }`}
            >
              <Icon className="w-4 h-4" strokeWidth={1.75} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Body */}
      <div className="p-6 md:p-8">
        {(tab === "pdf" || tab === "docx" || tab === "text") && (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept={acceptByTab[tab]}
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              disabled={uploading}
              className={`relative w-full border-2 border-dashed transition-all py-12 text-center group overflow-hidden ${
                dragActive
                  ? "border-orange bg-orange/5 scale-[1.005]"
                  : "border-border hover:border-ink hover:bg-cream/40"
              } ${uploading ? "opacity-60 pointer-events-none" : ""}`}
            >
              <div className="absolute inset-0 bg-gradient-warm opacity-0 group-hover:opacity-30 transition-opacity pointer-events-none" />
              <div className="relative">
                {uploading ? (
                  <>
                    <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-orange" />
                    <p className="font-display text-base text-ink mb-1">Subiendo...</p>
                  </>
                ) : (
                  <>
                    <div className="inline-flex items-center justify-center w-14 h-14 mb-4 bg-gradient-orange shadow-orange rounded-full group-hover:scale-110 transition-transform">
                      <Upload className="w-6 h-6 text-paper" strokeWidth={2} />
                    </div>
                    <p className="font-display text-xl font-medium text-ink mb-1.5">
                      {dragActive ? "Soltá para subir" : `Arrastrá tu ${labelFor(tab)} acá`}
                    </p>
                    <p className="text-xs text-ink/50 font-mono uppercase tracking-wider">
                      o hacé click · {hintFor(tab)}
                    </p>
                  </>
                )}
              </div>
            </button>

            {tab === "text" && (
              <>
                <div className="flex items-center gap-3 my-5">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-ink/40">
                    o pegá el texto
                  </span>
                  <div className="flex-1 h-px bg-border" />
                </div>
                <input
                  type="text"
                  value={textTitle}
                  onChange={(e) => setTextTitle(e.target.value)}
                  placeholder="Título (opcional)"
                  className="w-full bg-paper border border-border px-4 py-2.5 text-sm focus:border-ink focus:outline-none mb-3"
                  disabled={uploading}
                />
                <textarea
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder="Pegá acá tus apuntes, fragmentos del libro, transcripts..."
                  rows={8}
                  className="w-full bg-paper border border-border px-4 py-3 text-sm font-mono leading-relaxed focus:border-ink focus:outline-none resize-y"
                  disabled={uploading}
                />
                <div className="flex items-center justify-between mt-3">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-ink/40">
                    {textContent.length} chars · mín 100
                  </span>
                  <button
                    onClick={submitText}
                    disabled={uploading || textContent.trim().length < 100}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-gradient-ink text-paper hover:shadow-orange transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
                  >
                    {uploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" strokeWidth={2} />
                    )}
                    Procesar texto
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {tab === "youtube" && (
          <div>
            <div className="flex items-center justify-center w-14 h-14 mx-auto mb-4 bg-gradient-orange shadow-orange rounded-full">
              <Youtube className="w-6 h-6 text-paper" strokeWidth={2} />
            </div>
            <p className="font-display text-xl font-medium text-ink mb-1.5 text-center">
              Pegá un link de YouTube
            </p>
            <p className="text-xs text-ink/50 font-mono uppercase tracking-wider text-center mb-6">
              Funciona con videos que tengan subtítulos
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
              <input
                type="url"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="flex-1 bg-paper border border-border px-4 py-3 text-sm focus:border-ink focus:outline-none"
                disabled={uploading}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !uploading) submitYoutube();
                }}
              />
              <button
                onClick={submitYoutube}
                disabled={uploading || !youtubeUrl.trim()}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-medium bg-gradient-ink text-paper hover:shadow-orange transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
              >
                {uploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" strokeWidth={2} />
                )}
                Procesar
              </button>
            </div>
            <p className="text-[11px] font-mono uppercase tracking-wider text-ink/40 text-center mt-4">
              Si el video no tiene subtítulos, no podemos extraer el texto.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function labelFor(t: SourceType): string {
  if (t === "pdf") return "PDF";
  if (t === "docx") return "Word";
  if (t === "text") return "archivo de texto";
  return "";
}

function hintFor(t: SourceType): string {
  if (t === "pdf") return "Máx 10MB";
  if (t === "docx") return "Documentos .docx";
  if (t === "text") return ".txt o .md · Máx 10MB";
  return "";
}

function parseYoutubeId(url: string): string | null {
  const m = url.match(
    /(?:youtube\.com\/watch\?(?:.*&)?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  );
  return m ? m[1] : null;
}
