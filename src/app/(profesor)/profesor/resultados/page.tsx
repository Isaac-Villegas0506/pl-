import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ResultadosContent from './ResultadosContent'
import type { AsignacionResumen, IntentoConDatos } from '../types'

interface Props {
  searchParams: Promise<{ asignacion?: string; lectura_id?: string; filtro?: string }>
}

export default async function ResultadosPage({ searchParams }: Props) {
  const { asignacion, filtro } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: perfilData } = await supabase
    .from('usuarios').select('id').eq('auth_id', user.id).single()
  const profesor = perfilData as { id: string } | null
  if (!profesor) redirect('/login')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabaseAny = supabase as any

  // Asignaciones del profesor
  const { data: asignacionesRaw } = await supabaseAny
    .from('asignaciones_lectura')
    .select(`
      id, lectura_id, estado,
      lecturas ( titulo, portada_url ),
      aulas ( nombre, secciones ( nombre, grados ( nombre ) ) )
    `)
    .eq('profesor_id', profesor.id)
    .order('created_at', { ascending: false })

  const asignacionesArr = (asignacionesRaw ?? []) as any[]
  const asignacionIds = asignacion
    ? asignacionesArr.filter(a => a.id === asignacion).map(a => a.id)
    : asignacionesArr.map(a => a.id)

  // Intentos de esas asignaciones
  const { data: intentosRaw } = await supabaseAny
    .from('intentos_lectura')
    .select(`
      id, asignacion_id, estudiante_id, estado,
      nota_automatica, nota_final, fecha_completado,
      usuarios ( nombre, apellido )
    `)
    .in('asignacion_id', asignacionIds.slice(0, 50))
    .order('fecha_completado', { ascending: false })

  const intentos = (intentosRaw ?? []) as any[]

  // Construir AsignacionResumen con sus intentos
  const asignacionesConStats: (AsignacionResumen & { intentos: IntentoConDatos[] })[] = asignacionesArr.map(a => {
    const intDeLaAsig = intentos.filter(i => i.asignacion_id === a.id)
    const completados = intDeLaAsig.filter(i => i.estado === 'completado' || i.estado === 'revisando').length
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
      fecha_limite: null,
      total_estudiantes: intDeLaAsig.length,
      completados,
      porcentaje: intDeLaAsig.length > 0 ? Math.round((completados / intDeLaAsig.length) * 100) : 0,
      estado: (a.estado as 'activo' | 'cerrado' | 'cancelado') || 'activo',
      intentos: intDeLaAsig.map(i => ({
        id: i.id as string,
        estudiante_id: i.estudiante_id as string,
        estudiante_nombre: (i.usuarios as any)?.nombre ?? '',
        estudiante_apellido: (i.usuarios as any)?.apellido ?? '',
        asignacion_id: i.asignacion_id as string,
        estado: i.estado as string,
        nota_automatica: i.nota_automatica as number | null,
        nota_final: i.nota_final as number | null,
        fecha_completado: i.fecha_completado as string | null,
      })),
    }
  })

  // Pendientes de revisión
  const pendientes: IntentoConDatos[] = intentos
    .filter(i => i.estado === 'revisando')
    .map(i => {
      const asig = asignacionesArr.find(a => a.id === i.asignacion_id)
      return {
        id: i.id as string,
        estudiante_id: i.estudiante_id as string,
        estudiante_nombre: (i.usuarios as any)?.nombre ?? '',
        estudiante_apellido: (i.usuarios as any)?.apellido ?? '',
        asignacion_id: i.asignacion_id as string,
        estado: i.estado as string,
        nota_automatica: i.nota_automatica as number | null,
        nota_final: i.nota_final as number | null,
        fecha_completado: i.fecha_completado as string | null,
        lectura_titulo: (asig?.lecturas as any)?.titulo ?? 'Sin título',
      }
    })

  return (
    <ResultadosContent
      asignaciones={asignacionesConStats}
      pendientes={pendientes}
      filtroInicial={filtro === 'pendientes' ? 'pendientes' : 'asignaciones'}
    />
  )
}
