import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'
import type { LecturaDetalleCompleta, ProgresoLectura, AsignacionDetalle } from './types'

type TypedClient = SupabaseClient<Database>

export async function getLecturaDetalle(
  supabase: TypedClient,
  lecturaId: string
): Promise<LecturaDetalleCompleta | null> {
  try {
    const { data, error } = await supabase
      .from('lecturas')
      .select(`
        id, titulo, autor, descripcion, portada_url,
        paginas_total, anio_publicacion, es_global, estado,
        materia_id, categoria_id, grado_id,
        materias ( nombre, color ),
        categorias ( nombre ),
        grados ( nombre )
      `)
      .eq('id', lecturaId)
      .maybeSingle()

    if (error || !data) return null

    const row = data as Record<string, unknown>

    const { data: archivosRaw } = await supabase
      .from('lectura_archivos')
      .select('id, url, tipo, nombre')
      .eq('lectura_id', lecturaId)
      .order('orden')

    const archivos = ((archivosRaw as Record<string, unknown>[] | null) ?? []).map((a) => ({
      id: a.id as string,
      url: a.url as string,
      tipo: a.tipo as string,
      nombre: (a.nombre as string | null) ?? null,
    }))

    return {
      id: row.id as string,
      titulo: row.titulo as string,
      autor: row.autor as string,
      descripcion: (row.descripcion as string | null) ?? null,
      portada_url: (row.portada_url as string | null) ?? null,
      paginas_total: (row.paginas_total as number | null) ?? null,
      anio_publicacion: (row.anio_publicacion as number | null) ?? null,
      es_global: row.es_global as boolean,
      estado: row.estado as string,
      materias: row.materias as { nombre: string; color: string | null } | null,
      categorias: row.categorias as { nombre: string } | null,
      grados: row.grados as { nombre: string } | null,
      archivos,
      tiempo_lectura_min: null,
    }
  } catch {
    return null
  }
}

export async function getProgresoLectura(
  supabase: TypedClient,
  estudianteId: string,
  lecturaId: string
): Promise<ProgresoLectura | null> {
  try {
    const { data } = await supabase
      .from('progreso_lectura')
      .select('id, pagina_actual, paginas_total, porcentaje, terminado, updated_at')
      .eq('estudiante_id', estudianteId)
      .eq('lectura_id', lecturaId)
      .maybeSingle()

    if (!data) return null
    const row = data as Record<string, unknown>

    return {
      id: row.id as string,
      pagina_actual: row.pagina_actual as number,
      paginas_total: (row.paginas_total as number | null) ?? null,
      porcentaje: row.porcentaje as number,
      terminado: row.terminado as boolean,
      updated_at: row.updated_at as string,
    }
  } catch {
    return null
  }
}

export async function getAsignacionActiva(
  supabase: TypedClient,
  estudianteId: string,
  lecturaId: string
): Promise<AsignacionDetalle | null> {
  try {
    const { data: matricula } = await supabase
      .from('matriculas')
      .select('aula_id')
      .eq('estudiante_id', estudianteId)
      .eq('estado', 'activo')
      .limit(1)
      .maybeSingle()

    if (!matricula) return null
    const aulaId = (matricula as Record<string, unknown>).aula_id as string

    const { data } = await supabase
      .from('asignaciones_lectura')
      .select(`
        id, instrucciones, fecha_inicio, fecha_limite, estado,
        bimestres ( nombre )
      `)
      .eq('lectura_id', lecturaId)
      .eq('aula_id', aulaId)
      .eq('estado', 'activo')
      .maybeSingle()

    if (!data) return null
    const row = data as Record<string, unknown>

    return {
      id: row.id as string,
      instrucciones: (row.instrucciones as string | null) ?? null,
      fecha_inicio: row.fecha_inicio as string,
      fecha_limite: (row.fecha_limite as string | null) ?? null,
      estado: row.estado as string,
      bimestre: row.bimestres as { nombre: string } | null,
    }
  } catch {
    return null
  }
}

export async function getTotalPreguntas(
  supabase: TypedClient,
  lecturaId: string
): Promise<number> {
  try {
    const { count } = await supabase
      .from('preguntas')
      .select('*', { count: 'exact', head: true })
      .eq('lectura_id', lecturaId)
      .eq('activo', true)

    return count ?? 0
  } catch {
    return 0
  }
}

export async function getEsFavorito(
  supabase: TypedClient,
  estudianteId: string,
  lecturaId: string
): Promise<boolean> {
  try {
    const { data } = await supabase
      .from('favoritos')
      .select('id')
      .eq('usuario_id', estudianteId)
      .eq('lectura_id', lecturaId)
      .maybeSingle()

    return !!data
  } catch {
    return false
  }
}
