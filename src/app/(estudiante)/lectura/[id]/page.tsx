import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  getLecturaDetalle, getProgresoLectura, getAsignacionActiva,
  getTotalPreguntas, getEsFavorito,
} from './queries'
import LecturaDetalleContent from './LecturaDetalleContent'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function LecturaDetallePage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: perfilData } = await supabase
    .from('usuarios')
    .select('id')
    .eq('auth_id', user.id)
    .single()

  const perfil = perfilData as Record<string, unknown> | null
  if (!perfil) redirect('/login')
  const estudianteId = perfil.id as string

  const [lectura, progreso, asignacion, totalPreguntas, esFavorito] = await Promise.all([
    getLecturaDetalle(supabase, id),
    getProgresoLectura(supabase, estudianteId, id),
    getAsignacionActiva(supabase, estudianteId, id),
    getTotalPreguntas(supabase, id),
    getEsFavorito(supabase, estudianteId, id),
  ])

  if (!lectura) notFound()

  return (
    <LecturaDetalleContent
      lectura={lectura}
      progreso={progreso}
      asignacion={asignacion}
      totalPreguntas={totalPreguntas}
      esFavorito={esFavorito}
      usuarioId={estudianteId}
    />
  )
}
