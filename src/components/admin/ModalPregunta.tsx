'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Trash2, CheckCircle, List, ToggleLeft } from 'lucide-react'
import { crearPreguntaAction, editarPreguntaAction } from '@/app/(admin)/admin/actions'
import type { PreguntaConOpciones } from '@/types/app.types'
import type { NuevaPreguntaInput } from '@/app/(admin)/admin/types'

type Tipo = 'opcion_multiple' | 'verdadero_falso' | 'abierta'

const TIPO_CONFIG: { tipo: Tipo; label: string; desc: string; icon: React.ElementType; color: string }[] = [
  { tipo: 'opcion_multiple', label: 'Opción múltiple', desc: 'El estudiante elige una opción correcta', icon: List,        color: '#4F46E5' },
  { tipo: 'verdadero_falso', label: 'Verdadero / Falso', desc: 'El estudiante elige V o F',              icon: ToggleLeft, color: '#D97706' },
  { tipo: 'abierta',         label: 'Pregunta abierta', desc: 'El profesor califica manualmente',        icon: CheckCircle, color: '#10B981' },
]

interface Opcion { texto: string; es_correcta: boolean }

interface Props {
  isOpen: boolean
  onClose: () => void
  lecturaId: string
  pregunta?: PreguntaConOpciones
  siguienteOrden?: number
  onGuardado: () => void
}

