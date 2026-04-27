import { createClient } from '@/lib/supabase/server'
import ConfiguracionContent from './ConfiguracionContent'
import type { GradoConSecciones, BimestreAdmin, ConfigSistema } from '../types'

export default async function ConfiguracionPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = (await createClient()) as any

  const anioActual = new Date().getFullYear()

  const [
    { data: gradosData },
    { data: bimestresData },
    { data: configData },
  ] = await Promise.all([
    sb.from('grados')
      .select(`
        id, nombre,
        secciones (
          id, nombre,
          aulas ( id, nombre, anio_lectivo,
            estudiantes_aulas ( id )
          )
        )
      `)
      .order('nombre'),
    sb.from('bimestres')
      .select('id, nombre, fecha_inicio, fecha_fin, activo, anio_lectivo')
      .eq('anio_lectivo', anioActual)
      .order('nombre'),
    sb.from('config_sistema').select('*').limit(1).maybeSingle(),
  ])

  const grados: GradoConSecciones[] = ((gradosData ?? []) as Array<{
    id: string; nombre: string
    secciones: Array<{
      id: string; nombre: string
      aulas: Array<{
        id: string; nombre: string | null; anio_lectivo: number
        estudiantes_aulas: Array<{ id: string }>
      }>
    }>
  }>).map(g => ({
    id: g.id,
    nombre: g.nombre,
    total_estudiantes: g.secciones.reduce((sum, s) =>
      sum + s.aulas.reduce((s2, a) => s2 + a.estudiantes_aulas.length, 0), 0),
    secciones: g.secciones.map(s => ({
      id: s.id,
      nombre: s.nombre,
      aula_id: s.aulas[0]?.id ?? '',
      total_estudiantes: s.aulas.reduce((sum, a) => sum + a.estudiantes_aulas.length, 0),
    })),
  }))

  const bimestres: BimestreAdmin[] = ((bimestresData ?? []) as Array<{
    id: string; nombre: string; fecha_inicio: string | null
    fecha_fin: string | null; activo: boolean; anio_lectivo: number
  }>).map(b => ({
    id: b.id, nombre: b.nombre,
    fecha_inicio: b.fecha_inicio, fecha_fin: b.fecha_fin,
    activo: b.activo, anio_lectivo: b.anio_lectivo,
  }))

  const config: ConfigSistema = {
    nombre_institucion: configData?.nombre_institucion ?? 'Mi Institución',
    anio_lectivo: configData?.anio_lectivo ?? anioActual,
    permitir_registro: configData?.permitir_registro ?? false,
    nota_minima_aprobacion: configData?.nota_minima_aprobacion ?? 11,
    escala_maxima: configData?.escala_maxima ?? 20,
    correo_soporte: configData?.correo_soporte ?? '',
  }

  return (
    <ConfiguracionContent
      grados={grados}
      bimestres={bimestres}
      configInicial={config}
    />
  )
}
