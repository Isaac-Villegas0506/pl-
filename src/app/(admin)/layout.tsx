import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminNavBar from '@/components/layout/AdminNavBar'
import type { ReactNode } from 'react'

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabaseAny = supabase as any
  const { data: perfilData } = await supabaseAny
    .from('usuarios')
    .select('id, rol')
    .eq('auth_id', user.id)
    .single()

  const perfil = perfilData as { id: string; rol: string } | null

  if (!perfil) redirect('/login')
  if (perfil.rol !== 'administrador') redirect('/inicio')

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', paddingBottom: '76px' }}>
      {children}
      <AdminNavBar />
    </div>
  )
}
