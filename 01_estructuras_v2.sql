-- ══════════════════════════════════════════
-- FIX FINAL: COLUMNAS FALTANTES EN USUARIOS
-- ══════════════════════════════════════════

-- 1. AÑADIR COLUMNAS A LA TABLA USUARIOS
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS color_perfil TEXT DEFAULT '#4F46E5';

-- 2. ASEGURAR POLÍTICAS NO RECURSIVAS
-- (Borramos y recreamos para estar 100% seguros)
DROP POLICY IF EXISTS "usuarios_ven_su_propia_fila" ON usuarios;
DROP POLICY IF EXISTS "admins_ven_todo" ON usuarios;

CREATE POLICY "usuarios_ven_su_propia_fila" 
ON usuarios FOR SELECT 
TO authenticated 
USING (auth.uid() = auth_id);

CREATE POLICY "admins_ven_todo" 
ON usuarios FOR SELECT 
TO authenticated 
USING (rol = 'administrador');

-- 3. MÓDULO 11: ASEGURAR TABLAS Y RPC
CREATE TABLE IF NOT EXISTS logros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo TEXT NOT NULL UNIQUE,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  puntos INT DEFAULT 10,
  icono TEXT,
  categoria TEXT CHECK (categoria IN ('lectura', 'evaluacion', 'racha', 'social')),
  condicion_tipo TEXT,
  condicion_valor INT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Asegurar que el RPC exista
CREATE OR REPLACE FUNCTION incrementar_puntos_logros(p_estudiante_id UUID, p_puntos INT)
RETURNS VOID AS $$
BEGIN
  UPDATE estadisticas_estudiante
  SET total_puntos_logros = total_puntos_logros + p_puntos,
      updated_at = now()
  WHERE estudiante_id = p_estudiante_id;
  
  IF NOT FOUND THEN
    INSERT INTO estadisticas_estudiante (estudiante_id, total_puntos_logros)
    VALUES (p_estudiante_id, p_puntos);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. SEMILLADO
INSERT INTO logros (codigo, nombre, descripcion, puntos, icono, categoria, condicion_tipo, condicion_valor) VALUES
  ('logro-1', 'Primer Paso', 'Completaste tu primera lectura.', 10, 'BookOpen', 'lectura', 'lecturas_completadas', 1),
  ('racha-3', 'Lector Constante', 'Mantuviste una racha de 3 días.', 20, 'Zap', 'racha', 'racha_dias', 3)
ON CONFLICT (codigo) DO NOTHING;

SELECT 'COLUMNAS bio Y color_perfil AÑADIDAS. Perfil listo!' as status;
