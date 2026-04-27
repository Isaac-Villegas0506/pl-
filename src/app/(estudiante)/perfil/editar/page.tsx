import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import EditarPerfilContent from './EditarPerfilContent'
import { UsuarioPerfil } from '../types'

export default async function EditarPerfilPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: usuario } = await supabase
    .from('usuarios')
    .select('id, auth_id, nombre, apellido, email, avatar_url, bio, color_perfil, created_at, rol')
    .eq('auth_id', user.id)
    .single()

  if (!usuario) redirect('/login')

  return <EditarPerfilContent usuario={usuario as UsuarioPerfil} />
}
