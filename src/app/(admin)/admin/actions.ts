'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import type {
  NuevoUsuarioInput,
  EditarUsuarioInput,
  NuevaPreguntaInput,
  EditarPreguntaInput,
  ConfigSistema,
} from './types'

function getAdminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

const TABLAS_PERMITIDAS = ['materias', 'categorias', 'grados', 'niveles_dificultad'] as const
type TablaPermitida = (typeof TABLAS_PERMITIDAS)[number]

// ─── CREAR USUARIO ────────────────────────────────────────────────────────────

export async function crearUsuarioAction(
  datos: NuevoUsuarioInput
): Promise<{ success: boolean; usuarioId?: string; error?: string }> {
  try {
    const adminSb = getAdminClient()

    const { data: authData, error: authError } = await adminSb.auth.admin.createUser({
      email: datos.email,
      password: datos.password,
      email_confirm: true,
    })

    if (authError || !authData.user) {
      return { success: false, error: authError?.message ?? 'Error al crear usuario en Auth' }
    }

    const authId = authData.user.id

    // Usamos el cliente de administrador (Service Role) para evitar errores de RLS al crear perfiles ajenos
    const { data: usuarioData, error: insertError } = await adminSb
      .from('usuarios')
      .insert({
        auth_id: authId,
        email: datos.email,
        nombre: datos.nombre,
        apellido: datos.apellido,
        dni: datos.dni ?? null,
        rol: datos.rol,
        activo: true,
      })
      .select('id')
      .single()

    if (insertError || !usuarioData?.id) {
      return { success: false, error: insertError?.message ?? 'Error al crear perfil' }
    }

    if (datos.rol === 'estudiante' && datos.aula_id) {
      // Intentamos insertar en estudiantes_aulas que es lo que usa la lista de usuarios
      await adminSb.from('estudiantes_aulas').insert({
        usuario_id: usuarioData.id,
        aula_id: datos.aula_id,
        anio_lectivo: datos.anio_lectivo ?? new Date().getFullYear(),
      })
      
      // También insertamos en matriculas por compatibilidad con otros módulos
      await adminSb.from('matriculas').insert({
        estudiante_id: usuarioData.id,
        aula_id: datos.aula_id,
        estado: 'activo'
      })
    }

    if (datos.rol === 'profesor' && datos.aulas_profesor && datos.aulas_profesor.length > 0) {
      const insertData = datos.aulas_profesor.map(aula_id => ({
        profesor_id: usuarioData.id,
        aula_id,
        anio_lectivo: datos.anio_lectivo ?? new Date().getFullYear(),
        activo: true,
      }))
      await adminSb.from('profesor_aulas').insert(insertData)
    }

    // Forzar la revalidación de la lista de usuarios
    const { revalidatePath } = await import('next/cache')
    revalidatePath('/admin/usuarios')

    return { success: true, usuarioId: usuarioData.id as string }
  } catch (err: any) {
    console.error('Error crítico en crearUsuarioAction:', err)
    return { success: false, error: 'Ocurrió un error inesperado en el servidor.' }
  }
}

// ─── EDITAR USUARIO ───────────────────────────────────────────────────────────

export async function editarUsuarioAction(
  usuarioId: string,
  datos: EditarUsuarioInput
): Promise<{ success: boolean; error?: string }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = (await createClient()) as any

  const updatePayload: Record<string, unknown> = {}
  if (datos.nombre !== undefined) updatePayload.nombre = datos.nombre
  if (datos.apellido !== undefined) updatePayload.apellido = datos.apellido
  if (datos.dni !== undefined) updatePayload.dni = datos.dni
  if (datos.rol !== undefined) updatePayload.rol = datos.rol
  if (datos.activo !== undefined) updatePayload.activo = datos.activo
  if (datos.email !== undefined) updatePayload.email = datos.email

  const { error } = await supabase
    .from('usuarios')
    .update(updatePayload)
    .eq('id', usuarioId)

  if (error) return { success: false, error: error.message }

  if (datos.email && datos.auth_id) {
    const adminSb = getAdminClient()
    await adminSb.auth.admin.updateUserById(datos.auth_id, { email: datos.email })
  }

  return { success: true }
}

// ─── CAMBIAR ROL ──────────────────────────────────────────────────────────────

export async function cambiarRolAction(
  usuarioId: string,
  nuevoRol: string
): Promise<{ success: boolean; error?: string }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = (await createClient()) as any
  const { error } = await supabase
    .from('usuarios')
    .update({ rol: nuevoRol })
    .eq('id', usuarioId)

  if (error) return { success: false, error: error.message }
  return { success: true }
}

