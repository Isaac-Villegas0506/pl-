import { createAdminClient } from '@/lib/supabase/admin'
import type { PushPayload } from '@/lib/webpush'

interface CrearNotificacionInput {
  usuario_id: string
  tipo: 'asignacion' | 'calificacion' | 'recordatorio' | 'sistema' | 'logro'
  titulo: string
  mensaje: string
  accion_url?: string
  metadata?: Record<string, unknown>
}

export async function crearNotificacion(input: CrearNotificacionInput): Promise<void> {
  const supabase = createAdminClient()

  const { data: notif, error } = await supabase
    .from('notificaciones')
    .insert({
      usuario_id: input.usuario_id,
      tipo: input.tipo,
      titulo: input.titulo,
      mensaje: input.mensaje,
      accion_url: input.accion_url ?? null,
      metadata: input.metadata ?? null,
    })
    .select('id')
    .single()

  if (error) {
    console.error('[Notif] Error creando notificación:', error)
    return
  }

  // Intentar enviar push si el usuario tiene suscripciones activas
  const { data: suscripciones } = await supabase
    .from('push_subscriptions')
    .select('endpoint, p256dh, auth')
    .eq('usuario_id', input.usuario_id)
    .eq('activa', true)

  if (!suscripciones?.length) return

  const payload: PushPayload = {
    title: input.titulo,
    body: input.mensaje,
    url: input.accion_url ?? '/notificaciones',
    tag: `${input.tipo}_${notif.id}`,
    notificacion_id: notif.id,
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  const apiKey = process.env.INTERNAL_API_KEY
  if (!appUrl || !apiKey) return

  await fetch(`${appUrl}/api/push/enviar`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-internal-api-key': apiKey,
    },
    body: JSON.stringify({ usuario_id: input.usuario_id, payload }),
  }).catch(e => console.error('[Push] Error:', e))
}

export async function crearNotificacionMasiva(
  usuario_ids: string[],
  base: Omit<CrearNotificacionInput, 'usuario_id'>
): Promise<void> {
  await Promise.allSettled(
    usuario_ids.map(id => crearNotificacion({ ...base, usuario_id: id }))
  )
}
