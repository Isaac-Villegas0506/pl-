import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { UsuarioSesion } from '@/types/app.types'
import {
  getLecturaEnProgreso,
  getRecomendados,
  getPendientes,
  getNotificacionesCount,
} from './queries'
import InicioContent from './InicioContent'

export default async function InicioPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: perfilData } = await supabase
    .from('usuarios')
    .select('*')
    .eq('auth_id', user.id)
    .single()

  const perfil = perfilData as Record<string, unknown> | null

  if (!perfil) redirect('/login')

  const usuario: UsuarioSesion = {
    id: perfil.id as string,
    auth_id: perfil.auth_id as string,
    email: perfil.email as string,
    nombre: perfil.nombre as string,
    apellido: perfil.apellido as string,
    rol: perfil.rol as 'administrador' | 'profesor' | 'estudiante',
    avatar_url: (perfil.avatar_url as string | null) ?? null,
  }

  const estudianteId = usuario.id

  const [lecturaEnProgreso, recomendados, pendientes, notificacionesCount] =
    await Promise.all([
      getLecturaEnProgreso(supabase, estudianteId),
      getRecomendados(supabase, estudianteId),
      getPendientes(supabase, estudianteId),
      getNotificacionesCount(supabase, usuario.id),
    ])

  return (
    <InicioContent
      usuario={usuario}
      lecturaEnProgreso={lecturaEnProgreso}
      recomendados={recomendados}
      pendientes={pendientes}
      notificacionesCount={notificacionesCount}
    />
  )
}
