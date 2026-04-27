'use client'

import { useState } from 'react'
import { BookOpen, ChevronDown, ChevronUp, Plus } from 'lucide-react'
import AdminTopBar from '@/components/layout/AdminTopBar'
import { guardarConfiguracionAction } from '../actions'
import type { GradoConSecciones, BimestreAdmin, ConfigSistema } from '../types'

const TABS = ['Estructura', 'Bimestres', 'Sistema'] as const
type Tab = typeof TABS[number]

interface Props {
  grados: GradoConSecciones[]
  bimestres: BimestreAdmin[]
  configInicial: ConfigSistema
}

function ToggleSwitch({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      style={{
        width: '48px', height: '28px', borderRadius: '14px', border: 'none',
        background: value ? '#4F46E5' : '#E5E7EB',
        position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0,
      }}
    >
      <div style={{
        position: 'absolute', top: '3px',
        left: value ? '23px' : '3px',
        width: '22px', height: '22px', borderRadius: '50%',
        background: 'white', boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
        transition: 'left 0.2s',
      }} />
    </button>
  )
}

function SettingRow({
  label, desc, children,
}: { label: string; desc: string; children: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '16px 0', borderBottom: '1px solid #F3F4F6', gap: '12px',
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>{label}</p>
        <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px' }}>{desc}</p>
      </div>
      {children}
    </div>
  )
}

