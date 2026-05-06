import coverEstudio from "@/assets/blog/cover-estudio.jpg";
import coverMemoria from "@/assets/blog/cover-memoria.jpg";
import coverProductividad from "@/assets/blog/cover-productividad.jpg";
import coverIq from "@/assets/blog/cover-iq.jpg";
import coverIa from "@/assets/blog/cover-ia.jpg";
import coverExamenes from "@/assets/blog/cover-examenes.jpg";

export type BlogCategory =
  | "estudio"
  | "memoria"
  | "productividad"
  | "iq"
  | "ia"
  | "examenes";

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  category: BlogCategory;
  cover: string;
  date: string; // ISO
  readMinutes: number;
  keywords: string[];
  faq: { q: string; a: string }[];
  content: string; // markdown
}

export const CATEGORIES: Record<BlogCategory, { label: string; cover: string; description: string }> = {
  estudio: {
    label: "Técnicas de estudio",
    cover: coverEstudio,
    description: "Métodos basados en evidencia para estudiar mejor en menos tiempo.",
  },
  memoria: {
    label: "Memoria y aprendizaje",
    cover: coverMemoria,
    description: "Cómo funciona la memoria y cómo entrenarla con repaso espaciado.",
  },
  productividad: {
    label: "Productividad académica",
    cover: coverProductividad,
    description: "Hábitos, foco y gestión del tiempo para estudiantes y profesionales.",
  },
  iq: {
    label: "Test de IQ",
    cover: coverIq,
    description: "Inteligencia, razonamiento y cómo interpretar un test de IQ.",
  },
  ia: {
    label: "IA y estudio",
    cover: coverIa,
    description: "Cómo usar inteligencia artificial para aprender de verdad, no para hacer trampa.",
  },
  examenes: {
    label: "Exámenes y universidad",
    cover: coverExamenes,
    description: "Parciales, finales, CBC, oposiciones y guías de carreras.",
  },
};

const md = (s: TemplateStringsArray, ...v: unknown[]) =>
  s.reduce((acc, str, i) => acc + str + (v[i] ?? ""), "").trim();

