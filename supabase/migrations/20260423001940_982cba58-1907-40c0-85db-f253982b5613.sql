-- TABLES
CREATE TABLE public.iq_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  area TEXT NOT NULL CHECK (area IN ('logica','numerico','espacial','verbal')),
  dificultad TEXT NOT NULL CHECK (dificultad IN ('facil','medio','dificil')),
  pregunta TEXT NOT NULL,
  opciones JSONB NOT NULL,
  indice_correcto INTEGER NOT NULL,
  explicacion TEXT,
  es_espacial BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.iq_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  nombre TEXT NOT NULL,
  edad INTEGER NOT NULL,
  email TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  total_preguntas INTEGER DEFAULT 60,
  respuestas_correctas INTEGER DEFAULT 0,
  iq_score INTEGER,
  percentil NUMERIC(5,2),
  area_scores JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.iq_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID NOT NULL REFERENCES public.iq_attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.iq_questions(id),
  indice_seleccionado INTEGER NOT NULL,
  es_correcto BOOLEAN NOT NULL,
  tiempo_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.iq_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iq_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iq_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "IQ questions son públicas" ON public.iq_questions FOR SELECT USING (is_active = true);
CREATE POLICY "Cualquiera puede crear un intento" ON public.iq_attempts FOR INSERT WITH CHECK (true);
CREATE POLICY "El usuario ve sus intentos" ON public.iq_attempts FOR SELECT USING (user_id IS NULL OR auth.uid() = user_id);
CREATE POLICY "Cualquiera puede actualizar su intento" ON public.iq_attempts FOR UPDATE USING (user_id IS NULL OR auth.uid() = user_id);
CREATE POLICY "Insertar respuestas propias" ON public.iq_answers FOR INSERT WITH CHECK (true);
CREATE POLICY "Ver respuestas de intentos visibles" ON public.iq_answers FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.iq_attempts a WHERE a.id = attempt_id AND (a.user_id IS NULL OR auth.uid() = a.user_id))
);

CREATE INDEX idx_iq_questions_area_dif ON public.iq_questions(area, dificultad) WHERE is_active = true;
CREATE INDEX idx_iq_answers_attempt ON public.iq_answers(attempt_id);

-- ============== SEED 60 PREGUNTAS ==============

-- LOGICA - FACIL (5)
INSERT INTO public.iq_questions (area, dificultad, pregunta, opciones, indice_correcto, explicacion) VALUES
('logica','facil','Si todos los gatos son mamíferos y todos los mamíferos son animales, entonces:', '["Algunos gatos no son animales","Todos los gatos son animales","Los animales son gatos","Ningún gato es animal"]'::jsonb, 1, 'Por silogismo transitivo: gato → mamífero → animal.'),
('logica','facil','¿Qué número sigue en la secuencia: 2, 4, 6, 8, ...?', '["9","10","12","11"]'::jsonb, 1, 'Suma constante de 2.'),
('logica','facil','Si A > B y B > C, entonces:', '["C > A","A = C","A > C","No se puede saber"]'::jsonb, 2, 'Transitividad de la desigualdad.'),
('logica','facil','¿Cuál no pertenece al grupo: perro, gato, caballo, zanahoria?', '["Perro","Gato","Caballo","Zanahoria"]'::jsonb, 3, 'Los demás son animales; la zanahoria es vegetal.'),
('logica','facil','Pájaro es a volar como pez es a:', '["Caminar","Nadar","Saltar","Correr"]'::jsonb, 1, 'Analogía de medio de locomoción natural.');

