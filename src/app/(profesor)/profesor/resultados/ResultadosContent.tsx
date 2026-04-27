'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Clock, ChevronDown, AlertCircle } from 'lucide-react'
import ProfesorTopBar from '@/components/layout/ProfesorTopBar'
import ProgressBar from '@/components/ui/ProgressBar'
import { obtenerGradientePortada, formatNota } from '@/lib/utils'
import type { AsignacionResumen, IntentoConDatos } from '../types'

interface AsignacionConIntentos extends AsignacionResumen {
  intentos: (IntentoConDatos & { lectura_titulo?: string })[]
}

interface Props {
  asignaciones: AsignacionConIntentos[]
  pendientes: (IntentoConDatos & { lectura_titulo?: string })[]
  filtroInicial: 'asignaciones' | 'pendientes'
}

export default function ResultadosContent({ asignaciones, pendientes, filtroInicial }: Props) {
  const router = useRouter()
  const [tab, setTab] = useState<'asignaciones' | 'pendientes'>(filtroInicial)
  const [expandida, setExpandida] = useState<string | null>(null)

  function notaDisplay(nota: number | null) {
    if (nota === null) return null
    return parseFloat(nota.toFixed(1))
  }

  function promedioAsignacion(intentos: IntentoConDatos[]) {
    const conNota = intentos.filter(i => i.nota_automatica !== null || i.nota_final !== null)
    if (conNota.length === 0) return null
    const suma = conNota.reduce((acc, i) => acc + (i.nota_final ?? i.nota_automatica ?? 0), 0)
    return Math.round((suma / conNota.length) * 10) / 10
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F5F3FF' }}>
      <ProfesorTopBar title="Resultados" />

      {/* TABS */}
      <div style={{ display: 'flex', borderBottom: '1px solid #E5E7EB', padding: '0 16px' }}>
        {([
          { key: 'asignaciones', label: 'Por asignación' },
          { key: 'pendientes', label: `Pendientes (${pendientes.length})` },
        ] as const).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            flex: 1, height: '40px', border: 'none', background: 'transparent',
            cursor: 'pointer', fontSize: '13px', fontWeight: 700,
            color: tab === t.key ? '#4F46E5' : '#9CA3AF',
            borderBottom: tab === t.key ? '2px solid #4F46E5' : '2px solid transparent',
            transition: 'all 0.2s', fontFamily: 'inherit',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ padding: '12px 16px 100px' }}>

        {/* TAB: POR ASIGNACIÓN */}
        {tab === 'asignaciones' && (
          <>
            {asignaciones.length === 0 ? (
              <div style={{ background: 'white', borderRadius: '16px', padding: '32px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <p style={{ fontSize: '14px', color: '#9CA3AF' }}>Sin resultados aún.</p>
              </div>
            ) : asignaciones.map(asig => {
              const abierta = expandida === asig.id
              const promedio = promedioAsignacion(asig.intentos)
              const aprobados = asig.intentos.filter(i => (i.nota_final ?? i.nota_automatica ?? 0) >= 11).length
              const reprobados = asig.intentos.filter(i => {
                const n = i.nota_final ?? i.nota_automatica
                return n !== null && n < 11
              }).length

              return (
                <div key={asig.id} style={{ background: 'white', borderRadius: '18px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '12px', overflow: 'hidden' }}>
                  {/* Cabecera */}
                  <div onClick={() => setExpandida(abierta ? null : asig.id)} style={{ padding: '16px', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <div style={{ width: '44px', height: '56px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0, background: obtenerGradientePortada(asig.lectura_id), position: 'relative' }}>
                        {asig.portada_url && <Image src={asig.portada_url} alt="" fill style={{ objectFit: 'cover' }} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '14px', fontWeight: 700, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{asig.titulo}</p>
                        <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px' }}>{asig.grado_nombre} {asig.aula_nombre}</p>
                        {/* Stats de la asignación */}
                        <div style={{ display: 'flex', gap: '12px', marginTop: '10px', flexWrap: 'wrap' }}>
                          {promedio !== null && (
                            <div>
                              <p style={{ fontSize: '22px', fontWeight: 800, color: promedio >= 11 ? '#10B981' : '#F43F5E', lineHeight: 1 }}>{promedio.toFixed(1)}</p>
                              <p style={{ fontSize: '11px', color: '#9CA3AF' }}>Promedio</p>
                            </div>
                          )}
                          {aprobados > 0 && (
                            <span style={{ height: '28px', padding: '0 10px', background: '#D1FAE5', color: '#065F46', borderRadius: '99px', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center' }}>
                              {aprobados} aprobados
                            </span>
                          )}
                          {reprobados > 0 && (
                            <span style={{ height: '28px', padding: '0 10px', background: '#FFF1F2', color: '#F43F5E', borderRadius: '99px', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center' }}>
                              {reprobados} reprobados
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronDown size={16} color="#9CA3AF" style={{ transform: abierta ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s', flexShrink: 0 }} />
                    </div>
                  </div>

                  {/* Expandible: lista de estudiantes */}
                  <div style={{ maxHeight: abierta ? '600px' : '0px', overflow: 'hidden', transition: 'max-height 0.35s cubic-bezier(0.16,1,0.3,1)' }}>
                    <div style={{ borderTop: '1px solid #F3F4F6', padding: '0 16px' }}>
                      {asig.intentos.length === 0 ? (
                        <p style={{ padding: '16px 0', fontSize: '13px', color: '#9CA3AF', textAlign: 'center' }}>Sin intentos aún.</p>
                      ) : asig.intentos.map(intento => {
                        const nota = notaDisplay(intento.nota_final ?? intento.nota_automatica)
                        return (
                          <div key={intento.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: '1px solid #F9FAFB' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #4F46E5, #6D28D9)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <span style={{ fontSize: '11px', fontWeight: 700, color: 'white' }}>
                                {intento.estudiante_nombre[0]}{intento.estudiante_apellido[0]}
                              </span>
                            </div>
                            <div style={{ flex: 1 }}>
                              <p style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>{intento.estudiante_nombre} {intento.estudiante_apellido}</p>
                              <p style={{ fontSize: '11px', color: '#9CA3AF' }}>{intento.estado}</p>
                            </div>
                            {nota !== null ? (
                              <span style={{ fontSize: '16px', fontWeight: 800, color: nota >= 11 ? '#10B981' : '#F43F5E' }}>
                                {formatNota(nota)}
                              </span>
                            ) : (
                              <span style={{ fontSize: '11px', fontWeight: 600, color: '#F59E0B', background: '#FEF3C7', borderRadius: '6px', padding: '3px 8px' }}>
                                Pendiente
                              </span>
                            )}
                            {intento.estado === 'revisando' && (
                              <button
                                onClick={() => router.push(`/profesor/resultados/${intento.id}/revisar`)}
                                style={{ background: '#EEF2FF', border: 'none', borderRadius: '8px', padding: '6px 10px', fontSize: '11px', fontWeight: 700, color: '#4F46E5', cursor: 'pointer', fontFamily: 'inherit' }}
                              >
                                Revisar
                              </button>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )
            })}
          </>
        )}

        {/* TAB: PENDIENTES REVISIÓN */}
        {tab === 'pendientes' && (
          <>
            {pendientes.length === 0 ? (
              <div style={{ background: 'white', borderRadius: '16px', padding: '32px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <AlertCircle size={32} color="#D1D5DB" style={{ margin: '0 auto 8px' }} />
                <p style={{ fontSize: '14px', color: '#9CA3AF' }}>No hay evaluaciones pendientes de revisión. 🎉</p>
              </div>
            ) : pendientes.map(p => (
              <div key={p.id} style={{ background: 'white', borderRadius: '16px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '10px' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #F59E0B, #D97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Clock size={18} color="white" strokeWidth={2} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>{p.estudiante_nombre} {p.estudiante_apellido}</p>
                    <p style={{ fontSize: '12px', color: '#9CA3AF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.lectura_titulo}</p>
                    {p.fecha_completado && (
                      <p style={{ fontSize: '11px', color: '#D97706', marginTop: '2px' }}>
                        Entregado: {new Date(p.fecha_completado).toLocaleDateString('es')}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => router.push(`/profesor/resultados/${p.id}/revisar`)}
                    style={{
                      flexShrink: 0, height: '40px', padding: '0 14px',
                      background: 'linear-gradient(135deg, #4F46E5, #6D28D9)',
                      border: 'none', borderRadius: '10px',
                      fontSize: '13px', fontWeight: 700, color: 'white',
                      cursor: 'pointer', fontFamily: 'inherit',
                      boxShadow: '0 4px 12px rgba(79,70,229,0.3)',
                    }}
                  >
                    Revisar ahora
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
