import React from 'react'
import { AlertCircle } from 'lucide-react'

interface Props {
  label: string
  value: string
  onChange: (v: string) => void
  error?: string
  placeholder?: string
  type?: string
  style?: React.CSSProperties
  rightElement?: React.ReactNode
  disabled?: boolean
}

export default function CampoInput({ label, value, onChange, error,
  placeholder, type = 'text', style, rightElement, disabled }: Props) {
  return (
    <div style={style}>
      <label style={{
        fontSize: '13px', fontWeight: '600', color: '#374151',
        display: 'block', marginBottom: '6px',
      }}>
        {label}
      </label>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        background: disabled ? '#F9FAFB' : 'white',
        border: `1.5px solid ${error ? '#FDA4AF' : '#E5E7EB'}`,
        borderRadius: '14px', padding: '0 14px',
        height: '52px',
        boxShadow: error ? '0 0 0 3px rgba(244,63,94,0.08)' : 'none',
        transition: 'border-color 0.2s, box-shadow 0.2s',
      }}>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          style={{
            flex: 1, border: 'none', outline: 'none',
            background: 'transparent', fontSize: '15px',
            color: '#111827', fontFamily: 'inherit',
          }}
        />
        {rightElement}
      </div>
      {error && (
        <p style={{ fontSize: '12px', color: '#F43F5E',
          fontWeight: '600', marginTop: '5px', display: 'flex',
          alignItems: 'center', gap: '4px' }}>
          <AlertCircle size={12} /> {error}
        </p>
      )}
    </div>
  )
}
