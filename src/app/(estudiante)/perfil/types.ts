export interface UsuarioPerfil {
  id: string
  auth_id: string
  nombre: string
  apellido: string
  email: string
  avatar_url: string | null
  bio: string | null
  color_perfil: string
  created_at: string
  rol: string
}

export interface EstadisticasEstudiante {
  estudiante_id: string
  total_lecturas_completadas: number
  total_evaluaciones: number
  promedio_notas: number
  mejor_nota: number
  racha_actual: number
  racha_maxima: number
  total_puntos_logros: number
  ultimo_acceso: string | null
}

export interface Logro {
  id: string
  codigo: string
  nombre: string
  descripcion: string
  icono: string
  categoria: string
  condicion_tipo: string
  condicion_valor: number
  puntos: number
  rareza: 'comun' | 'raro' | 'epico' | 'legendario'
}

export interface LogroDesbloqueado {
  id: string
  logro_id: string
  desbloqueado_en: string
  logro: Logro
}
