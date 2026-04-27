'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { BookOpen, Users, Calendar, BookMarked, Search, Check } from 'lucide-react'
import ProfesorTopBar from '@/components/layout/ProfesorTopBar'
import { obtenerGradientePortada } from '@/lib/utils'
import { crearAsignacionAction } from '../../actions'
import type { AulaConDetalle } from '../../types'
import type { LecturaConRelaciones } from '@/types/app.types'

interface Props {
  profesorId: string
  aulas: AulaConDetalle[]
  lecturas: LecturaConRelaciones[]
  bimestres: { id: string; nombre: string }[]
  lecturaPreseleccionada?: string
}

export default function NuevaAsignacionForm({ profesorId, aulas, lecturas, bimestres, lecturaPreseleccionada }: Props) {
  const router = useRouter()
  const [lecturaId, setLecturaId] = useState<string>(lecturaPreseleccionada ?? '')
  const [aulasIds, setAulasIds] = useState<string[]>([])
  const [fechaInicio, setFechaInicio] = useState(new Date().toISOString().split('T')[0])
  const [fechaLimite, setFechaLimite] = useState('')
  const [bimestreId, setBimestreId] = useState<string>('')
  const [instrucciones, setInstrucciones] = useState('')
  const [requiereEvaluacion, setRequiereEvaluacion] = useState(false)
  const [tipoEvaluacion, setTipoEvaluacion] = useState<'sin_evaluacion' | 'opcion_multiple' | 'respuesta_abierta' | 'mixta'>('sin_evaluacion')
  const [busqueda, setBusqueda] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const lecturasFiltradas = useMemo(() =>
    lecturas.filter(l =>
      l.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
      l.autor.toLowerCase().includes(busqueda.toLowerCase())
    ), [lecturas, busqueda]
  )

  const lecturaSeleccionada = lecturas.find(l => l.id === lecturaId)
  const aulasSeleccionadas = aulas.filter(a => aulasIds.includes(a.id))

  const toggleAula = (id: string) => {
    setAulasIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const chipStyle = (active: boolean): React.CSSProperties => ({
    height: '36px', padding: '0 14px',
    border: active ? '2px solid #4F46E5' : '1.5px solid #E5E7EB',
    borderRadius: '99px',
    background: active ? '#EEF2FF' : 'white',
    fontSize: '13px', fontWeight: active ? 700 : 500,
    color: active ? '#4F46E5' : '#6B7280',
    cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
  })

  const inputStyle: React.CSSProperties = {
    width: '100%', height: '48px',
    border: '1.5px solid #E5E7EB', borderRadius: '12px',
    padding: '0 14px', fontSize: '14px', color: '#111827',
    background: 'white', outline: 'none', fontFamily: 'inherit',
    boxSizing: 'border-box',
  }

  async function handleSubmit() {
    if (!lecturaId || aulasIds.length === 0) return
    setIsSubmitting(true); setError('')

    // Crear asignaciones masivas
    const promesas = aulasIds.map(aula_id => 
      crearAsignacionAction({
        lectura_id: lecturaId,
        aula_id: aula_id,
        profesorId,
        fecha_inicio: fechaInicio,
        fecha_limite: fechaLimite || undefined,
        bimestre_id: bimestreId || undefined,
        instrucciones: instrucciones || undefined,
        requiere_evaluacion: requiereEvaluacion,
        tipo_evaluacion: requiereEvaluacion ? tipoEvaluacion : 'sin_evaluacion'
      })
    )

    const resultados = await Promise.all(promesas)
    const hayErrores = resultados.some(r => !r.success)

    if (!hayErrores) {
      router.push('/profesor/asignaciones')
    } else {
      setError('Hubo errores al crear algunas asignaciones.')
      setIsSubmitting(false)
    }
  }

  const sectionTitle = (label: string, Icon: React.ElementType) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
      <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={14} color="#4F46E5" strokeWidth={2.5} />
      </div>
      <p style={{ fontSize: '14px', fontWeight: 800, color: '#111827' }}>{label}</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#F5F3FF' }}>
      <ProfesorTopBar title="Nueva asignación" showBack />

      <div style={{ padding: '16px 16px 160px', maxWidth: '480px', margin: '0 auto' }}>

        {/* 1. LECTURA */}
        <div style={{ background: 'white', borderRadius: '18px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '12px' }}>
          {sectionTitle('1. Lectura a asignar', BookOpen)}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#F9FAFB', borderRadius: '12px', padding: '0 12px', height: '40px', marginBottom: '10px' }}>
            <Search size={14} color="#9CA3AF" />
            <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar..." style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', fontFamily: 'inherit' }} />
          </div>
          <div style={{ maxHeight: '260px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {lecturasFiltradas.map(l => {
              const sel = lecturaId === l.id
              return (
                <div
                  key={l.id}
                  onClick={() => setLecturaId(l.id)}
                  style={{
                    display: 'flex', gap: '10px', alignItems: 'center',
                    padding: '10px', borderRadius: '12px', cursor: 'pointer',
                    border: sel ? '2px solid #4F46E5' : '1.5px solid #E5E7EB',
                    background: sel ? '#EEF2FF' : 'white',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ width: '36px', height: '46px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, background: obtenerGradientePortada(l.id), position: 'relative' }}>
                    {l.portada_url && <Image src={l.portada_url} alt="" fill style={{ objectFit: 'cover' }} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '13px', fontWeight: 700, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.titulo}</p>
                    <p style={{ fontSize: '11px', color: '#9CA3AF' }}>{l.autor}</p>
                  </div>
                  {sel && <Check size={16} color="#4F46E5" strokeWidth={2.5} />}
                </div>
              )
            })}
          </div>
        </div>

        {/* 2. AULA */}
        <div style={{ background: 'white', borderRadius: '18px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '12px' }}>
          {sectionTitle('2. Aulas destinatarias', Users)}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {aulas.map(a => {
              const sel = aulasIds.includes(a.id)
              return (
                <button
                  key={a.id}
                  onClick={() => toggleAula(a.id)}
                  style={chipStyle(sel)}
                >
                  {a.grado_nombre} {a.seccion_nombre} {a.anio_lectivo}
                  {sel && <span style={{ marginLeft: '4px' }}>✓</span>}
                </button>
              )
            })}
          </div>
        </div>

        {/* 3. EVALUACIÓN */}
        <div style={{ background: 'white', borderRadius: '18px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: requiereEvaluacion ? '12px' : '0' }}>
            {sectionTitle('3. Evaluación al finalizar', BookMarked)}
            <button
              onClick={() => setRequiereEvaluacion(!requiereEvaluacion)}
              style={{
                width: '44px', height: '24px', border: 'none', borderRadius: '99px', cursor: 'pointer',
                background: requiereEvaluacion ? '#4F46E5' : '#E5E7EB',
                position: 'relative', transition: 'background 0.2s', marginBottom: '12px'
              }}
            >
              <div style={{
                position: 'absolute', top: '2px', left: requiereEvaluacion ? '22px' : '2px',
                width: '20px', height: '20px', background: 'white', borderRadius: '50%',
                transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)'
              }} />
            </button>
          </div>
          
          {requiereEvaluacion && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(['opcion_multiple', 'respuesta_abierta', 'mixta'] as const).map(tipo => (
                <button
                  key={tipo}
                  onClick={() => setTipoEvaluacion(tipo)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px', padding: '12px',
                    borderRadius: '12px', cursor: 'pointer',
                    background: tipoEvaluacion === tipo ? '#EEF2FF' : '#F9FAFB',
                    border: tipoEvaluacion === tipo ? '1.5px solid #4F46E5' : '1.5px solid #E5E7EB',
                    textAlign: 'left'
                  }}
                >
                  <div style={{
                    width: '18px', height: '18px', borderRadius: '50%',
                    border: tipoEvaluacion === tipo ? '5px solid #4F46E5' : '1.5px solid #9CA3AF',
                    background: 'white'
                  }} />
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151', textTransform: 'capitalize' }}>
                    {tipo.replace('_', ' ')}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 3. FECHAS */}
        <div style={{ background: 'white', borderRadius: '18px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '12px' }}>
          {sectionTitle('3. Período', Calendar)}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <p style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '6px' }}>Fecha inicio</p>
              <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <p style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '6px' }}>Fecha límite</p>
              <input type="date" value={fechaLimite} onChange={e => setFechaLimite(e.target.value)} style={inputStyle} />
            </div>
          </div>
        </div>

        {/* 4. BIMESTRE */}
        <div style={{ background: 'white', borderRadius: '18px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '12px' }}>
          {sectionTitle('4. Bimestre (opcional)', BookMarked)}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            <button onClick={() => setBimestreId('')} style={chipStyle(!bimestreId)}>Sin bimestre</button>
            {bimestres.map(b => (
              <button key={b.id} onClick={() => setBimestreId(b.id)} style={chipStyle(bimestreId === b.id)}>
                {b.nombre}
              </button>
            ))}
          </div>
        </div>

        {/* 5. INSTRUCCIONES */}
        <div style={{ background: 'white', borderRadius: '18px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '16px' }}>
          <p style={{ fontSize: '14px', fontWeight: 800, color: '#111827', marginBottom: '10px' }}>5. Instrucciones (opcional)</p>
          <textarea
            value={instrucciones}
            onChange={e => setInstrucciones(e.target.value)}
            placeholder="Escribe instrucciones adicionales para los estudiantes..."
            style={{ width: '100%', minHeight: '100px', border: '1.5px solid #E5E7EB', borderRadius: '12px', padding: '12px 14px', fontSize: '13px', color: '#374151', fontFamily: 'inherit', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>

        {/* PREVIEW */}
        {lecturaSeleccionada && aulasSeleccionadas.length > 0 && (
          <div style={{ background: '#F5F3FF', borderRadius: '16px', padding: '16px', border: '1.5px solid #C7D2FE', marginBottom: '16px' }}>
            <p style={{ fontSize: '13px', fontWeight: 700, color: '#4F46E5', marginBottom: '10px' }}>Resumen de la asignación</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <p style={{ fontSize: '13px', color: '#374151' }}>📖 <strong>{lecturaSeleccionada.titulo}</strong></p>
              <p style={{ fontSize: '13px', color: '#374151' }}>👥 {aulasSeleccionadas.length} aulas seleccionadas</p>
              {fechaLimite && <p style={{ fontSize: '13px', color: '#374151' }}>📅 Límite: {new Date(fechaLimite + 'T12:00').toLocaleDateString('es')}</p>}
            </div>
          </div>
        )}

        {error && <p style={{ fontSize: '13px', color: '#F43F5E', marginBottom: '8px', textAlign: 'center' }}>{error}</p>}
      </div>

      {/* BOTONES FIJOS */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
        background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(16px)',
        borderTop: '1px solid #F1F5F9',
        padding: '12px 16px', paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))',
      }}>
        <div style={{ maxWidth: '480px', margin: '0 auto', display: 'flex', gap: '10px' }}>
          <button onClick={() => router.back()} style={{ flex: 1, height: '54px', border: '1.5px solid #E5E7EB', borderRadius: '14px', background: 'white', fontSize: '15px', fontWeight: 700, color: '#6B7280', cursor: 'pointer', fontFamily: 'inherit' }}>
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!lecturaId || aulasIds.length === 0 || isSubmitting}
            style={{
              flex: 2, height: '54px', border: 'none',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #4F46E5, #6D28D9)',
              fontSize: '15px', fontWeight: 800, color: 'white',
              cursor: (!lecturaId || aulasIds.length === 0) ? 'not-allowed' : 'pointer',
              opacity: (!lecturaId || aulasIds.length === 0) ? 0.4 : 1,
              boxShadow: '0 4px 14px rgba(79,70,229,0.35)',
              fontFamily: 'inherit',
            }}
          >
            {isSubmitting ? 'Creando...' : 'Crear asignaciones'}
          </button>
        </div>
      </div>
    </div>
  )
}
