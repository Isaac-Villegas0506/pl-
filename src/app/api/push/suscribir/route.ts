import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const body = await req.json()
  const { endpoint, keys, userAgent } = body as {
    endpoint: string
    keys: { p256dh: string; auth: string }
    userAgent?: string
  }

  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any
  const { data: usuario } = await sb
    .from('usuarios').select('id').eq('auth_id', user.id).single()

  if (!usuario) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })

  const { error } = await sb
    .from('push_subscriptions')
    .upsert({
      usuario_id: usuario.id,
      endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
      user_agent: userAgent ?? req.headers.get('user-agent'),
      activa: true,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'endpoint' })

  if (error) return NextResponse.json({ error: 'Error al guardar suscripción' }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { endpoint } = await req.json() as { endpoint: string }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any)
    .from('push_subscriptions').update({ activa: false }).eq('endpoint', endpoint)

  return NextResponse.json({ success: true })
}
