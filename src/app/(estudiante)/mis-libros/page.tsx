import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import MisLibrosContent from './MisLibrosContent'

export default async function MisLibrosPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: usuarioAuth } = await supabase.from('usuarios').select('id').eq('auth_id', user.id).single()
  const estudianteId = (usuarioAuth as any)?.id
  if (!estudianteId) redirect('/login')

  // Obtener asignaciones activas (con el progreso del estudiante si existe)
  const [
    { data: asignacionesActivas },
    { data: historial },
    { data: descargasOffline },
    { data: statsRaw }
  ] = await Promise.all([
    // Asignaciones activas con JOINs
    (supabase as any)
      .from('asignaciones_lectura')
      .select(`
        id,
        lectura_id,
        aula_id,
        fecha_asignacion,
        fecha_limite,
        activo,
        lectura:lecturas(id, titulo, autor, portada_url, pdf_url, materia:materias(nombre, color)),
        intentos:intentos_lectura(id, estado, porcentaje_progreso, nota_final, nota_automatica, completado_en)
      `)
      .eq('activo', true)
      .order('fecha_limite', { ascending: true, nullsFirst: false }),
    
    // Historial completado
    (supabase as any)
      .from('intentos_lectura')
      .select(`
        id,
        lectura_id,
        estado,
        nota_final,
        nota_automatica,
        updated_at,
        lectura:lecturas(id, titulo, autor, portada_url)
      `)
      .eq('estudiante_id', estudianteId)
      .eq('estado', 'completado')
      .order('updated_at', { ascending: false })
      .limit(20),

    // Descargas offline activas
    (supabase as any)
      .from('descargas_offline')
      .select(`
        id,
        lectura_id,
        archivo_nombre,
        archivo_tamanio,
        descargado_en,
        ultima_apertura,
        activa,
        lectura:lecturas(id, titulo, autor)
      `)
      .eq('estudiante_id', estudianteId)
      .eq('activa', true),
      
    // Stats
    (supabase as any)
      .from('estadisticas_estudiante')
      .select('total_lecturas_completadas, promedio_notas')
      .eq('estudiante_id', estudianteId)
      .maybeSingle()
  ])

  // Formatear asignaciones
  const asignacionesConProgreso = (asignacionesActivas || []).map((asig: any) => {
    // Buscar si el estudiante tiene un intento para esta lectura/asignación
    const intentoEstudiante = asig.intentos?.find((i: any) => i.estudiante_id === estudianteId) || asig.intentos?.[0]
    
    return {
      ...asig,
      estado: intentoEstudiante?.estado || 'pendiente',
      porcentaje_progreso: intentoEstudiante?.porcentaje_progreso || 0,
      nota: intentoEstudiante?.nota_final ?? intentoEstudiante?.nota_automatica ?? null,
      completado_en: intentoEstudiante?.completado_en || null
    }
  })

  const stats = {
    leidas: statsRaw?.total_lecturas_completadas || 0,
    promedio: statsRaw?.promedio_notas || 0,
    enProgreso: asignacionesConProgreso.filter((a: any) => a.estado === 'en_progreso').length
  }

  return (
    <MisLibrosContent
      asignacionesActivas={asignacionesConProgreso}
      historial={historial || []}
      descargasOffline={descargasOffline || []}
      stats={stats}
      estudianteId={estudianteId}
    />
  )
}
