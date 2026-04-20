import { motion } from "framer-motion";

/**
 * Mockup CSS puro de un MacBook Pro con la UI real de Autodidactas adentro.
 * Sin imágenes externas — siempre nítido en cualquier viewport.
 */
export function MacbookMockup() {
  return (
    <div className="relative w-full max-w-[920px] mx-auto select-none">
      {/* Glow de fondo */}
      <div
        aria-hidden
        className="absolute -inset-16 bg-[var(--gradient-glow)] blur-3xl opacity-80 pointer-events-none"
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="relative animate-float-soft"
      >
        {/* Pantalla */}
        <div
          className="relative rounded-[18px] p-[10px] shadow-[0_30px_80px_oklch(5%_0.01_264_/_0.7)]"
          style={{
            background:
              "linear-gradient(180deg, oklch(28% 0.02 264), oklch(18% 0.02 264))",
            border: "1px solid oklch(35% 0.03 264)",
          }}
        >
          {/* Bisel interior */}
          <div
            className="rounded-[10px] overflow-hidden relative"
            style={{
              background: "oklch(8% 0.01 264)",
              border: "1px solid oklch(40% 0.04 264)",
              aspectRatio: "16 / 10",
            }}
          >
            {/* Notch */}
            <div
              aria-hidden
              className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-3 rounded-b-lg z-30"
              style={{ background: "oklch(8% 0.01 264)" }}
            />

            {/* Contenido de la app */}
            <AppPreview />
          </div>
        </div>

        {/* Base / hinge */}
        <div className="relative mx-auto" style={{ width: "104%" }}>
          <div
            className="h-3 rounded-b-2xl mx-auto"
            style={{
              background:
                "linear-gradient(180deg, oklch(30% 0.02 264), oklch(18% 0.02 264))",
              boxShadow: "inset 0 1px 0 oklch(45% 0.03 264)",
            }}
          />
          <div
            className="h-1.5 mx-auto rounded-b-[14px]"
            style={{
              width: "30%",
              background:
                "linear-gradient(180deg, oklch(20% 0.02 264), oklch(12% 0.01 264))",
            }}
          />
        </div>
      </motion.div>
    </div>
  );
}