export const POSTS: BlogPost[] = [
  // ============ ESTUDIO (6) ============
  {
    slug: "metodo-feynman-explicado-paso-a-paso",
    title: "Método Feynman: cómo entender cualquier tema explicándolo como si tuvieras 12 años",
    description:
      "Guía práctica del método Feynman con ejemplos en español: 4 pasos, errores comunes y cómo aplicarlo a parciales, finales y entrevistas técnicas.",
    category: "estudio",
    cover: coverEstudio,
    date: "2026-04-02",
    readMinutes: 8,
    keywords: ["método feynman", "técnicas de estudio", "aprendizaje activo", "estudiar mejor"],
    faq: [
      {
        q: "¿El método Feynman sirve para materias de memoria pura como Anatomía?",
        a: "Sí, pero combinalo con repaso espaciado (Anki o flashcards SM-2). Feynman te asegura comprensión; el repaso fija nombres y relaciones.",
      },
      {
        q: "¿Cuánto tiempo lleva una sesión Feynman?",
        a: "Entre 20 y 45 minutos por concepto. Si tardás más, probablemente el tema es demasiado grande y conviene partirlo en sub-conceptos.",
      },
      {
        q: "¿Puedo usar IA para hacer Feynman?",
        a: "Sí: explicale el tema a un chat y pedile que te haga preguntas como si tuviera 12 años y no entendiera nada. Es uno de los usos más potentes de la IA para estudiar.",
      },
    ],
    content: md`
## Qué es el método Feynman

Richard Feynman, premio Nobel de Física, decía que **si no podés explicar algo con palabras simples, no lo entendés**. Su método tiene cuatro pasos y se puede aplicar a cualquier materia: derecho, medicina, programación, matemática o historia.

Lo que lo hace tan efectivo es que ataca directamente el problema más común al estudiar: la **ilusión de competencia**. Leés un apunte, lo entendés mientras lo leés, lo subrayás, y al día siguiente no podés reproducir nada. Feynman corta esa ilusión de raíz.

## Los 4 pasos

### 1. Elegí un concepto y escribí su nombre arriba de una hoja en blanco

Una hoja, un concepto. No "Sistema cardiovascular" entero, sino "ciclo cardíaco" o "potencial de acción". Cuanto más específico, mejor.

### 2. Explicalo como si se lo enseñaras a un chico de 12 años

Sin jerga. Si tenés que usar una palabra técnica, definila antes con palabras comunes. Usá analogías de la vida cotidiana.

> Ejemplo: en vez de "el ATP es la moneda energética de la célula", decí "el ATP es como la batería cargada que la célula usa para hacer cosas; cuando se gasta, queda descargada (ADP) y hay que volver a cargarla".

### 3. Identificá los huecos y volvé al material

Donde te trabás, ahí está lo que no entendés. Volvé al apunte, al libro o al video y resolvé **solo ese hueco**. No releas todo: andá puntual.

### 4. Simplificá y armá una analogía propia

Reescribí la explicación más corta y con una analogía que sea tuya. Si la analogía la sacaste del libro, no cuenta: tu cerebro no hizo el trabajo.

## Errores comunes

- **Saltarse el paso 1 y arrancar a explicar mentalmente**. Tiene que ser por escrito o en voz alta. La cabeza miente.
- **Usar la jerga del libro como muleta**. Si tu explicación tiene tres palabras técnicas seguidas, no es Feynman.
- **No volver al material**. El paso 3 es el que produce el aprendizaje real.

## Cómo aplicarlo en Argentina y LatAm

Para alumnos del CBC, ingresos a Medicina o materias de UBA, UNLP, UBA XXI, UTN, UNAM o Universidad de Chile, Feynman funciona muy bien combinado con **resúmenes activos** y **flashcards de repaso espaciado**. La idea: Feynman para entender, flashcards para no olvidar.

## Una sesión Feynman tipo (45 min)

| Tiempo | Actividad |
|---|---|
| 0–5 min | Elegir concepto y escribir el título |
| 5–20 min | Primera explicación cruda |
| 20–35 min | Volver al material, llenar huecos |
| 35–45 min | Reescribir versión final con analogía propia |

## Plantilla descargable mental

> **Concepto:** ___
> **Lo explico así:** ___
> **Huecos que detecté:** ___
> **Mi analogía:** ___

Si después de tres intentos seguís sin poder explicarlo simple, el problema no sos vos: probablemente el material está mal escrito o el concepto requiere prerrequisitos que no tenés. Ahí conviene retroceder un nivel.
`,
  },
  {
    slug: "tecnica-pomodoro-funciona-realmente",
    title: "Técnica Pomodoro: ¿realmente funciona o es una moda de TikTok?",
    description:
      "Qué dice la evidencia sobre la técnica Pomodoro, cómo adaptarla a estudio universitario y por qué los 25 minutos no son sagrados.",
    category: "estudio",
    cover: coverEstudio,
    date: "2026-04-04",
    readMinutes: 7,
    keywords: ["pomodoro", "concentración", "estudiar con foco", "técnicas de estudio"],
    faq: [
      { q: "¿Cuántos pomodoros se pueden hacer por día?", a: "Para estudio profundo, entre 8 y 12 pomodoros de 25 min ya es mucho. Más que eso suele indicar que estás haciendo trabajo superficial." },
      { q: "¿Sirve el Pomodoro para programar o escribir?", a: "Sirve para arrancar, pero una vez en flow conviene no cortar. Adaptá a 50/10 o 90/15." },
      { q: "¿Qué hago en los 5 minutos de descanso?", a: "Algo físico y sin pantallas: caminar, tomar agua, mirar por la ventana. Scrollear redes durante el descanso anula el beneficio." },
    ],
    content: md`
## El origen del tomate

Francesco Cirillo inventó la técnica Pomodoro en los 80, usando un timer de cocina con forma de tomate (de ahí el nombre). La regla original es simple:

1. 25 minutos de foco absoluto
2. 5 minutos de descanso
3. Cada 4 pomodoros, descanso largo de 15–30 minutos

## ¿Funciona según la ciencia?

La evidencia directa sobre Pomodoro es limitada, pero los principios que lo sustentan están sólidamente respaldados:

- **Atención sostenida**: la mayoría de los adultos no puede mantener foco profundo más de 45–90 minutos sin caída de rendimiento.
- **Efecto de la fragmentación voluntaria**: saber que viene un descanso reduce la procrastinación y la fatiga.
- **Implementation intentions** (Gollwitzer, 1999): comprometerse a "voy a estudiar X durante 25 minutos" funciona mejor que "voy a estudiar".

## Por qué a veces no te funciona

- **25 minutos son muy pocos para tareas complejas**: escribir un ensayo o resolver un parcial integrador necesita más tiempo de calentamiento.
- **Cortás justo cuando entraste en flow**: la regla rígida puede ser contraproducente.
- **Los descansos los usás mal**: si en los 5 minutos abrís Instagram, tu cerebro queda en modo "scroll" y cuesta volver.

## Variantes que funcionan mejor según el contexto

| Tarea | Bloque | Descanso |
|---|---|---|
| Lectura técnica densa | 25 min | 5 min |
| Repaso con flashcards | 20 min | 5 min |
| Resolución de problemas | 50 min | 10 min |
| Escritura larga / código | 90 min | 15–20 min |

## Cómo armar una sesión Pomodoro útil

1. **Definí el output**: no "estudiar histología", sino "leer y resumir tejidos epiteliales".
2. **Eliminá fricciones**: celular en otra habitación, modo no molestar, una sola pestaña.
3. **Anotá distracciones en una hoja**: si te acordás que tenés que pagar el alquiler, escribilo y volvé. No lo hagas ahora.
4. **Trackeá pomodoros completados**: ver el progreso es lo que sostiene la práctica a largo plazo.

## Para estudiantes en Argentina

Si estás cursando el CBC, una carrera larga en UBA o estás preparando un final integrador, una rutina de **4 pomodoros (≈2 horas) a la mañana + 4 a la tarde** suele ser sostenible y suficiente. Más de 12 pomodoros diarios consistentes es señal de que estás haciendo lectura pasiva, no estudio.

## Conclusión

Pomodoro no es magia: es una excusa estructurada para empezar. Si ya tenés concentración entrenada, podés ignorarlo. Si te cuesta arrancar y postergás, es de las herramientas más simples que existen.
`,
  },
  {
    slug: "active-recall-vs-relectura",
    title: "Active recall vs. relectura: por qué subrayar no te hace aprender",
    description:
      "El estudio más citado de psicología cognitiva del estudio (Karpicke & Roediger, 2008) explicado para estudiantes de habla hispana.",
    category: "estudio",
    cover: coverEstudio,
    date: "2026-04-06",
    readMinutes: 9,
    keywords: ["active recall", "recuperación activa", "estudiar mejor", "psicología del aprendizaje"],
    faq: [
      { q: "¿Qué es active recall en una frase?", a: "Forzarte a recordar algo sin mirar el material, en lugar de releerlo." },
      { q: "¿Subrayar sirve para algo?", a: "Solo si después usás lo subrayado para hacer preguntas y responderlas de memoria. Subrayar y volver a leer no produce aprendizaje duradero." },
      { q: "¿Cuántas veces hay que recuperar un concepto?", a: "Idealmente 3–5 veces espaciadas en el tiempo (1 día, 3 días, 1 semana, 2 semanas, 1 mes)." },
    ],
    content: md`
## La pregunta incómoda

¿Cuántas veces leíste un apunte tres o cuatro veces, llegaste al parcial, y no te acordabas de nada? No es que seas vago. Es que **releer no es estudiar**.

## El experimento que cambió todo

Karpicke y Roediger publicaron en 2008 un estudio en *Science* que midió cuatro grupos de estudiantes universitarios aprendiendo vocabulario en swahili:

- **Grupo A**: estudiar repetidamente, testear repetidamente.
- **Grupo B**: estudiar repetidamente, testear una sola vez.
- **Grupo C**: estudiar una sola vez, testear repetidamente.
- **Grupo D**: estudiar una sola vez, testear una sola vez.

Una semana después, ¿quién recordaba más? El **Grupo C**, por amplísimo margen (~80 % vs ~30 %). El acto de **testearse** —no el de estudiar— era lo que producía el aprendizaje.

## Qué es active recall (recuperación activa)

Es cualquier actividad que te obliga a **traer información desde tu memoria sin mirarla**:

- Cerrar el apunte y escribir todo lo que recordás.
- Hacer flashcards y responder antes de dar vuelta la tarjeta.
- Explicarle el tema a alguien (ver método Feynman).
- Hacer preguntas al margen del libro y responderlas a los días.
- Resolver problemas viejos sin mirar la solución.

## Qué NO es active recall

- Subrayar.
- Resaltar con tres colores.
- Hacer un resumen mientras mirás el original.
- Releer apuntes.
- Ver videos del tema.

Todas estas son **actividades de codificación**, útiles al inicio. Pero si te quedás solo en codificación, no aprendés.

## Por qué cuesta tanto hacerlo

Active recall **se siente más difícil** que releer. Y eso es exactamente la señal de que está funcionando. Roediger lo llamó "dificultad deseable" (*desirable difficulty*): cuanto más esfuerzo cognitivo, más fuerte queda la huella en memoria.

Releer se siente cómodo porque reconocés el texto. Reconocer no es recordar.

## Cómo armar una rutina de active recall

| Día | Actividad |
|---|---|
| Día 1 | Leés y armás flashcards con los conceptos clave |
| Día 2 | Repaso 1 (de memoria) |
| Día 5 | Repaso 2 |
| Día 12 | Repaso 3 |
| Día 30 | Repaso 4 |

Esto es **active recall + repaso espaciado**. La combinación más poderosa que conocemos en psicología del aprendizaje.

## Active recall para distintos tipos de materias

- **Anatomía / Histología**: flashcards con imagen ➝ nombre.
- **Derecho**: pregunta abierta sobre un caso ➝ explicar fundamentos.
- **Matemática**: resolver problemas de cero, sin guía.
- **Idiomas**: traducir activamente, no reconocer.
- **Programación**: escribir el algoritmo desde cero antes de mirar la solución.

## Conclusión

Si tenés que cambiar **una sola cosa** sobre cómo estudiás, que sea esta: cerrá el apunte y forzate a recordar. Es incómodo, es lento al principio, y es la única cosa que demostradamente funciona.
`,
  },
  {
    slug: "como-tomar-apuntes-cornell",
    title: "Sistema Cornell: cómo tomar apuntes que vas a poder usar 6 meses después",
    description:
      "Guía completa del método Cornell para tomar apuntes en clase y al estudiar, con plantilla descargable y ejemplos de Medicina y Derecho.",
    category: "estudio",
    cover: coverEstudio,
    date: "2026-04-08",
    readMinutes: 7,
    keywords: ["método cornell", "cómo tomar apuntes", "técnicas de estudio", "apuntes universidad"],
    faq: [
      { q: "¿Cornell sirve en una notebook digital?", a: "Sí, todas las apps modernas (Notion, Obsidian, Notability, GoodNotes) tienen plantillas Cornell o se pueden armar fácil con tablas." },
      { q: "¿Sirve para clases magistrales rápidas?", a: "Sí, pero la columna de pistas y el resumen los hacés después de clase. Durante la clase solo escribís en la columna de notas." },
    ],
    content: md`
## Qué es el sistema Cornell

Walter Pauk, profesor de Cornell University, lo desarrolló en los 50. La hoja se divide en tres zonas:

\`\`\`
+-----------+-----------------------------+
|           |                             |
|  Pistas   |          Notas              |
| (claves,  |     (lo que escribís        |
| preguntas)|       en clase)             |
|           |                             |
+-----------+-----------------------------+
|              Resumen                    |
+-----------------------------------------+
\`\`\`

## Cómo se usa

### Durante la clase
Escribís en la **columna de notas** (la grande, derecha). No te preocupes por el orden ni por la prolijidad. Capturá ideas, esquemas, definiciones, ejemplos.

### Dentro de las 24 horas siguientes
1. Releés tus notas.
2. En la **columna de pistas** (izquierda) escribís preguntas o palabras clave que resuman cada idea.
3. En la **caja de resumen** (abajo), escribís en 2–3 oraciones el contenido total de la página.

### Para estudiar
Tapás la columna de notas. Mirás solo las pistas e intentás reconstruir la información. Esto convierte tus apuntes en una herramienta de **active recall**.

## Por qué funciona

- Te obliga a procesar la información dos veces (en clase y al pasar a Cornell).
- Genera material de repaso activo, no pasivo.
- El resumen final te da una vista de pájaro útil para repasar antes del examen.

## Adaptaciones por carrera

**Medicina**: en la columna de pistas usá nombres de estructuras o patologías; en notas, características y diferenciales.

**Derecho**: pistas = nombre del fallo o artículo; notas = doctrina, voto mayoritario, disidencias; resumen = principio general.

**Ingeniería**: pistas = fórmula o teorema; notas = derivación, condiciones de aplicación; resumen = cuándo se usa.

## Errores comunes

- Usarlo solo durante la clase y no completar las pistas después.
- Hacer resúmenes de 10 líneas en la caja de resumen (rompe el principio).
- Pasar todo a digital perfectito en vez de estudiar.

## Cornell + flashcards

Si querés llevar el sistema al máximo: cada **pista** se convierte en el frente de una flashcard, y la respuesta es lo que recordás de la columna de notas. Es la forma más eficiente de pasar de apuntes a memoria de largo plazo.
`,
  },
  {
    slug: "interleaving-mezclar-temas-aprende-mas",
    title: "Interleaving: por qué estudiar mezclando temas te hace aprender más",
    description:
      "Mezclar materias o tipos de problemas (interleaving) supera al estudio en bloque en casi todos los meta-análisis. Cómo aplicarlo sin volverte loco.",
    category: "estudio",
    cover: coverEstudio,
    date: "2026-04-10",
    readMinutes: 6,
    keywords: ["interleaving", "estudio intercalado", "cómo estudiar matemática", "técnicas de estudio"],
    faq: [
      { q: "¿No es mejor terminar un tema antes de pasar al otro?", a: "Para entender por primera vez sí. Para consolidar y aplicar, mezclar es mejor." },
      { q: "¿Sirve interleaving para historia o filosofía?", a: "Más para materias con problemas o ejercicios. En materias narrativas funciona mejor el repaso espaciado." },
    ],
    content: md`
## El experimento clásico

Rohrer y Taylor (2007) le dieron a estudiantes problemas de cálculo de volúmenes de cuatro figuras geométricas distintas.

- **Grupo bloque**: 4 problemas de prismas, 4 de cilindros, 4 de conos, 4 de esferas.
- **Grupo interleaving**: los 16 problemas mezclados aleatoriamente.

Durante la práctica, el grupo bloque tuvo **89 %** de aciertos vs **60 %** del grupo interleaving. Una semana después, en el examen real:

- Grupo bloque: **20 %**
- Grupo interleaving: **63 %**

Tres veces más aprendizaje real. Y, sin embargo, los del grupo interleaving **sentían** que estaban aprendiendo menos.

## Por qué funciona

Cuando mezclás temas, tu cerebro tiene que **identificar primero qué tipo de problema es** antes de aplicar el método. Esa discriminación es justamente la habilidad que vas a necesitar en el parcial, donde los problemas no vienen ordenados por capítulo.

## Cómo aplicarlo

- En matemática y física: en vez de hacer 20 ejercicios del capítulo 3 seguidos, mezclá 5 del 1, 5 del 2 y 5 del 3.
- En química orgánica: alterná tipos de reacciones (sustitución, eliminación, adición).
- En idiomas: mezclá vocabulario de varias unidades en lugar de "hoy solo unidad 4".

## Cuándo NO usar interleaving

- Cuando estás aprendiendo un tema por primera vez. Ahí necesitás bloques.
- En tareas creativas largas (escribir un ensayo, programar un proyecto): cortar de tema a tema mata el flow.

## Combinarlo con repaso espaciado

Las apps de flashcards bien hechas ya hacen interleaving por vos: te muestran cards de distintos mazos en una misma sesión. Eso es interleaving + spaced repetition trabajando juntos.
`,
  },
  {
    slug: "subrayar-resaltar-no-funciona",
    title: "Por qué subrayar con tres colores no funciona (y qué hacer en su lugar)",
    description:
      "El estudio meta-analítico de Dunlosky (2013) puso a subrayar entre las técnicas menos efectivas. Te explicamos por qué y qué hacer.",
    category: "estudio",
    cover: coverEstudio,
    date: "2026-04-12",
    readMinutes: 6,
    keywords: ["subrayar no sirve", "técnicas de estudio efectivas", "cómo estudiar"],
    faq: [
      { q: "¿Entonces no subrayo nunca?", a: "Subrayar muy poco (1-2 frases por página) está bien como marcador. El problema es subrayar el 60% del texto y creer que estudiaste." },
    ],
    content: md`
## El meta-análisis que arruinó tu cartuchera

En 2013, John Dunlosky y colegas publicaron un meta-análisis enorme en *Psychological Science in the Public Interest* clasificando las técnicas de estudio en alta, moderada y baja utilidad.

**Alta utilidad**: práctica de recuperación (active recall) y práctica distribuida (spaced repetition).

**Baja utilidad**: subrayar, resumir (sin instrucción), releer, mnemotecnias visuales, palabras clave.

## Por qué subrayar engaña tanto

1. **Da sensación de progreso**: ves la página llena de color y sentís que avanzaste.
2. **Es pasivo**: no estás generando, solo seleccionando.
3. **Inhibe la lectura crítica**: una vez subrayado, tendés a confiar en lo amarillo y no a cuestionar el resto.
4. **Sobre-subrayás**: en pocas semanas el 70% del libro está marcado.

## Qué hacer en lugar de subrayar

### 1. Marginalia activa
Escribí preguntas, no marcas. "¿Por qué pasa esto?", "¿Cómo se relaciona con X?". Cada pregunta es una flashcard futura.

### 2. Mapa conceptual al cierre del capítulo
Sin mirar el libro. Si te sale bien, dominás el tema. Si te sale mal, sabés qué releer.

### 3. Auto-explicación
Después de cada sección, contate a vos mismo en voz alta qué leíste. Si no podés, no lo entendiste.

### 4. Preguntas al margen
En vez de subrayar "el ATP es la moneda energética", anotá al lado: "¿Qué pasa cuando el ATP se gasta?".

## Cuándo subrayar SÍ tiene sentido

- Frases que querés citar después.
- 2 o 3 ideas centrales por capítulo (no más).
- Como índice visual para volver rápido a un punto.

La regla simple: **si subrayaste más del 10 % de la página, dejaste de estudiar y empezaste a decorar**.
`,
  },

  // ============ MEMORIA (5) ============
  {
    slug: "repaso-espaciado-spaced-repetition",
    title: "Repaso espaciado: la técnica más poderosa para no olvidar lo que estudiás",
    description:
      "Cómo funciona el spaced repetition, qué es la curva del olvido de Ebbinghaus, y cómo armar un sistema con Anki o flashcards SM-2.",
    category: "memoria",
    cover: coverMemoria,
    date: "2026-04-03",
    readMinutes: 9,
    keywords: ["repaso espaciado", "spaced repetition", "anki", "curva del olvido", "sm-2"],
    faq: [
      { q: "¿Anki es mejor que las flashcards de papel?", a: "Para más de 200 cards, sí: el algoritmo te dice qué repasar cada día. Para menos, papel funciona igual." },
      { q: "¿Cuántas cards nuevas por día?", a: "Para empezar, 10–15 nuevas y entre 50–100 de repaso. Más de 30 nuevas diarias es insostenible." },
    ],
    content: md`
## La curva del olvido

Hermann Ebbinghaus, en 1885, se memorizó listas de sílabas sin sentido y midió cuánto recordaba con el paso del tiempo. Descubrió que **olvidamos la mayoría de lo que aprendemos en las primeras 24 horas**.

\`\`\`
100% |█
     |█
     |█▓
 50% |█▓░
     |█▓░░
     |█▓░░░░░░
  0% +─────────────────►
     1h  1d  3d   1sem  1mes
\`\`\`

La buena noticia: cada vez que **recuperás** la información antes de olvidarla, la curva se aplana. El espaciamiento óptimo entre repasos es **justo antes de olvidar**.

## Qué es spaced repetition

Es un sistema que te muestra una flashcard justo antes de que la olvides. Si la respondés bien, el intervalo se alarga. Si la respondés mal, se acorta.

## El algoritmo SM-2 (el de Anki)

Cada card tiene tres parámetros:
- **Intervalo** (días hasta el próximo repaso)
- **Factor de facilidad** (cuánto se alarga el intervalo si acertás)
- **Repeticiones** (cuántas veces consecutivas la respondiste bien)

Si la respondés bien, el nuevo intervalo es \`intervalo_anterior × factor_facilidad\`. Si fallás, vuelve a 1 día.

## Cómo armar buenas flashcards

1. **Una idea por card**. Si la respuesta tiene 4 puntos, hacé 4 cards.
2. **Pregunta concreta**, no "explicar X".
3. **Cloze deletion** (frases con huecos) para definiciones largas.
4. **Imágenes** para anatomía, geografía, arte.

## Errores comunes

- Hacer 500 cards de un capítulo en una tarde y nunca más volver.
- Cards larguísimas que tenés que leer 30 segundos antes de responder.
- Copiar literal del libro: cards prefabricadas casi nunca funcionan tan bien como las propias.

## Una rutina realista

| Etapa | Tiempo diario |
|---|---|
| Cards nuevas (10–15) | 5 min |
| Repaso de cards viejas | 15–25 min |
| Total | 20–30 min |

Diez años después de empezar a usar Anki, los estudiantes de medicina suelen tener entre 8.000 y 15.000 cards activas. Suena demasiado, pero como el sistema te muestra solo las que tocan ese día, es muy sostenible.

## Spaced repetition + active recall = imbatible

Las flashcards bien hechas son active recall. El sistema decide cuándo. Vos solo aparecés todos los días 20 minutos. Es la única forma comprobada de **acumular conocimiento permanente** a lo largo de una carrera entera.
`,
  },
  {
    slug: "memoria-trabajo-vs-largo-plazo",
    title: "Memoria de trabajo vs. memoria de largo plazo: por qué tu cerebro 'se llena'",
    description:
      "Diferencia entre memoria de trabajo y de largo plazo, cuántos elementos podés sostener a la vez y cómo aprovechar el chunking para multiplicar tu capacidad.",
    category: "memoria",
    cover: coverMemoria,
    date: "2026-04-05",
    readMinutes: 8,
    keywords: ["memoria de trabajo", "memoria a largo plazo", "chunking", "Miller 7 +/- 2"],
    faq: [
      { q: "¿Se puede agrandar la memoria de trabajo?", a: "La capacidad bruta no, pero podés ampliar funcionalmente con chunking y estrategias." },
    ],
    content: md`
## Las tres memorias

Atkinson y Shiffrin propusieron en 1968 un modelo que sigue vigente:

1. **Memoria sensorial**: dura milisegundos. Es lo que captás justo antes de prestar atención.
2. **Memoria de trabajo (a corto plazo)**: dura segundos a minutos, capacidad muy limitada.
3. **Memoria de largo plazo**: capacidad prácticamente infinita, dura años o décadas.

## El número mágico de Miller

George Miller, 1956: la memoria de trabajo sostiene **7 ± 2 elementos** simultáneamente. Estimaciones más modernas (Cowan, 2001) lo bajan a **4 ± 1**.

Por eso recordás un teléfono de 8 dígitos pero no de 16. Y por eso una clase con 50 conceptos nuevos te deja la cabeza fundida.

## Chunking: el truco para multiplicar capacidad

Un chunk es una unidad de información significativa. Para alguien que no sabe ajedrez, una posición de 30 piezas son 30 elementos. Para un Gran Maestro, son 4–5 patrones reconocibles.

**El truco para estudiar más**: no memorices ítems sueltos, sino **patrones que conectan ítems**.

Ejemplo: el ciclo de Krebs tiene 8 reacciones. Si las memorizás como 8 ítems, te explota la cabeza. Si las agrupás como "tres pares de descarboxilación + un par de regeneración", son 4 chunks.

## Cómo pasar de memoria de trabajo a largo plazo

1. **Atención sostenida**: sin atención, no hay codificación.
2. **Procesamiento profundo**: significado > forma. Por eso resumir con tus palabras funciona mejor que copiar.
3. **Repetición espaciada**: cada recuperación fortalece la huella.
4. **Sueño**: la consolidación ocurre en gran parte durante el sueño REM y de ondas lentas.

## Implicancia práctica para estudiar

- No estudies 8 horas seguidas: tu memoria de trabajo se satura.
- Sesiones cortas y espaciadas vencen a maratones.
- Antes de leer algo nuevo, activá lo que ya sabés del tema (lluvia de ideas, índice).
- Dormí. En serio. Estudiar sin dormir es tirar el trabajo a la basura.
`,
  },
  {
    slug: "palacio-de-la-memoria-mnemonica",
    title: "Palacio de la memoria: la técnica de los campeones mundiales de memorización",
    description:
      "Cómo construir tu primer palacio de la memoria paso a paso, con ejemplos para memorizar listas, fórmulas, dinastías y huesos del cuerpo humano.",
    category: "memoria",
    cover: coverMemoria,
    date: "2026-04-07",
    readMinutes: 8,
    keywords: ["palacio de la memoria", "método de loci", "mnemotecnia", "campeonato de memoria"],
    faq: [
      { q: "¿Sirve para temas complejos o solo para listas?", a: "Brilla en listas y secuencias. Para conceptos abstractos, mejor combinar con mapas conceptuales." },
    ],
    content: md`
## Una técnica de 2500 años

El método de loci (latín: "lugares") aparece descrito por Cicerón. Lo usaban los oradores romanos para recordar discursos de horas. Los campeones mundiales actuales de memoria —que recuerdan el orden de un mazo de cartas en menos de 20 segundos— usan exactamente la misma técnica.

## Cómo funciona tu cerebro espacialmente

La memoria espacial es **ridículamente buena**. Podés recorrer mentalmente tu casa de la infancia y recordar dónde estaban los muebles 20 años después. Esa capacidad es la que aprovecha el palacio.

## Construir tu primer palacio

### Paso 1: elegí un lugar conocido
Tu casa actual, la de tus viejos, tu colegio, tu camino de casa al trabajo. Cuanto más vívida sea tu memoria del lugar, mejor.

### Paso 2: definí una ruta fija
Por ejemplo: puerta de entrada → perchero → living → cocina → heladera → habitación → cama → placard → baño → ducha. Diez "loci" o estaciones.

### Paso 3: asociá cada elemento a memorizar con un locus
Imagen exagerada, absurda, en movimiento. Cuanto más rara, mejor se fija.

> Ejemplo: si tenés que memorizar los huesos del carpo (escafoides, semilunar, piramidal, pisiforme, trapecio, trapezoide, grande, ganchoso):
> - Puerta: una **escafandra** gigante (escafoides)
> - Perchero: una **luna** colgada (semilunar)
> - Living: una **pirámide** sobre el sofá (piramidal)
> - Cocina: un piso lleno de **arroz** (pisiforme)
> - Heladera: un **trapecio** circense colgando (trapecio)
> - …

### Paso 4: recorré el palacio mentalmente
Tres veces ese día, una al día siguiente, una a la semana. Las imágenes quedan fijas.

## Para qué sirve y para qué no

**Sirve mucho**: secuencias de pasos (ciclo de Krebs, fases de la mitosis), listas largas (huesos, dinastías, presidentes), discursos, presentaciones.

**Sirve menos**: comprensión conceptual profunda, resolución de problemas, derivaciones matemáticas.

## Limitaciones

- Lleva tiempo construir el primer palacio (1–2 horas).
- Si reusás el mismo palacio para muchas listas, las imágenes se mezclan. Convieneorganizar uno por materia.
`,
  },
  {
    slug: "sueno-y-aprendizaje",
    title: "Sueño y aprendizaje: por qué dormir poco arruina todo lo que estudiaste",
    description:
      "Qué dice la ciencia sobre cómo el sueño consolida la memoria, por qué dormir 5 horas para estudiar es contraproducente y qué hacer la noche antes del parcial.",
    category: "memoria",
    cover: coverMemoria,
    date: "2026-04-09",
    readMinutes: 7,
    keywords: ["sueño y memoria", "dormir antes de un examen", "consolidación de memoria", "REM"],
    faq: [
      { q: "¿Y si no me da el tiempo, me conviene estudiar toda la noche?", a: "No. Estudios consistentes muestran que dormir 6–8 hs antes del examen rinde mejor que estudiar 4 hs extra y dormir 2." },
    ],
    content: md`
## Qué pasa mientras dormís

El sueño tiene varias fases que se alternan en ciclos de 90 minutos:

- **Sueño de ondas lentas (NREM 3)**: consolidación de memoria declarativa (hechos, conceptos).
- **Sueño REM**: consolidación de memoria procedural y resolución creativa.

Si dormís solo 4–5 horas, te perdés gran parte del REM, que se concentra en la segunda mitad de la noche.

## Evidencia experimental

- Estudios con resonancia magnética muestran reactivación nocturna de los circuitos involucrados en lo que aprendiste durante el día.
- Privación de sueño reduce hasta un **40 %** la capacidad de formar nuevas memorias al día siguiente (Walker, 2007).
- Una siesta de 90 minutos puede tener un efecto consolidador equiparable a una noche corta.

## Qué hacer la noche antes de un examen

1. **Cerrá los apuntes 60–90 min antes de dormir**.
2. **Hacé un repaso ligero, no aprendas nada nuevo**.
3. **Dormí 7–8 horas si podés**.
4. **No tomes café después de las 6 PM**: la cafeína tiene vida media de 5–7 horas.
5. **Pantallas reducidas**: la luz azul retrasa la melatonina.

## Mitos

- "Yo aprendí a funcionar con 4 horas". No: tu rendimiento subjetivo y el real divergen mucho con privación crónica.
- "Si tomo café, no necesito dormir". El café enmascara cansancio pero no reemplaza la consolidación.

## Implicancia para estudiar todo el cuatrimestre

Dormir bien no es opcional ni "cuando termine la facultad". Es **parte del estudio**. Cada hora de sueño bien dormida consolida lo que estudiaste durante el día. Estudiar sin dormir es como entrenar sin descansar: el músculo no crece.
`,
  },
  {
    slug: "olvido-curva-ebbinghaus",
    title: "La curva del olvido de Ebbinghaus: por qué olvidás el 50% en 24 horas",
    description:
      "Qué dice exactamente el experimento de Ebbinghaus, qué tan bien envejeció con la ciencia moderna y cómo aplicar la curva para no olvidar nada importante.",
    category: "memoria",
    cover: coverMemoria,
    date: "2026-04-11",
    readMinutes: 6,
    keywords: ["curva del olvido", "ebbinghaus", "memoria", "retención de información"],
    faq: [],
    content: md`
## Quién fue Ebbinghaus

Hermann Ebbinghaus, psicólogo alemán, hizo en 1885 uno de los experimentos más rigurosos de la historia de la psicología: usándose a sí mismo como sujeto único, memorizó listas de **2.300 sílabas sin sentido** y midió cuánto recordaba a las 20 minutos, 1 hora, 9 horas, 1 día, 2 días, 6 días y 31 días.

## El resultado

- A los 20 minutos: **58%** retenido
- A la 1 hora: **44%**
- A las 9 horas: **36%**
- A los 6 días: **25%**
- A los 31 días: **21%**

Y esa curva ha sido **replicada decenas de veces** con material real, no solo sílabas.

## Qué cambia la curva

La curva original es brutalmente pronunciada porque eran sílabas sin sentido. Si lo que estudiás:

- Tiene **significado** ➝ olvidás más lento.
- Conecta con lo que ya sabés ➝ olvidás más lento.
- Lo aprendiste con **emoción** ➝ olvidás más lento.
- Lo **recuperaste activamente** ➝ olvidás muchísimo más lento.

## Cómo aplanar la curva

Cada vez que recuperás la información antes de olvidarla, la nueva curva del olvido se hace más plana. Después de 4 o 5 recuperaciones espaciadas, la información puede quedar prácticamente para siempre.

\`\`\`
Sin repaso:        olvidás el 80% en una semana
Con 4 repasos:     recordás el 80% en seis meses
\`\`\`

## Cuándo repasar

Una secuencia razonable después de aprender algo:
- Repaso 1: el mismo día (2–4 hs después)
- Repaso 2: al día siguiente
- Repaso 3: a los 3 días
- Repaso 4: a la semana
- Repaso 5: al mes

Si usás un sistema SM-2 (Anki o equivalente), el algoritmo lo decide por vos.
`,
  },

  // ============ PRODUCTIVIDAD (5) ============
  {
    slug: "deep-work-cal-newport-resumen",
    title: "Deep Work de Cal Newport: resumen práctico para estudiantes",
    description:
      "Las 4 reglas de Deep Work aplicadas a estudio universitario: cómo conseguir 4 horas de foco profundo al día sin morir en el intento.",
    category: "productividad",
    cover: coverProductividad,
    date: "2026-04-13",
    readMinutes: 9,
    keywords: ["deep work", "cal newport", "concentración", "productividad estudiantes"],
    faq: [
      { q: "¿Cuántas horas de deep work se pueden hacer por día?", a: "Para principiantes, 1–2 horas. Para entrenados, 3–4. Más de 5 horas diarias sostenidas es prácticamente imposible." },
    ],
    content: md`
## La tesis del libro

Cal Newport propone una distinción simple:

- **Deep work** (trabajo profundo): tareas que requieren foco total, sin distracciones, durante períodos largos. Producen valor real y son difíciles de replicar.
- **Shallow work** (trabajo superficial): tareas logísticas, mails, reuniones, scroll, multitasking. Necesarias pero de bajo valor.

La hipótesis: **la capacidad de hacer deep work es cada vez más rara y más valiosa**. Quien la entrena, gana ventaja competitiva.

## Por qué importa para estudiar

Estudiar de verdad es deep work. Leer un capítulo difícil, resolver un parcial integrador, escribir una monografía: todo eso requiere **concentración sostenida**. Y nuestra atención está siendo demolida por notificaciones.

## Las 4 reglas

### Regla 1: trabajá profundo

Elegí una "filosofía" que se adapte a tu vida:
- **Monástica**: bloques de días/semanas enteras sin distracciones (no es realista para la mayoría).
- **Bimodal**: días enteros de deep work alternados con días sociales/logísticos.
- **Rítmica**: la misma franja horaria todos los días (la más sostenible).
- **Periodística**: encajás deep work donde puedas (requiere mucha disciplina).

Para estudiantes, **rítmica** suele ser la mejor: 7–11 AM todos los días, sin excepciones.

### Regla 2: aceptá el aburrimiento

Si cada vez que te aburrís dos segundos sacás el celular, tu cerebro pierde la capacidad de tolerar la fricción del foco profundo. Solución:

- Esperá filas sin celular.
- Caminá sin auriculares.
- Programá ventanas pequeñas de internet, no a demanda.

### Regla 3: dejá las redes sociales (o limitalas brutalmente)

Newport propone un experimento: 30 días sin redes. Casi nadie las extraña genuinamente. Las que sí, las reincorporás con uso intencional.

### Regla 4: secá lo superficial

Hacé un balance honesto: cuántas horas por día estás en shallow work y cuántas en deep work. Si hacés 6 hs en redes/mails/reuniones/scroll y 30 min de estudio real, la pirámide está invertida.

## Una rutina realista para un estudiante

\`\`\`
06:30 — despertar, sin celular hasta...
07:30 — primera ventana de mensajes
07:30–11:00 — deep work block (estudio profundo)
11:00–11:30 — descanso real
11:30–13:00 — segundo bloque, más liviano
13:00–14:00 — almuerzo + ocio sin pantallas
14:00–17:00 — clases / shallow work
17:00–18:00 — gimnasio / caminata
18:00–19:30 — repaso liviano, flashcards
19:30–22:30 — vida personal
22:30 — sin pantallas
\`\`\`

Cuatro horas diarias de deep work consistentes durante un cuatrimestre te ponen en otro plano respecto del estudiante promedio.
`,
  },
  {
    slug: "como-vencer-procrastinacion-evidencia",
    title: "Procrastinación: por qué postergás (no es vagancia) y cómo dejar de hacerlo",
    description:
      "La ciencia detrás de la procrastinación: regulación emocional, perfeccionismo, ansiedad. Estrategias específicas que funcionan según meta-análisis.",
    category: "productividad",
    cover: coverProductividad,
    date: "2026-04-15",
    readMinutes: 8,
    keywords: ["procrastinación", "como dejar de procrastinar", "productividad", "estudio"],
    faq: [
      { q: "¿La procrastinación es un problema de motivación?", a: "No. Es un problema de regulación emocional: postergamos para evitar la incomodidad de la tarea, no porque no nos importe." },
    ],
    content: md`
## La nueva ciencia de la procrastinación

Durante décadas se pensó que la procrastinación era un problema de gestión del tiempo. Investigaciones más recientes (Pychyl, Sirois, 2013) muestran que es un **problema de regulación emocional**.

> Procrastinás no porque no te importe la tarea, sino porque la tarea te genera una emoción incómoda (ansiedad, aburrimiento, miedo a fallar) y tu cerebro busca alivio inmediato (Instagram, YouTube, limpiar el escritorio).

## El círculo vicioso

1. Pienso en estudiar para el final.
2. Aparece ansiedad / aburrimiento / miedo.
3. Hago algo que me alivia (scrollear).
4. Alivio inmediato.
5. Culpa ➝ más ansiedad ➝ más procrastinación.

## Estrategias que funcionan según evidencia

### 1. Auto-compasión, no auto-castigo
Sirois (2014) mostró que perdonarse por procrastinaciones pasadas reduce procrastinación futura. El auto-castigo la aumenta.

### 2. Bajar el umbral de inicio
"Voy a estudiar 2 horas" es paralizante. "Voy a abrir el PDF y leer 1 página" no. Una vez empezada, la tarea se vuelve más fácil de continuar.

### 3. Implementation intentions
"Cuando termine de almorzar (X), voy a sentarme en el escritorio y abrir Histología (Y)". Concreto, condicional, específico. Reduce procrastinación significativamente (Gollwitzer).

### 4. Cambiar el ambiente
Estudiar siempre en el mismo lugar; no estudiar nunca en la cama. Tu cerebro asocia contextos con conductas.

### 5. Trabajar con el tiempo disponible, no contra él
Si tenés 25 minutos hasta clase, no digas "no me da el tiempo". Hacé un pomodoro completo.

### 6. Visualizar al "yo futuro"
La procrastinación funciona porque sentís al "yo de mañana" como otra persona. Visualizar concretamente cómo te vas a sentir mañana si NO estudiás hoy reduce la postergación.

## Errores comunes al intentar dejar de procrastinar

- Comprar 5 apps de productividad y no usar ninguna.
- Hacer planes perfectos para "el lunes empiezo".
- Esperar a tener motivación. La motivación viene **después** de empezar, no antes.

## Conclusión

Procrastinar no es defecto de carácter. Es un comportamiento aprendido que se desaprende. La fórmula: **autocompasión + tareas chiquitas + arrancar antes de tener ganas**.
`,
  },
  {
    slug: "gestion-tiempo-estudiantes-guia",
    title: "Gestión del tiempo para estudiantes universitarios: guía completa 2026",
    description:
      "Cómo planificar un cuatrimestre, organizar materias paralelas, calcular cuánto tiempo lleva cada parcial y construir un sistema sostenible.",
    category: "productividad",
    cover: coverProductividad,
    date: "2026-04-17",
    readMinutes: 10,
    keywords: ["gestión del tiempo", "estudiantes universidad", "planificar cuatrimestre", "agenda estudiante"],
    faq: [],
    content: md`
## Por qué la mayoría de estudiantes mal-administra su tiempo

No es porque no tengan agenda. Es porque **subestiman cuánto tiempo lleva estudiar** y **sobreestiman cuánto rinden por hora**.

Un parcial de Anatomía no se "estudia en una semana". Lleva 4–6 semanas de trabajo distribuido. Si arrancás la semana antes, ya perdiste.

## Marco general: 3 horizontes

### Horizonte largo (cuatrimestre)
- Cuántas materias cursás.
- Fechas estimadas de parciales y finales.
- Carga de cada materia (créditos / horas).

### Horizonte medio (semana)
- Bloques de deep work fijos.
- Distribución por materia según urgencia y dificultad.
- Espacio para ocio y descanso real.

### Horizonte corto (día)
- 3 tareas concretas máximo.
- Pomodoros, no horas vagas.

## La regla 1:2 o 1:3

Por cada hora de clase, calculá entre 2 y 3 horas de estudio fuera. Una materia de 8 horas semanales de cursada = 16–24 horas de estudio. Si estás en una carrera de 4 materias, eso son **fácil 60–80 horas semanales totales** (cursada + estudio). Por eso dos jobs + facultad full no funciona sin sacrificio.

## Cómo calcular cuánto te lleva un parcial

Heurística simple:

\`\`\`
páginas teóricas × 10 min de lectura activa
+ páginas teóricas × 5 min de armado de cards
+ horas de práctica estimada × 1.5
+ 2 sesiones de repaso final
\`\`\`

Para un parcial de 200 páginas + 30 hs de práctica:

- 200 × 10 = 33 hs de lectura
- 200 × 5 = 17 hs de cards
- 30 × 1.5 = 45 hs de práctica
- 2 sesiones × 4 hs = 8 hs de repaso

**Total: ~103 horas**. Si las distribuís en 6 semanas, son 17 hs por semana. Si las querés meter en 1, no se puede.

## Herramientas

- **Calendario digital** con bloques fijos (Google Calendar, Notion Calendar).
- **Lista de tareas** simple (Todoist, Apple Recordatorios).
- **Sistema de notas + flashcards** (Notion + Anki, Obsidian + Anki).
- **Pomodoro app** o reloj físico.

No hace falta un sistema complejo. La gente que más estudia usa herramientas simples y tiene **rituales fijos**.

## Errores fatales

- No bloquear tiempo para ocio: te quemás en 4 semanas.
- Confundir "tiempo en el escritorio" con "tiempo de estudio efectivo".
- No tener una hora fija de "fin del día académico".
- Llevar mal el cuaderno de fechas y enterarte que el parcial es en 3 días.

## Plantilla semanal sugerida

\`\`\`
Lun-Vie:
07:30–11:00 — Deep work materia A o B
11:30–13:00 — Cursada / clases
14:00–17:00 — Cursada / clases
18:00–19:30 — Repaso liviano + flashcards
19:30+      — Vida personal

Sábado:
09:00–13:00 — Estudio fuerte (materia menos avanzada)
Tarde libre

Domingo:
Total descanso o repaso liviano (90 min)
\`\`\`
`,
  },
  {
    slug: "como-armar-rutina-de-estudio",
    title: "Cómo armar una rutina de estudio que sí podás sostener (4 semanas a hábito)",
    description:
      "El error de armar rutinas perfectas que duran 3 días. Cómo diseñar una rutina mínima viable y escalarla en 4 semanas usando ciencia del hábito.",
    category: "productividad",
    cover: coverProductividad,
    date: "2026-04-19",
    readMinutes: 7,
    keywords: ["rutina de estudio", "hábitos", "atomic habits", "estudiantes"],
    faq: [],
    content: md`
## Por qué tus rutinas se caen el día 4

Casi todas las rutinas que intentamos armar fallan por la misma razón: **son demasiado ambiciosas para el primer día**.

Decís "voy a estudiar 4 horas todos los días desde mañana, gimnasio, dieta y meditación". Tres días después no podés con todo y abandonás todo.

## La idea de "rutina mínima viable"

Tomado del concepto MVP en startups: la versión más pequeña posible de la rutina que igual produce resultados.

Para estudio, una MVP razonable:

- **30 minutos de estudio** cada día laborable.
- A la **misma hora**.
- En el **mismo lugar**.

Eso es todo. No 4 hs. No 3 sesiones. Empezás con 30 minutos a la misma hora y no fallás un día.

## Por qué funciona

Tu cerebro aprende por **consistencia, no por intensidad**. Estudiar 30 min todos los días durante un mes construye un hábito. Estudiar 4 hs un día y nada el resto, no.

## La curva de 4 semanas

| Semana | Carga |
|---|---|
| 1 | 30 min/día (build the habit) |
| 2 | 45 min/día |
| 3 | 60 min/día + 1 sesión larga sábado |
| 4 | 90 min/día + 1 sesión larga sábado |

Para semana 5, ya tenés un hábito sólido y podés escalar.

## Anclajes (habit stacking)

James Clear (Atomic Habits) propone "habit stacking": atar el nuevo hábito a uno existente.

> "Después de tomar el primer café del día, abro el cuaderno de Anatomía durante 30 minutos."

El café ya está. El nuevo hábito se cuelga.

## Tracker visible

Un calendario en la pared con una cruz por día estudiado. Suena infantil, funciona absurdamente bien (Seinfeld lo usaba para escribir chistes diarios). La idea: **no romper la cadena**.

## Qué hacer cuando fallás un día

Regla de oro: **nunca dos días seguidos**. Un día perdido es un imprevisto. Dos días seguidos es el inicio del abandono.
`,
  },
  {
    slug: "multitasking-mito-productividad",
    title: "El mito del multitasking: por qué hacer dos cosas a la vez te hace peor en ambas",
    description:
      "Estudios neurocientíficos muestran que el cerebro no hace multitasking real, sino task-switching costoso. Implicancias para estudiar, trabajar y vivir.",
    category: "productividad",
    cover: coverProductividad,
    date: "2026-04-21",
    readMinutes: 6,
    keywords: ["multitasking", "task switching", "concentración", "productividad"],
    faq: [],
    content: md`
## Lo que tu cerebro hace cuando "multitaskeás"

Spoiler: no hace dos cosas a la vez. Hace **task switching** — alterna rápidamente entre tareas. Y cada switch tiene un **costo cognitivo** medible.

## El costo del switch

Investigaciones de Rubinstein, Meyer y Evans (2001) muestran que cambiar de tarea puede agregar entre **20 % y 40 %** de tiempo total. Y el error aumenta proporcionalmente.

Estudiar con WhatsApp abierto no es estudiar + chatear. Es estudiar al **60 %** y chatear al **60 %**, con más errores en ambas.

## El "residuo de atención"

Sophie Leroy (2009) demostró que cuando cambiás de tarea, una parte de tu atención queda "pegada" en la anterior por varios minutos. Por eso, después de revisar mails 30 segundos, tardás 5–10 minutos en volver a estar al 100 %.

## Implicancias para estudiar

- Estudiar con celular al lado, aunque no lo toques, ya degrada tu rendimiento (la mera presencia distrae — Ward et al., 2017).
- Tener 12 pestañas abiertas mientras leés un PDF: misma historia.
- Música con letra en idioma que entendés: degrada lectura. Música instrumental: neutro o levemente positivo.

## Qué sí podés combinar

- Tareas mecánicas + audio (lavar platos + podcast).
- Caminar + escuchar.
- Cocinar + audio.

Pero **no podés** combinar dos tareas que requieren atención central simultáneamente. No existe.

## Soluciones prácticas

1. **Modo no molestar siempre** durante deep work.
2. **Una sola pestaña** abierta.
3. **Notificaciones agrupadas** 2–3 veces al día.
4. **Celular en otra habitación**, no boca abajo.

La diferencia entre "atención al 60 %" y "atención al 100 %" no es 40 % más. Es la diferencia entre aprender y no aprender.
`,
  },

  // ============ IQ (5) ============
  {
    slug: "que-mide-realmente-test-iq",
    title: "¿Qué mide realmente un test de IQ? Guía honesta sin marketing",
    description:
      "Qué evalúa un test de IQ moderno, cómo se construye, qué subtests tiene un WAIS-IV, y por qué un solo número no resume tu inteligencia.",
    category: "iq",
    cover: coverIq,
    date: "2026-04-14",
    readMinutes: 9,
    keywords: ["test de iq", "que mide el iq", "wais", "inteligencia"],
    faq: [
      { q: "¿Sirve un test de IQ online?", a: "Para diversión y estimación gruesa, sí. Para diagnóstico clínico, no: solo el WAIS administrado por psicólogo es válido." },
    ],
    content: md`
## Qué es la inteligencia (según los psicómetras)

No hay una definición universal, pero la mayoría de tests modernos asumen el modelo **CHC (Cattell-Horn-Carroll)**, que distingue entre:

- **Inteligencia fluida (Gf)**: razonamiento abstracto, resolver problemas nuevos.
- **Inteligencia cristalizada (Gc)**: conocimiento acumulado, vocabulario.
- **Memoria de trabajo (Gwm)**: sostener información mentalmente.
- **Velocidad de procesamiento (Gs)**: rapidez para tareas cognitivas simples.
- **Razonamiento visoespacial (Gv)**.
- **Procesamiento auditivo (Ga)**.

Un IQ general resume todo eso en un número alrededor de 100 (con desvío estándar 15).

## Qué mide el WAIS-IV (el test más usado en adultos)

10 subtests centrales más 5 suplementarios, agrupados en 4 índices:

1. **Comprensión verbal** (vocabulario, semejanzas, información).
2. **Razonamiento perceptivo** (cubos, matrices, rompecabezas visual).
3. **Memoria de trabajo** (dígitos, aritmética).
4. **Velocidad de procesamiento** (claves, búsqueda de símbolos).

El IQ total es la suma ponderada.

## Qué NO mide

- Creatividad
- Inteligencia emocional / social
- Sabiduría práctica
- Ética
- Persistencia / grit
- Curiosidad

Por eso una persona con IQ promedio + alta persistencia logra muchísimo más que un IQ alto sin disciplina.

## La distribución

\`\`\`
IQ      Percentil    % población
< 70    < 2          ~2%
70–85   2–16         ~14%
85–115  16–84        ~68%   ← rango "normal"
115–130 84–98        ~14%
> 130   > 98         ~2%
> 145   > 99.9       ~0.1%
\`\`\`

## Tests online: cuáles sirven

- **Buenos para estimación**: tests basados en matrices de Raven, tests gratuitos que duran 30+ minutos y cubren varios subtests.
- **No sirven**: tests de Facebook de 10 preguntas que te dicen "tu IQ es 145".

## Para qué sirve saber tu IQ

- Identificación de altas capacidades en chicos.
- Diagnóstico de discapacidades intelectuales.
- Investigación.
- Curiosidad personal.

**No sirve** para definir cuánto vas a "lograr" en la vida. La correlación entre IQ y éxito profesional es positiva pero modesta. Esfuerzo y oportunidad pesan mucho más.

## Si querés probar tu IQ con un test bien armado

Autodidactas tiene un test de IQ de 60 preguntas con 5 áreas (verbal, numérica, lógica, espacial, memoria), que devuelve un puntaje, percentil estimado y desempeño por área. No es un diagnóstico clínico, pero está mejor calibrado que la mayoría de tests gratuitos online.
`,
  },
  {
    slug: "como-mejorar-iq-evidencia",
    title: "¿Se puede aumentar el IQ? Lo que dice la evidencia (no lo que dice TikTok)",
    description:
      "Repasamos meta-análisis sobre entrenamiento de inteligencia fluida, dual N-back, ajedrez, lectura y estimulación temprana. Spoiler: hay matices.",
    category: "iq",
    cover: coverIq,
    date: "2026-04-16",
    readMinutes: 8,
    keywords: ["mejorar iq", "entrenamiento cognitivo", "dual n-back", "inteligencia fluida"],
    faq: [],
    content: md`
## La pregunta polémica

¿El IQ es fijo o se puede entrenar? La respuesta corta: **un poco se puede, mucho menos de lo que prometen las apps**.

## Lo que sí mueve el IQ

### Educación
Cada año adicional de educación formal está asociado con un aumento de **1–5 puntos** de IQ (Ritchie & Tucker-Drob, 2018, meta-análisis).

### Estimulación temprana
Programas de calidad en infancia temprana producen aumentos sostenibles de varios puntos.

### Salud y nutrición
Deficiencias de yodo, hierro o desnutrición severa bajan el IQ. Corregirlas lo recupera.

## Lo que muestra efectos modestos o nulos

### Dual N-back (juegos de memoria de trabajo)
Las primeras investigaciones (Jaeggi et al., 2008) mostraron mejoras en inteligencia fluida. Replicaciones posteriores y meta-análisis grandes (Melby-Lervåg et al., 2016) encontraron que los efectos son **mucho menores y limitados a la tarea entrenada**, sin transferencia general.

### Apps de "entrenamiento cerebral"
Lumosity, Elevate, etc.: te hacen mejor en los juegos de la app. La transferencia a IQ general es muy limitada.

### Ajedrez
Mejora pensamiento estratégico, planificación, memoria de trabajo en ese dominio. Transferencia a IQ general: pequeña.

## Lo que sí ayuda al rendimiento cognitivo (sin "subir el IQ")

- **Sueño**: la diferencia entre dormir 5 hs y 8 hs equivale a varios puntos de IQ funcional.
- **Ejercicio aeróbico**: mejora velocidad de procesamiento y memoria.
- **Lectura constante**: aumenta vocabulario, comprensión, conocimiento general (Gc).
- **Aprender un instrumento o un idioma**: efectos pequeños pero consistentes en función ejecutiva.

## Conclusión honesta

No vas a pasar de IQ 100 a 130 con una app. Pero con educación, sueño, ejercicio y curiosidad sostenida durante años, podés ganar varios puntos y, más importante, **usar mucho mejor el IQ que ya tenés**. Disciplina, foco y conocimiento pesan más que un puntaje crudo.
`,
  },
  {
    slug: "altas-capacidades-superdotacion",
    title: "Altas capacidades y superdotación: mitos, realidades y cómo se diagnostica",
    description:
      "Qué es la superdotación, criterios diagnósticos, mitos comunes (no, no todos los superdotados son felices ni exitosos) y qué hacer si sospechás que tenés altas capacidades.",
    category: "iq",
    cover: coverIq,
    date: "2026-04-18",
    readMinutes: 7,
    keywords: ["altas capacidades", "superdotación", "iq alto", "niños superdotados"],
    faq: [],
    content: md`
## Qué se considera "altas capacidades"

Criterios típicos: IQ ≥ 130 (percentil 98+) sostenido en evaluación clínica, junto con creatividad y compromiso con la tarea (modelo de los tres anillos de Renzulli).

## Mitos comunes

### "Los superdotados son felices y exitosos"
No necesariamente. Hay correlación pequeña con éxito profesional, pero también mayor riesgo de **disincronía** (intelectual, emocional, social) y de **subrendimiento crónico** si el ambiente educativo no acompaña.

### "Si fuera superdotado lo sabría"
Mucha gente con IQ alto vive sin diagnóstico, especialmente mujeres y adultos. Los signos pueden incluir aburrimiento crónico en la escuela, intereses muy diversos y profundos, hipersensibilidad emocional o sensorial.

### "Es lo mismo que ser inteligente"
La inteligencia es un continuo. La superdotación implica un perfil específico, generalmente con asincronías entre desarrollo cognitivo y emocional.

## Cómo se diagnostica

- Evaluación con WAIS-IV o WISC-V administrada por psicólogo formado.
- Evaluación de creatividad y motivación.
- Historia clínica y educativa.

Tests online de IQ no diagnostican superdotación.

## Desafíos comunes en altas capacidades

- **Aburrimiento escolar** ➝ desinterés, desconexión, mal rendimiento paradójico.
- **Perfeccionismo** ➝ ansiedad, parálisis ante el error.
- **Sensación de no encajar** ➝ aislamiento social.
- **Asincronía** ➝ pensamiento adulto en niño, dificultad emocional.

## Qué hacer si sospechás que tenés altas capacidades

1. Hacer una evaluación clínica si te interesa diagnóstico formal.
2. Buscar comunidades (Mensa, asociaciones nacionales).
3. Ambientes intelectualmente desafiantes (carreras, hobbies profundos).
4. Trabajar perfeccionismo y ansiedad si están presentes.

## Para padres

- No saturar de actividades. Profundidad > cantidad.
- Permitir asincronías sin patologizar.
- Buscar pares cognitivos, no solo de la misma edad.
- Aceleración escolar puede ser muy beneficiosa cuando está bien indicada.
`,
  },
  {
    slug: "razonamiento-logico-mejorar",
    title: "Cómo mejorar tu razonamiento lógico: 7 hábitos respaldados por evidencia",
    description:
      "El razonamiento lógico se entrena. Estas son las prácticas que más impacto tienen, según investigación en psicología cognitiva y filosofía analítica.",
    category: "iq",
    cover: coverIq,
    date: "2026-04-20",
    readMinutes: 7,
    keywords: ["razonamiento lógico", "pensamiento crítico", "mejorar lógica", "falacias"],
    faq: [],
    content: md`
## Qué es razonamiento lógico

Capacidad de inferir conclusiones válidas a partir de premisas, identificar argumentos sólidos y detectar falacias. Es central para matemática, derecho, programación, ciencia y vida cotidiana.

## 7 prácticas que lo entrenan

### 1. Aprender lógica formal básica
Modus ponens, modus tollens, falacia del consecuente afirmado. Cualquier intro a lógica proposicional (Copi, Suppes) en 20 horas te cambia la forma de pensar.

### 2. Estudiar falacias comunes
- Falacia ad hominem
- Hombre de paja
- Falsa dicotomía
- Apelación a autoridad
- Pendiente resbaladiza
- Generalización apresurada

Una vez que las identificás, las ves en todas partes.

### 3. Resolver problemas de matemática discreta
Combinatoria, teoría de grafos, lógica de predicados. Entrena rigor argumentativo como pocas cosas.

### 4. Programar
Especialmente lenguajes funcionales (Haskell, OCaml) o cualquier código que te obligue a manejar precondiciones, postcondiciones e invariantes.

### 5. Escribir argumentos por escrito
Ensayos donde tengas que defender una tesis con premisas explícitas. Forzar la estructura argumental escrita expone agujeros.

### 6. Debatir con honestidad
Buscar el mejor argumento del lado contrario (steelmanning). Esto entrena el "pensamiento de Sistema 2" (Kahneman) que naturalmente evitamos.

### 7. Probabilidad bayesiana
Aprender a actualizar creencias en función de evidencia es una de las herramientas mentales más infravaloradas. Recursos: *Thinking, Fast and Slow* (Kahneman), *Rationality* (Pinker).

## Lo que NO entrena razonamiento lógico

- Trivias.
- Memorizar datos sueltos.
- Tests rápidos de IQ.
- Sudoku (entrena pattern matching, no inferencia formal).

## Implicancia práctica

El razonamiento lógico es probablemente la habilidad cognitiva con **mejor relación esfuerzo / impacto** que existe. Seis meses de práctica seria te dan una ventaja enorme en cualquier carrera.
`,
  },
  {
    slug: "interpretar-resultado-test-iq",
    title: "Cómo interpretar el resultado de un test de IQ (sin asustarte ni subestimarte)",
    description:
      "Qué significa cada rango de IQ, qué tan confiable es el resultado, intervalos de confianza, y por qué un test online te puede dar 10 puntos por encima o por debajo del real.",
    category: "iq",
    cover: coverIq,
    date: "2026-04-22",
    readMinutes: 7,
    keywords: ["interpretar test iq", "resultados iq", "percentil iq", "intervalo confianza"],
    faq: [],
    content: md`
## Lo primero: el IQ es una **estimación**, no una medida exacta

Cualquier test de IQ tiene un error de medición. Los tests clínicos buenos tienen un intervalo de confianza típico de **±5 puntos**. Tests online sin estandarización pueden tener intervalos de **±15 puntos**.

Si te dio 122 en un test online, lo realista es interpretarlo como "probablemente entre 110 y 130, más cerca de 120". No es 122 exacto.

## Tabla de interpretación

| IQ | Rango | Percentil | Descripción |
|---|---|---|---|
| < 70 | Muy bajo | < 2 | Discapacidad intelectual leve a profunda |
| 70–85 | Bajo | 2–16 | Por debajo del promedio |
| 85–115 | Promedio | 16–84 | Rango "normal" (68% de la población) |
| 115–130 | Alto | 84–98 | Por encima del promedio |
| 130–145 | Muy alto | 98–99.9 | Altas capacidades |
| > 145 | Excepcional | > 99.9 | 1 en 1000 o menos |

## Cómo se calcula el percentil

El percentil te dice qué porcentaje de la población quedó por debajo de tu puntaje. IQ 115 = percentil 84 = sacaste mejor que el 84 % de la población general.

## Qué significa tener un IQ "alto"

Estadísticamente, un IQ alto correlaciona con:
- Mayor probabilidad de éxito académico (especialmente en carreras simbólicas).
- Mayor velocidad de aprendizaje en general.
- Mayor ingreso promedio (correlación positiva pero modesta).

NO correlaciona fuertemente con:
- Felicidad
- Creatividad
- Éxito en relaciones
- Sabiduría práctica

## Qué significa tener un IQ "bajo"

Si un test online te dio bajo, antes de preocuparte considerá:
- ¿Estabas cansado?
- ¿El test tenía sesgos culturales o lingüísticos?
- ¿Era un test serio o uno de Facebook?

Para diagnóstico real, solo sirve un WAIS administrado por un psicólogo.

## Errores frecuentes al interpretar

1. **Tomarse el número como destino**. No lo es.
2. **Comparar puntajes de distintos tests**. Cada test tiene su escala y su normalización.
3. **Asumir que IQ alto = inteligente en todo**. Hay perfiles muy desparejos.
4. **Asumir que IQ bajo = no podés**. Trabajo, motivación y aprendizaje superan IQ con frecuencia.

## Cómo usar el resultado de manera saludable

- Como información sobre tus fortalezas y debilidades cognitivas relativas.
- Para identificar áreas a entrenar.
- Para ajustar expectativas sobre carga de estudio realista.

No como etiqueta ni como excusa.
`,
  },

  // ============ IA (5) ============
  {
    slug: "como-usar-chatgpt-para-estudiar",
    title: "Cómo usar ChatGPT para estudiar (sin que te haga más vago)",
    description:
      "10 prompts probados para usar IA como tutor en lugar de como tramposo. Cómo no caer en la ilusión de aprendizaje al copiar respuestas.",
    category: "ia",
    cover: coverIa,
    date: "2026-04-23",
    readMinutes: 9,
    keywords: ["chatgpt para estudiar", "ia y aprendizaje", "ia para estudiantes", "prompts estudio"],
    faq: [],
    content: md`
## El problema con la IA y el estudio

ChatGPT puede destruir tu aprendizaje o multiplicarlo, dependiendo de cómo lo uses. Si le pedís resúmenes y los leés pasivamente, es peor que no usarlo. Si lo usás como tutor socrático que te hace preguntas, puede ser la mejor herramienta de estudio que existe.

## La regla de oro

**Usá la IA para hacer preguntas, no para que las responda por vos**. Hacela trabajar como tutor, no como buscador.

## 10 prompts probados

### 1. Tutor socrático
> "Hacete pasar por un tutor socrático. Quiero entender [tema]. No me expliques nada de entrada. Hacé preguntas que me lleven a deducirlo. Si me trabo, dame una pista chiquita, no la respuesta."

### 2. Detector de huecos
> "Te voy a explicar [tema] con mis palabras. Quiero que me hagas 5 preguntas que ataquen los puntos donde mi explicación es vaga o incorrecta. No me corrijas todavía."

### 3. Generar quiz
> "Generame 10 preguntas de opción múltiple sobre [tema], con 4 opciones cada una, sin decirme la respuesta correcta hasta el final."

### 4. Versión Feynman
> "Explicale [tema] a un chico de 12 años que no sabe nada del tema. Después decime qué partes técnicas tuviste que saltarte y por qué."

### 5. Caso aplicado
> "Inventá un caso clínico / problema / escenario realista donde tendría que aplicar [concepto]. No lo resuelvas, solo planteámelo."

### 6. Comparación
> "Compará [concepto A] y [concepto B] en una tabla con 6 dimensiones relevantes. Después decime cuál es la diferencia más importante y por qué."

### 7. Mapa conceptual
> "Generame un mapa conceptual textual de [tema] con conceptos centrales, conceptos secundarios y relaciones entre ellos. Formato: lista anidada."

### 8. Errores comunes
> "¿Cuáles son los 5 errores conceptuales más comunes que cometen los estudiantes con [tema]? Para cada uno: cuál es el error, por qué se comete, y cómo se corrige."

### 9. Conexiones interdisciplinarias
> "¿Cómo se relaciona [tema] con [otra materia que estudio]? Dame 3 conexiones no obvias."

### 10. Revisión de mi resumen
> "Te paso este resumen mío. Marcame: 1) errores conceptuales, 2) cosas importantes que faltan, 3) imprecisiones. No me reescribas el resumen."

## Lo que NO hay que hacer

- Pedirle que escriba tu monografía y entregarla.
- Pedirle resúmenes y leerlos sin trabajarlos.
- Confiar en datos específicos sin verificar (las IA alucinan).
- Usarla como única fuente.

## Verificar siempre

Las IA actuales todavía generan errores fácticos plausibles ("alucinaciones"). Para datos clínicos, nombres propios, fechas, fórmulas, **siempre cruzar con fuente confiable**.

## El futuro: IA + tu material

Las herramientas de estudio modernas (como Autodidactas) permiten subir tus PDFs, audios y videos, y conversar con ese material específico. Eso reduce alucinaciones y mantiene la IA pegada a lo que tenés que estudiar, no a internet.
`,
  },
  {
    slug: "ia-vs-tutor-humano",
    title: "IA vs. tutor humano: ¿cuándo conviene cada uno para estudiar?",
    description:
      "Las fortalezas y debilidades de tutores con IA y tutores humanos. Cuándo gastar plata en clases particulares, cuándo alcanza con IA, y cómo combinarlos.",
    category: "ia",
    cover: coverIa,
    date: "2026-04-25",
    readMinutes: 7,
    keywords: ["tutor ia", "clases particulares", "ia vs humano", "estudio personalizado"],
    faq: [],
    content: md`
## Qué hace mejor un tutor con IA

- **Disponibilidad 24/7**. A las 3 AM antes del parcial, ahí está.
- **Costo bajísimo o gratis**. Vs $20–80 por hora de tutor humano.
- **Paciencia infinita**. Podés preguntar la misma cosa 10 veces.
- **Velocidad**. Resúmenes, ejemplos, ejercicios al toque.
- **Adaptación al ritmo**. Vos marcás el paso.

## Qué hace mejor un tutor humano

- **Detecta huecos que vos no sabés que tenés**. Una IA responde lo que le preguntás. Un buen tutor te hace preguntas que vos no se te habrían ocurrido.
- **Calibra expectativas reales**. Sabe qué nivel pide tal cátedra, qué pregunta cae siempre, qué libro usa este profe.
- **Sostiene la motivación**. La presión social de tener una clase agendada te obliga.
- **Lee tu lenguaje no verbal**. Una IA no nota que estás perdido si no se lo decís.
- **Cero alucinaciones** (en lo bueno).

## Cuándo conviene IA sola

- Materias introductorias.
- Repaso y aclaración de conceptos.
- Generación de ejercicios y simulacros.
- Resolver dudas puntuales rápidas.
- Cuando el presupuesto es nulo.

## Cuándo conviene tutor humano

- Materias muy difíciles donde estás trabado conceptualmente.
- Preparación de finales decisivos.
- Cuando necesitás disciplina externa.
- Materias con cátedras muy específicas (donde el tutor conoce al profe).
- Cuando tu autoconfianza está muy baja y necesitás validación humana.

## La combinación que funciona

Para un cuatrimestre típico:

- **IA para el día a día**: dudas, ejercicios, resúmenes, tutoría socrática.
- **Tutor humano puntual**: 1–2 clases antes de cada parcial decisivo, especialmente en materias problemáticas.

Esto baja el costo total (en vez de 20 clases con tutor, 4 estratégicas) y mantiene los beneficios de ambos.

## El futuro inmediato

Las plataformas que combinan IA con tu material específico (conversar con tus PDFs, audios y notas) están borrando parte de la diferencia. La IA cada vez es mejor "tutor", pero el tutor humano sigue ganando en calibración cultural y disciplina.
`,
  },
  {
    slug: "alucinaciones-ia-como-detectar",
    title: "Alucinaciones de la IA: cómo detectarlas y por qué pasan (con ejemplos reales)",
    description:
      "Las IA actuales generan información plausible pero falsa. Cómo identificar alucinaciones, por qué pasan a nivel técnico y qué hacer para no caer en ellas.",
    category: "ia",
    cover: coverIa,
    date: "2026-04-27",
    readMinutes: 8,
    keywords: ["alucinaciones ia", "errores chatgpt", "verificar ia", "ia confiable"],
    faq: [],
    content: md`
## Qué es una "alucinación"

Cuando un modelo de lenguaje genera información que **suena correcta pero es falsa**: una cita inexistente, una fecha incorrecta, una fórmula inventada, un fallo judicial que nunca existió.

## Por qué pasa

Los LLMs (Large Language Models) son fundamentalmente predictores de la siguiente palabra. No tienen una "base de datos de hechos verdaderos" — generan texto que estadísticamente continúa bien lo anterior. Cuando no saben algo, **no saben que no saben**, y completan con lo más plausible.

## Tipos comunes de alucinaciones

### 1. Citas y referencias inventadas
> "Según Smith (2019), el efecto Dunning-Kruger…"
> Resultado: Smith no escribió eso, o no existe.

### 2. Fechas y cifras falsas
> "El paper original de Karpicke se publicó en 2011" (es 2008).

### 3. Fallos judiciales falsos
Famoso caso 2023 en EE.UU.: un abogado citó casos inexistentes generados por ChatGPT en un escrito real. Sancionado.

### 4. Fórmulas mal puestas
Especialmente en química, física, matemática avanzada.

### 5. Personas mezcladas
Atribuir obras de un autor a otro de nombre similar.

## Cómo detectar alucinaciones

### Señales de alerta
- Citas con números de página exactos.
- Datos numéricos muy específicos.
- Nombres de papers que no podés googlear.
- Respuestas demasiado seguras sobre temas oscuros.

### Estrategias prácticas
1. **Cruzar con fuente primaria**. Si te da una cita, buscala.
2. **Pedirle el link**. Si no puede o inventa uno, sospechá.
3. **Re-preguntar de otra forma**. Si la respuesta cambia mucho, no estaba segura.
4. **Pedirle que indique nivel de confianza**. Modelos modernos lo hacen razonablemente.

## Cómo reducir alucinaciones al usar IA

- **Subir tu propio material** (PDFs, apuntes) y trabajar sobre eso (RAG: retrieval-augmented generation).
- **Pedir respuestas con cita inline** del material subido.
- **Modelos más nuevos y grandes alucinan menos**, pero ninguno cero.
- **Cross-check con búsqueda web** integrada.

## Implicancia para estudiar

La IA es una herramienta espectacular para **trabajar conceptos**, **generar ejercicios** y **discutir ideas**. Para **datos específicos** (fechas, autores, fórmulas, fallos, valores normales en medicina) **siempre verificá**.

Regla simple: **si vas a citarlo en un examen, verificalo**. Si es para entender un concepto, podés ser más laxo.
`,
  },
  {
    slug: "ia-trampa-ensenanza-universidad",
    title: "IA en la universidad: ¿es trampa? Una mirada honesta para estudiantes y docentes",
    description:
      "Dónde termina la ayuda legítima y empieza la trampa académica. Cómo las universidades están adaptando reglas y cómo posicionarte de manera ética y efectiva.",
    category: "ia",
    cover: coverIa,
    date: "2026-04-29",
    readMinutes: 8,
    keywords: ["ia trampa universidad", "chatgpt deshonestidad académica", "uso ético ia", "ia educación"],
    faq: [],
    content: md`
## El estado actual

En 2026, casi ninguna universidad prohíbe completamente la IA. La mayoría tiene políticas de "uso responsable" que varían por cátedra. Algunas la prohíben en exámenes presenciales pero la permiten en trabajos.

## Espectro: de uso legítimo a trampa

### Claramente legítimo
- Pedir explicaciones de conceptos.
- Generar ejercicios para practicar.
- Pedir feedback sobre tus borradores.
- Usarla como tutor socrático.
- Resumir textos para tu uso personal.

### Zona gris
- Pedirle estructura de un ensayo y completarlo vos.
- Que reescriba secciones tuyas para mejorar redacción.
- Generar ideas que después desarrollás.

### Claramente trampa
- Hacer que escriba el ensayo entero y entregarlo como tuyo.
- Resolver un parcial domiciliario sin marcarlo.
- Inventar bibliografía con la IA y citarla.
- Falsear código, datos, conclusiones de investigación.

## La regla práctica

Si el profe leyera tu proceso completo y se enterara de cómo usaste IA, **¿lo aceptaría sin problema?** Si la respuesta es "depende", andá con cuidado y declaralo.

## Por qué hacer trampa con IA es mala idea (más allá de lo ético)

- **Detectores cada vez mejores**. Las herramientas de detección no son perfectas pero mejoran rápido.
- **Estilo inconsistente**. Profes que conocen tu escritura notan el cambio.
- **No aprendés**. Llegás al final / oral sin la base.
- **Riesgo institucional**. Las sanciones por deshonestidad académica son cada vez más serias.

## Cómo posicionarte

1. Aprendé a usar IA como **multiplicador de aprendizaje**, no como reemplazo.
2. Declaralo cuando corresponda ("usé IA para revisar gramática").
3. En exámenes presenciales, sin IA. Punto.
4. En trabajos largos, usala como tutor y editor, no como autor.

## Para docentes (si llegaste hasta acá)

- Asumí que los alumnos tienen acceso a IA. Diseñá evaluaciones que la asuman.
- Más exámenes orales y presenciales.
- Trabajos donde el proceso pesa más que el producto.
- Enseñá explícitamente cómo usar IA bien.

Prohibirla es una batalla perdida. Enseñar a usarla bien es la única jugada con futuro.
`,
  },
  {
    slug: "rag-chat-con-tus-pdfs",
    title: "Chatear con tus PDFs: cómo funciona RAG y por qué es la mejor forma de usar IA para estudiar",
    description:
      "RAG (retrieval-augmented generation) explicado simple: por qué subir tus PDFs y preguntarles directamente es muchísimo mejor que usar IA genérica.",
    category: "ia",
    cover: coverIa,
    date: "2026-05-01",
    readMinutes: 6,
    keywords: ["rag", "chatear con pdf", "ia con tus documentos", "notebooklm", "autodidactas"],
    faq: [],
    content: md`
## El problema con la IA "pelada"

Si le preguntás a un ChatGPT genérico sobre tu apunte de Histología de la cátedra X, no tiene idea: solo conoce información pública general. Y como vimos en el artículo sobre alucinaciones, cuando no sabe, inventa.

## Qué es RAG

**Retrieval-Augmented Generation**. La idea es:

1. **Subís tus documentos** (PDF, audio, video transcripto, notas).
2. El sistema los **divide en chunks** y los indexa en una base vectorial.
3. Cuando hacés una pregunta, busca **los chunks relevantes** en tus documentos.
4. Le pasa esos chunks al LLM junto con tu pregunta.
5. La respuesta se basa en **tu material**, no en internet.

## Por qué es muchísimo mejor para estudiar

- **Cero alucinaciones sobre tu contenido**. Si la respuesta no está en tu material, te dice que no sabe.
- **Citas concretas**. Buenas implementaciones te muestran exactamente la página de dónde sacó cada cosa.
- **Privacidad**. Tu material no se filtra al modelo.
- **Adaptado a tu cátedra**. Si tu profe usa una nomenclatura específica, la IA la respeta.

## Casos de uso típicos

- Subir las 200 páginas del bibliografía obligatoria de un parcial y preguntarle dudas puntuales.
- Subir grabaciones de clase, transcribirlas y poder hacer búsquedas semánticas ("¿qué dijo el profe sobre la regla de los gases ideales?").
- Combinar varios apuntes y pedir comparaciones.
- Generar flashcards y quizzes a partir de tu material específico.

## Limitaciones

- Si el PDF es escaneado sin OCR, la calidad baja.
- Documentos con muchas tablas o fórmulas pueden perder estructura.
- Materiales muy largos (>1000 páginas) requieren buena indexación o se vuelven lentos.

## Conclusión

Si vas a usar IA en serio para estudiar, hacerlo sobre **tu propio material** (RAG) es mucho mejor que usar IA genérica. Es la diferencia entre un tutor que estudió tus apuntes vs. uno que solo sabe del tema en general.

Plataformas como Autodidactas, NotebookLM y similares están construidas sobre esta arquitectura.
`,
  },

  // ============ EXAMENES (4) ============
  {
    slug: "como-preparar-final-mes",
    title: "Cómo preparar un final integrador en 4 semanas (plan paso a paso)",
    description:
      "Plan de 4 semanas para preparar un final universitario integrador, con división por semanas, técnicas por etapa y checklist final.",
    category: "examenes",
    cover: coverExamenes,
    date: "2026-05-02",
    readMinutes: 10,
    keywords: ["preparar final", "examen integrador", "estudio universidad", "plan estudio"],
    faq: [],
    content: md`
## Antes de empezar: diagnóstico

Necesitás tres cosas:
1. **Programa oficial completo** de la materia.
2. **Lista de finales viejos** de los últimos 2–3 años.
3. **Bibliografía obligatoria** y cuáles capítulos.

Sin esto, estás trabajando a ciegas.

## Semana 1: mapeo y primera pasada

### Objetivo
Ver el panorama completo y armar tu sistema.

### Acciones
- Día 1: leer programa, marcar unidades por dificultad subjetiva (1–5).
- Día 2: revisar 5–10 finales viejos y anotar qué temas caen siempre.
- Día 3–7: primera lectura rápida de toda la materia. **Sin tomar apuntes detallados**, solo identificar estructura.

Al fin de semana 1 deberías poder decir: "la materia tiene 8 unidades, las críticas son 3, 4 y 7, el tipo de pregunta típica es X".

## Semana 2: estudio profundo de las unidades críticas

### Objetivo
Dominar 60 % del contenido (las unidades que más caen).

### Acciones
- Cornell para cada unidad importante.
- Flashcards de los conceptos centrales.
- Resolver 1–2 finales viejos completos.
- Marcar dudas para pregunta a profe / compañeros.

Sesiones de 4 hs/día con descansos. Ya estás en velocidad de crucero.

## Semana 3: completar la materia + practicar

### Objetivo
Cubrir el 40 % restante y empezar a integrar.

### Acciones
- Completar Cornell + flashcards de unidades menos críticas.
- 3–4 finales completos resueltos en condiciones reales (con tiempo).
- Empezar repasos de unidades de semana 2.
- Si hay coloquios, simular oral con un compañero.

## Semana 4: solo repaso e integración

### Objetivo
Activar todo lo aprendido y resolver bajo presión.

### Acciones
- Solo flashcards y resolución de problemas. **No más material nuevo**.
- 1 final completo cada 2 días.
- Repasos cortos diarios de las unidades flojas.
- Últimos 2 días: liviano. Repaso global, sueño, comida, ejercicio.

## La noche anterior

- Cerrá los apuntes 2 horas antes de dormir.
- Repaso ligero de checklist mental, no estudio profundo.
- Dormí 7–8 horas.
- Tené todo preparado (DNI, lápices, ropa, recorrido).

## El día del examen

- Desayuno completo.
- Llegar 30 minutos antes.
- Si te trabás en una pregunta, marcala y seguí.
- Releé al final.

## Errores que arruinan finales bien preparados

- Estudiar de noche el día previo.
- Cambiar de material a último momento ("este resumen está mejor").
- No dormir.
- Drogarse con cafeína (más de 3 cafés es contraproducente).
- Comparar con compañeros minutos antes.
`,
  },
  {
    slug: "tecnicas-resolver-multiple-choice",
    title: "Cómo resolver multiple choice: estrategias para no caer en preguntas trampa",
    description:
      "Técnicas para parciales y finales con multiple choice. Cómo descartar opciones, identificar trampas, y manejar el tiempo en exámenes largos.",
    category: "examenes",
    cover: coverExamenes,
    date: "2026-05-03",
    readMinutes: 7,
    keywords: ["multiple choice", "preguntas trampa", "estrategias examen", "técnica examen"],
    faq: [],
    content: md`
## Por qué los multiple choice engañan

No solo evalúan conocimiento: evalúan **lectura cuidadosa, manejo de incertidumbre y gestión del tiempo**. Mucha gente que sabe la materia pierde puntos por mala estrategia.

## Reglas generales

### 1. Leé la pregunta entera antes de mirar las opciones
Las opciones contaminan tu comprensión. Pensá tu respuesta antes y después comparala.

### 2. Eliminá opciones obviamente incorrectas primero
Reducir 4 opciones a 2 sube tu probabilidad de acierto del 25 % al 50 % aunque dudes.

### 3. Cuidado con las palabras absolutas
"Siempre", "nunca", "todos", "ninguno" son señal de probable opción incorrecta. La realidad raras veces es absoluta.

### 4. Cuidado con las opciones "todas las anteriores"
Si dos opciones son claramente correctas, "todas las anteriores" suele ser la respuesta.

### 5. Si dos opciones son sinónimas, ninguna suele ser correcta
Si A y B dicen lo mismo en distintas palabras, el evaluador raramente pondría dos correctas.

### 6. Confiá en tu primera intuición
Investigaciones muestran que cambiar respuestas en multiple choice **suele bajar el puntaje** (no siempre, pero en promedio sí). Cambiá solo si recordás algo concreto que la descarta.

## Manejo del tiempo

- Calculá tiempo por pregunta y respetá. 60 preguntas en 90 min = 1.5 min por pregunta.
- Si una pregunta te lleva 3 min, marcala y seguí.
- Reservá los últimos 10 min para revisar dudas.

## Si penaliza error

Si el examen resta puntos por respuesta incorrecta:
- Probabilidad cruda: 4 opciones, resta 0.25, esperanza neutra.
- Si podés descartar 1 opción, la esperanza ya es positiva. Respondé.
- Si no podés descartar ninguna, dejá en blanco.

## Estrategias específicas según tipo de pregunta

### Vocabulario / definiciones
Si no sabés, mirá raíces de palabras. Muchas veces se deduce.

### Cálculos
Hacé estimación rápida. Si una opción es 15 y vos calculás 1500, descartá.

### "Excepto" / "incorrecto"
Subrayá la palabra. Es trampa fácil. Si la pregunta dice "todas las siguientes son verdaderas EXCEPTO", la respuesta correcta es la **falsa**.

### Casos clínicos / problemas largos
Leé primero la pregunta del final, después el caso. Te enfocás en lo relevante.

## Después del examen

Anotá las preguntas que te confundieron mientras las recordás. Es oro para preparar el próximo.
`,
  },
  {
    slug: "ansiedad-examenes-tecnicas",
    title: "Ansiedad en exámenes: técnicas que sí funcionan (y mitos a olvidar)",
    description:
      "Bases neurobiológicas de la ansiedad de examen, técnicas con evidencia (respiración, exposición, escritura expresiva) y errores comunes.",
    category: "examenes",
    cover: coverExamenes,
    date: "2026-05-04",
    readMinutes: 8,
    keywords: ["ansiedad examen", "nervios examen", "técnicas relajación", "presión examen"],
    faq: [],
    content: md`
## Qué pasa en tu cuerpo

Antes de un examen, tu sistema nervioso simpático se activa: sube cortisol, adrenalina, frecuencia cardíaca. Esto, **en dosis moderada, mejora el rendimiento** (Ley Yerkes-Dodson). En dosis altas, lo destruye.

El problema no es la activación: es no saber regularla.

## Técnicas con evidencia

### 1. Respiración 4-7-8
- Inhalar 4 segundos
- Sostener 7
- Exhalar 8

Repetir 4 ciclos. Activa el parasimpático y baja la frecuencia cardíaca en 60–90 segundos.

### 2. Reformulación cognitiva
Reinterpretar la activación como "energía útil" en lugar de "ansiedad mala". Estudios de Brooks (2014): los que se decían "estoy emocionado" antes de hablar en público rendían mejor que los que se decían "tranquilizate".

### 3. Escritura expresiva
Ramírez & Beilock (2011): escribir 10 minutos antes del examen sobre tus preocupaciones reduce significativamente la ansiedad y mejora el desempeño en estudiantes de matemática.

### 4. Exposición progresiva
Hacer simulacros en condiciones reales (mismo horario, mismo aula si podés, mismo tiempo). Reduce la novedad estresante.

### 5. Sueño suficiente
Privación de sueño dispara cortisol. Dormir mal la noche previa es factor de ansiedad por sí mismo.

## Mitos que no ayudan

- "Tomate algo para los nervios". Ansiolíticos sin indicación pueden bajar tu rendimiento.
- "No pienses en el examen". El control intencional de pensamiento aumenta intrusividad.
- "Si te ponés nervioso es porque no estudiaste". Falso: gente muy preparada también sufre ansiedad de evaluación.

## El día del examen

- Desayuno con proteína, no solo azúcar.
- Llegar temprano, no minutos antes.
- 5 minutos antes: respiración 4-7-8.
- Mientras el profe reparte: "estoy activado, eso es energía útil".
- Si te bloqueás en una pregunta: respirar, saltar, volver.

## Cuándo buscar ayuda profesional

Si la ansiedad te impide rendir exámenes, te genera somatización (vómitos, ataques de pánico, parálisis), o te hace abandonar materias, el tratamiento con psicólogo (terapia cognitivo-conductual es el estándar) tiene altísima efectividad y vale 100 % la inversión.
`,
  },
  {
    slug: "como-preparar-examen-oral",
    title: "Cómo preparar un examen oral: estructura, simulacros y manejo del bloqueo",
    description:
      "Guía completa para preparar finales orales: cómo estructurar tu exposición, técnicas de simulacro, y qué hacer cuando te bloqueás frente al tribunal.",
    category: "examenes",
    cover: coverExamenes,
    date: "2026-05-05",
    readMinutes: 8,
    keywords: ["examen oral", "final oral", "como preparar oral", "tribunal universidad"],
    faq: [],
    content: md`
## Por qué los orales asustan más

En un escrito controlás el ritmo. En un oral, tres profes te miran y la presión social se suma a la cognitiva. Pero el oral tiene una ventaja enorme: **podés guiar la conversación** si sabés cómo.

## Estructura de una respuesta oral

Cualquier tema, idealmente, lo respondés con esta estructura:

1. **Marco general** (30 segundos): qué es y dónde se ubica en el programa.
2. **Definición precisa** (30 segundos).
3. **Desarrollo principal** (3–5 min): subdivisiones, mecanismos, ejemplos.
4. **Aplicaciones / relevancia** (1–2 min).
5. **Cierre** (15 segundos): conexión con otros temas.

Practicá esta estructura para los 10–15 temas centrales del programa.

## Simulacros: la única práctica que sirve

Leer el tema mentalmente no entrena oral. Hablar en voz alta, idealmente frente a alguien o grabándote, sí.

### Rutina sugerida (semana antes del oral)
- 3 simulacros por día.
- Tiempo total simulacro: 8–10 min por tema.
- Grabarte y volver a escuchar (incómodo pero útil).
- Cronometrarte: si te pasás de 10 min en un tema, sintetizá.

## El primer minuto es el que cuenta

El tribunal forma su impresión inicial muy rápido. Si arrancás con un marco claro y voz firme, el resto se vuelve más fácil.

> "El sistema cardiovascular es uno de los sistemas centrales del organismo. Lo voy a abordar en tres partes: anatomía macroscópica del corazón, ciclo cardíaco, y regulación nerviosa y humoral."

Eso solo ya te da puntos.

## Qué hacer cuando te bloqueás

1. **Respirar.** No es vergonzoso pausar 5 segundos.
2. **Resumir lo que llevás dicho** ("Vimos entonces que…"). Eso te activa lo siguiente.
3. **Pasar a un punto adyacente que sí sabés.** "Antes de seguir con X, conviene mencionar Y." Si manejás bien Y, recuperás contexto.
4. **Aceptar lo que no sabés.** "No recuerdo el dato exacto, pero el orden de magnitud es…". Es mucho mejor que inventar.

## Cómo manejar preguntas inesperadas

- **Reformular en voz alta**. "Si entendí bien, me preguntan sobre…". Te da segundos y muestra escucha.
- **Conectar con lo que sabés**. Si te preguntan sobre un tema lateral, relacionalo con algo central.
- **No mentir**. Si no sabés, decilo. Los profes detectan invención y penalizan más que el desconocimiento honesto.

## Tips logísticos

- Vestite cómodo pero formal. Te pone en modo "examen".
- Llevá agua.
- Mirá a los tres miembros del tribunal, no solo al que pregunta.
- Volumen de voz medio-alto. Bajo = inseguridad.

## Errores fatales

- Memorizar literal el apunte y quedarte si te interrumpen.
- Hablar muy rápido.
- Usar muletillas constantes ("eh", "este").
- Mentir cuando no sabés.
- Llegar sin haber simulado nunca.

Un buen oral simulado 10 veces se vuelve rutina. Uno no simulado nunca puede arruinar un cuatrimestre entero de estudio.
`,
  },
];

export const getPostBySlug = (slug: string) => POSTS.find((p) => p.slug === slug);

export const getRelatedPosts = (slug: string, limit = 3) => {
  const current = getPostBySlug(slug);
  if (!current) return [];
  return POSTS.filter((p) => p.slug !== slug && p.category === current.category).slice(0, limit);
};
