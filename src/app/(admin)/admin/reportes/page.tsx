import { createClient } from '@/lib/supabase/server'
import ReportesContent from './ReportesContent'
import type { DataMensual, RendimientoPorGrado } from '../types'

export default async function ReportesPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = (await createClient()) as any

  const inicioMes = new Date()
  inicioMes.setDate(1); inicioMes.setHours(0, 0, 0, 0)

  const [
    { data: intentosData },
    { count: totalIntentos },
    { count: intentosMes },
    { data: lecturasAsignadas },
    { data: lecturasCompletadas },
    { data: gradosData },
  ] = await Promise.all([
    // Intentos de los últimos 6 meses para el gráfico
    sb.from('intentos_lectura')
      .select('fecha_completado')
      .in('estado', ['completado', 'revisando'])
      .gte('fecha_completado', new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString()),
    sb.from('intentos_lectura').select('id', { count: 'exact', head: true }).in('estado', ['completado', 'revisando']),
    sb.from('intentos_lectura').select('id', { count: 'exact', head: true }).in('estado', ['completado', 'revisando']).gte('fecha_completado', inicioMes.toISOString()),
    // Top lecturas asignadas
    sb.from('asignaciones_lectura')
      .select('lectura_id, lecturas ( titulo, portada_url )')
      .order('created_at', { ascending: false })
      .limit(100),
    // Top lecturas completadas
    sb.from('intentos_lectura')
      .select('asignacion_id, asignaciones_lectura ( lectura_id, lecturas ( titulo, portada_url ) )')
      .in('estado', ['completado', 'revisando'])
      .limit(200),
    // Grados para rendimiento
    sb.from('grados').select('id, nombre').order('nombre'),
  ])

  // Construir data mensual (últimos 6 meses)
  const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
  const conteoMeses: Record<string, number> = {}
  const hoy = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    conteoMeses[key] = 0
  }
  ;((intentosData ?? []) as Array<{ fecha_completado: string | null }>).forEach(item => {
    if (!item.fecha_completado) return
    const d = new Date(item.fecha_completado)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (key in conteoMeses) conteoMeses[key]++
  })

  const dataMensual: DataMensual[] = Object.entries(conteoMeses).map(([key, count]) => {
    const [year, month] = key.split('-')
    return { mes: MESES[parseInt(month, 10) - 1] + ' ' + year, count }
  })

  // Top 5 lecturas más asignadas
  const asigCount: Record<string, { titulo: string; portada_url: string | null; count: number }> = {}
  ;((lecturasAsignadas ?? []) as Array<{ lectura_id: string; lecturas: { titulo: string; portada_url: string | null } | null }>).forEach(a => {
    if (!a.lectura_id || !a.lecturas) return
    if (!asigCount[a.lectura_id]) asigCount[a.lectura_id] = { titulo: a.lecturas.titulo, portada_url: a.lecturas.portada_url, count: 0 }
    asigCount[a.lectura_id].count++
  })
  const topAsignadas = Object.entries(asigCount)
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 5)
    .map(([id, val]) => ({ id, titulo: val.titulo, portada_url: val.portada_url, valor: val.count }))

  // Top 5 lecturas más completadas
  const compCount: Record<string, { titulo: string; portada_url: string | null; count: number }> = {}
  ;((lecturasCompletadas ?? []) as Array<{ asignaciones_lectura: { lectura_id: string; lecturas: { titulo: string; portada_url: string | null } | null } | null }>).forEach(it => {
    const a = it.asignaciones_lectura
    if (!a?.lectura_id || !a.lecturas) return
    if (!compCount[a.lectura_id]) compCount[a.lectura_id] = { titulo: a.lecturas.titulo, portada_url: a.lecturas.portada_url, count: 0 }
    compCount[a.lectura_id].count++
  })
  const topCompletadas = Object.entries(compCount)
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 5)
    .map(([id, val]) => ({ id, titulo: val.titulo, portada_url: val.portada_url, valor: val.count }))

  // Rendimiento por grado (simplificado)
  const rendimientoPorGrado: RendimientoPorGrado[] = await Promise.all(
    ((gradosData ?? []) as Array<{ id: string; nombre: string }>).map(async g => {
      const { data: intentosGrado } = await sb
        .from('intentos_lectura')
        .select('nota_final, nota_automatica, asignaciones_lectura!inner( aulas!inner( secciones!inner( grado_id ) ) )')
        .in('estado', ['completado', 'revisando'])
        .eq('asignaciones_lectura.aulas.secciones.grado_id', g.id)
        .limit(200)

      const notas = ((intentosGrado ?? []) as Array<{ nota_final: number | null; nota_automatica: number | null }>)
        .map(i => i.nota_final ?? i.nota_automatica ?? 0)
        .filter(n => n > 0)

      const promedio = notas.length > 0 ? notas.reduce((a, b) => a + b, 0) / notas.length : 0
      const aprobados = notas.filter(n => n >= 11).length
      const tasa = notas.length > 0 ? Math.round((aprobados / notas.length) * 100) : 0

      return {
        grado_id: g.id,
        grado_nombre: g.nombre,
        promedio_nota: Math.round(promedio * 10) / 10,
        tasa_aprobacion: tasa,
        total_intentos: notas.length,
        secciones: [],
      }
    })
  )

  return (
    <ReportesContent
      stats={{
        totalIntentos: (totalIntentos as number) ?? 0,
        intentosMes: (intentosMes as number) ?? 0,
      }}
      dataMensual={dataMensual}
      topAsignadas={topAsignadas}
      topCompletadas={topCompletadas}
      rendimientoPorGrado={rendimientoPorGrado}
    />
  )
}
