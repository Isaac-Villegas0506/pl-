import webpush from 'web-push'

let vapidSet = false
function initWebPush() {
  if (vapidSet) return
  if (process.env.VAPID_SUBJECT && process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT,
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    )
    vapidSet = true
  } else {
    console.warn('[WebPush] VAPID env vars not fully set. Push might fail.')
  }
}

export { webpush }

export interface PushPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  url?: string
  tag?: string
  notificacion_id?: string
}

export async function enviarPushAUsuario(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: PushPayload
): Promise<boolean> {
  try {
    initWebPush()
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: { p256dh: subscription.p256dh, auth: subscription.auth },
      },
      JSON.stringify(payload),
      { TTL: 60 * 60 * 24, urgency: 'normal' }
    )
    return true
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      'statusCode' in error &&
      ((error as { statusCode: number }).statusCode === 404 ||
       (error as { statusCode: number }).statusCode === 410)
    ) {
      return false // Subscription expirada
    }
    console.error('[Push] Error enviando notificación:', error)
    return false
  }
}
