import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ConfiguracionContent from './ConfiguracionContent'
import { UsuarioPerfil } from '../types'

export default async function ConfiguracionPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: usuario } = await supabase
    .from('usuarios')
    .select('id, auth_id, nombre, apellido, email, avatar_url, bio, color_perfil, created_at, rol')
    .eq('auth_id', user.id)
    .single()

  if (!usuario) redirect('/login')

  return <ConfiguracionContent usuario={usuario as UsuarioPerfil} />
}
