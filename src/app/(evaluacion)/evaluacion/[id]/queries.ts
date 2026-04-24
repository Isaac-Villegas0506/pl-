/* eslint-disable @typescript-eslint/no-explicit-any */
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'
import type {
  AsignacionConLectura,
  PreguntaConOpciones,
  RespuestaDetalle,
} from './types'

type TypedClient = SupabaseClient<Database>

// ─── TIPOS DE FILAS ──────────────────────────────────────────────────────────

interface RespuestaCompletaRow {
  pregunta_id: string
  texto_respuesta: string | null
  es_correcta: boolean | null
  puntaje_obtenido: number | null
  opcion_id: string | null
  preguntas: { enunciado: string; tipo: string; puntaje: number } | null
  opciones_respuesta: { texto: string } | null
}

// ─── ASIGNACIÓN CON LECTURA ──────────────────────────────────────────────────

export async function getAsignacionConLectura(
  supabase: TypedClient,
  asignacionId: string
): Promise<AsignacionConLectura | null> {
  const { data, error } = await supabase
    .from('asignaciones_lectura')
    .select(`
      id,
      lectura_id,
      fecha_limite,
      instrucciones,
      lecturas (
        id,
        titulo,
        autor,
        portada_url,
        paginas_total
      ),
      materias (
        nombre
      )
    `)
    .eq('id', asignacionId)
    .maybeSingle()

  if (error || !data) return null

  const row = data as any
  const lectura = row.lecturas as {
    id: string; titulo: string; autor: string
    portada_url: string | null
  } | null
  const materia = row.materias as { nombre: string } | null

  if (!lectura) return null

  return {
    id: row.id,
    lectura_id: lectura.id,
    titulo: lectura.titulo,
    autor: lectura.autor,
    portada_url: lectura.portada_url,
    fecha_limite: row.fecha_limite ?? null,
    instrucciones: row.instrucciones ?? null,
    materia_nombre: materia?.nombre ?? null,
  }
}

// ─── PREGUNTAS ───────────────────────────────────────────────────────────────

export async function getPreguntasDeAsignacion(
  supabase: TypedClient,
  lecturaId: string
): Promise<PreguntaConOpciones[]> {
  const { data, error } = await supabase
    .from('preguntas')
    .select(`
      id, enunciado, tipo, puntaje, orden, imagen_url,
      opciones_respuesta (
        id, texto, es_correcta, orden
      )
    `)
    .eq('lectura_id', lecturaId)
    .eq('activo', true)
    .order('orden', { ascending: true })

  if (error || !data) return []

  return (data as any[]).map((p) => ({
    id: p.id as string,
    enunciado: p.enunciado as string,
    tipo: p.tipo as PreguntaConOpciones['tipo'],
    puntaje: p.puntaje as number,
    orden: p.orden as number,
    imagen_url: (p.imagen_url as string | null) ?? null,
    opciones: ((p.opciones_respuesta ?? []) as {
      id: string; texto: string; es_correcta: boolean; orden: number
    }[]).sort((a, b) => a.orden - b.orden),
  }))
}

// ─── INTENTOS ────────────────────────────────────────────────────────────────

export async function getIntentoActivo(
  supabase: TypedClient,
  asignacionId: string,
  estudianteId: string
): Promise<{ id: string; estado: string } | null> {
  const { data } = await (supabase as any)
    .from('intentos_lectura')
    .select('id, estado')
    .eq('asignacion_id', asignacionId)
    .eq('estudiante_id', estudianteId)
    .eq('estado', 'en_progreso')
    .maybeSingle()

  if (!data?.id) return null
  return { id: data.id as string, estado: data.estado as string }
}

export async function getIntentoCompletado(
  supabase: TypedClient,
  asignacionId: string,
  estudianteId: string
): Promise<{ id: string; estado: string; nota_automatica: number | null } | null> {
  const { data } = await (supabase as any)
    .from('intentos_lectura')
    .select('id, estado, nota_automatica')
    .eq('asignacion_id', asignacionId)
    .eq('estudiante_id', estudianteId)
    .in('estado', ['completado', 'revisando'])
    .order('fecha_completado', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!data?.id) return null
  return {
    id: data.id as string,
    estado: data.estado as string,
    nota_automatica: (data.nota_automatica as number | null) ?? null,
  }
}

// ─── RESPUESTAS ──────────────────────────────────────────────────────────────

export async function getRespuestaPrevia(
  supabase: TypedClient,
  intentoId: string,
  preguntaId: string
): Promise<{ opcion_id: string | null; texto_respuesta: string | null } | null> {
  const { data } = await (supabase as any)
    .from('respuestas_estudiante')
    .select('opcion_id, texto_respuesta')
    .eq('intento_id', intentoId)
    .eq('pregunta_id', preguntaId)
    .maybeSingle()

  if (!data) return null
  return {
    opcion_id: (data.opcion_id as string | null) ?? null,
    texto_respuesta: (data.texto_respuesta as string | null) ?? null,
  }
}

export async function getResultadoCompleto(
  supabase: TypedClient,
  intentoId: string
): Promise<RespuestaDetalle[]> {
  const { data, error } = await (supabase as any)
    .from('respuestas_estudiante')
    .select(`
      pregunta_id,
      texto_respuesta,
      es_correcta,
      puntaje_obtenido,
      opcion_id,
      preguntas (
        enunciado,
        tipo,
        puntaje
      ),
      opciones_respuesta (
        texto
      )
    `)
    .eq('intento_id', intentoId)

  if (error || !data) return []

  const filas = (data as unknown[]).map((item) => item as RespuestaCompletaRow)

  const resultado: RespuestaDetalle[] = await Promise.all(
    filas.map(async (r) => {
      let textoOpcionCorrecta: string | null = null

      if (
        r.pregunta_id &&
        (r.preguntas?.tipo === 'opcion_multiple' || r.preguntas?.tipo === 'verdadero_falso')
      ) {
        const { data: correctaRaw } = await supabase
          .from('opciones_respuesta')
          .select('texto')
          .eq('pregunta_id', r.pregunta_id)
          .eq('es_correcta', true)
          .limit(1)
          .maybeSingle()

        textoOpcionCorrecta = (correctaRaw as { texto: string } | null)?.texto ?? null
      }

      return {
        pregunta_id: r.pregunta_id,
        enunciado: r.preguntas?.enunciado ?? '',
        tipo: (r.preguntas?.tipo ?? 'abierta') as RespuestaDetalle['tipo'],
        puntaje_pregunta: r.preguntas?.puntaje ?? 0,
        puntaje_obtenido: r.puntaje_obtenido ?? 0,
        es_correcta: r.es_correcta,
        texto_respuesta_estudiante: r.texto_respuesta,
        texto_opcion_estudiante: r.opciones_respuesta?.texto ?? null,
        texto_opcion_correcta: textoOpcionCorrecta,
      }
    })
  )

  return resultado
}
