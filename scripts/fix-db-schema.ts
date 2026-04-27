import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Cargar variables de entorno desde .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function fixSchema() {
  console.log('🔧 Iniciando ajuste de esquema en Supabase...\n')

  // Intentamos ejecutar SQL mediante RPC si existe, o probamos una técnica alternativa.
  // Como no tenemos RPC de SQL, intentaremos usar el cliente para detectar qué falta
  // y trataremos de informar al usuario o usar lo que hay.
  
  // Pero espera, si no puedo ejecutar ALTER TABLE, lo mejor es adaptar el script de creación
  // de aulas para que use lo que TIENE la base de datos, y luego ver si el frontend
  // realmente necesita esas columnas.
  
  // El frontend usa: .select('id, nombre, secciones ( id, nombre, aulas ( id, nombre, anio_lectivo ) )')
  // Esto falla si no hay relación.
  
  console.log('⚠️ No se puede ejecutar DDL (ALTER TABLE) directamente desde el cliente Supabase sin un RPC específico.')
  console.log('📝 Por favor, copia y pega el siguiente SQL en el SQL Editor de Supabase:')
  console.log(`
-- 1. Ajustar SECCIONES
ALTER TABLE secciones ADD COLUMN IF NOT EXISTS grado_id UUID REFERENCES grados(id);

-- 2. Ajustar AULAS
ALTER TABLE aulas ADD COLUMN IF NOT EXISTS seccion_id UUID REFERENCES secciones(id);
ALTER TABLE aulas ADD COLUMN IF NOT EXISTS anio_lectivo INTEGER DEFAULT 2026;
ALTER TABLE aulas ADD COLUMN IF NOT EXISTS capacidad INTEGER DEFAULT 35;
ALTER TABLE aulas ADD COLUMN IF NOT EXISTS activa BOOLEAN DEFAULT true;

-- 3. Crear relación UNIQUE para evitar duplicados
-- ALTER TABLE aulas ADD CONSTRAINT unique_aula UNIQUE(grado_id, seccion_id, anio_lectivo);
  `)
}

fixSchema().catch(console.error)
