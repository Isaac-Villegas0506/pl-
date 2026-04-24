import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BottomNav } from '@/components/layout'

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
    .select('*')
    .eq('auth_id', user.id)
    .single()

  const perfil = perfilData as any

  if (perfil?.rol === 'administrador') redirect('/admin/dashboard')
  if (perfil?.rol === 'profesor') redirect('/profesor/dashboard')

  return (
    <div className="min-h-screen bg-[#F0F4F8] pb-20">
      {children}
      <BottomNav />
    </div>
  )
}