export default function ConfiguracionContent({ grados, bimestres, configInicial }: Props) {
  const [tab, setTab] = useState<Tab>('Estructura')
  const [expandidos, setExpandidos] = useState<Set<string>>(new Set())
  const [config, setConfig] = useState<ConfigSistema>(configInicial)
  const [guardando, setGuardando] = useState(false)
  const [guardadoOk, setGuardadoOk] = useState(false)

  function toggleGrado(id: string) {
    setExpandidos(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function setConfigField<K extends keyof ConfigSistema>(field: K, val: ConfigSistema[K]) {
    setConfig(prev => ({ ...prev, [field]: val }))
  }

  async function handleGuardarConfig() {
    setGuardando(true)
    await guardarConfiguracionAction(config)
    setGuardando(false)
    setGuardadoOk(true)
    setTimeout(() => setGuardadoOk(false), 2500)
  }

  const inputStyle: React.CSSProperties = {
    height: '36px', border: '1.5px solid #E5E7EB', borderRadius: '10px',
    padding: '0 12px', fontSize: '14px', color: '#111827',
    outline: 'none', background: 'white', fontFamily: 'inherit',
    width: '160px', textAlign: 'right', boxSizing: 'border-box',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', paddingBottom: '100px' }}>
      <AdminTopBar title="Configuración" />

      {/* TABS */}
      <div style={{ display: 'flex', background: 'white', borderBottom: '1px solid #F3F4F6', padding: '0 16px' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, height: '46px', border: 'none', background: 'none',
            fontSize: '13px', fontWeight: '700', cursor: 'pointer',
            color: tab === t ? '#4F46E5' : '#9CA3AF',
            borderBottom: tab === t ? '2.5px solid #4F46E5' : '2.5px solid transparent',
          }}>
            {t}
          </button>
        ))}
      </div>

      <div style={{ padding: '12px 16px' }}>

        {/* ESTRUCTURA */}
        {tab === 'Estructura' && (
          <>
            {grados.length === 0 && (
              <p style={{ color: '#9CA3AF', fontSize: '14px', textAlign: 'center', padding: '40px 0' }}>
                No hay grados configurados
              </p>
            )}
            {grados.map(g => {
              const expandido = expandidos.has(g.id)
              return (
                <div key={g.id} style={{ background: 'white', borderRadius: '16px', marginBottom: '8px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                  <div onClick={() => toggleGrado(g.id)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', cursor: 'pointer' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#EEF2FF', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <BookOpen size={18} color="#4F46E5" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '15px', fontWeight: '700', color: '#111827' }}>{g.nombre}</p>
                      <p style={{ fontSize: '12px', color: '#9CA3AF' }}>
                        {g.secciones.length} secciones · {g.total_estudiantes} estudiantes
                      </p>
                    </div>
                    {expandido ? <ChevronUp size={18} color="#9CA3AF" /> : <ChevronDown size={18} color="#9CA3AF" />}
                  </div>

                  {expandido && (
                    <div style={{ borderTop: '1px solid #F3F4F6', padding: '8px 16px 12px' }}>
                      {g.secciones.map(s => (
                        <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F9FAFB' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4F46E5', flexShrink: 0 }} />
                            <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                              Sección {s.nombre}
                            </span>
                            <span style={{ fontSize: '12px', color: '#9CA3AF' }}>
                              · {s.total_estudiantes} est.
                            </span>
                          </div>
                        </div>
                      ))}
                      <button style={{
                        marginTop: '8px', width: '100%', height: '36px',
                        border: '1.5px dashed #C7D2FE', borderRadius: '10px',
                        background: 'transparent', color: '#4F46E5',
                        fontSize: '13px', fontWeight: '700', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                      }}>
                        <Plus size={14} /> Añadir sección
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
            <button style={{
              width: '100%', height: '56px',
              border: '1.5px dashed #C7D2FE', borderRadius: '16px',
              background: 'transparent', color: '#4F46E5',
              fontSize: '14px', fontWeight: '700', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              marginTop: '4px',
            }}>
              <Plus size={16} /> Nuevo grado
            </button>
          </>
        )}

        {/* BIMESTRES */}
        {tab === 'Bimestres' && (
          <>
            {bimestres.length === 0 && (
              <p style={{ color: '#9CA3AF', fontSize: '14px', textAlign: 'center', padding: '40px 0' }}>
                No hay bimestres configurados para este año
              </p>
            )}
            {bimestres.map(b => (
              <div key={b.id} style={{ background: 'white', borderRadius: '16px', marginBottom: '8px', padding: '14px 16px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: '15px', fontWeight: '700', color: '#111827' }}>{b.nombre}</p>
                  <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px' }}>
                    {b.fecha_inicio
                      ? `${b.fecha_inicio} → ${b.fecha_fin ?? '...'}`
                      : 'Sin fechas configuradas'}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    fontSize: '11px', fontWeight: '700',
                    color: b.activo ? '#065F46' : '#9CA3AF',
                    background: b.activo ? '#D1FAE5' : '#F3F4F6',
                    borderRadius: '99px', padding: '3px 10px',
                  }}>
                    {b.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>
            ))}
            <button style={{
              width: '100%', height: '48px',
              border: '1.5px dashed #C7D2FE', borderRadius: '14px',
              background: 'transparent', color: '#4F46E5',
              fontSize: '14px', fontWeight: '700', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              marginTop: '4px',
            }}>
              <Plus size={16} /> Nuevo bimestre
            </button>
          </>
        )}

        {/* SISTEMA */}
        {tab === 'Sistema' && (
          <div style={{ background: 'white', borderRadius: '18px', padding: '0 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <SettingRow label="Nombre de la institución" desc="Aparece en reportes y documentos">
              <input
                style={{ ...inputStyle, width: '180px' }}
                value={config.nombre_institucion}
                onChange={e => setConfigField('nombre_institucion', e.target.value)}
              />
            </SettingRow>
            <SettingRow label="Año lectivo actual" desc="Usado para filtrar bimestres y aulas">
              <input
                type="number"
                style={inputStyle}
                value={config.anio_lectivo}
                onChange={e => setConfigField('anio_lectivo', parseInt(e.target.value, 10))}
              />
            </SettingRow>
            <SettingRow label="Permitir registro de estudiantes" desc="Los estudiantes pueden registrarse solos">
              <ToggleSwitch value={config.permitir_registro} onChange={v => setConfigField('permitir_registro', v)} />
            </SettingRow>
            <SettingRow label="Calificación mínima de aprobación" desc="Nota mínima para aprobar (escala 0-20)">
              <input
                type="number"
                style={inputStyle}
                value={config.nota_minima_aprobacion}
                onChange={e => setConfigField('nota_minima_aprobacion', parseFloat(e.target.value))}
              />
            </SettingRow>
            <SettingRow label="Escala de notas máxima" desc="Puntaje máximo del sistema">
              <input
                type="number"
                style={inputStyle}
                value={config.escala_maxima}
                onChange={e => setConfigField('escala_maxima', parseFloat(e.target.value))}
              />
            </SettingRow>
            <SettingRow label="Correo de soporte" desc="Email de contacto para usuarios">
              <input
                type="email"
                style={{ ...inputStyle, width: '180px' }}
                value={config.correo_soporte}
                onChange={e => setConfigField('correo_soporte', e.target.value)}
              />
            </SettingRow>

            <button
              onClick={handleGuardarConfig}
              disabled={guardando}
              style={{
                width: '100%', height: '50px', borderRadius: '14px',
                background: guardadoOk ? '#10B981' : guardando ? '#9CA3AF' : 'linear-gradient(135deg, #4F46E5, #6D28D9)',
                border: 'none', fontSize: '15px', fontWeight: '800', color: 'white',
                cursor: guardando ? 'not-allowed' : 'pointer',
                margin: '20px 0',
                boxShadow: '0 4px 16px rgba(79,70,229,0.3)',
                transition: 'background 0.3s',
              }}
            >
              {guardadoOk ? '✓ Guardado' : guardando ? 'Guardando...' : 'Guardar configuración'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
