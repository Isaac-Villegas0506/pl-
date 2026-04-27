'use server'
/* eslint-disable @typescript-eslint/no-explicit-any */

import { createClient } from '@/lib/supabase/server'
import type { RevisionInput } from '../../../types'

export async function guardarRevisionAction(
  datos: RevisionInput
): Promise<{ success: boolean; nota?: number; error?: string }> {
  const supabase = (await createClient()) as any

  // 1. Actualizar puntajes de cada respuesta abierta
  for (const rev of datos.revisiones) {
    const { error } = await supabase
      .from('respuestas_estudiante')
      .update({
        puntaje_obtenido: rev.puntaje,
        comentario_profesor: rev.comentario || null,
        es_correcta: rev.puntaje > 0,
      })
      .eq('id', rev.respuestaId)

    if (error) return { success: false, error: error.message }
  }

  // 2. Calcular nueva nota_final
  // Obtener TODAS las respuestas del intento para recalcular
  const { data: todasRespuestas, error: errRespuestas } = await supabase
    .from('respuestas_estudiante')
    .select(`
      puntaje_obtenido,
      preguntas ( puntaje )
    `)
    .eq('intento_id', datos.intentoId)

  if (errRespuestas) return { success: false, error: errRespuestas.message }

  const respuestasArr = (todasRespuestas ?? []) as any[]

  const puntajeTotalObtenido = respuestasArr.reduce(
    (acc: number, r: any) => acc + ((r.puntaje_obtenido as number) ?? 0),
    0
  )
  const puntajeTotalMaximo = respuestasArr.reduce(
    (acc: number, r: any) => acc + ((r.preguntas as any)?.puntaje ?? 1),
    0
  )

  const notaCalculada =
    puntajeTotalMaximo > 0
      ? Math.round((puntajeTotalObtenido / puntajeTotalMaximo) * 20 * 100) / 100
      : 0

  // 3. Actualizar el intento
  const { error: errIntento } = await supabase
    .from('intentos_lectura')
    .update({
      nota_final: notaCalculada,
      nota_automatica: notaCalculada,
      revisado_por_profesor: true,
      estado: 'completado',
    })
    .eq('id', datos.intentoId)

  if (errIntento) return { success: false, error: errIntento.message }

  // 4. Obtener estudiante_id para la notificación
  const { data: intentoData } = await supabase
    .from('intentos_lectura')
    .select('estudiante_id')
    .eq('id', datos.intentoId)
    .single()

  const estudianteId = (intentoData as any)?.estudiante_id as string | undefined

  if (estudianteId) {
    await supabase.from('notificaciones').insert({
      usuario_id: estudianteId,
      tipo: 'calificacion',
      titulo: '¡Tu evaluación fue calificada!',
      mensaje: `Tu profesor revisó tu evaluación. Nota final: ${notaCalculada.toFixed(2)}/20`,
      leida: false,
    })
  }

  return { success: true, nota: notaCalculada }
}
