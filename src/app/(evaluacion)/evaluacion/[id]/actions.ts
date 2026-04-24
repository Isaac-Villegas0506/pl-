'use server'

import { createClient } from '@/lib/supabase/server'
import type { GuardarRespuestaInput } from './types'

export async function crearIntentoAction(
  asignacionId: string,
  estudianteId: string
): Promise<{ success: boolean; intentoId: string; error?: string }> {
  const supabase = await createClient()

  // Verificar si ya existe un intento en progreso
  const { data: existente } = await supabase
    .from('intentos_lectura')
    .select('id')
    .eq('asignacion_id', asignacionId)
    .eq('estudiante_id', estudianteId)
    .eq('estado', 'en_progreso')
    .maybeSingle()

  if (existente) {
    return { success: true, intentoId: existente.id }
  }

  // Crear nuevo intento
  const { data, error } = await supabase
    .from('intentos_lectura')
    .insert({
      asignacion_id: asignacionId,
      estudiante_id: estudianteId,
      estado: 'en_progreso',
      fecha_inicio: new Date().toISOString(),
    })
    .select('id')
    .single()

  if (error || !data) {
    return { success: false, intentoId: '', error: error?.message }
  }

  return { success: true, intentoId: data.id }
}

export async function guardarRespuestaAction(
  datos: GuardarRespuestaInput
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { intentoId, preguntaId, opcionId, textoRespuesta } = datos

  // Obtener info de la pregunta
  const { data: pregunta } = await supabase
    .from('preguntas')
    .select('tipo, puntaje')
    .eq('id', preguntaId)
    .single()

  if (!pregunta) {
    return { success: false, error: 'Pregunta no encontrada' }
  }

  let esCorrecta: boolean | null = null
  let puntajeObtenido = 0

  if (pregunta.tipo === 'opcion_multiple' || pregunta.tipo === 'verdadero_falso') {
    if (opcionId) {
      const { data: opcion } = await supabase
        .from('opciones_respuesta')
        .select('es_correcta')
        .eq('id', opcionId)
        .single()

      esCorrecta = opcion?.es_correcta ?? false
      puntajeObtenido = esCorrecta ? pregunta.puntaje : 0
    }
  }
  // Para 'abierta': es_correcta = null, puntaje_obtenido = 0

  const { error } = await supabase
    .from('respuestas_estudiante')
    .upsert(
      {
        intento_id: intentoId,
        pregunta_id: preguntaId,
        opcion_id: opcionId ?? null,
        texto_respuesta: textoRespuesta ?? null,
        es_correcta: esCorrecta,
        puntaje_obtenido: puntajeObtenido,
      },
      { onConflict: 'intento_id,pregunta_id' }
    )

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

export async function finalizarIntentoAction(
  intentoId: string,
  estudianteId: string
): Promise<{ success: boolean; nota: number; estado: string; error?: string }> {
  const supabase = await createClient()

  // Obtener todas las respuestas del intento
  const { data: respuestas } = await supabase
    .from('respuestas_estudiante')
    .select('puntaje_obtenido, pregunta_id, preguntas(tipo, puntaje)')
    .eq('intento_id', intentoId)

  if (!respuestas || respuestas.length === 0) {
    return { success: false, nota: 0, estado: 'en_progreso', error: 'Sin respuestas' }
  }

  const puntajeObtenido = respuestas.reduce(
    (acc, r) => acc + (r.puntaje_obtenido ?? 0), 0
  )

  const puntajeTotal = respuestas.reduce((acc, r) => {
    const p = r.preguntas as { tipo: string; puntaje: number } | null
    return acc + (p?.puntaje ?? 0)
  }, 0)

  const hayPreguntasAbiertas = respuestas.some((r) => {
    const p = r.preguntas as { tipo: string; puntaje: number } | null
    return p?.tipo === 'abierta'
  })

  const notaAutomatica =
    puntajeTotal > 0
      ? Math.round(((puntajeObtenido / puntajeTotal) * 20) * 100) / 100
      : 0

  const nuevoEstado = hayPreguntasAbiertas ? 'revisando' : 'completado'

  const { error } = await supabase
    .from('intentos_lectura')
    .update({
      estado: nuevoEstado,
      nota_automatica: notaAutomatica,
      fecha_completado: new Date().toISOString(),
    })
    .eq('id', intentoId)

  if (error) {
    return { success: false, nota: notaAutomatica, estado: nuevoEstado, error: error.message }
  }

  return { success: true, nota: notaAutomatica, estado: nuevoEstado }
}
