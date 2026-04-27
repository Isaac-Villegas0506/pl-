import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminDashboardContent from './AdminDashboardContent'
import type { UsuarioSesion } from '@/types/app.types'
import type { ActividadReciente } from '../types'

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any

  const { data: perfilData } = await sb
    .from('usuarios')
    .select('id, nombre, apellido, email, rol, auth_id, avatar_url')
    .eq('auth_id', user.id)
    .single()

  const admin = perfilData as UsuarioSesion | null
  if (!admin || admin.rol !== 'administrador') redirect('/inicio')

  const inicioMes = new Date()
  inicioMes.setDate(1)
  inicioMes.setHours(0, 0, 0, 0)

  const hace3Dias = new Date()
  hace3Dias.setDate(hace3Dias.getDate() - 3)

  const [
    { count: totalUsuarios },
    { count: totalAdmins },
    { count: totalProfesores },
    { count: totalEstudiantes },
    { count: totalLecturas },
    { count: lecturasPublicadas },
    { count: asignacionesActivas },
    { count: completadosMes },
    { count: pendientesRevision },
    { count: usuariosNuevosMes },
    { data: ultimosUsuarios },
    { data: ultimasLecturas },
  ] = await Promise.all([
    sb.from('usuarios').select('id', { count: 'exact', head: true }),
    sb.from('usuarios').select('id', { count: 'exact', head: true }).eq('rol', 'administrador'),
    sb.from('usuarios').select('id', { count: 'exact', head: true }).eq('rol', 'profesor'),
    sb.from('usuarios').select('id', { count: 'exact', head: true }).eq('rol', 'estudiante'),
    sb.from('lecturas').select('id', { count: 'exact', head: true }),
    sb.from('lecturas').select('id', { count: 'exact', head: true }).eq('estado', 'publicado'),
    sb.from('asignaciones_lectura').select('id', { count: 'exact', head: true }).eq('estado', 'activo'),
    sb.from('intentos_lectura')
      .select('id', { count: 'exact', head: true })
      .in('estado', ['completado', 'revisando'])
      .gte('fecha_completado', inicioMes.toISOString()),
    sb.from('intentos_lectura')
      .select('id', { count: 'exact', head: true })
      .eq('estado', 'revisando')
      .lte('updated_at', hace3Dias.toISOString()),
    sb.from('usuarios')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', inicioMes.toISOString()),
    sb.from('usuarios')
      .select('id, nombre, apellido, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
    sb.from('lecturas')
      .select('id, titulo, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const actividadReciente: ActividadReciente[] = [
    ...((ultimosUsuarios as { id: string; nombre: string; apellido: string; created_at: string }[] ?? []).map(u => ({
      tipo: 'usuario' as const,
      descripcion: `Nuevo usuario: ${u.nombre} ${u.apellido}`,
      created_at: u.created_at,
      id: u.id,
    }))),
    ...((ultimasLecturas as { id: string; titulo: string; created_at: string }[] ?? []).map(l => ({
      tipo: 'lectura' as const,
      descripcion: `Nueva lectura: ${l.titulo}`,
      created_at: l.created_at,
      id: l.id,
    }))),
  ]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 8)

  return (
    <AdminDashboardContent
      admin={admin}
      stats={{
        totalUsuarios: (totalUsuarios as number) ?? 0,
        totalAdmins: (totalAdmins as number) ?? 0,
        totalProfesores: (totalProfesores as number) ?? 0,
        totalEstudiantes: (totalEstudiantes as number) ?? 0,
        totalLecturas: (totalLecturas as number) ?? 0,
        lecturasPublicadas: (lecturasPublicadas as number) ?? 0,
        asignacionesActivas: (asignacionesActivas as number) ?? 0,
        completadosMes: (completadosMes as number) ?? 0,
        pendientesRevision: (pendientesRevision as number) ?? 0,
        usuariosNuevosMes: (usuariosNuevosMes as number) ?? 0,
      }}
      actividadReciente={actividadReciente}
    />
  )
}
