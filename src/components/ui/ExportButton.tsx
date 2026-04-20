import { useState } from "react";
import { Download, FileText, FileType2, FileCode, Loader2, Settings2, X } from "lucide-react";
import { toast } from "sonner";
import {
  exportDocument,
  DEFAULT_OPTIONS,
  type ExportableContent,
  type ExportFormat,
  type ExportOptions,
  type FontFamily,
  type Orientation,
  type PageSize,
} from "@/lib/document-export";

interface ExportButtonProps {
  content: ExportableContent;
  title: string;
  filename?: string;
  author?: string;
  subtitle?: string;
  variant?: "default" | "compact" | "ghost";
  label?: string;
}

const FORMAT_INFO: Record<ExportFormat, { label: string; description: string; icon: typeof FileText }> = {
  pdf: { label: "PDF", description: "Documento listo para imprimir", icon: FileText },
  docx: { label: "Word (.docx)", description: "Editable en Word o Google Docs", icon: FileType2 },
  md: { label: "Markdown", description: "Texto plano para Notion u Obsidian", icon: FileCode },
};

export function ExportButton({
  content,
  title,
  filename,
  author,
  subtitle,
  variant = "default",
  label = "Descargar",
}: ExportButtonProps) {
  const [open, setOpen] = useState(false);
  const [advanced, setAdvanced] = useState(false);
  const [exporting, setExporting] = useState<ExportFormat | null>(null);
  const [opts, setOpts] = useState({
    pageSize: DEFAULT_OPTIONS.pageSize as PageSize,
    orientation: DEFAULT_OPTIONS.orientation as Orientation,
    fontFamily: DEFAULT_OPTIONS.fontFamily as FontFamily,
    fontSize: DEFAULT_OPTIONS.fontSize,
    marginCm: DEFAULT_OPTIONS.marginCm,
    includeHeader: DEFAULT_OPTIONS.includeHeader,
    includeFooter: DEFAULT_OPTIONS.includeFooter,
    includeDate: DEFAULT_OPTIONS.includeDate,
  });

  const handleExport = async (format: ExportFormat) => {
    setExporting(format);
    try {
      const exportOpts: ExportOptions = {
        format,
        title,
        filename: filename ?? title,
        author,
        subtitle,
        ...opts,
      };
      await exportDocument(content, exportOpts);
      toast.success(`Descargado como ${FORMAT_INFO[format].label}`);
      setOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al exportar");
    } finally {
      setExporting(null);
    }
  };

  const triggerClass =
    variant === "compact"
      ? "inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium text-ink/70 hover:text-ink hover:bg-cream/60 rounded-md transition-colors"
      : variant === "ghost"
        ? "inline-flex items-center gap-2 text-xs font-medium text-ink/60 hover:text-ink"
        : "inline-flex items-center gap-2 px-3 py-2 text-xs font-medium border border-ink/80 hover:bg-ink hover:text-paper transition-all active:scale-[0.98] rounded-md";

  return (
    <>
      <button onClick={() => setOpen(true)} className={triggerClass} type="button">
        <Download className="w-3.5 h-3.5" strokeWidth={1.75} />
        {label}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/40 backdrop-blur-sm p-4 animate-in fade-in duration-150"
          onClick={() => !exporting && setOpen(false)}
        >
          <div
            className="bg-paper border border-border rounded-xl shadow-2xl max-w-md w-full max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-ink/40 mb-0.5">
                  Exportar
                </p>
                <h3 className="font-display text-lg text-ink">Descargar documento</h3>
              </div>
              <button
                onClick={() => !exporting && setOpen(false)}
                className="text-ink/40 hover:text-ink p-1 rounded-md hover:bg-cream/60 transition-colors disabled:opacity-50"
                disabled={!!exporting}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Format options */}
            <div className="p-6 space-y-2">
              <p className="text-[10px] font-mono uppercase tracking-wider text-ink/40 mb-3">
                Formato
              </p>
              {(Object.keys(FORMAT_INFO) as ExportFormat[]).map((fmt) => {
                const info = FORMAT_INFO[fmt];
                const Icon = info.icon;
                const isLoading = exporting === fmt;
                return (
                  <button
                    key={fmt}
                    onClick={() => handleExport(fmt)}
                    disabled={!!exporting}
                    className="w-full flex items-center gap-3 p-3 border border-border bg-paper hover:border-ink/60 hover:shadow-sm rounded-lg text-left transition-all disabled:opacity-50 disabled:pointer-events-none active:scale-[0.99]"
                  >
                    <div className="inline-flex items-center justify-center w-10 h-10 bg-cream/60 border border-border rounded-md shrink-0">
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-orange" />
                      ) : (
                        <Icon className="w-4 h-4 text-ink" strokeWidth={1.75} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-ink">{info.label}</div>
                      <div className="text-xs text-ink/55">{info.description}</div>
                    </div>
                    {!isLoading && (
                      <Download className="w-3.5 h-3.5 text-ink/40 shrink-0" strokeWidth={1.75} />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Advanced toggle */}
            <div className="border-t border-border">
              <button
                onClick={() => setAdvanced((a) => !a)}
                className="w-full flex items-center justify-between px-6 py-3 text-xs font-medium text-ink/70 hover:text-ink hover:bg-cream/30 transition-colors"
              >
                <span className="inline-flex items-center gap-2">
                  <Settings2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                  Opciones avanzadas
                </span>
                <span className="text-ink/40">{advanced ? "−" : "+"}</span>
              </button>

              {advanced && (
                <div className="px-6 pb-6 space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
                  <Field label="Tamaño de página">
                    <Segmented
                      value={opts.pageSize}
                      options={[
                        { value: "A4", label: "A4" },
                        { value: "Letter", label: "Letter" },
                      ]}
                      onChange={(v) => setOpts((o) => ({ ...o, pageSize: v as PageSize }))}
                    />
                  </Field>

                  <Field label="Orientación">
                    <Segmented
                      value={opts.orientation}
                      options={[
                        { value: "portrait", label: "Vertical" },
                        { value: "landscape", label: "Horizontal" },
                      ]}
                      onChange={(v) => setOpts((o) => ({ ...o, orientation: v as Orientation }))}
                    />
                  </Field>

                  <Field label="Tipografía">
                    <Segmented
                      value={opts.fontFamily}
                      options={[
                        { value: "serif", label: "Serif" },
                        { value: "sans", label: "Sans" },
                        { value: "mono", label: "Mono" },
                      ]}
                      onChange={(v) => setOpts((o) => ({ ...o, fontFamily: v as FontFamily }))}
                    />
                  </Field>

                  <Field label={`Tamaño de fuente: ${opts.fontSize}pt`}>
                    <input
                      type="range"
                      min={9}
                      max={14}
                      value={opts.fontSize}
                      onChange={(e) => setOpts((o) => ({ ...o, fontSize: parseInt(e.target.value) }))}
                      className="w-full accent-orange"
                    />
                  </Field>

                  <Field label={`Márgenes: ${opts.marginCm}cm`}>
                    <input
                      type="range"
                      min={1}
                      max={4}
                      step={0.5}
                      value={opts.marginCm}
                      onChange={(e) => setOpts((o) => ({ ...o, marginCm: parseFloat(e.target.value) }))}
                      className="w-full accent-orange"
                    />
                  </Field>

                  <div className="space-y-2 pt-1">
                    <Toggle
                      checked={opts.includeHeader}
                      onChange={(v) => setOpts((o) => ({ ...o, includeHeader: v }))}
                      label="Encabezado con título"
                    />
                    <Toggle
                      checked={opts.includeFooter}
                      onChange={(v) => setOpts((o) => ({ ...o, includeFooter: v }))}
                      label="Pie con número de página"
                    />
                    <Toggle
                      checked={opts.includeDate}
                      onChange={(v) => setOpts((o) => ({ ...o, includeDate: v }))}
                      label="Fecha en el encabezado"
                    />
                  </div>

                  <p className="text-[10px] text-ink/40 leading-relaxed pt-2 border-t border-border">
                    Las opciones avanzadas aplican a PDF y Word. Markdown ignora estilos.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] font-medium text-ink/65 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex bg-cream/60 border border-border rounded-md p-0.5 w-full">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`flex-1 px-3 py-1.5 text-xs rounded-[5px] transition-all ${
            value === o.value ? "bg-paper shadow-sm text-ink font-medium" : "text-ink/60 hover:text-ink"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center justify-between gap-3 text-xs text-ink/75 cursor-pointer hover:text-ink">
      <span>{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border transition-colors ${
          checked ? "bg-orange border-orange" : "bg-cream/60 border-border"
        }`}
      >
        <span
          className={`inline-block h-3.5 w-3.5 rounded-full bg-paper shadow-sm transition-transform mt-[1px] ${
            checked ? "translate-x-[18px]" : "translate-x-[2px]"
          }`}
        />
      </button>
    </label>
  );
}
