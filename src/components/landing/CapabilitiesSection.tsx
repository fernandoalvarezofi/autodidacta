import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Mic,
  Youtube,
  PencilLine,
  FileType2,
  AlignLeft,
  ScrollText,
  Network,
  Layers,
  ListChecks,
  Headphones,
  FileDown,
} from "lucide-react";
import { SectionHeader } from "./SectionHeader";

const INPUTS = [
  { id: "pdf", label: "Documento PDF", icon: FileText, sample: { name: "termodinamica-cap4.pdf", meta: "12 páginas · 2.4 MB" } },
  { id: "audio", label: "Audio de clase", icon: Mic, sample: { name: "clase-mecanica-cuantica.mp3", meta: "47 min · 31 MB" } },
  { id: "youtube", label: "Video YouTube", icon: Youtube, sample: { name: "khan-academy/derivadas", meta: "Khan Academy · 18 min" } },
  { id: "manuscript", label: "Manuscrito", icon: PencilLine, sample: { name: "apuntes-bioquimica.jpg", meta: "OCR avanzado · 3 páginas" } },
  { id: "word", label: "Word .docx", icon: FileType2, sample: { name: "ensayo-historia.docx", meta: "8 páginas · 1.1 MB" } },
  { id: "text", label: "Texto pegado", icon: AlignLeft, sample: { name: "Notas de cátedra", meta: "4.200 caracteres" } },
] as const;

const OUTPUTS = [
  { icon: ScrollText, name: "Resumen estructurado", desc: "Jerarquía Markdown con citas." },
  { icon: Network, name: "Mapa conceptual", desc: "Vinculado al texto fuente." },
  { icon: Layers, name: "Tarjetas SM-2", desc: "Pregunta y respuesta clasificadas." },
  { icon: ListChecks, name: "Evaluación MCQ", desc: "Con explicaciones razonadas." },
  { icon: Headphones, name: "Podcast didáctico", desc: "Diálogo entre dos voces." },
  { icon: FileDown, name: "Exportar a Word", desc: "Documento académico listo." },
];

export function CapabilitiesSection() {
  const [active, setActive] = useState<(typeof INPUTS)[number]["id"]>("pdf");
  const current = INPUTS.find((i) => i.id === active)!;
  const Icon = current.icon;

  return (
    <section id="capacidades" className="py-24 lg:py-32 bg-cream border-t border-border">
      <div className="container mx-auto px-6 lg:px-10 max-w-[1200px]">
        <SectionHeader
          number="02"
          eyebrow="Capacidades"
          title={
            <>
              Cualquier formato de entrada.{" "}
              <span className="italic text-orange font-normal">
                Seis herramientas de estudio.
              </span>
            </>
          }
          subtitle="Un mismo motor procesa el material que ya tenés y lo transforma en activos pedagógicos coherentes entre sí."
        />

        <div className="mt-16 grid lg:grid-cols-12 gap-10">
          {/* Inputs como lista vertical estilo índice */}
          <div className="lg:col-span-5">
            <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-ink/55 mb-4">
              Material fuente
            </div>
            <ul className="border-t border-border">
              {INPUTS.map((i) => {
                const isActive = i.id === active;
                const ItemIcon = i.icon;
                return (
                  <li key={i.id} className="border-b border-border">
                    <button
                      onClick={() => setActive(i.id)}
                      className="w-full flex items-center gap-4 py-4 text-left group"
                    >
                      <span
                        className={`w-8 h-8 flex items-center justify-center border transition-colors ${
                          isActive
                            ? "bg-ink border-ink text-paper"
                            : "border-border text-ink/70 group-hover:border-ink"
                        }`}
                      >
                        <ItemIcon className="w-4 h-4" strokeWidth={1.5} />
                      </span>
                      <span
                        className={`font-display text-lg ${
                          isActive ? "text-ink" : "text-ink/70 group-hover:text-ink"
                        } transition-colors`}
                      >
                        {i.label}
                      </span>
                      {isActive && (
                        <motion.span
                          layoutId="cap-bar"
                          className="ml-auto w-1.5 h-6 bg-orange"
                        />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>

            {/* Preview del input activo */}
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="mt-6 bg-paper border border-border p-5"
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-orange" strokeWidth={1.5} />
                  <div className="min-w-0">
                    <div className="font-mono text-sm truncate">{current.sample.name}</div>
                    <div className="text-xs text-ink/55">{current.sample.meta}</div>
                  </div>
                </div>
                <div className="mt-4 h-[3px] bg-cream relative overflow-hidden">
                  <motion.div
                    key={current.id}
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1.6, ease: "easeOut" }}
                    className="absolute inset-y-0 left-0 bg-orange"
                  />
                </div>
                <div className="mt-2 text-xs text-ink/55 font-mono">
                  Procesando · extrayendo conceptos clave…
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Outputs */}
          <div className="lg:col-span-7">
            <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-ink/55 mb-4">
              Activos pedagógicos generados
            </div>
            <div className="grid sm:grid-cols-2 gap-px bg-border border border-border">
              {OUTPUTS.map((o, i) => {
                const OIcon = o.icon;
                return (
                  <motion.div
                    key={o.name}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                    className="bg-paper p-6 hover:bg-cream transition-colors group"
                  >
                    <OIcon
                      className="w-5 h-5 text-orange mb-4"
                      strokeWidth={1.5}
                    />
                    <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-ink/55 mb-1">
                      Salida {String(i + 1).padStart(2, "0")}
                    </div>
                    <div className="font-display text-lg font-semibold leading-tight">
                      {o.name}
                    </div>
                    <div className="mt-1 text-sm text-ink/65">{o.desc}</div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
