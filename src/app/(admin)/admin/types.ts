export interface UsuarioConDetalle {
  id: string
  auth_id: string
  nombre: string
  apellido: string
  email: string
  dni: string | null
  rol: 'administrador' | 'profesor' | 'estudiante'
  activo: boolean
  created_at: string
  aula?: { grado_nombre: string; seccion_nombre: string }
}

export interface FiltrosUsuario {
  rol?: string
  activo?: boolean
  busqueda?: string
  pagina?: number
}

export interface NuevoUsuarioInput {
  nombre: string
  apellido: string
  email: string
  password: string
  rol: 'administrador' | 'profesor' | 'estudiante'
  dni?: string
  aula_id?: string
  anio_lectivo?: number
  aulas_profesor?: string[]
}

export interface EditarUsuarioInput {
  nombre?: string
  apellido?: string
  email?: string
  dni?: string
  rol?: string
  activo?: boolean
  aula_id?: string
  auth_id?: string
  aulas_profesor?: string[]
}

export interface NuevaPreguntaInput {
  lectura_id: string
  enunciado: string
  tipo: 'opcion_multiple' | 'verdadero_falso' | 'abierta'
  puntaje: number
  imagen_url?: string
  activo: boolean
  opciones?: { texto: string; es_correcta: boolean }[]
  opcion_correcta_vf?: boolean
}

export interface EditarPreguntaInput extends NuevaPreguntaInput {}

export interface ConfigSistema {
  nombre_institucion: string
  anio_lectivo: number
  permitir_registro: boolean
  nota_minima_aprobacion: number
  escala_maxima: number
  correo_soporte: string
}

export interface GradoConSecciones {
  id: string
  nombre: string
  total_estudiantes: number
  secciones: {
    id: string
    nombre: string
    total_estudiantes: number
    aula_id: string
  }[]
}

export interface DataMensual {
  mes: string
  count: number
}

export interface RendimientoPorGrado {
  grado_id: string
  grado_nombre: string
  promedio_nota: number
  tasa_aprobacion: number
  total_intentos: number
  secciones: {
    seccion_nombre: string
    total_estudiantes: number
    promedio_nota: number
    aprobados: number
    reprobados: number
  }[]
}

export interface LecturaAdminResumen {
  id: string
  titulo: string
  autor: string
  estado: 'borrador' | 'publicado' | 'archivado'
  portada_url: string | null
  es_global: boolean
  total_preguntas: number
  total_asignaciones: number
  materia_nombre: string | null
  grado_nombre: string | null
  created_at: string
}

export interface ItemCatalogo {
  id: string
  nombre: string
  activo?: boolean
  color?: string | null
}

export interface BimestreAdmin {
  id: string
  nombre: string
  fecha_inicio: string | null
  fecha_fin: string | null
  activo: boolean
  anio_lectivo: number
}

export interface ActividadReciente {
  tipo: 'usuario' | 'lectura'
  descripcion: string
  created_at: string
  id: string
}
