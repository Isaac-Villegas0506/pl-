import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardContent from './DashboardContent'
import type { AsignacionResumen, LecturaTopStat } from '../types'
import type { UsuarioSesion } from '@/types/app.types'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: perfilData } = await supabase
    .from('usuarios')
    .select('id, nombre, apellido, email, rol, auth_id, avatar_url')
    .eq('auth_id', user.id)
    .single()

  const profesor = perfilData as UsuarioSesion | null
  if (!profesor) redirect('/login')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabaseAny = supabase as any

  // Obtener asignaciones del profesor
  const { data: asignaciones } = await supabaseAny
    .from('asignaciones_lectura')
    .select(`
      id, lectura_id, fecha_limite, estado,
      lecturas ( titulo, portada_url ),
      aulas ( nombre, anio_lectivo, secciones ( nombre, grados ( nombre ) ) )
    `)
    .eq('profesor_id', profesor.id)
    .eq('estado', 'activo')
    .order('created_at', { ascending: false })

  const asignacionesArr = (asignaciones ?? []) as any[]

  // Para cada asignación, contar intentos
  const asignacionesConStats: AsignacionResumen[] = await Promise.all(
    asignacionesArr.slice(0, 8).map(async (a) => {
      const { count: total } = await supabaseAny
        .from('usuarios')
        .select('id', { count: 'exact', head: true })
        .eq('aula_id', a.aula_id ?? '')
        .eq('rol', 'estudiante')

      const { count: completados } = await supabaseAny
        .from('intentos_lectura')
        .select('id', { count: 'exact', head: true })
        .eq('asignacion_id', a.id)
        .in('estado', ['completado', 'revisando'])

      const t = (total as number) || 0
      const c = (completados as number) || 0
      const aula = a.aulas as any
      const seccion = aula?.secciones as any
      const grado = seccion?.grados as any

      return {
        id: a.id as string,
        lectura_id: a.lectura_id as string,
        titulo: (a.lecturas as any)?.titulo ?? 'Sin título',
        portada_url: (a.lecturas as any)?.portada_url ?? null,
        aula_nombre: aula?.nombre ?? `Aula ${a.aula_id?.slice(0, 4)}`,
        grado_nombre: grado?.nombre ?? '',
        fecha_limite: a.fecha_limite ?? null,
        total_estudiantes: t,
        completados: c,
        porcentaje: t > 0 ? Math.round((c / t) * 100) : 0,
        estado: 'activo',
      }
    })
  )

  // Stats globales
  const { count: totalAsignaciones } = await supabaseAny
    .from('asignaciones_lectura')
    .select('id', { count: 'exact', head: true })
    .eq('profesor_id', profesor.id)
    .eq('estado', 'activo')

  const { count: pendientesRevision } = await supabaseAny
    .from('intentos_lectura')
    .select('id', { count: 'exact', head: true })
    .eq('estado', 'revisando')
    .in('asignacion_id', asignacionesArr.map(a => a.id).slice(0, 50))

  const inicioMes = new Date()
  inicioMes.setDate(1)
  inicioMes.setHours(0, 0, 0, 0)

  const { count: completadosMes } = await supabaseAny
    .from('intentos_lectura')
    .select('id', { count: 'exact', head: true })
    .in('estado', ['completado', 'revisando'])
    .gte('fecha_completado', inicioMes.toISOString())
    .in('asignacion_id', asignacionesArr.map(a => a.id).slice(0, 50))

  const topLecturas: LecturaTopStat[] = asignacionesConStats
    .sort((a, b) => b.completados - a.completados)
    .slice(0, 3)
    .map(a => ({
      lectura_id: a.lectura_id,
      titulo: a.titulo,
      portada_url: a.portada_url,
      total_lecturas: a.completados,
    }))

  return (
    <DashboardContent
      profesor={profesor}
      stats={{
        asignacionesActivas: (totalAsignaciones as number) || 0,
        totalEstudiantes: asignacionesConStats.reduce((acc, a) => acc + a.total_estudiantes, 0),
        pendientesRevision: (pendientesRevision as number) || 0,
        completadosMes: (completadosMes as number) || 0,
      }}
      asignacionesRecientes={asignacionesConStats.slice(0, 5)}
      topLecturas={topLecturas}
    />
  )
}
