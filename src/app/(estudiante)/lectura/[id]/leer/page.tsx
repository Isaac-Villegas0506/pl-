import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getProgresoLectura, getTotalPreguntas, getAsignacionActiva } from '../queries'
import LectorPDFContent from './LectorPDFContent'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function LeerPage({ params }: PageProps) {
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

  // Get lectura basic info
  const { data: lecturaRaw } = await supabase
    .from('lecturas')
    .select('id, titulo, autor, portada_url')
    .eq('id', id)
    .single()

  const lectura = lecturaRaw as Record<string, unknown> | null
  if (!lectura) redirect(`/lectura/${id}`)

  // Get PDF file
  const { data: archivoRaw } = await supabase
    .from('lectura_archivos')
    .select('url')
    .eq('lectura_id', id)
    .eq('tipo', 'pdf')
    .limit(1)
    .maybeSingle()

  const archivo = archivoRaw as Record<string, unknown> | null
  if (!archivo) redirect(`/lectura/${id}`)

  const [progreso, totalPreguntas, asignacion, { data: favorito }] = await Promise.all([
    getProgresoLectura(supabase, estudianteId, id),
    getTotalPreguntas(supabase, id),
    getAsignacionActiva(supabase, estudianteId, id),
    supabase.from('favoritos').select('id').eq('usuario_id', estudianteId).eq('lectura_id', id).maybeSingle(),
  ])

  return (
    <LectorPDFContent
      pdfUrl={archivo.url as string}
      lecturaId={id}
      lecturaTitulo={lectura.titulo as string}
      lecturaAutor={lectura.autor as string}
      portadaUrl={lectura.portada_url as string | null}
      asignacionId={asignacion?.id ?? null}
      totalPreguntas={totalPreguntas}
      paginaInicial={progreso?.pagina_actual ?? 1}
      estudianteId={estudianteId}
      esFavoritoInicial={!!favorito}
    />
  )
}
