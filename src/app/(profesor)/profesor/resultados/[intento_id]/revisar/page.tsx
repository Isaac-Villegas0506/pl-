import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import RevisarContent from './RevisarContent'
import type { RespuestaAbiertaParaRevisar, IntentoConDatos } from '../../../types'

interface Props {
  params: Promise<{ intento_id: string }>
}

export default async function RevisarPage({ params }: Props) {
  const { intento_id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabaseAny = supabase as any

  // Obtener intento con datos del estudiante y asignación
  const { data: intentoRaw } = await supabaseAny
    .from('intentos_lectura')
    .select(`
      id, estudiante_id, asignacion_id, estado,
      nota_automatica, nota_final, fecha_completado,
      usuarios ( nombre, apellido ),
      asignaciones_lectura ( lecturas ( titulo ) )
    `)
    .eq('id', intento_id)
    .single()

  if (!intentoRaw) redirect('/profesor/resultados')

  const intento: IntentoConDatos = {
    id: intentoRaw.id as string,
    estudiante_id: intentoRaw.estudiante_id as string,
    estudiante_nombre: (intentoRaw.usuarios as any)?.nombre ?? '',
    estudiante_apellido: (intentoRaw.usuarios as any)?.apellido ?? '',
    asignacion_id: intentoRaw.asignacion_id as string,
    estado: intentoRaw.estado as string,
    nota_automatica: intentoRaw.nota_automatica as number | null,
    nota_final: intentoRaw.nota_final as number | null,
    fecha_completado: intentoRaw.fecha_completado as string | null,
  }

  const lecturaTitulo: string =
    (intentoRaw.asignaciones_lectura as any)?.lecturas?.titulo ?? 'Sin título'

  // Obtener respuestas de preguntas abiertas con su enunciado
  const { data: respuestasRaw } = await supabaseAny
    .from('respuestas_estudiante')
    .select(`
      id, pregunta_id, texto_respuesta, puntaje_obtenido,
      preguntas ( enunciado, puntaje, orden, tipo )
    `)
    .eq('intento_id', intento_id)

  const respuestasAbiertas: RespuestaAbiertaParaRevisar[] = ((respuestasRaw ?? []) as any[])
    .filter(r => (r.preguntas as any)?.tipo === 'abierta' && r.texto_respuesta)
    .map(r => ({
      id: r.id as string,
      pregunta_id: r.pregunta_id as string,
      enunciado: (r.preguntas as any)?.enunciado ?? '',
      orden: (r.preguntas as any)?.orden ?? 0,
      puntaje_maximo: (r.preguntas as any)?.puntaje ?? 1,
      texto_respuesta: r.texto_respuesta as string,
      puntaje_obtenido: (r.puntaje_obtenido as number) ?? 0,
    }))
    .sort((a, b) => a.orden - b.orden)

  return (
    <RevisarContent
      intento={intento}
      respuestasAbiertas={respuestasAbiertas}
      estudianteNombre={`${intento.estudiante_nombre} ${intento.estudiante_apellido}`}
      lecturaTitulo={lecturaTitulo}
    />
  )
}
