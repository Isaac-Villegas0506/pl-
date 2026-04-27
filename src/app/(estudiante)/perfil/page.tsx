import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PerfilContent from './PerfilContent'
import {
  UsuarioPerfil,
  EstadisticasEstudiante,
  LogroDesbloqueado
} from './types'

export default async function PerfilPage() {
  const supabase = await createClient()

  // 1. Obtener usuario de la sesión
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: usuarioAuth } = await supabase.from('usuarios').select('id').eq('auth_id', user.id).single()
  const estudianteId = (usuarioAuth as any)?.id

  if (!estudianteId) redirect('/login')

  // 2. Ejecutar consultas en paralelo
  const [
    { data: usuario },
    { data: statsData },
    { data: logrosDesbloqueados },
    { data: rachaDias },
    { data: topNotas },
    { count: totalLogrosDisponibles }
  ] = await Promise.all([
    // a) Datos completos del usuario
    (supabase as any)
      .from('usuarios')
      .select('id, auth_id, nombre, apellido, email, avatar_url, bio, color_perfil, created_at, rol')
      .eq('auth_id', user.id)
      .single(),

    // b) Estadísticas (obtener o crear)
    (supabase as any)
      .from('estadisticas_estudiante')
      .select('*')
      .eq('estudiante_id', estudianteId)
      .maybeSingle(),

    // c) Logros desbloqueados
    (supabase as any)
      .from('estudiante_logros')
      .select(`
        id,
        logro_id,
        desbloqueado_en,
        logro:logros (*)
      `)
      .eq('estudiante_id', estudianteId)
      .order('desbloqueado_en', { ascending: false }),

    // d) Racha de los últimos 60 días
    (supabase as any)
      .from('racha_lectura')
      .select('fecha')
      .eq('estudiante_id', estudianteId)
      .gte('fecha', new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('fecha', { ascending: false }),

    // e) Top 3 notas
    (supabase as any)
      .from('intentos_lectura')
      .select(`
        id,
        nota_final,
        fecha_fin,
        asignacion:asignaciones_lectura(
          lectura:lecturas(titulo)
        )
      `)
      .eq('estudiante_id', estudianteId)
      .not('nota_final', 'is', null)
      .order('nota_final', { ascending: false })
      .limit(3),

    // f) Total de logros disponibles
    (supabase as any)
      .from('logros')
      .select('*', { count: 'exact', head: true })
      .eq('activo', true)
  ])

  if (!usuario) redirect('/login')

  // Procesar racha
  const fechasRacha = new Set(rachaDias?.map((d: any) => d.fecha) || [])
  let rachaActual = 0
  const cursor = new Date()

  while (true) {
    const fechaStr = cursor.toISOString().split('T')[0]
    if (fechasRacha.has(fechaStr)) {
      rachaActual++
      cursor.setDate(cursor.getDate() - 1)
    } else {
      break
    }
  }

  // Si las estadísticas no existen, crearlas (o usar defaults)
  const stats: EstadisticasEstudiante = statsData || {
    estudiante_id: (usuario as any).id,
    total_lecturas_completadas: 0,
    total_evaluaciones: 0,
    promedio_notas: 0,
    mejor_nota: 0,
    racha_actual: rachaActual,
    racha_maxima: rachaActual,
    total_puntos_logros: 0,
    ultimo_acceso: new Date().toISOString().split('T')[0]
  }

  // Formatear top notas
  const topNotasFormat = (topNotas || []).map((nota: any) => ({
    titulo: nota.asignacion?.lectura?.titulo || 'Lectura',
    nota: Number(nota.nota_final) || 0,
    fecha: nota.fecha_fin
  }))

  return (
    <PerfilContent
      usuario={usuario as UsuarioPerfil}
      stats={stats}
      logrosDesbloqueados={(logrosDesbloqueados as any) || []}
      totalLogrosDisponibles={totalLogrosDisponibles || 0}
      rachaActual={rachaActual}
      rachaMaxima={stats.racha_maxima || rachaActual}
      diasRacha={Array.from(fechasRacha) as string[]}
      topNotas={topNotasFormat}
    />
  )
}
