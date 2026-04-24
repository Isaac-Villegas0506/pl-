import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getAsignacionConLectura, getPreguntasDeAsignacion, getIntentoCompletado } from './queries'
import IntroduccionContent from './IntroduccionContent'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EvaluacionIntroPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  // Verificar sesión
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: usuarioRaw } = await supabase
    .from('usuarios')
    .select('id')
    .eq('auth_id', user.id)
    .single()

  const usuario = usuarioRaw as { id: string } | null
  if (!usuario) redirect('/login')

  // Carga paralela
  const [asignacion, intentoCompletado] = await Promise.all([
    getAsignacionConLectura(supabase, id),
    getIntentoCompletado(supabase, id, usuario.id),
  ])

  if (!asignacion) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: '20px', background: '#F5F3FF',
      }}>
        <p style={{ fontSize: '16px', color: '#6B7280', textAlign: 'center' }}>
          No se encontró la asignación.
        </p>
      </div>
    )
  }

  // Si ya completó → ir al resultado
  if (intentoCompletado) {
    redirect(`/evaluacion/${id}/resultado`)
  }

  // Cargar preguntas
  const preguntas = await getPreguntasDeAsignacion(supabase, asignacion.lectura_id)

  if (preguntas.length === 0) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: '20px', background: '#F5F3FF',
      }}>
        <p style={{ fontSize: '16px', color: '#6B7280', textAlign: 'center' }}>
          Esta lectura no tiene preguntas configuradas.
        </p>
      </div>
    )
  }

  const totalPreguntas = preguntas.length
  const puntajeTotal = preguntas.reduce((acc, p) => acc + p.puntaje, 0)
  const tiempoEstimado = totalPreguntas * 2

  return (
    <IntroduccionContent
      asignacion={asignacion}
      totalPreguntas={totalPreguntas}
      puntajeTotal={puntajeTotal}
      tiempoEstimado={tiempoEstimado}
      asignacionId={id}
      estudianteId={usuario.id}
    />
  )
}
