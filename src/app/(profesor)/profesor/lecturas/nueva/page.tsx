import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import NuevaLecturaForm from './NuevaLecturaForm'

export default async function NuevaLecturaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: perfilData } = await supabase
    .from('usuarios').select('id').eq('auth_id', user.id).single()
  const profesor = perfilData as { id: string } | null
  if (!profesor) redirect('/login')

  const [{ data: materias }, { data: categorias }, { data: grados }, { data: niveles }] =
    await Promise.all([
      supabase.from('materias').select('id, nombre').order('nombre'),
      supabase.from('categorias').select('id, nombre').order('nombre'),
      supabase.from('grados').select('id, nombre').order('nombre'),
      supabase.from('niveles_dificultad').select('id, nombre').order('nombre'),
    ])

  return (
    <NuevaLecturaForm
      profesorId={profesor.id}
      materias={(materias ?? []) as { id: string; nombre: string }[]}
      categorias={(categorias ?? []) as { id: string; nombre: string }[]}
      grados={(grados ?? []) as { id: string; nombre: string }[]}
      niveles={(niveles ?? []) as { id: string; nombre: string }[]}
    />
  )
}
