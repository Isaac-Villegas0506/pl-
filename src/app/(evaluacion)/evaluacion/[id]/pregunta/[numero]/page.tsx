import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  getAsignacionConLectura,
  getPreguntasDeAsignacion,
  getIntentoActivo,
  getRespuestaPrevia,
} from '../../queries'
import PreguntaContent from './PreguntaContent'

interface Props {
  params: Promise<{ id: string; numero: string }>
}

export default async function PreguntaPage({ params }: Props) {
  const { id, numero } = await params
  const numeroPregunta = parseInt(numero, 10)

  if (isNaN(numeroPregunta) || numeroPregunta < 1) {
    redirect(`/evaluacion/${id}`)
  }

  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: usuario } = await supabase
    .from('usuarios')
    .select('id')
    .eq('auth_id', user.id)
    .single()

  if (!usuario) redirect('/login')

  // Verificar intento activo
  const intento = await getIntentoActivo(supabase, id, usuario.id)
  if (!intento) redirect(`/evaluacion/${id}`)

  // Cargar asignación y preguntas
  const asignacion = await getAsignacionConLectura(supabase, id)
  if (!asignacion) redirect(`/evaluacion/${id}`)

  const preguntas = await getPreguntasDeAsignacion(supabase, asignacion.lectura_id)
  const totalPreguntas = preguntas.length

  // Si el número está fuera de rango → resultado
  if (numeroPregunta > totalPreguntas) {
    redirect(`/evaluacion/${id}/resultado`)
  }

  const pregunta = preguntas[numeroPregunta - 1]
  if (!pregunta) redirect(`/evaluacion/${id}/resultado`)

  // Verificar respuesta previa
  const respuestaPrevia = await getRespuestaPrevia(supabase, intento.id, pregunta.id)
  const valorPrevio = respuestaPrevia?.opcion_id ?? respuestaPrevia?.texto_respuesta ?? null

  return (
    <PreguntaContent
      pregunta={pregunta}
      numeroPregunta={numeroPregunta}
      totalPreguntas={totalPreguntas}
      asignacionId={id}
      intentoId={intento.id}
      estudianteId={usuario.id}
      respuestaPrevia={valorPrevio}
    />
  )
}
