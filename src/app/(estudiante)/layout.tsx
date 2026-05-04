import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BottomNav, DesktopSidebar } from '@/components/layout'
import ToastNotificacion from '@/components/notificaciones/ToastNotificacion'
import InstalarAppBanner from '@/components/pwa/InstalarAppBanner'
import SolicitarPermisosPush from '@/components/pwa/SolicitarPermisosPush'

import './estudiante.css'

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
    <div className="estudiante-shell">
      {/* Sidebar: visible only on desktop via CSS */}
      <DesktopSidebar />

      {/* Main content area */}
      <main className="estudiante-main">
        {children}
      </main>

      {/* Bottom Nav: visible only on mobile via CSS */}
      <BottomNav />

      {/* Global overlays */}
      <ToastNotificacion />
      <InstalarAppBanner />
      {perfil?.id && <SolicitarPermisosPush usuarioId={perfil.id} />}
    </div>
  )
}
