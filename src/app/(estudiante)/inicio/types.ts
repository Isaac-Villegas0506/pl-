export interface LecturaEnProgresoConDetalle {
  progreso_id: string
  lectura_id: string
  titulo: string
  autor: string
  portada_url: string | null
  porcentaje: number
  pagina_actual: number
  paginas_total: number | null
  categoria_nombre: string | null
  asignacion_id: string | null
  updated_at: string
}

export interface AsignacionConLectura {
  asignacion_id: string
  lectura_id: string
  titulo: string
  autor: string
  portada_url: string | null
  fecha_limite: string | null
  instrucciones: string | null
  materia_nombre: string | null
  materia_color: string | null
  dias_restantes: number | null
}
