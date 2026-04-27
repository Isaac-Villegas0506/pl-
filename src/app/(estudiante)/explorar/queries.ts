import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'
import type { LecturaConRelaciones } from '@/types/app.types'
import type { FiltrosOpciones, FiltrosActivos } from './types'
import { APP_CONFIG } from '@/lib/constants'

type TypedClient = SupabaseClient<Database>

export async function getFiltrosOpciones(supabase: TypedClient): Promise<FiltrosOpciones> {
  const [gradosRes, materiasRes, autoresRes] = await Promise.all([
    supabase.from('grados').select('id, nombre, orden').order('orden'),
    supabase.from('materias').select('id, nombre, color').order('nombre'),
    supabase.from('lecturas').select('autor').eq('es_global', true).eq('estado', 'publicado'),
  ])

  const grados = ((gradosRes.data as Record<string, unknown>[] | null) ?? [])
    .filter((g) => (g.nombre as string).toLowerCase().includes('secundaria'))
    .map((g) => ({
      id: g.id as string,
      nombre: g.nombre as string,
      orden: (g.orden as number) ?? 0,
    }))

  const materias = ((materiasRes.data as Record<string, unknown>[] | null) ?? []).map((m) => ({
    id: m.id as string,
    nombre: m.nombre as string,
    color: (m.color as string | null) ?? null,
  }))

  const autoresRaw = (autoresRes.data as Record<string, unknown>[] | null) ?? []
  const autoresSet = new Set(autoresRaw.map((a) => a.autor as string))
  const autores = Array.from(autoresSet)
    .sort((a, b) => a.localeCompare(b))
    .map((autor) => ({ autor }))

  return { grados, materias, niveles: [], autores }
}

export async function getLecturasExplorar(
  supabase: TypedClient,
  filtros: FiltrosActivos,
  page: number
): Promise<{ data: LecturaConRelaciones[]; count: number }> {
  const pageSize = APP_CONFIG.PAGINADO
  const from = page * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('lecturas')
    .select(
      `
      id,
      titulo,
      autor,
      descripcion,
      portada_url,
      es_global,
      estado,
      materia_id,
      categoria_id,
      grado_id,
      materias ( nombre, color ),
      categorias ( nombre ),
      grados ( nombre )
    `,
      { count: 'exact' }
    )
    .eq('es_global', true)
    .eq('estado', 'publicado')

  if (filtros.q) {
    query = query.or(`titulo.ilike.%${filtros.q}%,autor.ilike.%${filtros.q}%`)
  }
  if (filtros.grado) {
    query = query.eq('grado_id', filtros.grado)
  }
  if (filtros.materia) {
    query = query.eq('materia_id', filtros.materia)
  }
  if (filtros.autor) {
    query = query.ilike('autor', `%${filtros.autor}%`)
  }

  query = query.order('created_at', { ascending: false }).range(from, to)

  const { data, count, error } = await query

  if (error || !data) return { data: [], count: 0 }

  const lecturas: LecturaConRelaciones[] = (data as Record<string, unknown>[]).map((row) => ({
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

  return { data: lecturas, count: count ?? 0 }
}
