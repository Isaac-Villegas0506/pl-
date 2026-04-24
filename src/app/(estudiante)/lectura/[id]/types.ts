export interface LecturaDetalleCompleta {
  id: string
  titulo: string
  autor: string
  descripcion: string | null
  portada_url: string | null
  paginas_total: number | null
  anio_publicacion: number | null
  es_global: boolean
  estado: string
  materias: { nombre: string; color: string | null } | null
  categorias: { nombre: string } | null
  grados: { nombre: string } | null
  archivos: { id: string; url: string; tipo: string; nombre: string | null }[]
}

export interface ProgresoLectura {
  id: string
  pagina_actual: number
  paginas_total: number | null
  porcentaje: number
  terminado: boolean
  updated_at: string
}

export interface AsignacionDetalle {
  id: string
  instrucciones: string | null
  fecha_inicio: string
  fecha_limite: string | null
  estado: string
  bimestre: { nombre: string } | null
}

export interface GuardarProgresoInput {
  estudianteId: string
  lecturaId: string
  paginaActual: number
  paginasTotal: number
  porcentaje: number
  terminado: boolean
}
