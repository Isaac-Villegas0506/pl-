import type { TipoPregunta } from '@/types/app.types'

export interface AsignacionConLectura {
  id: string
  lectura_id: string
  titulo: string
  autor: string
  portada_url: string | null
  fecha_limite: string | null
  instrucciones: string | null
  materia_nombre: string | null
}

export interface OpcionRespuesta {
  id: string
  texto: string
  es_correcta: boolean
  orden: number
}

export interface PreguntaConOpciones {
  id: string
  enunciado: string
  tipo: TipoPregunta
  puntaje: number
  orden: number
  imagen_url: string | null
  opciones: OpcionRespuesta[]
}

export interface GuardarRespuestaInput {
  intentoId: string
  preguntaId: string
  opcionId?: string
  textoRespuesta?: string
  estudianteId: string
}

export interface RespuestaDetalle {
  pregunta_id: string
  enunciado: string
  tipo: TipoPregunta
  puntaje_pregunta: number
  puntaje_obtenido: number
  es_correcta: boolean | null
  texto_respuesta_estudiante: string | null
  texto_opcion_estudiante: string | null
  texto_opcion_correcta: string | null
}