// ─── DESACTIVAR USUARIO ───────────────────────────────────────────────────────

export async function desactivarUsuarioAction(
  usuarioId: string,
  authId: string
): Promise<{ success: boolean; error?: string }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = (await createClient()) as any
  const { error } = await supabase
    .from('usuarios')
    .update({ activo: false })
    .eq('id', usuarioId)

  if (error) return { success: false, error: error.message }

  const adminSb = getAdminClient()
  await adminSb.auth.admin.updateUserById(authId, { ban_duration: '87600h' })

  return { success: true }
}

// ─── REACTIVAR USUARIO ────────────────────────────────────────────────────────

export async function reactivarUsuarioAction(
  usuarioId: string,
  authId: string
): Promise<{ success: boolean; error?: string }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = (await createClient()) as any
  const { error } = await supabase
    .from('usuarios')
    .update({ activo: true })
    .eq('id', usuarioId)

  if (error) return { success: false, error: error.message }

  const adminSb = getAdminClient()
  await adminSb.auth.admin.updateUserById(authId, { ban_duration: 'none' })

  return { success: true }
}

// ─── CREAR PREGUNTA ───────────────────────────────────────────────────────────

export async function crearPreguntaAction(
  datos: NuevaPreguntaInput
): Promise<{ success: boolean; preguntaId?: string; error?: string }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = (await createClient()) as any

  const { count: totalExistentes } = await supabase
    .from('preguntas')
    .select('id', { count: 'exact', head: true })
    .eq('lectura_id', datos.lectura_id)

  const orden = ((totalExistentes as number) ?? 0) + 1

  const { data: pregunta, error } = await supabase
    .from('preguntas')
    .insert({
      lectura_id: datos.lectura_id,
      enunciado: datos.enunciado,
      tipo: datos.tipo,
      puntaje: datos.puntaje,
      orden,
      imagen_url: datos.imagen_url ?? null,
      activo: datos.activo,
    })
    .select('id')
    .single()

  if (error || !pregunta?.id) {
    return { success: false, error: error?.message ?? 'Error al crear pregunta' }
  }

  const preguntaId = pregunta.id as string

  if (datos.tipo === 'opcion_multiple' && datos.opciones && datos.opciones.length > 0) {
    const opcionesInsert = datos.opciones.map((op, idx) => ({
      pregunta_id: preguntaId,
      texto: op.texto,
      es_correcta: op.es_correcta,
      orden: idx + 1,
    }))
    await supabase.from('opciones_respuesta').insert(opcionesInsert)
  }

  if (datos.tipo === 'verdadero_falso') {
    const correctaVF = datos.opcion_correcta_vf ?? true
    await supabase.from('opciones_respuesta').insert([
      { pregunta_id: preguntaId, texto: 'Verdadero', es_correcta: correctaVF, orden: 1 },
      { pregunta_id: preguntaId, texto: 'Falso', es_correcta: !correctaVF, orden: 2 },
    ])
  }

  return { success: true, preguntaId }
}

// ─── EDITAR PREGUNTA ──────────────────────────────────────────────────────────

export async function editarPreguntaAction(
  preguntaId: string,
  datos: EditarPreguntaInput
): Promise<{ success: boolean; error?: string }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = (await createClient()) as any

  const { error } = await supabase
    .from('preguntas')
    .update({
      enunciado: datos.enunciado,
      tipo: datos.tipo,
      puntaje: datos.puntaje,
      imagen_url: datos.imagen_url ?? null,
      activo: datos.activo,
    })
    .eq('id', preguntaId)

  if (error) return { success: false, error: error.message }

  await supabase.from('opciones_respuesta').delete().eq('pregunta_id', preguntaId)

  if (datos.tipo === 'opcion_multiple' && datos.opciones && datos.opciones.length > 0) {
    const opcionesInsert = datos.opciones.map((op, idx) => ({
      pregunta_id: preguntaId,
      texto: op.texto,
      es_correcta: op.es_correcta,
      orden: idx + 1,
    }))
    await supabase.from('opciones_respuesta').insert(opcionesInsert)
  }

  if (datos.tipo === 'verdadero_falso') {
    const correctaVF = datos.opcion_correcta_vf ?? true
    await supabase.from('opciones_respuesta').insert([
      { pregunta_id: preguntaId, texto: 'Verdadero', es_correcta: correctaVF, orden: 1 },
      { pregunta_id: preguntaId, texto: 'Falso', es_correcta: !correctaVF, orden: 2 },
    ])
  }

  return { success: true }
}

