import { createClient } from '@/lib/supabase/server'
import NuevoUsuarioForm from './NuevoUsuarioForm'

export default async function NuevoUsuarioPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = (await createClient()) as any

  // Consultar grados con sus secciones y aulas de forma más robusta
  const { data: gradosData, error } = await sb
    .from('grados')
    .select(`
      id, 
      nombre, 
      orden,
      secciones ( 
        id, 
        nombre, 
        aulas ( 
          id, 
          nombre, 
          anio_lectivo 
        ) 
      )
    `)
    .eq('activo', true)
    .order('orden', { ascending: true })

  if (error) {
    console.error('Error al cargar grados para nuevo usuario:', error)
  }

  const grados = (gradosData ?? []) as any[]

  return <NuevoUsuarioForm grados={grados} />
}
