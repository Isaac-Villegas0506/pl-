import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AsignacionesContent from './AsignacionesContent'
import type { AsignacionResumen } from '../types'

export default async function AsignacionesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: perfilData } = await supabase
    .from('usuarios').select('id').eq('auth_id', user.id).single()
  const profesor = perfilData as { id: string } | null
  if (!profesor) redirect('/login')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabaseAny = supabase as any

  const { data: asignacionesRaw } = await supabaseAny
    .from('asignaciones_lectura')
    .select(`
      id, lectura_id, fecha_limite, fecha_inicio, estado, instrucciones,
      lecturas ( titulo, portada_url ),
      aulas ( id, nombre, anio_lectivo, secciones ( nombre, grados ( nombre ) ) )
    `)
    .eq('profesor_id', profesor.id)
    .order('created_at', { ascending: false })

  const asignacionesArr = (asignacionesRaw ?? []) as any[]

  const asignaciones: AsignacionResumen[] = await Promise.all(
    asignacionesArr.map(async (a) => {
      const { count: completados } = await supabaseAny
        .from('intentos_lectura')
        .select('id', { count: 'exact', head: true })
        .eq('asignacion_id', a.id)
        .in('estado', ['completado', 'revisando'])

      const aula = a.aulas as any
      const seccion = aula?.secciones as any
      const grado = seccion?.grados as any

      return {
        id: a.id as string,
        lectura_id: a.lectura_id as string,
        titulo: (a.lecturas as any)?.titulo ?? 'Sin título',
        portada_url: (a.lecturas as any)?.portada_url ?? null,
        aula_nombre: aula?.nombre ?? '',
        grado_nombre: grado?.nombre ?? '',
        fecha_limite: a.fecha_limite ?? null,
        total_estudiantes: 0,
        completados: (completados as number) || 0,
        porcentaje: 0,
        estado: (a.estado as 'activo' | 'cerrado' | 'cancelado') || 'activo',
      }
    })
  )

  const activas = asignaciones.filter(a => a.estado === 'activo')
  const cerradas = asignaciones.filter(a => a.estado !== 'activo')

  return (
    <AsignacionesContent
      activas={activas}
      cerradas={cerradas}
      profesorId={profesor.id}
    />
  )
}