// ─── ELIMINAR PREGUNTA ────────────────────────────────────────────────────────

export async function eliminarPreguntaAction(
  preguntaId: string
): Promise<{ success: boolean; error?: string }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = (await createClient()) as any
  await supabase.from('opciones_respuesta').delete().eq('pregunta_id', preguntaId)
  const { error } = await supabase.from('preguntas').delete().eq('id', preguntaId)
  if (error) return { success: false, error: error.message }
  return { success: true }
}

// ─── REORDENAR PREGUNTAS ──────────────────────────────────────────────────────

export async function reordenarPreguntasAction(
  reordenamiento: { id: string; orden: number }[]
): Promise<{ success: boolean; error?: string }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = (await createClient()) as any

  await Promise.all(
    reordenamiento.map(({ id, orden }) =>
      supabase.from('preguntas').update({ orden }).eq('id', id)
    )
  )

  return { success: true }
}

// ─── ACTUALIZAR CATÁLOGO ──────────────────────────────────────────────────────

export async function actualizarCatalogoAction(
  tabla: string,
  id: string,
  nombre: string
): Promise<{ success: boolean; error?: string }> {
  if (!(TABLAS_PERMITIDAS as readonly string[]).includes(tabla)) {
    return { success: false, error: 'Tabla no permitida' }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = (await createClient()) as any
  const { error } = await supabase
    .from(tabla as TablaPermitida)
    .update({ nombre })
    .eq('id', id)

  if (error) return { success: false, error: error.message }
  return { success: true }
}

// ─── CREAR ÍTEM CATÁLOGO ──────────────────────────────────────────────────────

export async function crearItemCatalogoAction(
  tabla: string,
  nombre: string
): Promise<{ success: boolean; id?: string; error?: string }> {
  if (!(TABLAS_PERMITIDAS as readonly string[]).includes(tabla)) {
    return { success: false, error: 'Tabla no permitida' }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = (await createClient()) as any
  const { data, error } = await supabase
    .from(tabla as TablaPermitida)
    .insert({ nombre, activo: true })
    .select('id')
    .single()

  if (error || !data?.id) return { success: false, error: error?.message }
  return { success: true, id: data.id as string }
}

// ─── ELIMINAR ÍTEM CATÁLOGO ───────────────────────────────────────────────────

export async function eliminarItemCatalogoAction(
  tabla: string,
  id: string
): Promise<{ success: boolean; error?: string }> {
  if (!(TABLAS_PERMITIDAS as readonly string[]).includes(tabla)) {
    return { success: false, error: 'Tabla no permitida' }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = (await createClient()) as any
  const { error } = await supabase.from(tabla as TablaPermitida).delete().eq('id', id)
  if (error) return { success: false, error: error.message }
  return { success: true }
}

// ─── GUARDAR CONFIGURACIÓN ────────────────────────────────────────────────────

export async function guardarConfiguracionAction(
  config: ConfigSistema
): Promise<{ success: boolean; error?: string }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = (await createClient()) as any

  const { data: existing } = await supabase
    .from('config_sistema')
    .select('id')
    .limit(1)
    .maybeSingle()

  if (existing?.id) {
    const { error } = await supabase
      .from('config_sistema')
      .update({
        nombre_institucion: config.nombre_institucion,
        anio_lectivo: config.anio_lectivo,
        permitir_registro: config.permitir_registro,
        nota_minima_aprobacion: config.nota_minima_aprobacion,
        escala_maxima: config.escala_maxima,
        correo_soporte: config.correo_soporte,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)

    if (error) return { success: false, error: error.message }
  } else {
    const { error } = await supabase.from('config_sistema').insert({
      nombre_institucion: config.nombre_institucion,
      anio_lectivo: config.anio_lectivo,
      permitir_registro: config.permitir_registro,
      nota_minima_aprobacion: config.nota_minima_aprobacion,
      escala_maxima: config.escala_maxima,
      correo_soporte: config.correo_soporte,
    })
    if (error) return { success: false, error: error.message }
  }

  return { success: true }
}

// ─── CAMBIAR ESTADO LECTURA (ADMIN) ──────────────────────────────────────────

export async function cambiarEstadoLecturaAction(
  lecturaId: string,
  estado: 'borrador' | 'publicado' | 'archivado'
): Promise<{ success: boolean; error?: string }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = (await createClient()) as any
  const { error } = await supabase
    .from('lecturas')
    .update({ estado })
    .eq('id', lecturaId)

  if (error) return { success: false, error: error.message }
  return { success: true }
}
