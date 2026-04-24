'use client'

import { useState } from 'react'

interface RespuestaAbiertaProps {
  valor: string
  onChange: (texto: string) => void
  maxChars?: number
  readOnly?: boolean
}

export default function RespuestaAbierta({
  valor,
  onChange,
  maxChars = 500,
  readOnly = false,
}: RespuestaAbiertaProps) {
  const [isFocused, setIsFocused] = useState(false)
  const chars = valor.length
  const porcentaje = chars / maxChars

  const contadorColor =
    porcentaje > 0.95
      ? '#F43F5E'
      : porcentaje > 0.8
        ? '#F59E0B'
        : '#9CA3AF'

  return (
    <div style={{ marginTop: '20px' }}>
      <label style={{
        display: 'block',
        fontSize: '13px', fontWeight: 600, color: '#374151',
        marginBottom: '8px',
      }}>
        Escribe tu respuesta
      </label>

      <textarea
        value={valor}
        onChange={(e) => !readOnly && onChange(e.target.value.slice(0, maxChars))}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        readOnly={readOnly}
        placeholder="Desarrolla tu respuesta aquí..."
        style={{
          width: '100%',
          minHeight: '140px',
          maxHeight: '300px',
          background: readOnly ? '#F9FAFB' : 'white',
          border: isFocused
            ? '1.5px solid #4F46E5'
            : '1.5px solid #E5E7EB',
          borderRadius: '16px',
          padding: '16px',
          fontSize: '15px',
          color: '#111827',
          lineHeight: '1.6',
          fontFamily: 'inherit',
          resize: 'vertical',
          outline: 'none',
          boxShadow: isFocused
            ? '0 0 0 3px rgba(79,70,229,0.10)'
            : '0 1px 4px rgba(0,0,0,0.04)',
          transition: 'border-color 0.2s, box-shadow 0.2s',
          cursor: readOnly ? 'default' : 'text',
        }}
      />

      <div style={{
        display: 'flex', justifyContent: 'flex-end',
        marginTop: '6px',
      }}>
        <span style={{ fontSize: '12px', color: contadorColor, fontWeight: 500, transition: 'color 0.2s' }}>
          {chars}/{maxChars}
        </span>
      </div>
    </div>
  )
}
