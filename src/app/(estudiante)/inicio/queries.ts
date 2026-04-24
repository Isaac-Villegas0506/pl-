import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'
import type { LecturaConRelaciones } from '@/types/app.types'
import type { LecturaEnProgresoConDetalle, AsignacionConLectura } from './types'

type TypedClient = SupabaseClient<Database>

export async function getLecturaEnProgreso(
  supabase: TypedClient,
  estudianteId: string
): Promise<LecturaEnProgresoConDetalle | null> {
  try {
    const { data, error } = await supabase
      .from('progreso_lectura')
      .select(`
        id,
        lectura_id,
        porcentaje,
        pagina_actual,
        paginas_total,
        updated_at,
        lecturas (
          id,
          titulo,
          autor,
          portada_url,
          categorias ( nombre )
        )
      `)
      .eq('estudiante_id', estudianteId)
      .eq('terminado', false)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error || !data) return null

    const raw = data as Record<string, unknown>
    const lectura = raw.lecturas as Record<string, unknown> | null
    const categoria = lectura?.categorias as Record<string, unknown> | null

    return {
      progreso_id: raw.id as string,
      lectura_id: raw.lectura_id as string,
      titulo: (lectura?.titulo as string) ?? '',
      autor: (lectura?.autor as string) ?? '',
      portada_url: (lectura?.portada_url as string | null) ?? null,
      porcentaje: raw.porcentaje as number,
      pagina_actual: raw.pagina_actual as number,
      paginas_total: (raw.paginas_total as number | null) ?? null,
      categoria_nombre: (categoria?.nombre as string | null) ?? null,
      asignacion_id: null,
      updated_at: raw.updated_at as string,
    }
  } catch {
    return null
  }
}

export async function getRecomendados(
  supabase: TypedClient,
  _estudianteId: string
): Promise<LecturaConRelaciones[]> {
  try {
    const { data, error } = await supabase
      .from('lecturas')
      .select(`
        id,
        titulo,
        autor,
        descripcion,
        portada_url,
        es_global,
        estado,
        materias ( nombre, color ),
        categorias ( nombre ),
        grados ( nombre )
      `)
      .eq('es_global', true)
      .eq('estado', 'publicado')
      .order('created_at', { ascending: false })
      .limit(6)

    if (error || !data) return []

    return (data as Record<string, unknown>[]).map((row) => ({
      id: row.id as string,
      titulo: row.titulo as string,
      autor: row.autor as string,
      descripcion: (row.descripcion as string | null) ?? null,
      portada_url: (row.portada_url as string | null) ?? null,
      es_global: row.es_global as boolean,
      estado: row.estado as 'borrador' | 'publicado' | 'archivado',
      materias: row.materias as { nombre: string; color: string | null } | null,
      categorias: row.categorias as { nombre: string } | null,
      niveles_dificultad: null,
      grados: row.grados as { nombre: string } | null,
    }))
  } catch {
    return []
  }
}

export async function getPendientes(
  supabase: TypedClient,
  estudianteId: string
): Promise<AsignacionConLectura[]> {
  try {
    const { data: matricula } = await supabase
      .from('matriculas')
      .select('aula_id')
      .eq('estudiante_id', estudianteId)
      .eq('estado', 'activo')
      .limit(1)
      .maybeSingle()

    if (!matricula) return []

    const aulaId = (matricula as Record<string, unknown>).aula_id as string

    const { data: asignaciones, error } = await supabase
      .from('asignaciones_lectura')
      .select(`
        id,
        fecha_limite,
        instrucciones,
        lecturas (
          id,
          titulo,
          autor,
          portada_url,
          materias ( nombre, color )
        )
      `)
      .eq('aula_id', aulaId)
      .eq('estado', 'activo')
      .order('fecha_limite', { ascending: true, nullsFirst: false })
      .limit(3)

    if (error || !asignaciones) return []

    const { data: intentosCompletados } = await supabase
      .from('intentos_lectura')
      .select('asignacion_id')
      .eq('estudiante_id', estudianteId)
      .eq('estado', 'completado')

    const completadosIds = new Set(
      ((intentosCompletados as Record<string, unknown>[] | null) ?? []).map(
        (i) => i.asignacion_id as string
      )
    )

    const hoy = new Date()

    return (asignaciones as Record<string, unknown>[])
      .filter((a) => !completadosIds.has(a.id as string))
      .map((a) => {
        const lectura = a.lecturas as Record<string, unknown> | null
        const materia = lectura?.materias as Record<string, unknown> | null
        const fechaLimite = a.fecha_limite as string | null

        let diasRestantes: number | null = null
        if (fechaLimite) {
          const diff = new Date(fechaLimite).getTime() - hoy.getTime()
          diasRestantes = Math.ceil(diff / (1000 * 60 * 60 * 24))
        }

        return {
          asignacion_id: a.id as string,
          lectura_id: (lectura?.id as string) ?? '',
          titulo: (lectura?.titulo as string) ?? '',
          autor: (lectura?.autor as string) ?? '',
          portada_url: (lectura?.portada_url as string | null) ?? null,
          fecha_limite: fechaLimite,
          instrucciones: (a.instrucciones as string | null) ?? null,
          materia_nombre: (materia?.nombre as string | null) ?? null,
          materia_color: (materia?.color as string | null) ?? null,
          dias_restantes: diasRestantes,
        }
      })
  } catch {
    return []
  }
}

export async function getNotificacionesCount(
  supabase: TypedClient,
  usuarioId: string
): Promise<number> {
  try {
    const { count } = await supabase
      .from('notificaciones')
      .select('*', { count: 'exact', head: true })
      .eq('usuario_id', usuarioId)
      .eq('leida', false)

    return count ?? 0
  } catch {
    return 0
  }
}