function AppPreview() {
  return (
    <div className="absolute inset-0 flex text-[10px] sm:text-[11px] font-sans">
      {/* Sidebar */}
      <div
        className="w-[18%] h-full flex flex-col gap-2 p-2.5 border-r"
        style={{
          background: "oklch(14% 0.02 264)",
          borderColor: "oklch(25% 0.03 264)",
        }}
      >
        <div className="flex items-center gap-1.5 mb-2">
          <div className="w-4 h-4 rounded bg-gradient-brand shadow-glow-brand" />
          <span className="font-display font-bold text-foreground">
            Autodidactas
          </span>
        </div>
        {[
          { label: "Mis notebooks", active: true },
          { label: "Flashcards", active: false },
          { label: "Quiz arena", active: false },
          { label: "Plan de examen", active: false },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-md px-2 py-1.5 truncate"
            style={{
              background: item.active
                ? "oklch(65% 0.25 264 / 0.18)"
                : "transparent",
              color: item.active
                ? "oklch(80% 0.12 264)"
                : "oklch(70% 0.01 264)",
              border: item.active
                ? "1px solid oklch(65% 0.25 264 / 0.4)"
                : "1px solid transparent",
            }}
          >
            {item.label}
          </div>
        ))}
        <div className="mt-auto pt-2 border-t" style={{ borderColor: "oklch(25% 0.03 264)" }}>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-gradient-brand" />
            <div className="text-muted-foreground truncate">Streak 12 🔥</div>
          </div>
        </div>
      </div>

      {/* Main: notebook + mindmap */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <div
          className="h-7 flex items-center gap-2 px-3 border-b"
          style={{
            background: "oklch(13% 0.02 264)",
            borderColor: "oklch(25% 0.03 264)",
          }}
        >
          <div className="flex gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[oklch(62%_0.23_25)]" />
            <span className="w-1.5 h-1.5 rounded-full bg-[oklch(75%_0.18_55)]" />
            <span className="w-1.5 h-1.5 rounded-full bg-[oklch(78%_0.22_142)]" />
          </div>
          <div className="text-muted-foreground truncate">
            Termodinámica · Cap. 4 — Entropía
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <span className="px-1.5 py-[2px] rounded-full bg-[oklch(78%_0.22_142_/_0.18)] text-[oklch(82%_0.18_142)]">
              ✓ Guardado
            </span>
          </div>
        </div>

        {/* Workspace */}
        <div className="flex-1 grid grid-cols-2 gap-0">
          {/* Resumen */}
          <div className="p-3 overflow-hidden border-r" style={{ borderColor: "oklch(25% 0.03 264)" }}>
            <div className="font-display font-bold text-foreground mb-1.5 leading-tight">
              Segundo principio de la termodinámica
            </div>
            <div className="space-y-1.5 text-muted-foreground leading-snug">
              <p>
                La <span className="text-foreground font-semibold">entropía</span>{" "}
                de un sistema aislado nunca decrece — tiende al equilibrio.
              </p>
              <div
                className="rounded-md px-2 py-1.5 border-l-2"
                style={{
                  background: "oklch(65% 0.25 264 / 0.08)",
                  borderColor: "oklch(65% 0.25 264)",
                }}
              >
                <span className="text-foreground">ΔS ≥ 0</span> en procesos espontáneos.
              </div>
              <p>Aplicaciones: motores térmicos, refrigeración, biología…</p>
            </div>

            {/* Flashcards strip */}
            <div className="mt-3 flex gap-1.5">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex-1 rounded-md p-1.5 border"
                  style={{
                    background: "oklch(18% 0.025 264)",
                    borderColor: "oklch(30% 0.04 264)",
                  }}
                >
                  <div className="text-[8px] text-muted-foreground">
                    Flashcard {i}
                  </div>
                  <div className="text-[9px] text-foreground truncate">
                    {["¿Qué es ΔS?", "Definí entropía", "Procesos…"][i - 1]}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mindmap */}
          <div
            className="relative overflow-hidden"
            style={{
              background:
                "radial-gradient(circle at 50% 50%, oklch(18% 0.03 264), oklch(12% 0.02 264))",
            }}
          >
            <MiniMindmap />
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniMindmap() {
  // SVG mindmap centrado
  return (
    <svg viewBox="0 0 200 130" className="absolute inset-0 w-full h-full">
      <defs>
        <linearGradient id="brandGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="oklch(65% 0.25 264)" />
          <stop offset="100%" stopColor="oklch(72% 0.20 195)" />
        </linearGradient>
      </defs>
      {/* edges */}
      {[
        [100, 65, 40, 30],
        [100, 65, 160, 30],
        [100, 65, 35, 100],
        [100, 65, 165, 100],
        [100, 65, 100, 18],
      ].map(([x1, y1, x2, y2], i) => (
        <line
          key={i}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="oklch(72% 0.20 195 / 0.35)"
          strokeWidth="0.7"
        />
      ))}

      {/* nodos sub */}
      {[
        { cx: 40, cy: 30, label: "ΔS≥0" },
        { cx: 160, cy: 30, label: "Calor" },
        { cx: 35, cy: 100, label: "Motores" },
        { cx: 165, cy: 100, label: "Equilibrio" },
        { cx: 100, cy: 18, label: "Sistema" },
      ].map((n, i) => (
        <g key={i}>
          <circle
            cx={n.cx}
            cy={n.cy}
            r="11"
            fill="oklch(72% 0.20 195 / 0.18)"
            stroke="oklch(72% 0.20 195)"
            strokeWidth="0.5"
          />
          <text
            x={n.cx}
            y={n.cy + 1.5}
            textAnchor="middle"
            fontSize="4"
            fill="oklch(96% 0.005 264)"
            fontFamily="DM Sans"
          >
            {n.label}
          </text>
        </g>
      ))}

      {/* Nodo central */}
      <circle
        cx="100"
        cy="65"
        r="18"
        fill="url(#brandGrad)"
        filter="drop-shadow(0 0 6px oklch(65% 0.25 264 / 0.7))"
      />
      <text
        x="100"
        y="63"
        textAnchor="middle"
        fontSize="5"
        fontWeight="700"
        fill="white"
        fontFamily="Syne"
      >
        Entropía
      </text>
      <text
        x="100"
        y="70"
        textAnchor="middle"
        fontSize="3.2"
        fill="oklch(95% 0.02 264 / 0.85)"
      >
        2do principio
      </text>
    </svg>
  );
}
