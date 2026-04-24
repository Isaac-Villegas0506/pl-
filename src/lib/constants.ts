export const ROLES = {
  ADMIN: 'administrador',
  PROFESOR: 'profesor',
  ESTUDIANTE: 'estudiante',
} as const

export const ESTADO_LECTURA = {
  BORRADOR: 'borrador',
  PUBLICADO: 'publicado',
  ARCHIVADO: 'archivado',
} as const

export const TIPO_PREGUNTA = {
  MULTIPLE: 'opcion_multiple',
  VERDADERO_FALSO: 'verdadero_falso',
  ABIERTA: 'abierta',
} as const

export const ESTADO_INTENTO = {
  EN_PROGRESO: 'en_progreso',
  COMPLETADO: 'completado',
  REVISANDO: 'revisando',
} as const

export const ESCALA_NOTA = {
  MIN: 0,
  MAX: 20,
  APROBADO: 11,
} as const

export const RUTAS = {
  LOGIN: '/login',
  RECUPERAR: '/recuperar',
  INICIO_ESTUDIANTE: '/inicio',
  EXPLORAR: '/explorar',
  MIS_LIBROS: '/mis-libros',
  FAVORITOS: '/favoritos',
  HISTORIAL: '/historial',
  PERFIL: '/perfil',
  DASHBOARD_PROFESOR: '/profesor/dashboard',
  LECTURAS_PROFESOR: '/profesor/lecturas',
  ASIGNACIONES: '/profesor/asignaciones',
  AULAS_PROFESOR: '/profesor/aulas',
  RESULTADOS: '/profesor/resultados',
  DASHBOARD_ADMIN: '/admin/dashboard',
  USUARIOS_ADMIN: '/admin/usuarios',
  LECTURAS_ADMIN: '/admin/lecturas',
  REPORTES: '/admin/reportes',
} as const

export const APP_CONFIG = {
  NOMBRE: 'Plan de Lectura',
  NOMBRE_CORTO: 'PlanLector',
  META_ANUAL_DEFAULT: 12,
  PDF_MAX_MB: 50,
  PDF_MAX_BYTES: 52428800,
  PAGINADO: 10,
  ESCALA_RATING: 5,
} as const

export const MATERIAS_DEFAULT = [
  { nombre: 'Matemática', color: '#2563EB' },
  { nombre: 'Literatura', color: '#8B5CF6' },
  { nombre: 'Química', color: '#10B981' },
  { nombre: 'Historia', color: '#F97316' },
  { nombre: 'Biología', color: '#14B8A6' },
  { nombre: 'Física', color: '#EF4444' },
  { nombre: 'Ciencias', color: '#059669' },
] as const
