-- ============================================================
-- Plan de Lectura — SQL Base para Supabase
-- Ejecutar en: Supabase SQL Editor
-- ============================================================

-- 1. Extensión para generación de UUIDs
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Tabla usuarios
CREATE TABLE usuarios (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id     UUID UNIQUE NOT NULL,
  email       TEXT UNIQUE NOT NULL,
  nombre      TEXT NOT NULL,
  apellido    TEXT NOT NULL,
  rol         TEXT NOT NULL CHECK (rol IN ('administrador', 'profesor', 'estudiante')),
  activo      BOOLEAN DEFAULT TRUE,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- 3. Habilitar RLS en usuarios
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- 4. Política SELECT: cada usuario puede ver su propio registro
CREATE POLICY "usuario_ver_propio"
  ON usuarios
  FOR SELECT
  TO authenticated
  USING (auth_id = auth.uid());

-- 5. Política UPDATE: cada usuario puede actualizar su propio registro
CREATE POLICY "usuario_actualizar_propio"
  ON usuarios
  FOR UPDATE
  TO authenticated
  USING (auth_id = auth.uid());

-- 6. Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION actualizar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Trigger que llama a la función antes de cada UPDATE en usuarios
CREATE TRIGGER trigger_usuarios_updated_at
  BEFORE UPDATE ON usuarios
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_updated_at();

-- ============================================================
-- CÓMO INSERTAR EL PRIMER ADMINISTRADOR MANUALMENTE
-- ============================================================
--
-- Paso 1: Crear el usuario en Supabase Auth (Dashboard > Authentication > Users > Add User)
--         Email: admin@planlectura.com
--         Password: (la que elijas)
--
-- Paso 2: Copiar el UUID del usuario creado en Auth (columna "User UID")
--
-- Paso 3: Ejecutar este INSERT reemplazando el auth_id:
--
-- INSERT INTO usuarios (auth_id, email, nombre, apellido, rol)
-- VALUES (
--   'PEGAR-AUTH-UID-AQUI',
--   'admin@planlectura.com',
--   'Admin',
--   'Principal',
--   'administrador'
-- );
--
-- Con esto el administrador podrá iniciar sesión y crear los demás usuarios
-- desde el panel de administración del sistema.
-- ============================================================
