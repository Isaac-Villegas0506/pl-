'use client'

import { useState } from 'react'
import { Check, X } from 'lucide-react'
import type { OpcionRespuesta } from '@/app/(evaluacion)/evaluacion/[id]/types'

interface VerdaderoFalsoProps {
  seleccionada: string | null
  opcionVerdaderoId: string
  opcionFalsoId: string
  onSeleccionar: (id: string) => void
  readOnly?: boolean
}

export default function VerdaderoFalso({
  seleccionada,
  opcionVerdaderoId,
  opcionFalsoId,
  onSeleccionar,
  readOnly = false,
}: VerdaderoFalsoProps) {
  const esVerdadero = seleccionada === opcionVerdaderoId
  const esFalso = seleccionada === opcionFalsoId

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '20px' }}>
      {/* VERDADERO */}
      <button
        onClick={() => !readOnly && onSeleccionar(opcionVerdaderoId)}
        disabled={readOnly}
        style={{
          border: esVerdadero ? '2px solid #10B981' : '1.5px solid #E5E7EB',
          borderRadius: '16px',
          padding: '20px',
          background: esVerdadero ? '#ECFDF5' : 'white',
          boxShadow: esVerdadero
            ? '0 4px 12px rgba(16,185,129,0.2)'
            : '0 1px 4px rgba(0,0,0,0.04)',
          cursor: readOnly ? 'default' : 'pointer',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: '8px',
          transition: 'all 0.2s cubic-bezier(0.16,1,0.3,1)',
          transform: esVerdadero ? 'scale(1.02)' : 'scale(1)',
          fontFamily: 'inherit',
        }}
      >
        <Check
          size={28}
          color={esVerdadero ? '#10B981' : '#D1D5DB'}
          strokeWidth={2.5}
          style={{ transition: 'color 0.2s' }}
        />
        <span style={{
          fontSize: '15px', fontWeight: 700,
          color: esVerdadero ? '#065F46' : '#9CA3AF',
          transition: 'color 0.2s',
        }}>
          Verdadero
        </span>
      </button>

      {/* FALSO */}
      <button
        onClick={() => !readOnly && onSeleccionar(opcionFalsoId)}
        disabled={readOnly}
        style={{
          border: esFalso ? '2px solid #F43F5E' : '1.5px solid #E5E7EB',
          borderRadius: '16px',
          padding: '20px',
          background: esFalso ? '#FFF1F2' : 'white',
          boxShadow: esFalso
            ? '0 4px 12px rgba(244,63,94,0.2)'
            : '0 1px 4px rgba(0,0,0,0.04)',
          cursor: readOnly ? 'default' : 'pointer',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: '8px',
          transition: 'all 0.2s cubic-bezier(0.16,1,0.3,1)',
          transform: esFalso ? 'scale(1.02)' : 'scale(1)',
          fontFamily: 'inherit',
        }}
      >
        <X
          size={28}
          color={esFalso ? '#F43F5E' : '#D1D5DB'}
          strokeWidth={2.5}
          style={{ transition: 'color 0.2s' }}
        />
        <span style={{
          fontSize: '15px', fontWeight: 700,
          color: esFalso ? '#BE123C' : '#9CA3AF',
          transition: 'color 0.2s',
        }}>
          Falso
        </span>
      </button>
    </div>
  )
}
