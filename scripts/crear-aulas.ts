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

async function crearAulas() {
  console.log('🔄 Iniciando creación de Grados, Secciones y Aulas...\n')

  const gradosParaCrear = [
    { nombre: '1° Secundaria', orden: 7 },
    { nombre: '2° Secundaria', orden: 8 },
    { nombre: '3° Secundaria', orden: 9 },
    { nombre: '4° Secundaria', orden: 10 },
    { nombre: '5° Secundaria', orden: 11 },
  ]
  const nombresSecciones = ['A', 'B', 'C', 'D', 'E']
  const anioLectivo = 2026

  for (const g of gradosParaCrear) {
    console.log(`\n🎓 Procesando ${g.nombre}...`)
    
    // 1. Grado
    let { data: grado } = await (supabase as any)
      .from('grados')
      .select('id')
      .eq('nombre', g.nombre)
      .maybeSingle()

    if (!grado) {
      const { data: nuevoGrado, error: errG } = await (supabase as any)
        .from('grados')
        .insert({ nombre: g.nombre, orden: g.orden })
        .select('id')
        .single()
      
      if (errG) {
        console.error(`   ❌ Error grado:`, errG.message)
        continue
      }
      grado = nuevoGrado
    }

    // 2. Secciones
    for (const sNombre of nombresSecciones) {
      let { data: seccion } = await (supabase as any)
        .from('secciones')
        .select('id')
        .eq('grado_id', grado.id)
        .eq('nombre', sNombre)
        .maybeSingle()

      if (!seccion) {
        const { data: nuevaSec, error: errS } = await (supabase as any)
          .from('secciones')
          .insert({ grado_id: grado.id, nombre: sNombre })
          .select('id')
          .single()
        
        if (errS) {
          console.error(`      ❌ Error sección ${sNombre}:`, errS.message)
          continue
        }
        seccion = nuevaSec
      }

      // 3. Aula
      const { error: errA } = await (supabase as any)
        .from('aulas')
        .insert({
          seccion_id: seccion.id,
          grado_id: grado.id,
          anio_lectivo: anioLectivo,
          nombre: sNombre // Opcional: "Sección A"
        })
      
      if (errA && !errA.message.includes('duplicate key')) {
        console.error(`         ❌ Error aula ${sNombre}:`, errA.message)
      } else {
        console.log(`      ✅ Sección ${sNombre} lista.`)
      }
    }
  }

  console.log('\n✨ Proceso finalizado. Si el script falló por columnas faltantes, ejecuta el SQL de 01_estructuras_v2.sql en Supabase.')
}

crearAulas().catch(console.error)
