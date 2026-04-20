import { motion } from "framer-motion";
import { useCountUp } from "@/hooks/use-count-up";
import { SectionHeader } from "./SectionHeader";

function BigStat({
  value,
  suffix,
  label,
  source,
}: {
  value: number;
  suffix?: string;
  label: string;
  source: string;
}) {
  const { ref, value: v } = useCountUp(value);
  return (
    <div className="border-t border-ink pt-6">
      <div
        className="font-display font-semibold leading-none tracking-tight"
        style={{ fontSize: "clamp(2.75rem, 6vw, 4.5rem)" }}
      >
        <span ref={ref}>{v.toLocaleString("es-AR")}</span>
        {suffix && <span className="text-orange">{suffix}</span>}
      </div>
      <div className="mt-4 font-display text-lg leading-snug max-w-[28ch]">
        {label}
      </div>
      <div className="mt-3 text-[11px] font-mono uppercase tracking-[0.15em] text-ink/55">
        {source}
      </div>
    </div>
  );
}

export function EvidenceSection() {
  return (
    <section id="evidencia" className="py-24 lg:py-32 border-t border-border">
      <div className="container mx-auto px-6 lg:px-10 max-w-[1200px]">
        <SectionHeader
          number="03"
          eyebrow="Evidencia"
          title={
            <>
              Resultados que se{" "}
              <span className="italic text-orange font-normal">
                pueden medir
              </span>
              .
            </>
          }
          subtitle="Datos agregados de estudiantes de grado y posgrado que utilizaron Autodidactas durante al menos un cuatrimestre."
        />

        <div className="mt-16 grid md:grid-cols-3 gap-x-10 gap-y-12">
          <BigStat
            value={62}
            suffix="%"
            label="Mejora en retención de información a 30 días."
            source="Estudio interno · n = 1.240"
          />
          <BigStat
            value={3}
            suffix="×"
            label="Velocidad de preparación frente a métodos tradicionales."
            source="Comparativo cuatrimestral"
          />
          <BigStat
            value={89}
            suffix="%"
            label="De los usuarios reportó mayor confianza al rendir."
            source="Encuesta semestral · n = 4.800"
          />
        </div>

        {/* Cita testimonial editorial */}
        <motion.figure
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-24 max-w-4xl mx-auto text-center"
        >
          <blockquote
            className="font-display italic font-medium leading-[1.2] tracking-tight"
            style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)" }}
          >
            «Por primera vez, mis alumnos llegan a clase con preguntas precisas
            sobre el material. La plataforma cambió la dinámica del aula.»
          </blockquote>
          <figcaption className="mt-6 text-sm">
            <div className="font-display font-semibold">Dra. Lucía Bermúdez</div>
            <div className="text-ink/55 mt-0.5">
              Profesora de Bioquímica · Universidad Nacional
            </div>
          </figcaption>
        </motion.figure>
      </div>
    </section>
  );
}
