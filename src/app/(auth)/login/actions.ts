'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

type LoginResult = { success: false; error: string }

export async function loginAction(
  email: string,
  password: string
): Promise<LoginResult> {
  const supabase = await createClient()

  const { data, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (authError || !data.user) {
    return { success: false, error: 'credenciales' }
  }

  const { data: perfilData, error: perfilError } = await supabase
    .from('usuarios')
    .select('*')
    .eq('auth_id', data.user.id)
    .single()

  const perfil = perfilData as any

  if (perfilError || !perfil) {
    await supabase.auth.signOut()
    return { success: false, error: 'credenciales' }
  }

  if (!perfil.activo) {
    await supabase.auth.signOut()
    return { success: false, error: 'desactivado' }
  }

  const destino =
    perfil.rol === 'administrador'
      ? '/admin/dashboard'
      : perfil.rol === 'profesor'
        ? '/profesor/dashboard'
        : '/inicio'

  redirect(destino)
}

export async function logoutAction(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
