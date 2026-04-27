'use server'
/* eslint-disable @typescript-eslint/no-explicit-any */

import { createClient } from '@/lib/supabase/server'
import type { NuevaLecturaInput, NuevaAsignacionInput } from './types'

// ─── CREAR LECTURA ────────────────────────────────────────────────────────────

export async function crearLecturaAction(
  datos: NuevaLecturaInput
): Promise<{ success: boolean; lecturaId?: string; error?: string }> {
  const supabase = (await createClient()) as any

  const { data, error } = await supabase
    .from('lecturas')
    .insert({
      titulo: datos.titulo,
      autor: datos.autor,
      descripcion: datos.descripcion ?? null,
      materia_id: datos.materia_id ?? null,
      categoria_id: datos.categoria_id ?? null,
      grado_id: datos.grado_id ?? null,
      nivel_dificultad_id: datos.nivel_dificultad_id ?? null,
      anio_publicacion: datos.anio_publicacion ?? null,
      paginas_total: datos.paginas_total ?? null,
      es_global: datos.es_global,
      estado: datos.estado,
      creado_por: datos.profesorId,
    })
    .select('id')
    .single()

  if (error || !data?.id) {
    return { success: false, error: error?.message }
  }

  return { success: true, lecturaId: data.id as string }
}

import { crearNotificacionMasiva } from '@/lib/notificaciones/enviar'

// ─── CREAR ASIGNACIÓN ─────────────────────────────────────────────────────────

export async function crearAsignacionAction(
  datos: NuevaAsignacionInput
): Promise<{ success: boolean; asignacionId?: string; error?: string }> {
  const supabase = (await createClient()) as any

  // Verificar que no existe asignación activa duplicada
  const { data: existente } = await supabase
    .from('asignaciones_lectura')
    .select('id')
    .eq('lectura_id', datos.lectura_id)
    .eq('aula_id', datos.aula_id)
    .eq('profesor_id', datos.profesorId)
    .eq('estado', 'activo')
    .maybeSingle()

  if (existente?.id) {
    return { success: false, error: 'Ya existe una asignación activa para esta lectura y aula.' }
  }

  const { data, error } = await supabase
    .from('asignaciones_lectura')
    .insert({
      lectura_id: datos.lectura_id,
      aula_id: datos.aula_id,
      profesor_id: datos.profesorId,
      fecha_inicio: datos.fecha_inicio,
      fecha_limite: datos.fecha_limite ?? null,
      bimestre_id: datos.bimestre_id ?? null,
      instrucciones: datos.instrucciones ?? null,
      estado: 'activo',
      requiere_evaluacion: datos.requiere_evaluacion ?? false,
      tipo_evaluacion: datos.tipo_evaluacion ?? 'sin_evaluacion',
    })
    .select('id')
    .single()

  if (error || !data?.id) {
    return { success: false, error: error?.message }
  }

  // Notificar a todos los estudiantes del aula
  const { data: estudiantes } = await supabase
    .from('estudiantes_aulas')
    .select('usuario_id')
    .eq('aula_id', datos.aula_id)

  if (estudiantes && estudiantes.length > 0) {
    const { data: lectura } = await supabase
      .from('lecturas')
      .select('titulo')
      .eq('id', datos.lectura_id)
      .single()

    const tituloLectura = lectura?.titulo || 'nueva lectura'
    
    await crearNotificacionMasiva(
      estudiantes.map((e: any) => e.usuario_id),
      {
        tipo: 'asignacion',
        titulo: '📚 Nueva Asignación',
        mensaje: `Se ha asignado "${tituloLectura}". ¡Revisa tus tareas pendientes!`,
        accion_url: '/mis-libros',
      }
    )
  }

  return { success: true, asignacionId: data.id as string }
}

// ─── CERRAR ASIGNACIÓN ────────────────────────────────────────────────────────

export async function cerrarAsignacionAction(
  asignacionId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = (await createClient()) as any

  const { error } = await supabase
    .from('asignaciones_lectura')
    .update({ estado: 'cerrado' })
    .eq('id', asignacionId)

  if (error) return { success: false, error: error.message }
  return { success: true }
}

// ─── ARCHIVAR LECTURA ─────────────────────────────────────────────────────────

export async function archivarLecturaAction(
  lecturaId: string,
  profesorId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = (await createClient()) as any

  const { error } = await supabase
    .from('lecturas')
    .update({ estado: 'archivado' })
    .eq('id', lecturaId)
    .eq('creado_por', profesorId)

  if (error) return { success: false, error: error.message }
  return { success: true }
}
