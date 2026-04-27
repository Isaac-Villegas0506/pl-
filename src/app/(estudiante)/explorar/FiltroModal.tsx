'use client'

import { useState, useEffect } from 'react'
import { X, CheckCircle2 } from 'lucide-react'

interface FiltroModalProps {
  isOpen: boolean
  onClose: () => void
  titulo: string
  opciones: { id: string; nombre: string }[]
  valorActual: string | undefined
  onSeleccionar: (id: string | undefined) => void
}

export default function FiltroModal({
  isOpen,
  onClose,
  titulo,
  opciones,
  valorActual,
  onSeleccionar,
}: FiltroModalProps) {
  const [seleccion, setSeleccion] = useState<string | undefined>(valorActual)
  const [visible, setVisible] = useState(false)

  // Sincronizar selección cuando cambia valorActual
  useEffect(() => {
    setSeleccion(valorActual)
  }, [valorActual])

  // Animación de entrada y salida
  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => setVisible(true), 10)
      return () => clearTimeout(t)
    } else {
      setVisible(false)
    }
  }, [isOpen])

  // Bloquear scroll del body mientras está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  const handleAplicar = () => {
    onSeleccionar(seleccion)
    onClose()
  }

  const handleLimpiar = () => {
    setSeleccion(undefined)
    onSeleccionar(undefined)
    onClose()
  }

  return (
    // OVERLAY
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.3s ease',
      }}
    >
      {/* BOTTOM SHEET */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '480px',
          background: 'white',
          borderRadius: '24px 24px 0 0',
          padding: '0 0 32px',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.15)',
          transform: visible ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          maxHeight: '80vh',
          display: 'flex', flexDirection: 'column',
        }}
      >
        {/* HANDLE */}
        <div style={{
          display: 'flex', justifyContent: 'center',
          paddingTop: '12px', paddingBottom: '4px',
        }}>
          <div style={{
            width: '36px', height: '4px',
            background: '#E5E7EB', borderRadius: '99px',
          }} />
        </div>

        {/* HEADER */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 20px 16px',
          borderBottom: '1px solid #F3F4F6',
        }}>
          <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#111827' }}>
            {titulo}
          </h3>
          <button
            onClick={onClose}
            style={{
              width: '32px', height: '32px',
              background: '#F3F4F6', border: 'none',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={16} color="#6B7280" strokeWidth={2.5} />
          </button>
        </div>

        {/* LISTA DE OPCIONES (scrollable) */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '4px 0' }}>
          {opciones.map((opcion, index) => {
            const isSelected = seleccion === opcion.id
            return (
              <button
                key={opcion.id}
                onClick={() => setSeleccion(isSelected ? undefined : opcion.id)}
                style={{
                  width: '100%', border: 'none',
                  background: isSelected ? '#F5F3FF' : 'transparent',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  cursor: 'pointer',
                  borderBottom: index < opciones.length - 1
                    ? '1px solid #F9FAFB' : 'none',
                  transition: 'background 0.15s',
                  fontFamily: 'inherit',
                }}
              >
                <span style={{
                  fontSize: '15px',
                  fontWeight: isSelected ? 700 : 500,
                  color: isSelected ? '#4F46E5' : '#111827',
                  transition: 'color 0.15s',
                }}>
                  {opcion.nombre}
                </span>

                {isSelected ? (
                  <CheckCircle2
                    size={22}
                    color="#4F46E5"
                    fill="#EEF2FF"
                    strokeWidth={2}
                    style={{
                      flexShrink: 0,
                      animation: 'scaleIn 0.2s cubic-bezier(0.16,1,0.3,1)',
                    }}
                  />
                ) : (
                  <div style={{
                    width: '22px', height: '22px',
                    border: '1.5px solid #D1D5DB',
                    borderRadius: '50%', flexShrink: 0,
                  }} />
                )}
              </button>
            )
          })}
        </div>

        {/* BOTONES DE ACCIÓN */}
        <div style={{
          padding: '16px 20px 0',
          borderTop: '1px solid #F3F4F6',
          display: 'flex', flexDirection: 'column', gap: '10px',
        }}>
          <button
            onClick={handleAplicar}
            style={{
              height: '52px', width: '100%',
              background: 'linear-gradient(135deg, #4F46E5, #6D28D9)',
              color: 'white', border: 'none',
              borderRadius: '14px',
              fontSize: '15px', fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(79,70,229,0.35)',
              transition: 'transform 0.15s, box-shadow 0.15s',
              fontFamily: 'inherit',
            }}
          >
            Aplicar filtro
          </button>

          <button
            onClick={handleLimpiar}
            style={{
              height: '44px', width: '100%',
              background: 'transparent', color: '#6B7280',
              border: 'none', borderRadius: '14px',
              fontSize: '14px', fontWeight: 600,
              cursor: 'pointer',
              transition: 'color 0.15s',
              fontFamily: 'inherit',
            }}
          >
            Limpiar selección
          </button>
        </div>
      </div>
    </div>
  )
}
