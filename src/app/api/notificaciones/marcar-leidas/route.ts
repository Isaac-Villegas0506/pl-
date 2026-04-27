import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { ids } = await req.json() as { ids: string[] }
  if (!ids?.length) return NextResponse.json({ success: true })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any
  const { data: usuario } = await sb
    .from('usuarios').select('id').eq('auth_id', user.id).single()

  if (!usuario) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })

  await sb
    .from('notificaciones')
    .update({ leida: true })
    .in('id', ids)
    .eq('usuario_id', usuario.id)

  return NextResponse.json({ success: true })
}
