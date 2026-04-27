export interface AsignacionResumen {
  id: string
  lectura_id: string
  titulo: string
  portada_url: string | null
  aula_nombre: string
  grado_nombre: string
  fecha_limite: string | null
  total_estudiantes: number
  completados: number
  porcentaje: number
  estado: 'activo' | 'cerrado' | 'cancelado'
}

export interface LecturaTopStat {
  lectura_id: string
  titulo: string
  portada_url: string | null
  total_lecturas: number
}

export interface AulaConDetalle {
  id: string
  nombre: string | null
  anio_lectivo: number
  grado_nombre: string
  seccion_nombre: string
}

export interface IntentoConDatos {
  id: string
  estudiante_id: string
  estudiante_nombre: string
  estudiante_apellido: string
  asignacion_id: string
  estado: string
  nota_automatica: number | null
  nota_final: number | null
  fecha_completado: string | null
}

export interface RespuestaAbiertaParaRevisar {
  id: string
  pregunta_id: string
  enunciado: string
  orden: number
  puntaje_maximo: number
  texto_respuesta: string
  puntaje_obtenido: number
}

export interface RevisionInput {
  intentoId: string
  revisiones: {
    respuestaId: string
    puntaje: number
    comentario: string
  }[]
}

export interface NuevaLecturaInput {
  titulo: string
  autor: string
  descripcion?: string
  materia_id?: string
  categoria_id?: string
  grado_id?: string
  nivel_dificultad_id?: string
  anio_publicacion?: number
  paginas_total?: number
  es_global: boolean
  estado: 'borrador' | 'publicado'
  profesorId: string
}

export interface NuevaAsignacionInput {
  lectura_id: string
  aula_id: string
  profesorId: string
  fecha_inicio: string
  fecha_limite?: string
  bimestre_id?: string
  instrucciones?: string
  requiere_evaluacion?: boolean
  tipo_evaluacion?: 'sin_evaluacion' | 'opcion_multiple' | 'respuesta_abierta' | 'mixta'
}
