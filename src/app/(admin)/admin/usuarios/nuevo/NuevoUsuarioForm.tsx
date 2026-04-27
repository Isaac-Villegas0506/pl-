'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { GraduationCap, BookOpen, Shield, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import AdminTopBar from '@/components/layout/AdminTopBar'
import { crearUsuarioAction } from '../../actions'
import type { NuevoUsuarioInput } from '../../types'

type Rol = 'estudiante' | 'profesor' | 'administrador'

interface GradoConSecciones {
  id: string
  nombre: string
  secciones: Array<{
    id: string
    nombre: string
    aulas: Array<{ id: string; nombre: string | null; anio_lectivo: number }>
  }>
}

interface Props {
  grados: GradoConSecciones[]
}

function calcularFortaleza(pass: string): number {
  let score = 0
  if (pass.length >= 8) score++
  if (/[A-Z]/.test(pass)) score++
  if (/[0-9]/.test(pass)) score++
  if (/[^A-Za-z0-9]/.test(pass)) score++
  return score
}

const FORTALEZA_CONFIG = [
  { label: 'Débil',    color: '#F43F5E' },
  { label: 'Regular',  color: '#F59E0B' },
  { label: 'Buena',    color: '#10B981' },
  { label: 'Fuerte',   color: '#4F46E5' },
]

const ROL_CONFIG: { rol: Rol; label: string; desc: string; icon: React.ElementType; color: string; bgSel: string }[] = [
  { rol: 'estudiante',    label: 'Estudiante',    desc: 'Accede a lecturas y evaluaciones', icon: GraduationCap, color: '#10B981', bgSel: '#ECFDF5' },
  { rol: 'profesor',      label: 'Profesor',      desc: 'Gestiona asignaciones y resultados', icon: BookOpen,      color: '#4F46E5', bgSel: '#EEF2FF' },
  { rol: 'administrador', label: 'Administrador', desc: 'Acceso total al sistema',            icon: Shield,        color: '#0F172A', bgSel: '#F1F5F9' },
]

