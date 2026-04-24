import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'
import type {
  AsignacionConLectura,
  PreguntaConOpciones,
  RespuestaDetalle,
} from './types'

type Supabase = SupabaseClient<Database>

export async function getAsignacionConLectura(
  supabase: Supabase,
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

  const lectura = data.lecturas as {
    id: string; titulo: string; autor: string
    portada_url: string | null; paginas_total: number | null
  } | null
  const materia = data.materias as { nombre: string } | null

  if (!lectura) return null

  return {
    id: data.id,
    lectura_id: lectura.id,
    titulo: lectura.titulo,
    autor: lectura.autor,
    portada_url: lectura.portada_url,
    fecha_limite: data.fecha_limite,
    instrucciones: data.instrucciones,
    materia_nombre: materia?.nombre ?? null,
  }
}

export async function getPreguntasDeAsignacion(
  supabase: Supabase,
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

  return data.map((p) => ({
    id: p.id,
    enunciado: p.enunciado,
    tipo: p.tipo as PreguntaConOpciones['tipo'],
    puntaje: p.puntaje,
    orden: p.orden,
    imagen_url: p.imagen_url ?? null,
    opciones: ((p.opciones_respuesta ?? []) as {
      id: string; texto: string; es_correcta: boolean; orden: number
    }[]).sort((a, b) => a.orden - b.orden),
  }))
}

export async function getIntentoActivo(
  supabase: Supabase,
  asignacionId: string,
  estudianteId: string
): Promise<{ id: string; estado: string } | null> {
  const { data } = await supabase
    .from('intentos_lectura')
    .select('id, estado')
    .eq('asignacion_id', asignacionId)
    .eq('estudiante_id', estudianteId)
    .eq('estado', 'en_progreso')
    .maybeSingle()

  return data ?? null
}

export async function getIntentoCompletado(
  supabase: Supabase,
  asignacionId: string,
  estudianteId: string
): Promise<{ id: string; estado: string; nota_automatica: number | null } | null> {
  const { data } = await supabase
    .from('intentos_lectura')
    .select('id, estado, nota_automatica')
    .eq('asignacion_id', asignacionId)
    .eq('estudiante_id', estudianteId)
    .in('estado', ['completado', 'revisando'])
    .order('fecha_completado', { ascending: false })
    .limit(1)
    .maybeSingle()

  return data ?? null
}

export async function getRespuestaPrevia(
  supabase: Supabase,
  intentoId: string,
  preguntaId: string
): Promise<{ opcion_id: string | null; texto_respuesta: string | null } | null> {
  const { data } = await supabase
    .from('respuestas_estudiante')
    .select('opcion_id, texto_respuesta')
    .eq('intento_id', intentoId)
    .eq('pregunta_id', preguntaId)
    .maybeSingle()

  return data ?? null
}

export async function getResultadoCompleto(
  supabase: Supabase,
  intentoId: string
): Promise<RespuestaDetalle[]> {
  const { data, error } = await supabase
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

  // Para cada respuesta, buscar la opción correcta
  const resultado: RespuestaDetalle[] = await Promise.all(
    data.map(async (r) => {
      const pregunta = r.preguntas as {
        enunciado: string; tipo: string; puntaje: number
      } | null
      const opcionElegida = r.opciones_respuesta as { texto: string } | null

      let textoOpcionCorrecta: string | null = null

      if (r.pregunta_id && (pregunta?.tipo === 'opcion_multiple' || pregunta?.tipo === 'verdadero_falso')) {
        const { data: correcta } = await supabase
          .from('opciones_respuesta')
          .select('texto')
          .eq('pregunta_id', r.pregunta_id)
          .eq('es_correcta', true)
          .limit(1)
          .maybeSingle()
        textoOpcionCorrecta = correcta?.texto ?? null
      }

      return {
        pregunta_id: r.pregunta_id,
        enunciado: pregunta?.enunciado ?? '',
        tipo: (pregunta?.tipo ?? 'abierta') as RespuestaDetalle['tipo'],
        puntaje_pregunta: pregunta?.puntaje ?? 0,
        puntaje_obtenido: r.puntaje_obtenido ?? 0,
        es_correcta: r.es_correcta,
        texto_respuesta_estudiante: r.texto_respuesta,
        texto_opcion_estudiante: opcionElegida?.texto ?? null,
        texto_opcion_correcta: textoOpcionCorrecta,
      }
    })
  )

  return resultado
}
