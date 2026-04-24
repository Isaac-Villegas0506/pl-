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
        style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          background: 'white',
          borderRadius: '16px',
          padding: '0 16px',
          height: '50px',
          border: isFocused ? '1.5px solid #4F46E5' : '1.5px solid #E5E7EB',
          boxShadow: isFocused
            ? '0 0 0 3px rgba(79,70,229,0.10), 0 2px 8px rgba(0,0,0,0.04)'
            : '0 2px 8px rgba(0,0,0,0.04)',
          transition: 'border-color 0.2s, box-shadow 0.2s',
        }}
      >
        <button type="submit" style={{ flexShrink: 0, cursor: 'pointer', background: 'none', border: 'none', display: 'flex' }}>
          <Search
            size={18}
            color={isFocused ? '#4F46E5' : '#9CA3AF'}
          />
        </button>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Buscar libros, autores..."
          style={{
            flex: 1, border: 'none', outline: 'none',
            background: 'transparent',
            fontSize: '15px', fontWeight: 500, color: '#111827',
            fontFamily: 'var(--font-nunito)',
            minWidth: 0,
          }}
        />
      </div>
    </form>
  )
}
