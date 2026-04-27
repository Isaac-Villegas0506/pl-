import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminTopBar from '@/components/layout/AdminTopBar'
import { Users, GraduationCap, LayoutDashboard } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AulasAdminPage() {
  const supabase = await createClient()

  const { data: authUser } = await supabase.auth.getUser()
  if (!authUser.user) redirect('/login')

  const { data: perfilData } = await supabase
    .from('usuarios')
    .select('rol')
    .eq('auth_id', authUser.user.id)
    .single()
  const perfil = perfilData as any

  if (perfil?.rol !== 'administrador') redirect('/inicio')

  // Obtener grados con sus secciones y aulas
  const { data: gradosData } = await supabase
    .from('grados')
    .select(`
      id, nombre, orden,
      secciones (
        id, nombre,
        aulas (
          id, anio_lectivo, capacidad,
          estudiantes_aulas (count),
          profesor_aulas (
            profesor:usuarios (nombre, apellido)
          )
        )
      )
    `)
    .eq('activo', true)
    .order('orden', { ascending: true })
  
  const grados = gradosData as any[]

  const anioActual = new Date().getFullYear()

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', paddingBottom: '40px' }}>
      <AdminTopBar title="Gestión de Aulas" />

      <div style={{ padding: '20px 16px' }}>
        
        {/* Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #4F46E5, #6D28D9)',
          borderRadius: '20px', padding: '24px 20px',
          color: 'white', marginBottom: '24px',
          boxShadow: '0 10px 30px rgba(79,70,229,0.3)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '14px',
              background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '16px',
            }}>
              <LayoutDashboard size={24} color="white" />
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '6px' }}>
              Aulas del Año {anioActual}
            </h1>
            <p style={{ fontSize: '14px', opacity: 0.9 }}>
              Visualiza la distribución de grados, secciones y profesores asignados.
            </p>
          </div>
          {/* Decoración */}
          <div style={{
            position: 'absolute', top: '-20px', right: '-20px',
            width: '120px', height: '120px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)', filter: 'blur(20px)',
          }} />
        </div>

        {/* Listado de Grados */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {grados?.map((grado) => (
            <div key={grado.id} style={{
              background: 'white', borderRadius: '20px', padding: '20px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px',
                  background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <GraduationCap size={20} color="#4F46E5" />
                </div>
                <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#111827' }}>
                  {grado.nombre}
                </h2>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                {grado.secciones.map((seccion: any) => {
                  const aula = seccion.aulas?.find((a: any) => a.anio_lectivo === anioActual)
                  
                  if (!aula) return null

                  const totalEstudiantes = aula.estudiantes_aulas?.[0]?.count ?? 0
                  const profesores = aula.profesor_aulas?.map((pa: any) => pa.profesor) ?? []

                  return (
                    <div key={seccion.id} style={{
                      border: '1.5px solid #F3F4F6', borderRadius: '16px',
                      padding: '16px', background: '#F8FAFC',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div>
                          <p style={{ fontSize: '16px', fontWeight: '800', color: '#111827' }}>
                            Sección {seccion.nombre}
                          </p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                            <Users size={14} color="#6B7280" />
                            <span style={{ fontSize: '13px', color: '#6B7280', fontWeight: '600' }}>
                              {totalEstudiantes} / {aula.capacidad} estudiantes
                            </span>
                          </div>
                        </div>
                        {/* Barra de capacidad */}
                        <div style={{ width: '60px' }}>
                          <div style={{
                            width: '100%', height: '6px', borderRadius: '3px',
                            background: '#E5E7EB', overflow: 'hidden',
                          }}>
                            <div style={{
                              height: '100%', borderRadius: '3px',
                              width: `${Math.min(100, (totalEstudiantes / aula.capacidad) * 100)}%`,
                              background: totalEstudiantes >= aula.capacidad ? '#EF4444' : '#10B981',
                            }} />
                          </div>
                        </div>
                      </div>

                      {/* Profesores */}
                      <div>
                        <p style={{ fontSize: '12px', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: '8px' }}>
                          Profesores Asignados
                        </p>
                        {profesores.length > 0 ? (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {profesores.map((prof: any, i: number) => (
                              <div key={i} style={{
                                padding: '4px 10px', background: 'white',
                                borderRadius: '8px', border: '1px solid #E5E7EB',
                                fontSize: '12px', fontWeight: '600', color: '#4B5563',
                              }}>
                                {prof.nombre} {prof.apellido}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p style={{ fontSize: '13px', color: '#9CA3AF', fontStyle: 'italic' }}>
                            Sin profesores asignados
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}

          {grados?.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#6B7280' }}>
              No hay grados ni aulas registradas.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
