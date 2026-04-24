import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LoginForm from './LoginForm'

export default async function LoginPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const { data: perfilData } = await supabase
      .from('usuarios')
      .select('*')
      .eq('auth_id', user.id)
      .single()

    const perfil = perfilData as any

    const destino =
      perfil?.rol === 'administrador'
        ? '/admin/dashboard'
        : perfil?.rol === 'profesor'
          ? '/profesor/dashboard'
          : '/inicio'

    redirect(destino)
  }

  return <LoginForm />
}
