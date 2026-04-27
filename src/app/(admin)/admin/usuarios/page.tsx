import { createClient } from '@/lib/supabase/server'
import UsuariosContent from './UsuariosContent'
import type { UsuarioConDetalle, FiltrosUsuario } from '../types'

const POR_PAGINA = 20

export default async function UsuariosPage({
  searchParams,
}: {
  searchParams: Promise<{ rol?: string; busqueda?: string; pagina?: string; activo?: string }>
}) {
  const params = await searchParams
  const pagina = parseInt(params.pagina ?? '1', 10)
  const filtros: FiltrosUsuario = {
    rol: params.rol,
    busqueda: params.busqueda,
    pagina,
    activo: params.activo === 'false' ? false : params.activo === 'true' ? true : undefined,
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = (await createClient()) as any

  let query = sb
    .from('usuarios')
    .select(`
      id, auth_id, nombre, apellido, email, dni, rol, activo, created_at,
      estudiantes_aulas (
        aulas (
          nombre,
          secciones ( nombre, grados ( nombre ) )
        )
      )
    `, { count: 'exact' })

  if (filtros.rol && filtros.rol !== 'todos') {
    if (filtros.rol === 'inactivo') {
      query = query.eq('activo', false)
    } else {
      query = query.eq('rol', filtros.rol).eq('activo', true)
    }
  }

  if (filtros.busqueda) {
    query = query.or(
      `nombre.ilike.%${filtros.busqueda}%,apellido.ilike.%${filtros.busqueda}%,email.ilike.%${filtros.busqueda}%`
    )
  }

  if (filtros.activo !== undefined) {
    query = query.eq('activo', filtros.activo)
  }

  const desde = (pagina - 1) * POR_PAGINA
  query = query
    .order('created_at', { ascending: false })
    .range(desde, desde + POR_PAGINA - 1)

  const { data, count } = await query

  const rows = (data ?? []) as Array<{
    id: string; auth_id: string; nombre: string; apellido: string
    email: string; dni: string | null; rol: string; activo: boolean
    created_at: string
    estudiantes_aulas: Array<{
      aulas: { nombre: string | null; secciones: { nombre: string; grados: { nombre: string } } | null } | null
    }>
  }>

  const usuarios: UsuarioConDetalle[] = rows.map(u => {
    const aulaData = u.estudiantes_aulas?.[0]?.aulas
    return {
      id: u.id,
      auth_id: u.auth_id,
      nombre: u.nombre,
      apellido: u.apellido,
      email: u.email,
      dni: u.dni,
      rol: u.rol as UsuarioConDetalle['rol'],
      activo: u.activo,
      created_at: u.created_at,
      aula: aulaData
        ? {
            grado_nombre: aulaData.secciones?.grados?.nombre ?? '',
            seccion_nombre: aulaData.secciones?.nombre ?? '',
          }
        : undefined,
    }
  })

  const total = (count as number) ?? 0
  const totalPaginas = Math.ceil(total / POR_PAGINA)

  return (
    <UsuariosContent
      usuarios={usuarios}
      total={total}
      pagina={pagina}
      totalPaginas={totalPaginas}
      filtrosActivos={filtros}
    />
  )
}
