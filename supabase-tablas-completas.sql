-- ============================================================
-- Plan de Lectura — TODAS LAS TABLAS
-- Ejecutar en: Supabase SQL Editor (una sola vez)
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- 1. TABLAS DE CATÁLOGOS (sin dependencias)
-- ============================================================

CREATE TABLE IF NOT EXISTS categorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL UNIQUE,
  descripcion TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS materias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL UNIQUE,
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS grados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL UNIQUE,
  orden INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS periodos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  anio INT NOT NULL,
  fecha_inicio DATE,
  fecha_fin DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bimestres (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  periodo_id UUID REFERENCES periodos(id),
  nombre TEXT NOT NULL,
  numero INT NOT NULL,
  fecha_inicio DATE,
  fecha_fin DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 2. AULAS (depende de grados, periodos)
-- ============================================================

CREATE TABLE IF NOT EXISTS aulas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  grado_id UUID REFERENCES grados(id),
  periodo_id UUID REFERENCES periodos(id),
  profesor_id UUID REFERENCES usuarios(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 3. MATRÍCULAS (depende de usuarios, aulas)
-- ============================================================

CREATE TABLE IF NOT EXISTS matriculas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estudiante_id UUID NOT NULL REFERENCES usuarios(id),
  aula_id UUID NOT NULL REFERENCES aulas(id),
  estado TEXT NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo', 'retirado')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(estudiante_id, aula_id)
);

-- ============================================================
-- 4. LECTURAS (depende de materias, categorias, grados, usuarios)
-- ============================================================

CREATE TABLE IF NOT EXISTS lecturas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  autor TEXT NOT NULL,
  descripcion TEXT,
  portada_url TEXT,
  materia_id UUID REFERENCES materias(id),
  categoria_id UUID REFERENCES categorias(id),
  nivel_dificultad_id UUID,
  grado_id UUID REFERENCES grados(id),
  anio_publicacion INT,
  paginas_total INT,
  es_global BOOLEAN DEFAULT false,
  estado TEXT NOT NULL DEFAULT 'borrador' CHECK (estado IN ('borrador', 'publicado', 'archivado')),
  creado_por UUID REFERENCES usuarios(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 5. ASIGNACIONES DE LECTURA (depende de lecturas, aulas, usuarios, bimestres)
-- ============================================================

CREATE TABLE IF NOT EXISTS asignaciones_lectura (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lectura_id UUID NOT NULL REFERENCES lecturas(id),
  aula_id UUID NOT NULL REFERENCES aulas(id),
  profesor_id UUID NOT NULL REFERENCES usuarios(id),
  bimestre_id UUID REFERENCES bimestres(id),
  instrucciones TEXT,
  fecha_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
  fecha_limite DATE,
  estado TEXT NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'cerrado', 'cancelado')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 6. PROGRESO DE LECTURA (depende de usuarios, lecturas)
-- ============================================================

CREATE TABLE IF NOT EXISTS progreso_lectura (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estudiante_id UUID NOT NULL REFERENCES usuarios(id),
  lectura_id UUID NOT NULL REFERENCES lecturas(id),
  porcentaje INT DEFAULT 0,
  pagina_actual INT DEFAULT 0,
  paginas_total INT,
  terminado BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(estudiante_id, lectura_id)
);

-- ============================================================
-- 7. PREGUNTAS Y OPCIONES (depende de lecturas)
-- ============================================================

CREATE TABLE IF NOT EXISTS preguntas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lectura_id UUID NOT NULL REFERENCES lecturas(id),
  enunciado TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('opcion_multiple', 'verdadero_falso', 'abierta')),
  puntaje INT DEFAULT 1,
  orden INT DEFAULT 0,
  imagen_url TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS opciones_respuesta (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pregunta_id UUID NOT NULL REFERENCES preguntas(id) ON DELETE CASCADE,
  texto TEXT NOT NULL,
  es_correcta BOOLEAN DEFAULT false,
  orden INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 8. INTENTOS Y RESPUESTAS (depende de asignaciones, usuarios, preguntas)
-- ============================================================

CREATE TABLE IF NOT EXISTS intentos_lectura (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asignacion_id UUID REFERENCES asignaciones_lectura(id),
  estudiante_id UUID NOT NULL REFERENCES usuarios(id),
  estado TEXT NOT NULL DEFAULT 'en_progreso' CHECK (estado IN ('en_progreso', 'completado', 'revisando')),
  nota_automatica NUMERIC(5,2),
  nota_profesor NUMERIC(5,2),
  nota_final NUMERIC(5,2),
  feedback_profesor TEXT,
  iniciado_at TIMESTAMPTZ DEFAULT now(),
  completado_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS respuestas_estudiante (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intento_id UUID NOT NULL REFERENCES intentos_lectura(id) ON DELETE CASCADE,
  pregunta_id UUID NOT NULL REFERENCES preguntas(id),
  opcion_id UUID REFERENCES opciones_respuesta(id),
  respuesta_texto TEXT,
  es_correcta BOOLEAN,
  puntaje_obtenido INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 9. NOTIFICACIONES (depende de usuarios)
-- ============================================================

CREATE TABLE IF NOT EXISTS notificaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id),
  tipo TEXT NOT NULL DEFAULT 'sistema' CHECK (tipo IN ('asignacion', 'vencimiento', 'calificacion', 'sistema')),
  titulo TEXT NOT NULL,
  mensaje TEXT,
  url_destino TEXT,
  leida BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 10. FAVORITOS (depende de usuarios, lecturas)
-- ============================================================

CREATE TABLE IF NOT EXISTS favoritos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id),
  lectura_id UUID NOT NULL REFERENCES lecturas(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(usuario_id, lectura_id)
);

-- ============================================================
-- RLS EN TODAS LAS TABLAS
-- ============================================================

ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE materias ENABLE ROW LEVEL SECURITY;
ALTER TABLE grados ENABLE ROW LEVEL SECURITY;
ALTER TABLE periodos ENABLE ROW LEVEL SECURITY;
ALTER TABLE bimestres ENABLE ROW LEVEL SECURITY;
ALTER TABLE aulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE matriculas ENABLE ROW LEVEL SECURITY;
ALTER TABLE lecturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE asignaciones_lectura ENABLE ROW LEVEL SECURITY;
ALTER TABLE progreso_lectura ENABLE ROW LEVEL SECURITY;
ALTER TABLE preguntas ENABLE ROW LEVEL SECURITY;
ALTER TABLE opciones_respuesta ENABLE ROW LEVEL SECURITY;
ALTER TABLE intentos_lectura ENABLE ROW LEVEL SECURITY;
ALTER TABLE respuestas_estudiante ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE favoritos ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura para usuarios autenticados
CREATE POLICY "select_categorias" ON categorias FOR SELECT TO authenticated USING (true);
CREATE POLICY "select_materias" ON materias FOR SELECT TO authenticated USING (true);
CREATE POLICY "select_grados" ON grados FOR SELECT TO authenticated USING (true);
CREATE POLICY "select_periodos" ON periodos FOR SELECT TO authenticated USING (true);
CREATE POLICY "select_bimestres" ON bimestres FOR SELECT TO authenticated USING (true);
CREATE POLICY "select_aulas" ON aulas FOR SELECT TO authenticated USING (true);
CREATE POLICY "select_matriculas" ON matriculas FOR SELECT TO authenticated USING (true);
CREATE POLICY "select_lecturas" ON lecturas FOR SELECT TO authenticated USING (true);
CREATE POLICY "select_asignaciones" ON asignaciones_lectura FOR SELECT TO authenticated USING (true);
CREATE POLICY "select_preguntas" ON preguntas FOR SELECT TO authenticated USING (true);
CREATE POLICY "select_opciones" ON opciones_respuesta FOR SELECT TO authenticated USING (true);

-- Progreso: solo el dueño
CREATE POLICY "progreso_ver" ON progreso_lectura FOR SELECT TO authenticated
  USING (estudiante_id IN (SELECT id FROM usuarios WHERE auth_id = auth.uid()));
CREATE POLICY "progreso_insertar" ON progreso_lectura FOR INSERT TO authenticated
  WITH CHECK (estudiante_id IN (SELECT id FROM usuarios WHERE auth_id = auth.uid()));
CREATE POLICY "progreso_actualizar" ON progreso_lectura FOR UPDATE TO authenticated
  USING (estudiante_id IN (SELECT id FROM usuarios WHERE auth_id = auth.uid()));

-- Intentos: solo el dueño
CREATE POLICY "intentos_ver" ON intentos_lectura FOR SELECT TO authenticated
  USING (estudiante_id IN (SELECT id FROM usuarios WHERE auth_id = auth.uid()));
CREATE POLICY "intentos_insertar" ON intentos_lectura FOR INSERT TO authenticated
  WITH CHECK (estudiante_id IN (SELECT id FROM usuarios WHERE auth_id = auth.uid()));

-- Respuestas: acceso via intento
CREATE POLICY "respuestas_ver" ON respuestas_estudiante FOR SELECT TO authenticated
  USING (intento_id IN (SELECT id FROM intentos_lectura WHERE estudiante_id IN (SELECT id FROM usuarios WHERE auth_id = auth.uid())));
CREATE POLICY "respuestas_insertar" ON respuestas_estudiante FOR INSERT TO authenticated
  WITH CHECK (intento_id IN (SELECT id FROM intentos_lectura WHERE estudiante_id IN (SELECT id FROM usuarios WHERE auth_id = auth.uid())));

-- Notificaciones: solo el dueño
CREATE POLICY "notif_ver" ON notificaciones FOR SELECT TO authenticated
  USING (usuario_id IN (SELECT id FROM usuarios WHERE auth_id = auth.uid()));
CREATE POLICY "notif_actualizar" ON notificaciones FOR UPDATE TO authenticated
  USING (usuario_id IN (SELECT id FROM usuarios WHERE auth_id = auth.uid()));

-- Favoritos: solo el dueño
CREATE POLICY "fav_ver" ON favoritos FOR SELECT TO authenticated
  USING (usuario_id IN (SELECT id FROM usuarios WHERE auth_id = auth.uid()));
CREATE POLICY "fav_insertar" ON favoritos FOR INSERT TO authenticated
  WITH CHECK (usuario_id IN (SELECT id FROM usuarios WHERE auth_id = auth.uid()));
CREATE POLICY "fav_eliminar" ON favoritos FOR DELETE TO authenticated
  USING (usuario_id IN (SELECT id FROM usuarios WHERE auth_id = auth.uid()));

-- ============================================================
-- TRIGGERS updated_at
-- ============================================================

CREATE TRIGGER trigger_aulas_updated_at BEFORE UPDATE ON aulas
  FOR EACH ROW EXECUTE FUNCTION actualizar_updated_at();
CREATE TRIGGER trigger_lecturas_updated_at BEFORE UPDATE ON lecturas
  FOR EACH ROW EXECUTE FUNCTION actualizar_updated_at();
CREATE TRIGGER trigger_asignaciones_updated_at BEFORE UPDATE ON asignaciones_lectura
  FOR EACH ROW EXECUTE FUNCTION actualizar_updated_at();
CREATE TRIGGER trigger_progreso_updated_at BEFORE UPDATE ON progreso_lectura
  FOR EACH ROW EXECUTE FUNCTION actualizar_updated_at();
CREATE TRIGGER trigger_intentos_updated_at BEFORE UPDATE ON intentos_lectura
  FOR EACH ROW EXECUTE FUNCTION actualizar_updated_at();

-- ============================================================
-- DATOS INICIALES
-- ============================================================

-- Materias
INSERT INTO materias (nombre, color) VALUES
  ('Matemática', '#2563EB'),
  ('Literatura', '#8B5CF6'),
  ('Química', '#10B981'),
  ('Historia', '#F97316'),
  ('Biología', '#14B8A6'),
  ('Física', '#EF4444'),
  ('Ciencias', '#059669')
ON CONFLICT (nombre) DO NOTHING;

-- Categorías
INSERT INTO categorias (nombre, descripcion) VALUES
  ('Aventura', 'Historias de exploración y riesgo'),
  ('Ciencia Ficción', 'Mundos futuros y tecnología'),
  ('Fantasía', 'Mundos mágicos y fantásticos'),
  ('Misterio', 'Historias de suspenso y enigmas'),
  ('Historia', 'Hechos y relatos históricos'),
  ('Poesía', 'Versos y composiciones líricas'),
  ('Cuentos', 'Relatos cortos y fábulas'),
  ('Educativo', 'Material didáctico y académico')
ON CONFLICT (nombre) DO NOTHING;

-- Grados
INSERT INTO grados (nombre, orden) VALUES
  ('1° Primaria', 1),
  ('2° Primaria', 2),
  ('3° Primaria', 3),
  ('4° Primaria', 4),
  ('5° Primaria', 5),
  ('6° Primaria', 6),
  ('1° Secundaria', 7),
  ('2° Secundaria', 8),
  ('3° Secundaria', 9),
  ('4° Secundaria', 10),
  ('5° Secundaria', 11)
ON CONFLICT (nombre) DO NOTHING;

-- ============================================================
-- LECTURAS DE EJEMPLO
-- ============================================================

DO $$
DECLARE
  mat_lit UUID;
  mat_his UUID;
  mat_bio UUID;
  mat_cie UUID;
  cat_aven UUID;
  cat_fant UUID;
  cat_mist UUID;
  cat_edu UUID;
  cat_cuen UUID;
  grado_3 UUID;
BEGIN
  SELECT id INTO mat_lit FROM materias WHERE nombre = 'Literatura';
  SELECT id INTO mat_his FROM materias WHERE nombre = 'Historia';
  SELECT id INTO mat_bio FROM materias WHERE nombre = 'Biología';
  SELECT id INTO mat_cie FROM materias WHERE nombre = 'Ciencias';
  SELECT id INTO cat_aven FROM categorias WHERE nombre = 'Aventura';
  SELECT id INTO cat_fant FROM categorias WHERE nombre = 'Fantasía';
  SELECT id INTO cat_mist FROM categorias WHERE nombre = 'Misterio';
  SELECT id INTO cat_edu FROM categorias WHERE nombre = 'Educativo';
  SELECT id INTO cat_cuen FROM categorias WHERE nombre = 'Cuentos';
  SELECT id INTO grado_3 FROM grados WHERE nombre = '3° Primaria';

  INSERT INTO lecturas (titulo, autor, descripcion, materia_id, categoria_id, grado_id, es_global, estado) VALUES
    ('El Principito', 'Antoine de Saint-Exupéry', 'Un piloto perdido en el desierto conoce a un pequeño príncipe que le enseña sobre la vida y el amor.', mat_lit, cat_fant, grado_3, true, 'publicado'),
    ('Cuentos de la Selva', 'Horacio Quiroga', 'Relatos que exploran la vida salvaje y la relación entre humanos y naturaleza en la selva.', mat_lit, cat_cuen, grado_3, true, 'publicado'),
    ('Los Ojos del Perro Siberiano', 'Antonio Santa Ana', 'La historia de dos hermanos enfrentados a un secreto familiar que cambiará sus vidas.', mat_lit, cat_mist, grado_3, true, 'publicado'),
    ('Mi Planta de Naranja Lima', 'José Mauro de Vasconcelos', 'Zezé, un niño brasileño, encuentra consuelo en un árbol al que considera su amigo.', mat_lit, cat_aven, grado_3, true, 'publicado'),
    ('Viaje al Centro de la Tierra', 'Julio Verne', 'El profesor Lidenbrock y su sobrino emprenden una expedición subterránea.', mat_cie, cat_aven, grado_3, true, 'publicado'),
    ('La Vida es Sueño', 'Pedro Calderón de la Barca', 'Segismundo reflexiona sobre la realidad y los sueños desde su prisión.', mat_his, cat_fant, grado_3, true, 'publicado'),
    ('El Mundo de los Insectos', 'María García', 'Una guía ilustrada sobre los insectos más fascinantes del planeta.', mat_bio, cat_edu, grado_3, true, 'publicado'),
    ('Crónicas de Narnia: El León', 'C.S. Lewis', 'Cuatro hermanos descubren un mundo mágico dentro de un armario.', mat_lit, cat_fant, grado_3, true, 'publicado')
  ON CONFLICT DO NOTHING;
END $$;

-- ============================================================
-- VERIFICAR
-- ============================================================
SELECT '--- TABLAS CREADAS ---' as info;
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

SELECT '--- LECTURAS INSERTADAS ---' as info;
SELECT l.titulo, l.autor, m.nombre as materia, c.nombre as categoria
FROM lecturas l
LEFT JOIN materias m ON l.materia_id = m.id
LEFT JOIN categorias c ON l.categoria_id = c.id
WHERE l.estado = 'publicado';