export default function ModalPregunta({ isOpen, onClose, lecturaId, pregunta, siguienteOrden = 1, onGuardado }: Props) {
  const esEdicion = !!pregunta

  const [tipo, setTipo]           = useState<Tipo>(pregunta?.tipo ?? 'opcion_multiple')
  const [enunciado, setEnunciado] = useState(pregunta?.enunciado ?? '')
  const [puntaje, setPuntaje]     = useState(pregunta?.puntaje ?? 2)
  const [activo, setActivo]       = useState(pregunta?.activo ?? true)
  const [opciones, setOpciones]   = useState<Opcion[]>(
    pregunta?.tipo === 'opcion_multiple' && pregunta.opciones.length > 0
      ? pregunta.opciones.map(o => ({ texto: o.texto, es_correcta: o.es_correcta }))
      : [{ texto: '', es_correcta: true }, { texto: '', es_correcta: false }]
  )
  const [correctaVF, setCorrectaVF] = useState<boolean>(
    pregunta?.tipo === 'verdadero_falso'
      ? (pregunta.opciones.find(o => o.es_correcta)?.texto === 'Verdadero')
      : true
  )
  const [cargando, setCargando] = useState(false)
  const [error, setError]       = useState<string | null>(null)

  useEffect(() => {
    if (tipo === 'opcion_multiple' && opciones.length < 2) {
      setOpciones([{ texto: '', es_correcta: true }, { texto: '', es_correcta: false }])
    }
  }, [tipo, opciones.length])

  if (!isOpen) return null

  function actualizarOpcion(idx: number, texto: string) {
    setOpciones(prev => prev.map((o, i) => i === idx ? { ...o, texto } : o))
  }

  function marcarCorrecta(idx: number) {
    setOpciones(prev => prev.map((o, i) => ({ ...o, es_correcta: i === idx })))
  }

  function agregarOpcion() {
    if (opciones.length >= 5) return
    setOpciones(prev => [...prev, { texto: '', es_correcta: false }])
  }

  function eliminarOpcion(idx: number) {
    if (opciones.length <= 2) return
    const nuevas = opciones.filter((_, i) => i !== idx)
    if (!nuevas.some(o => o.es_correcta)) nuevas[0].es_correcta = true
    setOpciones(nuevas)
  }

  async function handleGuardar() {
    setError(null)
    if (!enunciado.trim()) { setError('El enunciado es obligatorio.'); return }
    if (tipo === 'opcion_multiple') {
      if (opciones.some(o => !o.texto.trim())) { setError('Todas las opciones deben tener texto.'); return }
      if (!opciones.some(o => o.es_correcta)) { setError('Marca al menos una opción correcta.'); return }
    }

    setCargando(true)
    const datos: NuevaPreguntaInput = {
      lectura_id: lecturaId,
      enunciado: enunciado.trim(),
      tipo,
      puntaje,
      activo,
      opciones: tipo === 'opcion_multiple' ? opciones : undefined,
      opcion_correcta_vf: tipo === 'verdadero_falso' ? correctaVF : undefined,
    }

    const result = esEdicion
      ? await editarPreguntaAction(pregunta!.id, datos)
      : await crearPreguntaAction(datos)

    setCargando(false)
    if (!result.success) { setError(result.error ?? 'Error al guardar'); return }
    onGuardado()
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', border: '1.5px solid #E5E7EB', borderRadius: '12px',
    padding: '12px 14px', fontSize: '14px', color: '#111827',
    outline: 'none', background: 'white', fontFamily: 'inherit',
    boxSizing: 'border-box',
  }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 400, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} />
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 401,
        background: 'white', borderRadius: '24px 24px 0 0',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.2)',
        maxHeight: '92vh', overflowY: 'auto',
      }}>
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '12px' }}>
          <div style={{ width: '40px', height: '4px', borderRadius: '2px', background: '#E5E7EB' }} />
        </div>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px 16px', borderBottom: '1px solid #F3F4F6' }}>
          <p style={{ fontSize: '17px', fontWeight: '800', color: '#111827' }}>{esEdicion ? 'Editar pregunta' : 'Nueva pregunta'}</p>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color="#9CA3AF" /></button>
        </div>

        <div style={{ padding: '16px 20px 32px' }}>
          {/* TIPO */}
          <p style={{ fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '10px' }}>Tipo de pregunta</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
            {TIPO_CONFIG.map(cfg => {
              const sel = tipo === cfg.tipo
              return (
                <button key={cfg.tipo} type="button" onClick={() => setTipo(cfg.tipo)} style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px 14px', borderRadius: '12px',
                  border: sel ? `2px solid ${cfg.color}` : '1.5px solid #E5E7EB',
                  background: sel ? `${cfg.color}10` : 'white',
                  cursor: 'pointer', textAlign: 'left',
                }}>
                  <cfg.icon size={18} color={sel ? cfg.color : '#9CA3AF'} />
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: '700', color: sel ? cfg.color : '#111827' }}>{cfg.label}</p>
                    <p style={{ fontSize: '11px', color: '#9CA3AF' }}>{cfg.desc}</p>
                  </div>
                </button>
              )
            })}
          </div>

          {/* ENUNCIADO */}
          <p style={{ fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>Enunciado *</p>
          <textarea
            value={enunciado}
            onChange={e => setEnunciado(e.target.value)}
            placeholder="Escribe la pregunta..."
            style={{ ...inputStyle, minHeight: '100px', resize: 'vertical', lineHeight: '1.5' }}
          />

          {/* PUNTAJE */}
          <p style={{ fontSize: '13px', fontWeight: '700', color: '#374151', margin: '16px 0 8px' }}>Puntaje</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button type="button" onClick={() => setPuntaje(p => Math.max(1, p - 1))} style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#F3F4F6', border: 'none', fontSize: '18px', fontWeight: '700', color: '#374151', cursor: 'pointer' }}>−</button>
            <span style={{ fontSize: '22px', fontWeight: '800', color: '#111827', minWidth: '32px', textAlign: 'center' }}>{puntaje}</span>
            <button type="button" onClick={() => setPuntaje(p => Math.min(10, p + 1))} style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#F3F4F6', border: 'none', fontSize: '18px', fontWeight: '700', color: '#374151', cursor: 'pointer' }}>+</button>
            <span style={{ fontSize: '12px', color: '#9CA3AF' }}>puntos (máx 10)</span>
          </div>

          {/* OPCIONES MÚLTIPLE */}
          {tipo === 'opcion_multiple' && (
            <div style={{ marginTop: '20px' }}>
              <p style={{ fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '10px' }}>Opciones de respuesta</p>
              {opciones.map((op, idx) => (
                <div key={idx} style={{
                  display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px',
                  padding: '10px 12px', borderRadius: '12px',
                  background: op.es_correcta ? '#ECFDF5' : 'white',
                  border: op.es_correcta ? '1.5px solid #10B981' : '1.5px solid #E5E7EB',
                }}>
                  <button type="button" onClick={() => marcarCorrecta(idx)} style={{
                    width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0,
                    border: op.es_correcta ? '2px solid #10B981' : '2px solid #D1D5DB',
                    background: op.es_correcta ? '#10B981' : 'white',
                    cursor: 'pointer',
                  }} />
                  <input
                    value={op.texto}
                    onChange={e => actualizarOpcion(idx, e.target.value)}
                    placeholder={`Opción ${String.fromCharCode(65 + idx)}`}
                    style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: '14px', color: '#111827', fontFamily: 'inherit' }}
                  />
                  {opciones.length > 2 && (
                    <button type="button" onClick={() => eliminarOpcion(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}>
                      <Trash2 size={14} color="#F43F5E" />
                    </button>
                  )}
                </div>
              ))}
              {opciones.length < 5 && (
                <button type="button" onClick={agregarOpcion} style={{ width: '100%', height: '38px', border: '1.5px dashed #C7D2FE', borderRadius: '10px', background: 'transparent', color: '#4F46E5', fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <Plus size={14} /> Agregar opción
                </button>
              )}
            </div>
          )}

          {/* VERDADERO / FALSO */}
          {tipo === 'verdadero_falso' && (
            <div style={{ marginTop: '20px', background: '#F0FDF4', borderRadius: '12px', padding: '14px 16px' }}>
              <p style={{ fontSize: '13px', fontWeight: '700', color: '#065F46', marginBottom: '10px' }}>¿Cuál es la respuesta correcta?</p>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[true, false].map(val => (
                  <button key={String(val)} type="button" onClick={() => setCorrectaVF(val)} style={{
                    flex: 1, height: '40px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                    background: correctaVF === val ? '#10B981' : '#E5E7EB',
                    color: correctaVF === val ? 'white' : '#6B7280',
                    fontSize: '14px', fontWeight: '700',
                  }}>
                    {val ? 'Verdadero' : 'Falso'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ACTIVO */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '20px', padding: '14px 0', borderTop: '1px solid #F3F4F6' }}>
            <p style={{ fontSize: '14px', fontWeight: '700', color: '#111827' }}>Pregunta activa</p>
            <button type="button" onClick={() => setActivo(!activo)} style={{ width: '48px', height: '28px', borderRadius: '14px', border: 'none', background: activo ? '#4F46E5' : '#E5E7EB', position: 'relative', cursor: 'pointer', transition: 'background 0.2s' }}>
              <div style={{ position: 'absolute', top: '3px', left: activo ? '23px' : '3px', width: '22px', height: '22px', borderRadius: '50%', background: 'white', boxShadow: '0 1px 4px rgba(0,0,0,0.2)', transition: 'left 0.2s' }} />
            </button>
          </div>

          {error && (
            <div style={{ background: '#FFF1F2', borderRadius: '10px', padding: '10px 14px', marginTop: '12px' }}>
              <p style={{ fontSize: '13px', color: '#BE123C', fontWeight: '600' }}>{error}</p>
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button onClick={onClose} style={{ flex: 1, height: '48px', borderRadius: '14px', background: 'white', border: '1.5px solid #E5E7EB', fontSize: '14px', fontWeight: '700', color: '#6B7280', cursor: 'pointer' }}>
              Cancelar
            </button>
            <button onClick={handleGuardar} disabled={cargando} style={{ flex: 2, height: '48px', borderRadius: '14px', background: cargando ? '#9CA3AF' : 'linear-gradient(135deg, #4F46E5, #6D28D9)', border: 'none', fontSize: '14px', fontWeight: '800', color: 'white', cursor: cargando ? 'not-allowed' : 'pointer' }}>
              {cargando ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear pregunta'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
