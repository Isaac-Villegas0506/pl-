import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TopBar } from '@/components/layout'
import NotificacionesLista from './NotificacionesLista'

export default async function NotificacionesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: perfilData } = await supabase
    .from('usuarios')
    .select('id')
    .eq('auth_id', user.id)
    .single()

  const perfil = perfilData as Record<string, unknown> | null
  if (!perfil) redirect('/login')

  const usuarioId = perfil.id as string

  const { data: notificacionesRaw } = await supabase
    .from('notificaciones')
    .select('*')
    .eq('usuario_id', usuarioId)
    .order('created_at', { ascending: false })
    .limit(30)

  const notificaciones = ((notificacionesRaw as Record<string, unknown>[] | null) ?? []).map(
    (n) => ({
      id: n.id as string,
      tipo: n.tipo as 'asignacion' | 'vencimiento' | 'calificacion' | 'sistema',
      titulo: n.titulo as string,
      mensaje: (n.mensaje as string | null) ?? null,
      leida: n.leida as boolean,
      url_destino: (n.url_destino as string | null) ?? null,
      created_at: n.created_at as string,
    })
  )

  // Marcar todas como leídas
  await (supabase as any)
    .from('notificaciones')
    .update({ leida: true })
    .eq('usuario_id', usuarioId)
    .eq('leida', false)

  return (
    <div>
      <TopBar title="Notificaciones" showBack />
      <NotificacionesLista notificaciones={notificaciones} />
    </div>
  )
}
