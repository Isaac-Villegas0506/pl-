export interface FiltrosOpciones {
  grados: { id: string; nombre: string; orden: number }[]
  materias: { id: string; nombre: string; color: string | null }[]
  niveles: { id: string; nombre: string; orden: number }[]
  autores: { autor: string }[]
}

export interface FiltrosActivos {
  q: string
  grado: string | undefined
  materia: string | undefined
  nivel: string | undefined
  autor: string | undefined
}