-- LOGICA - MEDIO (5)
INSERT INTO public.iq_questions (area, dificultad, pregunta, opciones, indice_correcto, explicacion) VALUES
('logica','medio','Si ningún pintor es escultor y algunos escultores son arquitectos, entonces:', '["Todos los arquitectos son pintores","Algunos arquitectos no son pintores","Ningún arquitecto es escultor","Todos los pintores son arquitectos"]'::jsonb, 1, 'Los escultores que son arquitectos no pueden ser pintores.'),
('logica','medio','Continúa la secuencia: 1, 1, 2, 3, 5, 8, ...', '["11","12","13","14"]'::jsonb, 2, 'Serie de Fibonacci: 5+8=13.'),
('logica','medio','En un grupo, todos los que estudian aprueban. Juan no aprobó. Por lo tanto:', '["Juan estudió","Juan no estudió","Juan aprobará","Nada se puede deducir"]'::jsonb, 1, 'Modus tollens.'),
('logica','medio','Encuentra el intruso: triángulo, cuadrado, círculo, hexágono', '["Triángulo","Cuadrado","Círculo","Hexágono"]'::jsonb, 2, 'Los demás son polígonos; el círculo no.'),
('logica','medio','Si hoy es martes, ¿qué día será dentro de 100 días?', '["Miércoles","Jueves","Viernes","Sábado"]'::jsonb, 1, '100 mod 7 = 2; martes + 2 = jueves.');

-- LOGICA - DIFICIL (5)
INSERT INTO public.iq_questions (area, dificultad, pregunta, opciones, indice_correcto, explicacion) VALUES
('logica','dificil','Tres amigos —A, B y C— mienten o dicen la verdad. A dice: "B miente". B dice: "C miente". C dice: "A y B mienten". ¿Quién dice la verdad?', '["Solo A","Solo B","Solo C","Ninguno"]'::jsonb, 1, 'Si B dice la verdad, C miente; entonces A miente, lo que confirma que B dice verdad.'),
('logica','dificil','Continúa: 2, 6, 12, 20, 30, ...', '["40","42","44","46"]'::jsonb, 1, 'Diferencias 4,6,8,10,12 → 30+12=42.'),
('logica','dificil','Si "todo P es Q" es falso, entonces necesariamente:', '["Algún P no es Q","Todo Q es P","Ningún P es Q","Algún Q no es P"]'::jsonb, 0, 'La negación de un universal afirmativo es un particular negativo.'),
('logica','dificil','En una caja hay 3 medias rojas y 3 azules. ¿Cuántas hay que sacar a ciegas para garantizar un par del mismo color?', '["2","3","4","6"]'::jsonb, 1, 'Por palomar: con 3 medias y 2 colores siempre hay un par.'),
('logica','dificil','Si llueve, el suelo está mojado. El suelo no está mojado. Entonces:', '["Llovió","No llovió","Puede haber llovido","No se puede saber"]'::jsonb, 1, 'Modus tollens.');

-- NUMERICO - FACIL (5)
INSERT INTO public.iq_questions (area, dificultad, pregunta, opciones, indice_correcto, explicacion) VALUES
('numerico','facil','¿Cuánto es 15 + 27?', '["41","42","43","44"]'::jsonb, 1, 'Suma directa.'),
('numerico','facil','¿Qué número sigue: 5, 10, 15, 20, ...?', '["22","24","25","30"]'::jsonb, 2, 'Suma de 5.'),
('numerico','facil','Si un kilo de pan cuesta $4, ¿cuánto cuestan 3 kilos?', '["$10","$11","$12","$14"]'::jsonb, 2, '4×3=12.'),
('numerico','facil','¿Cuál es el doble de 18?', '["32","34","36","38"]'::jsonb, 2, '18×2=36.'),
('numerico','facil','El 10% de 200 es:', '["10","20","25","50"]'::jsonb, 1, '200×0.10=20.');

-- NUMERICO - MEDIO (5)
INSERT INTO public.iq_questions (area, dificultad, pregunta, opciones, indice_correcto, explicacion) VALUES
('numerico','medio','Continúa: 3, 6, 12, 24, ...', '["36","42","48","60"]'::jsonb, 2, 'Multiplicación por 2.'),
('numerico','medio','Si 4x = 32, entonces x²=', '["16","32","64","128"]'::jsonb, 2, 'x=8, 8²=64.'),
('numerico','medio','Un producto cuesta $80 y tiene 25% de descuento. Precio final:', '["$55","$60","$65","$70"]'::jsonb, 1, '80×0.75=60.'),
('numerico','medio','¿Qué fracción equivale a 0.75?', '["1/2","2/3","3/4","4/5"]'::jsonb, 2, '3/4=0.75.'),
('numerico','medio','Si un auto recorre 240 km en 3 horas, ¿velocidad promedio?', '["60 km/h","70 km/h","80 km/h","90 km/h"]'::jsonb, 2, '240/3=80.');

