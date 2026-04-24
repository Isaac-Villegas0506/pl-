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
        className="flex items-center gap-2.5 bg-white rounded-[16px] px-4 h-[50px] transition-all duration-200"
        style={{
          border: isFocused ? '1.5px solid #4F46E5' : '1.5px solid #E5E7EB',
          boxShadow: isFocused
            ? '0 0 0 3px rgba(79,70,229,0.10), 0 2px 8px rgba(0,0,0,0.04)'
            : '0 2px 8px rgba(0,0,0,0.04)',
        }}
      >
        <button type="submit" className="shrink-0 cursor-pointer">
          <Search
            size={18}
            style={{ color: isFocused ? '#4F46E5' : '#9CA3AF', transition: 'color 0.2s' }}
          />
        </button>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Buscar libros, autores..."
          className="flex-1 bg-transparent border-none outline-none text-[15px] font-medium text-[#111827] placeholder:text-[#D1D5DB]"
          style={{ fontFamily: 'var(--font-nunito)' }}
        />
      </div>
    </form>
  )
}
