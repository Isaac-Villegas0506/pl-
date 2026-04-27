import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProfesorTopBar from '@/components/layout/ProfesorTopBar'
import { User, BookOpen, Settings, Users, LogOut, Lock } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import BtnCerrarSesion from '@/components/ui/BtnCerrarSesion'

export const dynamic = 'force-dynamic'

export default async function PerfilProfesorPage() {
  const supabase = await createClient()

  const { data: authData } = await supabase.auth.getUser()
  if (!authData.user) redirect('/login')

  const { data: perfil } = await (supabase as any)
    .from('usuarios')
    .select('*')
    .eq('auth_id', authData.user.id)
    .single()

  if (!perfil || perfil.rol !== 'profesor') redirect('/inicio')

  // Obtener aulas asignadas
  const { data: aulasData } = await (supabase as any)
    .from('profesor_aulas')
    .select(`
      aula:aulas (
        anio_lectivo,
        grado:grados(nombre),
        seccion:secciones(nombre)
      )
    `)
    .eq('profesor_id', perfil.id)
    .eq('activo', true)

  const aulas = aulasData?.map((a: any) => a.aula) || []

  // Estadísticas rápidas
  const { count: lecturasCreadas } = await (supabase as any)
    .from('lecturas')
    .select('id', { count: 'exact', head: true })
    .eq('creado_por', perfil.id)

  const { count: asignacionesActivas } = await (supabase as any)
    .from('asignaciones_lectura')
    .select('id', { count: 'exact', head: true })
    .eq('profesor_id', perfil.id)
    .eq('estado', 'activo')

  const menuItemStyle = {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '16px', background: 'white', borderRadius: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)', marginBottom: '12px',
    textDecoration: 'none', color: 'inherit',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', paddingBottom: '80px' }}>
      <ProfesorTopBar title="Mi Perfil" />

      {/* Cabecera del Perfil */}
      <div style={{
        background: 'linear-gradient(135deg, #4F46E5, #6D28D9)',
        padding: '32px 20px', color: 'white',
        borderBottomLeftRadius: '32px', borderBottomRightRadius: '32px',
        boxShadow: '0 10px 30px rgba(79,70,229,0.2)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Decoración fondo */}
        <div style={{
          position: 'absolute', top: '-20px', right: '-20px',
          width: '150px', height: '150px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)', filter: 'blur(30px)',
        }} />

        <div style={{
          width: '80px', height: '80px', borderRadius: '24px',
          background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '16px', position: 'relative', zIndex: 1,
          border: '2px solid rgba(255,255,255,0.3)',
        }}>
          {perfil.avatar_url ? (
            <Image src={perfil.avatar_url} alt="Avatar" fill style={{ borderRadius: '22px', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontSize: '32px', fontWeight: '800' }}>
              {perfil.nombre[0]}{perfil.apellido[0]}
            </span>
          )}
        </div>

        <h1 style={{ fontSize: '22px', fontWeight: '800', margin: '0 0 4px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          {perfil.nombre} {perfil.apellido}
        </h1>
        <p style={{ fontSize: '14px', opacity: 0.9, margin: 0, position: 'relative', zIndex: 1 }}>
          Profesor de Plan de Lectura
        </p>
      </div>

      {/* Contenido Principal */}
      <div style={{ padding: '24px 16px', marginTop: '-10px' }}>
        
        {/* Estadísticas */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookOpen size={20} color="#4F46E5" />
            </div>
            <div>
              <p style={{ fontSize: '20px', fontWeight: '800', color: '#111827', margin: 0, lineHeight: 1 }}>{lecturasCreadas || 0}</p>
              <p style={{ fontSize: '12px', color: '#6B7280', margin: '4px 0 0' }}>Lecturas subidas</p>
            </div>
          </div>
          <div style={{ background: 'white', borderRadius: '20px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={20} color="#10B981" />
            </div>
            <div>
              <p style={{ fontSize: '20px', fontWeight: '800', color: '#111827', margin: 0, lineHeight: 1 }}>{asignacionesActivas || 0}</p>
              <p style={{ fontSize: '12px', color: '#6B7280', margin: '4px 0 0' }}>Asignaciones activas</p>
            </div>
          </div>
        </div>

        {/* Aulas Asignadas */}
        <div style={{ marginBottom: '24px' }}>
          <p style={{ fontSize: '14px', fontWeight: '800', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', paddingLeft: '4px' }}>
            Aulas a Cargo
          </p>
          <div style={{ background: 'white', borderRadius: '20px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            {aulas.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {aulas.map((a: any, i: number) => (
                  <div key={i} style={{
                    padding: '8px 14px', background: '#F8FAFC', border: '1.5px solid #F1F5F9',
                    borderRadius: '12px', fontSize: '13px', fontWeight: '700', color: '#4B5563',
                  }}>
                    {a.grado?.nombre} {a.seccion?.nombre}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '14px', color: '#9CA3AF', margin: 0, fontStyle: 'italic' }}>
                No tienes aulas asignadas este año.
              </p>
            )}
          </div>
        </div>

        {/* Opciones */}
        <div>
          <p style={{ fontSize: '14px', fontWeight: '800', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', paddingLeft: '4px' }}>
            Ajustes
          </p>
          <Link href="/profesor/perfil/cambiar-password" style={menuItemStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Lock size={18} color="#4B5563" />
              </div>
              <p style={{ fontSize: '15px', fontWeight: '700', color: '#111827', margin: 0 }}>Cambiar contraseña</p>
            </div>
            <span style={{ color: '#9CA3AF' }}>›</span>
          </Link>
          
          <div style={{ marginTop: '12px' }}>
            <BtnCerrarSesion variant="menuItem" />
          </div>
        </div>

      </div>
    </div>
  )
}