-- NUMERICO - DIFICIL (5)
INSERT INTO public.iq_questions (area, dificultad, pregunta, opciones, indice_correcto, explicacion) VALUES
('numerico','dificil','Continúa: 1, 4, 9, 16, 25, ...', '["30","32","36","49"]'::jsonb, 2, 'Cuadrados perfectos: 6²=36.'),
('numerico','dificil','Si log₂(x) = 5, entonces x =', '["10","16","25","32"]'::jsonb, 3, '2⁵=32.'),
('numerico','dificil','Un capital se duplica al 5% anual de interés compuesto. Aproximadamente en:', '["10 años","12 años","14 años","20 años"]'::jsonb, 2, 'Regla del 72: 72/5≈14.4.'),
('numerico','dificil','Continúa: 2, 3, 5, 7, 11, 13, ...', '["14","15","16","17"]'::jsonb, 3, 'Números primos.'),
('numerico','dificil','Si a+b=10 y a·b=21, entonces a²+b²=', '["50","58","62","79"]'::jsonb, 1, '(a+b)²-2ab=100-42=58.');

-- ESPACIAL - FACIL (5)
INSERT INTO public.iq_questions (area, dificultad, pregunta, opciones, indice_correcto, explicacion, es_espacial) VALUES
('espacial','facil','¿Qué figura sigue?  ▲ ▲▲ ▲▲▲ ?', '["▲","▲▲","▲▲▲▲","▲▲▲▲▲"]'::jsonb, 2, 'Suma un triángulo cada vez.', true),
('espacial','facil','Si rotas la letra "M" 180°, obtienes:', '["W","E","N","Z"]'::jsonb, 0, 'M girada 180° se ve como W.', true),
('espacial','facil','¿Cuántas caras tiene un cubo?', '["4","6","8","12"]'::jsonb, 1, 'Un cubo tiene 6 caras.', false),
('espacial','facil','¿Qué figura completa la simetría?  ◐ | ?', '["◑","◐","○","●"]'::jsonb, 0, 'Reflejo especular de ◐ es ◑.', true),
('espacial','facil','¿Cuál es el reflejo de "p" en un espejo vertical?', '["q","b","d","p"]'::jsonb, 1, 'Reflejo horizontal de p es q… reflejo vertical es b.', true);

-- ESPACIAL - MEDIO (5)
INSERT INTO public.iq_questions (area, dificultad, pregunta, opciones, indice_correcto, explicacion, es_espacial) VALUES
('espacial','medio','Continúa el patrón:  □ ■ □ ■ □ ?', '["□","■","○","●"]'::jsonb, 1, 'Alternancia.', true),
('espacial','medio','Si plegamos un cuadrado por la diagonal, obtenemos:', '["Triángulo rectángulo","Rombo","Hexágono","Círculo"]'::jsonb, 0, 'Diagonal divide en dos triángulos rectángulos.', false),
('espacial','medio','¿Qué viene?  ◀ ▼ ▶ ▲ ◀ ▼ ?', '["▲","▶","◀","▼"]'::jsonb, 1, 'Rotación 90° en sentido horario.', true),
('espacial','medio','Un cubo tiene cuántos vértices:', '["6","8","10","12"]'::jsonb, 1, 'Un cubo tiene 8 vértices.', false),
('espacial','medio','La sombra de una esfera iluminada desde arriba es:', '["Cuadrada","Triangular","Circular","Ovalada"]'::jsonb, 2, 'Proyección de esfera = círculo.', false);

