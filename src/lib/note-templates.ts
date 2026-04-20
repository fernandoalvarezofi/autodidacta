// Templates iniciales para el editor visual de notas
// Cada template devuelve HTML compatible con TipTap StarterKit + extensiones cargadas
import type { ClayIconKey } from "@/lib/clay-icons";

export interface NoteTemplate {
  key: string;
  name: string;
  /** ClayIconKey del icono representativo del template */
  emoji: ClayIconKey;
  description: string;
  cover_color: string;
  build: (ctx: { title: string; sourceMarkdown?: string }) => {
    title: string;
    html: string;
  };
}

const today = () =>
  new Date().toLocaleDateString("es", { day: "2-digit", month: "long", year: "numeric" });

export const NOTE_TEMPLATES: NoteTemplate[] = [
  {
    key: "blank",
    name: "En blanco",
    emoji: "pencil",
    description: "Empezá desde cero, sin estructura predefinida.",
    cover_color: "cream",
    build: ({ title }) => ({
      title: title || "Nota sin título",
      html: `<h1>${escape(title || "Nueva nota")}</h1><p></p>`,
    }),
  },
  {
    key: "academic",
    name: "Resumen académico",
    emoji: "library",
    description: "Estructura formal: tesis, desarrollo, conclusión y referencias.",
    cover_color: "cream",
    build: ({ title, sourceMarkdown }) => ({
      title: title || "Resumen académico",
      html: `
<h1>${escape(title || "Resumen académico")}</h1>
<p><em>Fecha: ${today()}</em></p>
<h2>Tesis principal</h2>
<p>Escribí en una oración la idea central del documento.</p>
<h2>Desarrollo</h2>
<h3>1. Contexto</h3>
<p>Marco general del tema.</p>
<h3>2. Argumentos clave</h3>
<ul><li>Argumento uno</li><li>Argumento dos</li><li>Argumento tres</li></ul>
<h3>3. Evidencia</h3>
<blockquote><p>Citá fragmentos relevantes acá.</p></blockquote>
<h2>Conclusión</h2>
<p>Síntesis y proyección.</p>
<h2>Referencias</h2>
<p>${sourceMarkdown ? escape(sourceMarkdown.slice(0, 200)) + "..." : "Documento fuente"}</p>
`,
    }),
  },
  {
    key: "cornell",
    name: "Cornell notes",
    emoji: "checklist",
    description: "Sistema clásico: pistas, notas y resumen al pie.",
    cover_color: "orange",
    build: ({ title }) => ({
      title: title || "Cornell notes",
      html: `
<h1>${escape(title || "Cornell notes")}</h1>
<table>
  <tbody>
    <tr><th style="width:30%">Pistas / preguntas</th><th>Notas</th></tr>
    <tr><td><p>¿Qué pregunta clave responde?</p></td><td><p>Tu desarrollo aquí.</p></td></tr>
    <tr><td><p>Concepto importante</p></td><td><p>Definición y ejemplo.</p></td></tr>
    <tr><td><p>Detalle a memorizar</p></td><td><p>Explicación.</p></td></tr>
  </tbody>
</table>
<h2>Resumen final</h2>
<p>En 3-5 oraciones: ¿qué aprendí?</p>
`,
    }),
  },
  {
    key: "concept-map",
    name: "Mapa de conceptos",
    emoji: "compass",
    description: "Concepto raíz, ramas y relaciones jerárquicas.",
    cover_color: "cream",
    build: ({ title }) => ({
      title: title || "Mapa de conceptos",
      html: `
<h1>${escape(title || "Mapa de conceptos")}</h1>
<h2>Concepto raíz</h2>
<p><strong>${escape(title || "Concepto principal")}</strong></p>
<h2>Ramas principales</h2>
<ul>
  <li><strong>Rama 1</strong>
    <ul><li>Sub-idea</li><li>Sub-idea</li></ul>
  </li>
  <li><strong>Rama 2</strong>
    <ul><li>Sub-idea</li><li>Sub-idea</li></ul>
  </li>
  <li><strong>Rama 3</strong>
    <ul><li>Sub-idea</li><li>Sub-idea</li></ul>
  </li>
</ul>
<h2>Relaciones cruzadas</h2>
<p>Anotá conexiones entre ramas distintas.</p>
`,
    }),
  },
  {
    key: "cheatsheet",
    name: "Cheat-sheet",
    emoji: "flame",
    description: "Hoja de trucos densa para repaso rápido pre-examen.",
    cover_color: "orange",
    build: ({ title }) => ({
      title: title || "Cheat-sheet",
      html: `
<h1>⚡ ${escape(title || "Cheat-sheet")}</h1>
<p><em>Repaso rápido — última actualización ${today()}</em></p>
<h2>Fórmulas clave</h2>
<ul>
  <li><code>fórmula 1 = ...</code></li>
  <li><code>fórmula 2 = ...</code></li>
</ul>
<h2>Definiciones esenciales</h2>
<ul>
  <li><strong>Término:</strong> definición corta.</li>
  <li><strong>Término:</strong> definición corta.</li>
</ul>
<h2>Pasos / proceso</h2>
<ol>
  <li>Paso uno</li>
  <li>Paso dos</li>
  <li>Paso tres</li>
</ol>
<h2>Errores comunes</h2>
<blockquote><p>⚠️ Cuidado con...</p></blockquote>
`,
    }),
  },
  {
    key: "study-plan",
    name: "Cronograma de estudio",
    emoji: "calendar",
    description: "Plan semanal con metas diarias y check-list.",
    cover_color: "cream",
    build: ({ title }) => ({
      title: title || "Cronograma de estudio",
      html: `
<h1>📅 ${escape(title || "Cronograma de estudio")}</h1>
<h2>Meta general</h2>
<p>¿Qué querés lograr al final de la semana?</p>
<h2>Lunes</h2>
<ul data-type="taskList"><li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Tarea uno</p></div></li><li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Tarea dos</p></div></li></ul>
<h2>Martes</h2>
<ul data-type="taskList"><li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Tarea uno</p></div></li></ul>
<h2>Miércoles</h2>
<ul data-type="taskList"><li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Tarea uno</p></div></li></ul>
<h2>Jueves</h2>
<ul data-type="taskList"><li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Tarea uno</p></div></li></ul>
<h2>Viernes</h2>
<ul data-type="taskList"><li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Repaso general</p></div></li></ul>
<h2>Reflexión semanal</h2>
<blockquote><p>¿Qué funcionó? ¿Qué cambio para la próxima?</p></blockquote>
`,
    }),
  },
  {
    key: "comparative",
    name: "Comparativa",
    emoji: "target",
    description: "Tabla comparativa entre dos o más opciones.",
    cover_color: "cream",
    build: ({ title }) => ({
      title: title || "Cuadro comparativo",
      html: `
<h1>⚖️ ${escape(title || "Cuadro comparativo")}</h1>
<table>
  <tbody>
    <tr><th>Criterio</th><th>Opción A</th><th>Opción B</th></tr>
    <tr><td><strong>Definición</strong></td><td><p>...</p></td><td><p>...</p></td></tr>
    <tr><td><strong>Ventajas</strong></td><td><p>...</p></td><td><p>...</p></td></tr>
    <tr><td><strong>Desventajas</strong></td><td><p>...</p></td><td><p>...</p></td></tr>
    <tr><td><strong>Cuándo usar</strong></td><td><p>...</p></td><td><p>...</p></td></tr>
  </tbody>
</table>
<h2>Conclusión</h2>
<p>¿Cuál elegirías y por qué?</p>
`,
    }),
  },
];

function escape(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c,
  );
}

export function getTemplate(key: string | null | undefined): NoteTemplate {
  return NOTE_TEMPLATES.find((t) => t.key === key) ?? NOTE_TEMPLATES[0];
}
