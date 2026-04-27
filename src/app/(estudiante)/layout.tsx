import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BottomNav } from '@/components/layout'
import ToastNotificacion from '@/components/notificaciones/ToastNotificacion'
import InstalarAppBanner from '@/components/pwa/InstalarAppBanner'
import SolicitarPermisosPush from '@/components/pwa/SolicitarPermisosPush'

export default async function EstudianteLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: perfilData } = await supabase
    .from('usuarios')
    .select('id, rol')
    .eq('auth_id', user.id)
    .single()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const perfil = perfilData as any

  if (perfil?.rol === 'administrador') redirect('/admin/dashboard')
  if (perfil?.rol === 'profesor') redirect('/profesor/dashboard')

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F5F3FF',
      paddingBottom: '80px',
    }}>
      {children}
      <BottomNav />
      <ToastNotificacion />
      <InstalarAppBanner />
      {perfil?.id && <SolicitarPermisosPush usuarioId={perfil.id} />}
    </div>
  )
}