-- ESPACIAL - DIFICIL (5)
INSERT INTO public.iq_questions (area, dificultad, pregunta, opciones, indice_correcto, explicacion, es_espacial) VALUES
('espacial','dificil','¿Qué figura sigue?  ★ ✦ ○ ● ★ ✦ ○ ?', '["★","✦","●","◎"]'::jsonb, 2, 'Patrón cíclico de 4 elementos.', true),
('espacial','dificil','Un dado tiene caras opuestas que suman 7. Si arriba está 3, abajo hay:', '["2","4","5","6"]'::jsonb, 1, '7-3=4.', false),
('espacial','dificil','¿Cuántas aristas tiene un tetraedro regular?', '["4","6","8","12"]'::jsonb, 1, 'Tetraedro: 4 vértices, 6 aristas, 4 caras.', false),
('espacial','dificil','Patrón:  ◐ ◑ ◒ ◓ ◐ ?', '["◑","◒","◓","◐"]'::jsonb, 0, 'Rotación cíclica de 4.', true),
('espacial','dificil','Al desplegar un cubo en cruz, ¿cuántos cuadrados se ven?', '["4","5","6","8"]'::jsonb, 2, 'Un cubo tiene 6 caras.', false);

-- VERBAL - FACIL (5)
INSERT INTO public.iq_questions (area, dificultad, pregunta, opciones, indice_correcto, explicacion) VALUES
('verbal','facil','Sinónimo de "rápido":', '["Lento","Veloz","Pesado","Tranquilo"]'::jsonb, 1, 'Veloz = rápido.'),
('verbal','facil','Antónimo de "feliz":', '["Alegre","Triste","Contento","Risueño"]'::jsonb, 1, 'Triste es opuesto a feliz.'),
('verbal','facil','Día es a noche como blanco es a:', '["Gris","Claro","Negro","Brillante"]'::jsonb, 2, 'Pares de opuestos.'),
('verbal','facil','¿Cuál no es un color primario?', '["Rojo","Verde","Amarillo","Azul"]'::jsonb, 1, 'Los primarios son rojo, amarillo, azul.'),
('verbal','facil','Sinónimo de "comenzar":', '["Terminar","Iniciar","Pausar","Dejar"]'::jsonb, 1, 'Iniciar = comenzar.');

-- VERBAL - MEDIO (5)
INSERT INTO public.iq_questions (area, dificultad, pregunta, opciones, indice_correcto, explicacion) VALUES
('verbal','medio','Médico es a hospital como profesor es a:', '["Aula","Escuela","Libro","Estudiante"]'::jsonb, 1, 'Lugar habitual de trabajo.'),
('verbal','medio','Antónimo de "efímero":', '["Pasajero","Breve","Duradero","Volátil"]'::jsonb, 2, 'Efímero = corta duración; opuesto: duradero.'),
('verbal','medio','¿Cuál palabra no encaja?', '["Manzana","Naranja","Lechuga","Pera"]'::jsonb, 2, 'Las demás son frutas; la lechuga es verdura.'),
('verbal','medio','"Inocuo" significa:', '["Peligroso","Inofensivo","Ruidoso","Brillante"]'::jsonb, 1, 'Inocuo = sin daño.'),
('verbal','medio','Pluma es a escribir como tijera es a:', '["Cortar","Pegar","Coser","Pintar"]'::jsonb, 0, 'Función principal del objeto.');

-- VERBAL - DIFICIL (5)
INSERT INTO public.iq_questions (area, dificultad, pregunta, opciones, indice_correcto, explicacion) VALUES
('verbal','dificil','"Idiosincrasia" se refiere a:', '["Una enfermedad rara","Rasgos propios distintivos","Una opinión política","Una crisis económica"]'::jsonb, 1, 'Carácter o conducta propia de un individuo o grupo.'),
('verbal','dificil','Antónimo de "exhaustivo":', '["Detallado","Completo","Superficial","Profundo"]'::jsonb, 2, 'Exhaustivo = total; opuesto: superficial.'),
('verbal','dificil','"Sofista" en filosofía clásica era:', '["Un sabio infalible","Un orador que enseñaba retórica por dinero","Un astrónomo","Un sacerdote"]'::jsonb, 1, 'En la Grecia clásica, los sofistas enseñaban retórica.'),
('verbal','dificil','Elija la palabra que mejor completa: "Su discurso fue tan ___ que nadie comprendió la conclusión."', '["Lúcido","Conciso","Abstruso","Diáfano"]'::jsonb, 2, 'Abstruso = oscuro, difícil de entender.'),
('verbal','dificil','"Falacia" significa:', '["Verdad evidente","Razonamiento engañoso","Pregunta abierta","Hecho histórico"]'::jsonb, 1, 'Una falacia es un argumento aparentemente válido pero engañoso.');