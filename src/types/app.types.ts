import type { Database } from './database.types'

export type Rol = 'administrador' | 'profesor' | 'estudiante'
export type EstadoLectura = 'borrador' | 'publicado' | 'archivado'
export type TipoPregunta = 'opcion_multiple' | 'verdadero_falso' | 'abierta'
export type EstadoIntento = 'en_progreso' | 'completado' | 'revisando'

export interface UsuarioSesion {
  id: string
  auth_id: string
  email: string
  nombre: string
  apellido: string
  rol: Rol
  avatar_url: string | null
}

export interface LecturaConRelaciones {
  id: string
  titulo: string
  autor: string
  descripcion: string | null
  portada_url: string | null
  es_global: boolean
  estado: EstadoLectura
  materias: { nombre: string; color: string | null } | null
  categorias: { nombre: string } | null
  niveles_dificultad: { nombre: string } | null
  grados: { nombre: string } | null
}

export interface FiltrosExploracion {
  grado_id?: string
  materia_id?: string
  categoria_id?: string
  nivel_dificultad_id?: string
  busqueda?: string
}

export interface OpcionRespuesta {
  id: string
  pregunta_id: string
  texto: string
  es_correcta: boolean
  orden: number
}

export interface PreguntaConOpciones {
  id: string
  lectura_id: string
  enunciado: string
  tipo: TipoPregunta
  puntaje: number
  orden: number
  imagen_url: string | null
  activo: boolean
  created_at: string
  opciones: OpcionRespuesta[]
}

export interface ResultadoIntento {
  intento: Database['public']['Tables']['intentos_lectura']['Row']
  respuestas: Database['public']['Tables']['respuestas_estudiante']['Row'][]
  total_preguntas: number
  correctas: number
  nota_automatica: number
  nota_sobre_20: number
}
