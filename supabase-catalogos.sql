-- ============================================================
-- Plan de Lectura — Tablas de catálogos
-- Ejecutar en: Supabase SQL Editor
-- ============================================================

-- Tabla: categorias
CREATE TABLE IF NOT EXISTS categorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL UNIQUE,
  descripcion TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla: materias
CREATE TABLE IF NOT EXISTS materias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL UNIQUE,
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla: grados
CREATE TABLE IF NOT EXISTS grados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL UNIQUE,
  orden INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE materias ENABLE ROW LEVEL SECURITY;
ALTER TABLE grados ENABLE ROW LEVEL SECURITY;

-- Políticas: lectura pública para usuarios autenticados
CREATE POLICY "categorias_lectura" ON categorias FOR SELECT TO authenticated USING (true);
CREATE POLICY "materias_lectura" ON materias FOR SELECT TO authenticated USING (true);
CREATE POLICY "grados_lectura" ON grados FOR SELECT TO authenticated USING (true);

-- Política: lectura pública en lecturas para autenticados
ALTER TABLE lecturas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lecturas_lectura_publica" ON lecturas FOR SELECT TO authenticated USING (true);

-- Datos iniciales de materias
INSERT INTO materias (nombre, color) VALUES
  ('Matemática', '#2563EB'),
  ('Literatura', '#8B5CF6'),
  ('Química', '#10B981'),
  ('Historia', '#F97316'),
  ('Biología', '#14B8A6'),
  ('Física', '#EF4444'),
  ('Ciencias', '#059669')
ON CONFLICT (nombre) DO NOTHING;

-- Datos iniciales de categorías
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

-- Datos iniciales de grados
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
-- Lecturas de ejemplo para que el explorar tenga contenido
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

-- Verificar
SELECT l.titulo, l.autor, m.nombre as materia, c.nombre as categoria
FROM lecturas l
LEFT JOIN materias m ON l.materia_id = m.id
LEFT JOIN categorias c ON l.categoria_id = c.id
WHERE l.estado = 'publicado';
