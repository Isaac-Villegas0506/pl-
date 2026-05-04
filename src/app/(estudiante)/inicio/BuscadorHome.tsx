'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'

interface BuscadorHomeProps {
  onSearch: (query: string) => void
}

export default function BuscadorHome({ onSearch }: BuscadorHomeProps) {
  const [value, setValue] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (value.trim()) onSearch(value.trim())
  }

  return (
    <form onSubmit={handleSubmit}>
      <div
        className="soft-shadow"
        style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          background: '#F8FAFC', // Slate 50
          borderRadius: '16px',
          padding: '0 16px',
          height: '52px', // Restored closer to original height
          border: isFocused ? '2px solid #4F46E5' : '2px solid transparent',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <button type="submit" style={{ flexShrink: 0, cursor: 'pointer', background: 'none', border: 'none', display: 'flex' }}>
          <Search
            size={18}
            color={isFocused ? '#4F46E5' : '#94A3B8'}
            strokeWidth={2.5}
          />
        </button>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="¿Qué quieres leer hoy?"
          style={{
            flex: 1, border: 'none', outline: 'none',
            background: 'transparent',
            fontSize: '15px', fontWeight: 600, color: '#0F172A',
            fontFamily: 'var(--font-nunito)',
            minWidth: 0,
          }}
        />
      </div>
    </form>
  )
}
