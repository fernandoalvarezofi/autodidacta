import { FileText, Network, Layers } from "lucide-react";

/**
 * Mockup editorial: tarjeta tipo "página de cuaderno académico" con secciones,
 * tipografía serif, citas, y un pequeño diagrama. Sin glows, sin gradientes,
 * solo papel, tinta y un acento naranja.
 */
export function StudyMockup() {
  return (
    <div className="relative max-w-[1100px] mx-auto">
      <div className="bg-card border border-border shadow-paper overflow-hidden">
        {/* Topbar tipo barra de navegador minimal */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-border bg-cream">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-ink/15" />
            <span className="w-2.5 h-2.5 rounded-full bg-ink/15" />
            <span className="w-2.5 h-2.5 rounded-full bg-ink/15" />
          </div>
          <div className="flex-1 text-center text-xs font-mono text-ink/55 truncate">
            autodidactas.app/notebook/termodinamica-iv
          </div>
        </div>

        <div className="grid grid-cols-12">
          {/* Sidebar */}
          <aside className="hidden md:block col-span-3 border-r border-border p-6 bg-paper">
            <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-ink/55 mb-3">
              Cuadernos
            </div>
            <ul className="space-y-2 text-sm">
              {[
                { t: "Termodinámica IV", active: true },
                { t: "Cálculo III" },
                { t: "Bioquímica" },
                { t: "Historia · S. XX" },
              ].map((n) => (
                <li
                  key={n.t}
                  className={`px-2 py-1.5 -mx-2 border-l-2 ${
                    n.active
                      ? "border-orange text-ink font-medium"
                      : "border-transparent text-ink/60"
                  }`}
                >
                  {n.t}
                </li>
              ))}
            </ul>

            <div className="mt-8 text-[10px] font-mono uppercase tracking-[0.15em] text-ink/55 mb-3">
              Herramientas
            </div>
            <ul className="space-y-2.5 text-sm text-ink/70">
              <li className="flex items-center gap-2.5">
                <FileText className="w-3.5 h-3.5" strokeWidth={1.5} /> Resumen
              </li>
              <li className="flex items-center gap-2.5">
                <Network className="w-3.5 h-3.5" strokeWidth={1.5} /> Mapa
                conceptual
              </li>
              <li className="flex items-center gap-2.5">
                <Layers className="w-3.5 h-3.5" strokeWidth={1.5} /> Flashcards
              </li>
            </ul>
          </aside>

          {/* Documento */}
          <article className="col-span-12 md:col-span-6 p-7 lg:p-10 border-r border-border">
            <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-ink/55">
              Capítulo IV · §3
            </div>
            <h3 className="mt-2 font-display text-2xl lg:text-3xl font-semibold leading-tight">
              Segundo principio de la termodinámica
            </h3>
            <div className="mt-3 rule-thin w-12 border-orange border-t-2" />

            <div className="mt-5 space-y-4 text-[13.5px] leading-relaxed text-ink/85 font-display">
              <p>
                La <strong>entropía</strong> de un sistema aislado nunca decrece
                con el tiempo; tiende a un valor máximo en el equilibrio
                termodinámico.
              </p>

              <blockquote className="border-l-2 border-orange pl-4 italic text-ink/75">
                «No es posible un proceso cuyo único resultado sea la
                transferencia de calor de un cuerpo más frío a otro más
                caliente.» — Clausius, 1854
              </blockquote>

              <p>
                Formalmente, para un proceso espontáneo:{" "}
                <span className="font-mono text-[12px] bg-cream px-1.5 py-0.5">
                  ΔS<sub>universo</sub> ≥ 0
                </span>
              </p>
            </div>
          </article>

          {/* Panel de estudio */}
          <aside className="col-span-12 md:col-span-3 p-6 bg-cream">
            <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-ink/55 mb-4">
              Tarjetas generadas
            </div>
            <ul className="space-y-3">
              {[
                "Definir entropía en sistema aislado",
                "Enunciar el principio de Clausius",
                "Calcular ΔS en proceso isotérmico",
              ].map((q, i) => (
                <li
                  key={i}
                  className="bg-paper border border-border p-3 text-[12.5px] leading-snug"
                >
                  <div className="text-[9px] font-mono uppercase tracking-[0.15em] text-ink/55 mb-1">
                    Tarjeta {String(i + 1).padStart(2, "0")}
                  </div>
                  {q}
                </li>
              ))}
            </ul>

            <div className="mt-6 rule-thin pt-4">
              <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-ink/55">
                Próxima revisión
              </div>
              <div className="font-display text-xl font-semibold mt-1">
                en 3 días
              </div>
              <div className="text-[11px] text-ink/55 mt-0.5">
                Algoritmo SM-2
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
