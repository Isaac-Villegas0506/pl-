'use server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function actualizarPerfilAction(datos: {
  nombre: string
  apellido: string
  bio: string
  colorPerfil: string
  avatarUrl?: string
}): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'No autenticado' }

  // Validaciones básicas
  if (!datos.nombre.trim()) return { success: false, error: 'El nombre es requerido' }
  if (!datos.apellido.trim()) return { success: false, error: 'El apellido es requerido' }

  const { error } = await (supabase as any)
    .from('usuarios')
    .update({
      nombre: datos.nombre.trim(),
      apellido: datos.apellido.trim(),
      bio: datos.bio.trim().slice(0, 120),
      color_perfil: datos.colorPerfil,
      ...(datos.avatarUrl ? { avatar_url: datos.avatarUrl } : {}),
    })
    .eq('auth_id', user.id)

  if (error) return { success: false, error: 'Error al guardar los cambios' }

  revalidatePath('/perfil')
  revalidatePath('/perfil/editar')
  return { success: true }
}

export async function cambiarPasswordAction(
  passwordActual: string,
  passwordNueva: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'No autenticado' }

  // Verificar contraseña actual haciendo signIn
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password: passwordActual,
  })
  if (signInError) return { success: false, error: 'La contraseña actual es incorrecta' }

  // Actualizar a la nueva contraseña
  const { error: updateError } = await supabase.auth.updateUser({
    password: passwordNueva,
  })
  if (updateError) return { success: false, error: 'Error al actualizar la contraseña' }

  return { success: true }
}

export async function obtenerUrlAvatarAction(
  authUid: string,
  extension: string
): Promise<{ url: string | null }> {
  const supabase = await createClient()
  const ruta = `${authUid}/avatar.${extension}`

  const { data } = supabase
    .storage
    .from('avatares')
    .getPublicUrl(ruta)

  return { url: data.publicUrl ?? null }
}

export async function registrarActividadHoyAction(
  estudianteId: string
): Promise<void> {
  const supabase = await createClient()
  const hoy = new Date().toISOString().split('T')[0]

  await (supabase as any)
    .from('racha_lectura')
    .upsert({
      estudiante_id: estudianteId,
      fecha: hoy,
      lecturas_abiertas: 1,
    }, {
      onConflict: 'estudiante_id, fecha',
      ignoreDuplicates: false,
    })

  // Calcular y actualizar racha actual
  await actualizarRachaAction(estudianteId)
}

export async function actualizarRachaAction(
  estudianteId: string
): Promise<void> {
  const supabase = await createClient()

  // Obtener últimos 60 días de actividad
  const hace60 = new Date()
  hace60.setDate(hace60.getDate() - 60)

  const { data: dias } = await (supabase as any)
    .from('racha_lectura')
    .select('fecha')
    .eq('estudiante_id', estudianteId)
    .gte('fecha', hace60.toISOString().split('T')[0])
    .order('fecha', { ascending: false })

  if (!dias?.length) {
    await (supabase as any)
      .from('estadisticas_estudiante')
      .upsert({ estudiante_id: estudianteId, racha_actual: 0 })
    return
  }

  // Calcular racha actual (días consecutivos contando desde hoy)
  const fechas = new Set(dias.map((d: any) => d.fecha))
  let racha = 0
  const cursor = new Date()

  while (true) {
    const fechaStr = cursor.toISOString().split('T')[0]
    if (fechas.has(fechaStr)) {
      racha++
      cursor.setDate(cursor.getDate() - 1)
    } else {
      break
    }
  }

  // Obtener racha máxima actual para no sobrescribir si es mayor
  const { data: statsActuales } = await (supabase as any)
    .from('estadisticas_estudiante')
    .select('racha_maxima')
    .eq('estudiante_id', estudianteId)
    .maybeSingle()

  const rachaMaxActual = statsActuales?.racha_maxima ?? 0

  await (supabase as any)
    .from('estadisticas_estudiante')
    .upsert({
      estudiante_id: estudianteId,
      racha_actual: racha,
      racha_maxima: Math.max(racha, rachaMaxActual),
      ultimo_acceso: new Date().toISOString().split('T')[0],
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'estudiante_id',
    })

  // Verificar si desbloqueó logros de racha
  await verificarLogrosRachaAction(estudianteId, racha)
}

export async function verificarLogrosRachaAction(
  estudianteId: string,
  rachaActual: number
): Promise<void> {
  const supabase = createAdminClient()

  // Obtener logros de tipo racha_dias que apliquen
  const { data: logros } = await (supabase as any)
    .from('logros')
    .select('id, codigo, condicion_valor, puntos')
    .eq('condicion_tipo', 'racha_dias')
    .lte('condicion_valor', rachaActual)

  if (!logros?.length) return

  for (const logro of logros) {
    // Verificar si ya lo tiene
    const { data: yaLo } = await (supabase as any)
      .from('estudiante_logros')
      .select('id')
      .eq('estudiante_id', estudianteId)
      .eq('logro_id', logro.id)
      .maybeSingle()

    if (yaLo) continue // Ya lo tenía

    // Desbloquear logro
    await (supabase as any)
      .from('estudiante_logros')
      .insert({ estudiante_id: estudianteId, logro_id: logro.id })

    // Sumar puntos a las estadísticas
    await (supabase as any).rpc('incrementar_puntos_logros', {
      p_estudiante_id: estudianteId,
      p_puntos: logro.puntos,
    })

    // Crear notificación de logro
    await (supabase as any).from('notificaciones').insert({
      usuario_id: estudianteId,
      tipo: 'logro',
      titulo: '🏆 ¡Nuevo logro desbloqueado!',
      mensaje: `Obtuviste el logro "${logro.codigo}"`,
      accion_url: '/perfil',
    })
  }
}
