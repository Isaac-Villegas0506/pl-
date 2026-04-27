import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import GestionPreguntasContent from './GestionPreguntasContent'
import type { PreguntaConOpciones } from '@/types/app.types'

export default async function GestionPreguntasPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = (await createClient()) as any

  const { data: lecturaData } = await sb
    .from('lecturas')
    .select('id, titulo')
    .eq('id', id)
    .single()

  if (!lecturaData) notFound()

  const { data: preguntasData } = await sb
    .from('preguntas')
    .select(`
      id, lectura_id, enunciado, tipo, puntaje, orden, imagen_url, activo, created_at,
      opciones_respuesta ( id, pregunta_id, texto, es_correcta, orden )
    `)
    .eq('lectura_id', id)
    .order('orden', { ascending: true })

  const preguntas: PreguntaConOpciones[] = ((preguntasData ?? []) as Array<{
    id: string; lectura_id: string; enunciado: string; tipo: string
    puntaje: number; orden: number; imagen_url: string | null
    activo: boolean; created_at: string
    opciones_respuesta: Array<{
      id: string; pregunta_id: string; texto: string; es_correcta: boolean; orden: number
    }>
  }>).map(p => ({
    id: p.id,
    lectura_id: p.lectura_id,
    enunciado: p.enunciado,
    tipo: p.tipo as PreguntaConOpciones['tipo'],
    puntaje: p.puntaje,
    orden: p.orden,
    imagen_url: p.imagen_url,
    activo: p.activo,
    created_at: p.created_at,
    opciones: (p.opciones_respuesta ?? []).sort((a, b) => a.orden - b.orden),
  }))

  return (
    <GestionPreguntasContent
      lectura={{ id: lecturaData.id as string, titulo: lecturaData.titulo as string }}
      preguntas={preguntas}
    />
  )
}
