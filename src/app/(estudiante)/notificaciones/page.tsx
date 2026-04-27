import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import NotificacionesContent from './NotificacionesContent'
import type { Notificacion } from '@/hooks/useNotificaciones'

export default async function NotificacionesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: perfilData } = await supabase
    .from('usuarios')
    .select('id')
    .eq('auth_id', user.id)
    .single()

  const perfil = perfilData as { id: string } | null
  if (!perfil) redirect('/login')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from('notificaciones')
    .select('id, tipo, titulo, mensaje, leida, accion_url, created_at')
    .eq('usuario_id', perfil.id)
    .order('created_at', { ascending: false })
    .limit(50)

  const notificaciones = (data ?? []) as Notificacion[]

  return (
    <NotificacionesContent
      notificacionesIniciales={notificaciones}
      usuarioId={perfil.id}
    />
  )
}
