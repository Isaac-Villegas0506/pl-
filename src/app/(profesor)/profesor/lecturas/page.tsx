import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LecturasProfesorContent from './LecturasProfesorContent'
import type { LecturaConRelaciones } from '@/types/app.types'

export default async function LecturasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: perfilData } = await supabase
    .from('usuarios')
    .select('id, rol')
    .eq('auth_id', user.id)
    .single()

  const profesor = perfilData as { id: string; rol: string } | null
  if (!profesor) redirect('/login')

  const { data: todasLecturas } = await supabase
    .from('lecturas')
    .select(`
      id, titulo, autor, descripcion, portada_url, es_global, estado,
      materias ( nombre, color ),
      categorias ( nombre ),
      niveles_dificultad ( nombre ),
      grados ( nombre )
    `)
    .neq('estado', 'archivado')
    .order('created_at', { ascending: false })

  const lecturas = (todasLecturas ?? []) as LecturaConRelaciones[]
  const misLecturas = lecturas.filter(l => (l as unknown as { creado_por?: string }).creado_por === profesor.id)
  const globales = lecturas.filter(l => l.es_global && (l as unknown as { creado_por?: string }).creado_por !== profesor.id)

  return (
    <LecturasProfesorContent
      misLecturas={misLecturas}
      lecturasGlobales={globales}
      profesorId={profesor.id}
    />
  )
}
