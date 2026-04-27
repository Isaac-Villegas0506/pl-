import { createClient } from '@/lib/supabase/server'
import ContenidoContent from './ContenidoContent'
import type { LecturaAdminResumen, ItemCatalogo } from '../types'

export default async function ContenidoPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = (await createClient()) as any

  const [
    { count: totalLecturas },
    { count: totalPreguntas },
    { data: lecturasData },
    { data: materiasData },
    { data: categoriasData },
    { data: gradosData },
    { data: nivelesData },
  ] = await Promise.all([
    sb.from('lecturas').select('id', { count: 'exact', head: true }),
    sb.from('preguntas').select('id', { count: 'exact', head: true }),
    sb.from('lecturas')
      .select(`
        id, titulo, autor, estado, portada_url, es_global, created_at,
        materias ( nombre ),
        grados ( nombre )
      `)
      .order('created_at', { ascending: false })
      .limit(50),
    sb.from('materias').select('id, nombre, color').order('nombre'),
    sb.from('categorias').select('id, nombre').order('nombre'),
    sb.from('grados').select('id, nombre').order('nombre'),
    sb.from('niveles_dificultad').select('id, nombre').order('nombre'),
  ])

  const lecturasRaw = (lecturasData ?? []) as Array<{
    id: string; titulo: string; autor: string; estado: string
    portada_url: string | null; es_global: boolean; created_at: string
    materias: { nombre: string } | null
    grados: { nombre: string } | null
  }>

  const preguntasCounts = await Promise.all(
    lecturasRaw.slice(0, 50).map(async l => {
      const { count } = await sb
        .from('preguntas')
        .select('id', { count: 'exact', head: true })
        .eq('lectura_id', l.id)
      const { count: asig } = await sb
        .from('asignaciones_lectura')
        .select('id', { count: 'exact', head: true })
        .eq('lectura_id', l.id)
        .eq('estado', 'activo')
      return { id: l.id, preguntas: (count as number) ?? 0, asignaciones: (asig as number) ?? 0 }
    })
  )

  const countMap = Object.fromEntries(preguntasCounts.map(p => [p.id, p]))

  const lecturas: LecturaAdminResumen[] = lecturasRaw.map(l => ({
    id: l.id,
    titulo: l.titulo,
    autor: l.autor,
    estado: l.estado as LecturaAdminResumen['estado'],
    portada_url: l.portada_url,
    es_global: l.es_global,
    total_preguntas: countMap[l.id]?.preguntas ?? 0,
    total_asignaciones: countMap[l.id]?.asignaciones ?? 0,
    materia_nombre: l.materias?.nombre ?? null,
    grado_nombre: l.grados?.nombre ?? null,
    created_at: l.created_at,
  }))

  const materias: ItemCatalogo[] = (materiasData ?? []) as ItemCatalogo[]
  const categorias: ItemCatalogo[] = (categoriasData ?? []) as ItemCatalogo[]
  const grados: ItemCatalogo[] = (gradosData ?? []) as ItemCatalogo[]
  const niveles: ItemCatalogo[] = (nivelesData ?? []) as ItemCatalogo[]

  return (
    <ContenidoContent
      lecturas={lecturas}
      stats={{
        totalLecturas: (totalLecturas as number) ?? 0,
        totalPreguntas: (totalPreguntas as number) ?? 0,
      }}
      catalogos={{ materias, categorias, grados, niveles }}
    />
  )
}
