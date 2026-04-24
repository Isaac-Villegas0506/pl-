export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      usuarios: {
        Row: {
          id: string
          auth_id: string
          email: string
          nombre: string
          apellido: string
          rol: 'administrador' | 'profesor' | 'estudiante'
          activo: boolean
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          auth_id: string
          email: string
          nombre: string
          apellido: string
          rol: 'administrador' | 'profesor' | 'estudiante'
          activo?: boolean
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          auth_id?: string
          email?: string
          nombre?: string
          apellido?: string
          rol?: 'administrador' | 'profesor' | 'estudiante'
          activo?: boolean
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      lecturas: {
        Row: {
          id: string
          titulo: string
          autor: string
          descripcion: string | null
          portada_url: string | null
          materia_id: string | null
          categoria_id: string | null
          nivel_dificultad_id: string | null
          grado_id: string | null
          anio_publicacion: number | null
          paginas_total: number | null
          es_global: boolean
          estado: 'borrador' | 'publicado' | 'archivado'
          creado_por: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          titulo: string
          autor: string
          descripcion?: string | null
          portada_url?: string | null
          materia_id?: string | null
          categoria_id?: string | null
          nivel_dificultad_id?: string | null
          grado_id?: string | null
          anio_publicacion?: number | null
          paginas_total?: number | null
          es_global?: boolean
          estado?: 'borrador' | 'publicado' | 'archivado'
          creado_por?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          titulo?: string
          autor?: string
          descripcion?: string | null
          portada_url?: string | null
          materia_id?: string | null
          categoria_id?: string | null
          nivel_dificultad_id?: string | null
          grado_id?: string | null
          anio_publicacion?: number | null
          paginas_total?: number | null
          es_global?: boolean
          estado?: 'borrador' | 'publicado' | 'archivado'
          creado_por?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      asignaciones_lectura: {
        Row: {
          id: string
          lectura_id: string
          aula_id: string
          profesor_id: string
          bimestre_id: string | null
          instrucciones: string | null
          fecha_inicio: string
          fecha_limite: string | null
          estado: 'activo' | 'cerrado' | 'cancelado'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          lectura_id: string
          aula_id: string
          profesor_id: string
          bimestre_id?: string | null
          instrucciones?: string | null
          fecha_inicio?: string
          fecha_limite?: string | null
          estado?: 'activo' | 'cerrado' | 'cancelado'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          lectura_id?: string
          aula_id?: string
          profesor_id?: string
          bimestre_id?: string | null
          instrucciones?: string | null
          fecha_inicio?: string
          fecha_limite?: string | null
          estado?: 'activo' | 'cerrado' | 'cancelado'
          created_at?: string
          updated_at?: string
        }
      }
      intentos_lectura: {
        Row: {
          id: string
          asignacion_id: string
          estudiante_id: string
          estado: 'en_progreso' | 'completado' | 'revisando'
          nota_automatica: number | null
          nota_final: number | null
          revisado_por_profesor: boolean
          fecha_inicio: string
          fecha_completado: string | null
          created_at: string
        }
        Insert: {
          id?: string
          asignacion_id: string
          estudiante_id: string
          estado?: 'en_progreso' | 'completado' | 'revisando'
          nota_automatica?: number | null
          nota_final?: number | null
          revisado_por_profesor?: boolean
          fecha_inicio?: string
          fecha_completado?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          asignacion_id?: string
          estudiante_id?: string
          estado?: 'en_progreso' | 'completado' | 'revisando'
          nota_automatica?: number | null
          nota_final?: number | null
          revisado_por_profesor?: boolean
          fecha_inicio?: string
          fecha_completado?: string | null
          created_at?: string
        }
      }
      progreso_lectura: {
        Row: {
          id: string
          estudiante_id: string
          lectura_id: string
          pagina_actual: number
          paginas_total: number | null
          porcentaje: number
          terminado: boolean
          fecha_inicio: string
          fecha_fin: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          estudiante_id: string
          lectura_id: string
          pagina_actual?: number
          paginas_total?: number | null
          porcentaje?: number
          terminado?: boolean
          fecha_inicio?: string
          fecha_fin?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          estudiante_id?: string
          lectura_id?: string
          pagina_actual?: number
          paginas_total?: number | null
          porcentaje?: number
          terminado?: boolean
          fecha_inicio?: string
          fecha_fin?: string | null
          updated_at?: string
        }
      }
      favoritos: {
        Row: {
          id: string
          estudiante_id: string
          lectura_id: string
          created_at: string
        }
        Insert: {
          id?: string
          estudiante_id: string
          lectura_id: string
          created_at?: string
        }
        Update: {
          id?: string
          estudiante_id?: string
          lectura_id?: string
          created_at?: string
        }
      }
      historial_lectura: {
        Row: {
          id: string
          estudiante_id: string
          lectura_id: string
          nota_final: number | null
          calificacion_propia: number | null
          fecha_completado: string
        }
        Insert: {
          id?: string
          estudiante_id: string
          lectura_id: string
          nota_final?: number | null
          calificacion_propia?: number | null
          fecha_completado?: string
        }
        Update: {
          id?: string
          estudiante_id?: string
          lectura_id?: string
          nota_final?: number | null
          calificacion_propia?: number | null
          fecha_completado?: string
        }
      }
      notificaciones: {
        Row: {
          id: string
          usuario_id: string
          tipo: 'asignacion' | 'vencimiento' | 'calificacion' | 'sistema'
          titulo: string
          mensaje: string | null
          leida: boolean
          url_destino: string | null
          created_at: string
        }
        Insert: {
          id?: string
          usuario_id: string
          tipo: 'asignacion' | 'vencimiento' | 'calificacion' | 'sistema'
          titulo: string
          mensaje?: string | null
          leida?: boolean
          url_destino?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          usuario_id?: string
          tipo?: 'asignacion' | 'vencimiento' | 'calificacion' | 'sistema'
          titulo?: string
          mensaje?: string | null
          leida?: boolean
          url_destino?: string | null
          created_at?: string
        }
      }
      materias: {
        Row: {
          id: string
          nombre: string
          color: string | null
          icono: string | null
          activo: boolean
          created_at: string
        }
        Insert: {
          id?: string
          nombre: string
          color?: string | null
          icono?: string | null
          activo?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          nombre?: string
          color?: string | null
          icono?: string | null
          activo?: boolean
          created_at?: string
        }
      }
      categorias: {
        Row: {
          id: string
          nombre: string
          descripcion: string | null
          activo: boolean
          created_at: string
        }
        Insert: {
          id?: string
          nombre: string
          descripcion?: string | null
          activo?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          nombre?: string
          descripcion?: string | null
          activo?: boolean
          created_at?: string
        }
      }
      grados: {
        Row: {
          id: string
          nombre: string
          nivel: 'primaria' | 'secundaria'
          orden: number
          activo: boolean
          created_at: string
        }
        Insert: {
          id?: string
          nombre: string
          nivel: 'primaria' | 'secundaria'
          orden: number
          activo?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          nombre?: string
          nivel?: 'primaria' | 'secundaria'
          orden?: number
          activo?: boolean
          created_at?: string
        }
      }
      secciones: {
        Row: {
          id: string
          grado_id: string
          nombre: string
          activo: boolean
          created_at: string
        }
        Insert: {
          id?: string
          grado_id: string
          nombre: string
          activo?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          grado_id?: string
          nombre?: string
          activo?: boolean
          created_at?: string
        }
      }
      aulas: {
        Row: {
          id: string
          seccion_id: string
          anio_lectivo: number
          nombre: string | null
          activo: boolean
          created_at: string
        }
        Insert: {
          id?: string
          seccion_id: string
          anio_lectivo: number
          nombre?: string | null
          activo?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          seccion_id?: string
          anio_lectivo?: number
          nombre?: string | null
          activo?: boolean
          created_at?: string
        }
      }
      matriculas: {
        Row: {
          id: string
          estudiante_id: string
          aula_id: string
          estado: 'activo' | 'retirado' | 'trasladado'
          fecha_inicio: string
          fecha_fin: string | null
          created_at: string
        }
        Insert: {
          id?: string
          estudiante_id: string
          aula_id: string
          estado?: 'activo' | 'retirado' | 'trasladado'
          fecha_inicio?: string
          fecha_fin?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          estudiante_id?: string
          aula_id?: string
          estado?: 'activo' | 'retirado' | 'trasladado'
          fecha_inicio?: string
          fecha_fin?: string | null
          created_at?: string
        }
      }
      preguntas: {
        Row: {
          id: string
          lectura_id: string
          enunciado: string
          tipo: 'opcion_multiple' | 'verdadero_falso' | 'abierta'
          puntaje: number
          orden: number
          imagen_url: string | null
          activo: boolean
          created_at: string
        }
        Insert: {
          id?: string
          lectura_id: string
          enunciado: string
          tipo: 'opcion_multiple' | 'verdadero_falso' | 'abierta'
          puntaje?: number
          orden?: number
          imagen_url?: string | null
          activo?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          lectura_id?: string
          enunciado?: string
          tipo?: 'opcion_multiple' | 'verdadero_falso' | 'abierta'
          puntaje?: number
          orden?: number
          imagen_url?: string | null
          activo?: boolean
          created_at?: string
        }
      }
      opciones_respuesta: {
        Row: {
          id: string
          pregunta_id: string
          texto: string
          es_correcta: boolean
          orden: number
        }
        Insert: {
          id?: string
          pregunta_id: string
          texto: string
          es_correcta?: boolean
          orden?: number
        }
        Update: {
          id?: string
          pregunta_id?: string
          texto?: string
          es_correcta?: boolean
          orden?: number
        }
      }
      respuestas_estudiante: {
        Row: {
          id: string
          intento_id: string
          pregunta_id: string
          opcion_id: string | null
          texto_respuesta: string | null
          es_correcta: boolean | null
          puntaje_obtenido: number
          comentario_profesor: string | null
          created_at: string
        }
        Insert: {
          id?: string
          intento_id: string
          pregunta_id: string
          opcion_id?: string | null
          texto_respuesta?: string | null
          es_correcta?: boolean | null
          puntaje_obtenido?: number
          comentario_profesor?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          intento_id?: string
          pregunta_id?: string
          opcion_id?: string | null
          texto_respuesta?: string | null
          es_correcta?: boolean | null
          puntaje_obtenido?: number
          comentario_profesor?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      rol_usuario: 'administrador' | 'profesor' | 'estudiante'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
