import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import NuevaAsignacionForm from './NuevaAsignacionForm'
import type { AulaConDetalle } from '../../types'
import type { LecturaConRelaciones } from '@/types/app.types'

interface Props {
  searchParams: Promise<{ lectura_id?: string }>
}

export default async function NuevaAsignacionPage({ searchParams }: Props) {
  const { lectura_id } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: perfilData } = await supabase
    .from('usuarios').select('id').eq('auth_id', user.id).single()
  const profesor = perfilData as { id: string } | null
  if (!profesor) redirect('/login')

  const { data: lecturasRaw } = await supabase
    .from('lecturas')
    .select('id, titulo, autor, descripcion, portada_url, es_global, estado, materias(nombre,color), categorias(nombre), niveles_dificultad(nombre), grados(nombre)')
    .eq('estado', 'publicado')
    .order('titulo')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabaseAny = supabase as any

  const { data: aulasRaw } = await supabaseAny
    .from('aulas')
    .select('id, nombre, anio_lectivo, secciones(nombre, grados(nombre))')
    .order('anio_lectivo', { ascending: false })

  const aulas: AulaConDetalle[] = ((aulasRaw ?? []) as any[]).map(a => ({
    id: a.id as string,
    nombre: a.nombre as string | null,
    anio_lectivo: a.anio_lectivo as number,
    seccion_nombre: (a.secciones as any)?.nombre ?? '',
    grado_nombre: (a.secciones as any)?.grados?.nombre ?? '',
  }))

  return (
    <NuevaAsignacionForm
      profesorId={profesor.id}
      aulas={aulas}
      lecturas={(lecturasRaw ?? []) as LecturaConRelaciones[]}
      bimestres={[
        { id: 'b1', nombre: 'Bimestre I' },
        { id: 'b2', nombre: 'Bimestre II' },
        { id: 'b3', nombre: 'Bimestre III' },
        { id: 'b4', nombre: 'Bimestre IV' },
      ]}
      lecturaPreseleccionada={lectura_id}
    />
  )
}
