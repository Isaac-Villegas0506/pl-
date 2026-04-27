import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { enviarPushAUsuario, type PushPayload } from '@/lib/webpush'

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get('x-internal-api-key')
  if (apiKey !== process.env.INTERNAL_API_KEY) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any
  const { usuario_id, payload } = await req.json() as {
    usuario_id: string
    payload: PushPayload
  }

  const { data: suscripciones } = await sb
    .from('push_subscriptions')
    .select('endpoint, p256dh, auth')
    .eq('usuario_id', usuario_id)
    .eq('activa', true)

  if (!suscripciones?.length) {
    return NextResponse.json({ enviado: false, razon: 'Sin suscripciones activas' })
  }

  const resultados = await Promise.allSettled(
    (suscripciones as { endpoint: string; p256dh: string; auth: string }[]).map(async (sub) => {
      const exito = await enviarPushAUsuario(sub, payload)
      if (!exito) {
        await sb.from('push_subscriptions').update({ activa: false }).eq('endpoint', sub.endpoint)
      }
      return exito
    })
  )

  const enviados = resultados.filter(r => r.status === 'fulfilled' && r.value === true).length
  return NextResponse.json({ enviado: enviados > 0, total: enviados })
}
