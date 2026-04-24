import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getIntentoCompletado, getResultadoCompleto, getAsignacionConLectura, getPreguntasDeAsignacion } from '../queries'
import ResultadoContent from './ResultadoContent'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ResultadoPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: usuario } = await supabase
    .from('usuarios')
    .select('id')
    .eq('auth_id', user.id)
    .single()

  if (!usuario) redirect('/login')

  // Buscar intento completado o en revisión
  const intento = await getIntentoCompletado(supabase, id, usuario.id)
  if (!intento) redirect(`/evaluacion/${id}`)

  // Cargar asignación para totalPreguntas
  const asignacion = await getAsignacionConLectura(supabase, id)
  if (!asignacion) redirect('/inicio')

  const preguntas = await getPreguntasDeAsignacion(supabase, asignacion.lectura_id)
  const totalPreguntas = preguntas.length

  // Cargar detalle de respuestas
  const respuestasDetalle = await getResultadoCompleto(supabase, intento.id)

  // Calcular estadísticas
  const correctas = respuestasDetalle.filter((r) => r.es_correcta === true).length
  const puntajeObtenido = respuestasDetalle.reduce((acc, r) => acc + r.puntaje_obtenido, 0)
  const puntajeTotal = respuestasDetalle.reduce((acc, r) => acc + r.puntaje_pregunta, 0)
  const notaSobre20 = puntajeTotal > 0
    ? Math.round(((puntajeObtenido / puntajeTotal) * 20) * 100) / 100
    : (intento.nota_automatica ?? 0)
  const porcentaje = totalPreguntas > 0
    ? Math.round((correctas / totalPreguntas) * 100)
    : 0
  const hayPreguntasAbiertas = respuestasDetalle.some((r) => r.tipo === 'abierta')

  return (
    <ResultadoContent
      nota={notaSobre20}
      correctas={correctas}
      totalPreguntas={totalPreguntas}
      porcentaje={porcentaje}
      hayPreguntasAbiertas={hayPreguntasAbiertas}
      respuestasDetalle={respuestasDetalle}
      asignacionId={id}
    />
  )
}
