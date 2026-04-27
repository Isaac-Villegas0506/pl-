'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function registrarDescargaAction(
  lecturaId: string,
  estudianteId: string,
  nombreArchivo: string,
  tamanio: number
): Promise<{ success: boolean }> {
  const supabase = await createClient()

  const { error } = await (supabase as any)
    .from('descargas_offline')
    .upsert({
      estudiante_id: estudianteId,
      lectura_id: lecturaId,
      archivo_nombre: nombreArchivo,
      archivo_tamanio: tamanio,
      activa: true,
      descargado_en: new Date().toISOString(),
    }, { onConflict: 'estudiante_id, lectura_id' })

  if (!error) {
    await (supabase as any).rpc('incrementar_descargas', { p_lectura_id: lecturaId })
    revalidatePath('/mis-libros')
  }

  return { success: !error }
}

export async function eliminarDescargaAction(
  lecturaId: string,
  estudianteId: string
): Promise<{ success: boolean }> {
  const supabase = await createClient()

  const { error } = await (supabase as any)
    .from('descargas_offline')
    .update({ activa: false })
    .eq('lectura_id', lecturaId)
    .eq('estudiante_id', estudianteId)

  revalidatePath('/mis-libros')
  return { success: !error }
}

export async function actualizarUltimaAperturaAction(
  lecturaId: string,
  estudianteId: string
): Promise<void> {
  const supabase = await createClient()
  await (supabase as any)
    .from('descargas_offline')
    .update({ ultima_apertura: new Date().toISOString() })
    .eq('lectura_id', lecturaId)
    .eq('estudiante_id', estudianteId)
}
