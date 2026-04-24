'use server'

import { createClient } from '@/lib/supabase/server'
import type { GuardarProgresoInput } from './types'

export async function toggleFavoritoAction(
  lecturaId: string,
  estudianteId: string,
  esFavoritoActual: boolean
): Promise<{ success: boolean; esFavorito: boolean }> {
  try {
    const supabase = await createClient()

    if (esFavoritoActual) {
      const { error } = await (supabase as any)
        .from('favoritos')
        .delete()
        .eq('usuario_id', estudianteId)
        .eq('lectura_id', lecturaId)

      if (error) return { success: false, esFavorito: true }
      return { success: true, esFavorito: false }
    } else {
      const { error } = await (supabase as any)
        .from('favoritos')
        .insert({ usuario_id: estudianteId, lectura_id: lecturaId })

      if (error) return { success: false, esFavorito: false }
      return { success: true, esFavorito: true }
    }
  } catch {
    return { success: false, esFavorito: esFavoritoActual }
  }
}

export async function guardarProgresoAction(
  datos: GuardarProgresoInput
): Promise<{ success: boolean }> {
  try {
    const supabase = await createClient()

    const { error } = await (supabase as any)
      .from('progreso_lectura')
      .upsert(
        {
          estudiante_id: datos.estudianteId,
          lectura_id: datos.lecturaId,
          pagina_actual: datos.paginaActual,
          paginas_total: datos.paginasTotal,
          porcentaje: datos.porcentaje,
          terminado: datos.terminado,
        },
        { onConflict: 'estudiante_id,lectura_id' }
      )

    if (error) return { success: false }

    if (datos.terminado) {
      await (supabase as any)
        .from('historial_lectura')
        .upsert(
          {
            estudiante_id: datos.estudianteId,
            lectura_id: datos.lecturaId,
            fecha_fin: new Date().toISOString(),
          },
          { onConflict: 'estudiante_id,lectura_id' }
        )
    }

    return { success: true }
  } catch {
    return { success: false }
  }
}
