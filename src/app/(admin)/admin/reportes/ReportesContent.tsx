'use client'

import { useState, useEffect } from 'react'
import AdminTopBar from '@/components/layout/AdminTopBar'
import { obtenerGradientePortada } from '@/lib/utils'
import type { DataMensual, RendimientoPorGrado } from '../types'

const TABS = ['Resumen', 'Por Grado', 'Lecturas'] as const
type Tab = typeof TABS[number]

const PODIO = [
  'linear-gradient(135deg, #F59E0B, #D97706)',
  'linear-gradient(135deg, #94A3B8, #64748B)',
  'linear-gradient(135deg, #D97706, #92400E)',
]

interface LecturaRanking { id: string; titulo: string; portada_url: string | null; valor: number }

interface Props {
  stats: { totalIntentos: number; intentosMes: number }
  dataMensual: DataMensual[]
  topAsignadas: LecturaRanking[]
  topCompletadas: LecturaRanking[]
  rendimientoPorGrado: RendimientoPorGrado[]
}

function BarChart({ data }: { data: DataMensual[] }) {
  const [montado, setMontado] = useState(false)
  useEffect(() => { const t = setTimeout(() => setMontado(true), 100); return () => clearTimeout(t) }, [])
  const maxVal = Math.max(...data.map(d => d.count), 1)

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '120px', padding: '0 4px' }}>
      {data.map(mes => (
        <div key={mes.mes} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
          <div style={{
            width: '100%', borderRadius: '6px 6px 0 0',
            background: 'linear-gradient(to top, #4F46E5, #818CF8)',
            height: montado ? `${Math.max((mes.count / maxVal) * 100, 4)}px` : '4px',
            minHeight: '4px',
            transition: 'height 0.6s cubic-bezier(0.16,1,0.3,1)',
          }} />
          <span style={{ fontSize: '9px', color: '#9CA3AF', fontWeight: '600', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
            {mes.mes.slice(0, 3)}
          </span>
        </div>
      ))}
    </div>
  )
}

function RankingItem({ item, pos, labelValor }: { item: LecturaRanking; pos: number; labelValor: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: '1px solid #F3F4F6' }}>
      <span style={{
        width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
        background: pos <= 3 ? PODIO[pos - 1] : '#F3F4F6',
        color: pos <= 3 ? 'white' : '#9CA3AF',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '13px', fontWeight: '800',
      }}>
        {pos}
      </span>
      <div style={{ width: '36px', height: '46px', borderRadius: '8px', background: obtenerGradientePortada(item.id), flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '13px', fontWeight: '700', color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {item.titulo}
        </p>
        <p style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '2px' }}>
          {item.valor} {labelValor}
        </p>
      </div>
    </div>
  )
}

export default function ReportesContent({ stats, dataMensual, topAsignadas, topCompletadas, rendimientoPorGrado }: Props) {
  const [tab, setTab] = useState<Tab>('Resumen')
  const [gradoExpandido, setGradoExpandido] = useState<string | null>(null)
  const [subTab, setSubTab] = useState<'asignadas' | 'completadas'>('asignadas')

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC' }}>
      <AdminTopBar title="Reportes" subtitle="Estadísticas del sistema" />

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

      <div style={{ padding: '16px' }}>

        {/* RESUMEN */}
        {tab === 'Resumen' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
              {[
                { label: 'Total completados', value: stats.totalIntentos.toLocaleString(), color: '#4F46E5', bg: '#EEF2FF' },
                { label: 'Completados este mes', value: stats.intentosMes.toLocaleString(), color: '#10B981', bg: '#D1FAE5' },
              ].map(s => (
                <div key={s.label} style={{ background: 'white', borderRadius: '16px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: s.bg, marginBottom: '8px' }} />
                  <p style={{ fontSize: '24px', fontWeight: '800', color: s.color }}>{s.value}</p>
                  <p style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '600', marginTop: '3px' }}>{s.label}</p>
                </div>
              ))}
            </div>

            <div style={{ background: 'white', borderRadius: '18px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <p style={{ fontSize: '15px', fontWeight: '800', color: '#111827', marginBottom: '16px' }}>
                Actividad mensual
              </p>
              <BarChart data={dataMensual} />
            </div>
          </>
        )}

        {/* POR GRADO */}
        {tab === 'Por Grado' && (
          <div>
            {rendimientoPorGrado.length === 0 && (
              <p style={{ color: '#9CA3AF', fontSize: '14px', textAlign: 'center', padding: '40px 0' }}>Sin datos de rendimiento disponibles</p>
            )}
            {rendimientoPorGrado.map(g => {
              const expandido = gradoExpandido === g.grado_id
              const aprobColor = g.tasa_aprobacion >= 70 ? '#10B981' : g.tasa_aprobacion >= 50 ? '#F59E0B' : '#F43F5E'
              return (
                <div key={g.grado_id} style={{ background: 'white', borderRadius: '16px', marginBottom: '8px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                  <button onClick={() => setGradoExpandido(expandido ? null : g.grado_id)} style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer',
                  }}>
                    <div style={{ textAlign: 'left' }}>
                      <p style={{ fontSize: '15px', fontWeight: '700', color: '#111827' }}>{g.grado_nombre}</p>
                      <p style={{ fontSize: '12px', color: '#9CA3AF' }}>{g.total_intentos} evaluaciones · Prom: {g.promedio_nota}/20</p>
                    </div>
                    <span style={{
                      fontSize: '12px', fontWeight: '800',
                      color: aprobColor, background: `${aprobColor}20`,
                      borderRadius: '99px', padding: '4px 12px',
                    }}>
                      {g.tasa_aprobacion}% aprob.
                    </span>
                  </button>
                  {expandido && g.total_intentos === 0 && (
                    <div style={{ padding: '12px 16px', borderTop: '1px solid #F3F4F6' }}>
                      <p style={{ fontSize: '13px', color: '#9CA3AF' }}>Sin datos de intentos para este grado.</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* LECTURAS */}
        {tab === 'Lecturas' && (
          <>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              {[
                { key: 'asignadas', label: 'Más asignadas' },
                { key: 'completadas', label: 'Más completadas' },
              ].map(s => (
                <button key={s.key} onClick={() => setSubTab(s.key as 'asignadas' | 'completadas')} style={{
                  flex: 1, height: '38px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                  background: subTab === s.key ? '#0F172A' : 'white',
                  color: subTab === s.key ? 'white' : '#6B7280',
                  fontSize: '13px', fontWeight: '700',
                  boxShadow: subTab === s.key ? '0 2px 8px rgba(15,23,42,0.2)' : '0 1px 4px rgba(0,0,0,0.06)',
                }}>
                  {s.label}
                </button>
              ))}
            </div>

            <div style={{ background: 'white', borderRadius: '18px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              {subTab === 'asignadas' && (
                topAsignadas.length === 0
                  ? <p style={{ color: '#9CA3AF', textAlign: 'center', padding: '20px', fontSize: '14px' }}>Sin datos</p>
                  : topAsignadas.map((l, idx) => <RankingItem key={l.id} item={l} pos={idx + 1} labelValor="asignaciones" />)
              )}
              {subTab === 'completadas' && (
                topCompletadas.length === 0
                  ? <p style={{ color: '#9CA3AF', textAlign: 'center', padding: '20px', fontSize: '14px' }}>Sin datos</p>
                  : topCompletadas.map((l, idx) => <RankingItem key={l.id} item={l} pos={idx + 1} labelValor="completados" />)
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
