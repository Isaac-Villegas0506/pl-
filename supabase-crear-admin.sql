-- ============================================================
-- CREAR PRIMER ADMINISTRADOR — Plan de Lectura
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

-- PASO 1: Verificar que la tabla usuarios existe
-- Si da error aquí, primero ejecuta supabase-setup.sql
SELECT COUNT(*) as total_usuarios FROM usuarios;

-- ============================================================
-- PASO 2: Crear usuario de autenticación Y perfil en un solo paso
-- ============================================================
-- IMPORTANTE: Supabase maneja las contraseñas internamente.
-- Nosotros solo creamos el registro en auth.users (con contraseña)
-- y luego insertamos el perfil en nuestra tabla usuarios.

-- Primero creamos el usuario en auth.users usando la función de Supabase
-- Cambia el email y password si quieres:

DO $$
DECLARE
  new_user_id UUID;
BEGIN
  -- Crear usuario en auth.users con email y contraseña
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'admin@planlectura.com',                          -- ← TU EMAIL
    crypt('Admin123!', gen_salt('bf')),                -- ← TU CONTRASEÑA
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  )
  RETURNING id INTO new_user_id;

  -- Crear perfil en nuestra tabla usuarios
  INSERT INTO usuarios (auth_id, email, nombre, apellido, rol, activo)
  VALUES (
    new_user_id,
    'admin@planlectura.com',                          -- ← MISMO EMAIL
    'Admin',                                           -- ← NOMBRE
    'Principal',                                       -- ← APELLIDO
    'administrador',
    true
  );

  RAISE NOTICE 'Usuario administrador creado con éxito. Auth ID: %', new_user_id;
END $$;

-- ============================================================
-- VERIFICAR que se creó correctamente
-- ============================================================
SELECT u.id, u.email, u.nombre, u.apellido, u.rol, u.activo, u.auth_id
FROM usuarios u
WHERE u.email = 'admin@planlectura.com';

-- ============================================================
-- CREDENCIALES PARA INICIAR SESIÓN:
--   Email:    admin@planlectura.com
--   Password: Admin123!
-- ============================================================
