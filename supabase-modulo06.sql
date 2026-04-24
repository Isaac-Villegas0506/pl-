-- ============================================================
-- Plan de Lectura — Tabla lectura_archivos + historial_lectura
-- Ejecutar en: Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS lectura_archivos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lectura_id UUID NOT NULL REFERENCES lecturas(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'pdf' CHECK (tipo IN ('pdf', 'epub', 'imagen')),
  nombre TEXT,
  tamano_bytes BIGINT,
  orden INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS historial_lectura (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estudiante_id UUID NOT NULL REFERENCES usuarios(id),
  lectura_id UUID NOT NULL REFERENCES lecturas(id),
  fecha_inicio TIMESTAMPTZ DEFAULT now(),
  fecha_fin TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(estudiante_id, lectura_id)
);

ALTER TABLE lectura_archivos ENABLE ROW LEVEL SECURITY;
ALTER TABLE historial_lectura ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_archivos" ON lectura_archivos FOR SELECT TO authenticated USING (true);
CREATE POLICY "historial_ver" ON historial_lectura FOR SELECT TO authenticated
  USING (estudiante_id IN (SELECT id FROM usuarios WHERE auth_id = auth.uid()));
CREATE POLICY "historial_insertar" ON historial_lectura FOR INSERT TO authenticated
  WITH CHECK (estudiante_id IN (SELECT id FROM usuarios WHERE auth_id = auth.uid()));
CREATE POLICY "historial_actualizar" ON historial_lectura FOR UPDATE TO authenticated
  USING (estudiante_id IN (SELECT id FROM usuarios WHERE auth_id = auth.uid()));

-- Agregar un PDF de ejemplo al Principito (usando un PDF público de prueba)
INSERT INTO lectura_archivos (lectura_id, url, tipo, nombre)
SELECT id, 'https://www.africau.edu/images/default/sample.pdf', 'pdf', 'el-principito.pdf'
FROM lecturas WHERE titulo = 'El Principito'
ON CONFLICT DO NOTHING;