export default function NuevoUsuarioForm({ grados }: Props) {
  const router = useRouter()
  const [rol, setRol] = useState<Rol>('estudiante')
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [dni, setDni] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [mostrarPass, setMostrarPass] = useState(false)
  const [aulaId, setAulaId] = useState('')
  const [aulasSeleccionadas, setAulasSeleccionadas] = useState<string[]>([])
  const [anioLectivo] = useState(new Date().getFullYear())
  const [activo] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cargando, setCargando] = useState(false)
  const [busquedaAula, setBusquedaAula] = useState('')

  const fortaleza = calcularFortaleza(password)
  const fortalezaConfig = FORTALEZA_CONFIG[fortaleza - 1]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!nombre.trim() || !apellido.trim() || !email.trim() || !password) {
      setError('Por favor completa todos los campos obligatorios.')
      return
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }
    if (rol === 'estudiante' && !aulaId) {
      setError('Selecciona un aula para el estudiante.')
      return
    }

    setCargando(true)
    const datos: NuevoUsuarioInput = {
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      email: email.trim().toLowerCase(),
      password,
      rol,
      dni: dni.trim() || undefined,
      aula_id: rol === 'estudiante' ? aulaId : undefined,
      anio_lectivo: rol === 'estudiante' ? anioLectivo : undefined,
      aulas_profesor: rol === 'profesor' ? aulasSeleccionadas : undefined,
    }

    const result = await crearUsuarioAction(datos)
    setCargando(false)

    if (!result.success) {
      setError(result.error ?? 'Error al crear usuario')
      toast.error(result.error ?? 'Error al crear usuario')
      return
    }

    toast.success('Usuario creado correctamente')
    router.push('/admin/usuarios')
    router.refresh()
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', height: '50px',
    border: '1.5px solid #E5E7EB', borderRadius: '12px',
    padding: '0 16px', fontSize: '15px', color: '#111827',
    outline: 'none', background: 'white', fontFamily: 'inherit',
    boxSizing: 'border-box',
  }

  const labelStyle: React.CSSProperties = {
    fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '6px', display: 'block',
  }

  const sectionStyle: React.CSSProperties = {
    background: 'white', borderRadius: '18px', padding: '20px 16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.04)',
    marginBottom: '12px',
  }

  const toggleAula = (id: string) => {
    setAulasSeleccionadas(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC' }}>
      <AdminTopBar title="Nuevo Usuario" showBack />

      <form onSubmit={handleSubmit} style={{ padding: '16px' }}>

        {/* ROL */}
        <div style={sectionStyle}>
          <p style={{ fontSize: '15px', fontWeight: '800', color: '#111827', marginBottom: '14px' }}>
            ¿Qué tipo de usuario?
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {ROL_CONFIG.map(cfg => {
              const seleccionado = rol === cfg.rol
              return (
                <button
                  key={cfg.rol}
                  type="button"
                  onClick={() => setRol(cfg.rol)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '14px',
                    padding: '16px', borderRadius: '14px',
                    border: seleccionado ? `2px solid ${cfg.color}` : '1.5px solid #E5E7EB',
                    background: seleccionado ? cfg.bgSel : 'white',
                    cursor: 'pointer', textAlign: 'left',
                    boxShadow: seleccionado ? `0 2px 12px ${cfg.color}30` : 'none',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{
                    width: '42px', height: '42px', borderRadius: '12px', flexShrink: 0,
                    background: seleccionado ? cfg.color : '#F3F4F6',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <cfg.icon size={20} color={seleccionado ? 'white' : '#9CA3AF'} />
                  </div>
                  <div>
                    <p style={{ fontSize: '15px', fontWeight: '700', color: '#111827' }}>{cfg.label}</p>
                    <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px' }}>{cfg.desc}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* DATOS PERSONALES */}
        <div style={sectionStyle}>
          <p style={{ fontSize: '15px', fontWeight: '800', color: '#111827', marginBottom: '14px' }}>
            Datos personales
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Nombre(s) *</label>
              <input style={inputStyle} placeholder="Nombre(s)" value={nombre} onChange={e => setNombre(e.target.value)} required />
            </div>
            <div>
              <label style={labelStyle}>Apellidos *</label>
              <input style={inputStyle} placeholder="Apellidos" value={apellido} onChange={e => setApellido(e.target.value)} required />
            </div>
            <div>
              <label style={labelStyle}>DNI / Código</label>
              <input style={inputStyle} placeholder="Número de documento" value={dni} onChange={e => setDni(e.target.value)} />
            </div>
          </div>
        </div>

        {/* ACCESO */}
        <div style={sectionStyle}>
          <p style={{ fontSize: '15px', fontWeight: '800', color: '#111827', marginBottom: '14px' }}>
            Acceso al sistema
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Email *</label>
              <input type="email" style={inputStyle} placeholder="correo@ejemplo.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <label style={labelStyle}>Contraseña *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={mostrarPass ? 'text' : 'password'}
                  style={{ ...inputStyle, paddingRight: '48px' }}
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setMostrarPass(!mostrarPass)}
                  style={{
                    position: 'absolute', right: '14px', top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                  }}
                >
                  {mostrarPass ? <EyeOff size={18} color="#9CA3AF" /> : <Eye size={18} color="#9CA3AF" />}
                </button>
              </div>
              {password && (
                <div style={{ marginTop: '8px' }}>
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} style={{
                        flex: 1, height: '4px', borderRadius: '2px',
                        background: i <= fortaleza ? (fortalezaConfig?.color ?? '#E5E7EB') : '#E5E7EB',
                        transition: 'background 0.3s',
                      }} />
                    ))}
                  </div>
                  {fortalezaConfig && (
                    <p style={{ fontSize: '11px', fontWeight: '600', color: fortalezaConfig.color }}>
                      {fortalezaConfig.label}
                    </p>
                  )}
                </div>
              )}
            </div>
            <div>
              <label style={labelStyle}>Confirmar contraseña *</label>
              <input
                type="password"
                style={{
                  ...inputStyle,
                  borderColor: confirmPassword && confirmPassword !== password ? '#F43F5E' : '#E5E7EB',
                }}
                placeholder="Repite la contraseña"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
              />
              {confirmPassword && confirmPassword !== password && (
                <p style={{ fontSize: '11px', color: '#F43F5E', marginTop: '4px' }}>Las contraseñas no coinciden</p>
              )}
            </div>
          </div>
        </div>

        {/* AULA (solo estudiantes) */}
        {rol === 'estudiante' && (
          <div style={sectionStyle}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <p style={{ fontSize: '15px', fontWeight: '800', color: '#111827', margin: 0 }}>
                Asignación de aula
              </p>
              {aulaId && (
                <span style={{ fontSize: '12px', color: '#10B981', fontWeight: '700' }}>✓ Seleccionada</span>
              )}
            </div>

            {/* Buscador de Aulas */}
            <div style={{ marginBottom: '16px', position: 'relative' }}>
              <input
                type="text"
                placeholder="Buscar por grado o sección..."
                value={busquedaAula}
                onChange={(e) => setBusquedaAula(e.target.value)}
                style={{
                  ...inputStyle,
                  height: '42px',
                  fontSize: '14px',
                  background: '#F3F4F6',
                  border: 'none',
                  paddingLeft: '40px'
                }}
              />
              <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }}>
                <GraduationCap size={18} />
              </div>
            </div>

            {grados.length === 0 ? (
              <p style={{ fontSize: '13px', color: '#9CA3AF' }}>No hay aulas disponibles</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '380px', overflowY: 'auto', paddingRight: '4px' }}>
                {(() => {
                  const searchOriginal = busquedaAula.toLowerCase().trim()
                  // Normalizar búsqueda común: "1ro" -> "1°", "primero" -> "1°"
                  const search = searchOriginal
                    .replace(/1ro|primero/g, '1°')
                    .replace(/2do|segundo/g, '2°')
                    .replace(/3ro|tercero/g, '3°')
                    .replace(/4to|cuarto/g, '4°')
                    .replace(/5to|quinto/g, '5°')
                  
                  let totalVisibles = 0

                  const content = (grados || []).map(grado => {
                    // Obtener todas las aulas de todas las secciones de este grado
                    const todasLasAulas = (grado.secciones || []).flatMap(s => s.aulas || [])
                    
                    const aulasFiltradas = todasLasAulas.filter(aula => {
                      if (!search) return true
                      const nombreGrado = (grado.nombre || '').toLowerCase()
                      const nombreAula = (aula.nombre || '').toLowerCase()
                      const combo = `${nombreGrado} ${nombreAula}`.toLowerCase()
                      
                      return nombreGrado.includes(search) || 
                             nombreAula.includes(search) || 
                             combo.includes(search) ||
                             `sección ${nombreAula}`.includes(search) ||
                             (search.length === 1 && nombreAula === search)
                    })

                    if (aulasFiltradas.length === 0) return null
                    totalVisibles += aulasFiltradas.length

                    return (
                      <div key={grado.id}>
                        <p style={{
                          fontSize: '11px', fontWeight: '800', color: '#9CA3AF',
                          textTransform: 'uppercase', letterSpacing: '0.08em',
                          marginBottom: '8px',
                        }}>
                          {grado.nombre}
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '8px' }}>
                          {aulasFiltradas.map(aula => (
                            <button
                              key={aula.id}
                              type="button"
                              onClick={() => setAulaId(aula.id)}
                              style={{
                                height: '38px', padding: '0 12px',
                                borderRadius: '10px', cursor: 'pointer',
                                fontSize: '13px', fontWeight: '700', fontFamily: 'inherit',
                                background: aulaId === aula.id
                                  ? 'linear-gradient(135deg, #10B981, #059669)'
                                  : 'white',
                                color: aulaId === aula.id ? 'white' : '#4B5563',
                                border: aulaId === aula.id ? 'none' : '1.5px solid #F3F4F6',
                                transition: 'all 0.2s',
                                boxShadow: aulaId === aula.id
                                  ? '0 4px 12px rgba(16,185,129,0.2)' : 'none',
                                textAlign: 'center',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                              }}
                            >
                              Sección {aula.nombre || 'A'}
                            </button>
                          ))}
                        </div>
                      </div>
                    )
                  })

                  if (totalVisibles === 0 && search) {
                    return (
                      <div style={{ textAlign: 'center', padding: '32px 0' }}>
                        <p style={{ fontSize: '14px', color: '#9CA3AF', margin: 0 }}>
                          No se encontraron aulas para "<b>{busquedaAula}</b>"
                        </p>
                        <button 
                          type="button"
                          onClick={() => setBusquedaAula('')}
                          style={{ background: 'none', border: 'none', color: '#4F46E5', fontWeight: '700', cursor: 'pointer', marginTop: '8px' }}
                        >
                          Ver todas las aulas
                        </button>
                      </div>
                    )
                  }

                  return content
                })()}
              </div>
            )}
          </div>
        )}

        {/* AULAS ASIGNADAS (solo profesor) */}
        {rol === 'profesor' && (
          <div style={{
            background: 'white', borderRadius: '20px', padding: '20px',
            marginBottom: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            border: '1px solid rgba(0,0,0,0.04)',
          }}>
            <p style={{
              fontSize: '15px', fontWeight: '800', color: '#111827', marginBottom: '4px',
            }}>
              Aulas asignadas
            </p>
            <p style={{ fontSize: '13px', color: '#9CA3AF', marginBottom: '16px' }}>
              Selecciona las aulas que tendrá a cargo este profesor
            </p>

            {/* Grid de aulas por grado con filtro */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '380px', overflowY: 'auto', paddingRight: '4px' }}>
              {(() => {
                const searchOriginal = busquedaAula.toLowerCase().trim()
                const search = searchOriginal
                  .replace(/1ro|primero/g, '1°')
                  .replace(/2do|segundo/g, '2°')
                  .replace(/3ro|tercero/g, '3°')
                  .replace(/4to|cuarto/g, '4°')
                  .replace(/5to|quinto/g, '5°')

                let totalVisibles = 0

                const content = (grados || []).map((grado) => {
                  const todasLasAulas = (grado.secciones || []).flatMap(s => s.aulas || [])
                  
                  const aulasFiltradas = todasLasAulas.filter(aula => {
                    if (!search) return true
                    const nombreGrado = (grado.nombre || '').toLowerCase()
                    const nombreAula = (aula.nombre || '').toLowerCase()
                    const combo = `${nombreGrado} ${nombreAula}`.toLowerCase()
                    
                    return nombreGrado.includes(search) || 
                           nombreAula.includes(search) || 
                           combo.includes(search) ||
                           `sección ${nombreAula}`.includes(search) ||
                           (search.length === 1 && nombreAula === search)
                  })

                  if (aulasFiltradas.length === 0) return null
                  totalVisibles += aulasFiltradas.length

                  return (
                    <div key={grado.id}>
                      <p style={{
                        fontSize: '11px', fontWeight: '800', color: '#9CA3AF',
                        textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px',
                      }}>
                        {grado.nombre}
                      </p>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '8px' }}>
                        {aulasFiltradas.map((aula) => {
                          const seleccionada = aulasSeleccionadas.includes(aula.id)
                          return (
                            <button
                              key={aula.id}
                              type="button"
                              onClick={() => toggleAula(aula.id)}
                              style={{
                                height: '36px', padding: '0 14px',
                                borderRadius: '10px', cursor: 'pointer',
                                fontSize: '13px', fontWeight: '700', fontFamily: 'inherit',
                                background: seleccionada
                                  ? 'linear-gradient(135deg, #4F46E5, #6D28D9)'
                                  : 'white',
                                color: seleccionada ? 'white' : '#4B5563',
                                border: seleccionada ? 'none' : '1.5px solid #F3F4F6',
                                boxShadow: seleccionada ? '0 4px 12px rgba(79,70,229,0.2)' : 'none',
                                transition: 'all 0.2s',
                                textAlign: 'center',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                              }}
                            >
                              Sección {aula.nombre || 'A'}
                              {seleccionada && <span style={{ marginLeft: '4px' }}>✓</span>}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                })

                if (totalVisibles === 0 && search) {
                  return (
                    <div style={{ textAlign: 'center', padding: '24px 0' }}>
                      <p style={{ fontSize: '13px', color: '#9CA3AF' }}>No se encontraron aulas</p>
                    </div>
                  )
                }

                return content
              })()}
            </div>

            {aulasSeleccionadas.length > 0 && (
              <div style={{
                marginTop: '12px', padding: '10px 14px',
                background: '#EEF2FF', borderRadius: '12px',
              }}>
                <p style={{ fontSize: '13px', color: '#4F46E5', fontWeight: '700' }}>
                  {aulasSeleccionadas.length} aula{aulasSeleccionadas.length !== 1 ? 's' : ''} seleccionada{aulasSeleccionadas.length !== 1 ? 's' : ''}
                </p>
              </div>
            )}
          </div>
        )}

        {error && (
          <div style={{
            background: '#FFF1F2', border: '1px solid #FDA4AF',
            borderRadius: '12px', padding: '12px 16px',
            marginBottom: '12px',
          }}>
            <p style={{ fontSize: '13px', fontWeight: '600', color: '#BE123C' }}>{error}</p>
          </div>
        )}

        {/* BOTONES */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
          <button
            type="button"
            onClick={() => router.back()}
            style={{
              flex: 1, height: '50px', borderRadius: '14px',
              background: 'white', border: '1.5px solid #E5E7EB',
              fontSize: '15px', fontWeight: '700', color: '#6B7280',
              cursor: 'pointer',
            }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={cargando}
            style={{
              flex: 2, height: '50px', borderRadius: '14px',
              background: cargando ? '#9CA3AF' : 'linear-gradient(135deg, #4F46E5, #6D28D9)',
              border: 'none',
              fontSize: '15px', fontWeight: '800', color: 'white',
              cursor: cargando ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 16px rgba(79,70,229,0.3)',
            }}
          >
            {cargando ? 'Creando...' : 'Crear usuario'}
          </button>
        </div>
      </form>
    </div>
  )
}
