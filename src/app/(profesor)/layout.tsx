import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProfesorNavBar from '@/components/layout/ProfesorNavBar'
import type { ReactNode } from 'react'

export default async function ProfesorLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: perfilData } = await supabase
    .from('usuarios')
    .select('id, rol')
    .eq('auth_id', user.id)
    .single()

  const perfil = perfilData as { id: string; rol: string } | null

  if (!perfil) redirect('/login')
  if (perfil.rol === 'estudiante') redirect('/inicio')

  return (
    <div style={{ minHeight: '100vh', background: '#F5F3FF', paddingBottom: '76px' }}>
      {children}
      <ProfesorNavBar />
    </div>
  )
}
