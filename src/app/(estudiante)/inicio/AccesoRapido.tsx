'use client'

import { BookOpen, LayoutGrid, Heart, Download } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface QuickAccessItem {
  id: string
  label: string
  icon: LucideIcon
  bgColor: string
  iconColor: string
  shadowColor: string
  ruta: string
}

const ITEMS: QuickAccessItem[] = [
  {
    id: 'libros',
    label: 'Libros',
    icon: BookOpen,
    bgColor: '#EEF2FF',
    iconColor: '#4F46E5',
    shadowColor: 'rgba(79,70,229,0.15)',
    ruta: '/mis-libros',
  },
  {
    id: 'categorias',
    label: 'Categorías',
    icon: LayoutGrid,
    bgColor: '#FFF7ED',
    iconColor: '#F97316',
    shadowColor: 'rgba(249,115,22,0.15)',
    ruta: '/explorar',
  },
  {
    id: 'favoritos',
    label: 'Favoritos',
    icon: Heart,
    bgColor: '#FFF1F5',
    iconColor: '#F43F5E',
    shadowColor: 'rgba(244,63,94,0.15)',
    ruta: '/favoritos',
  },
  {
    id: 'descargas',
    label: 'Descargas',
    icon: Download,
    bgColor: '#ECFDF5',
    iconColor: '#10B981',
    shadowColor: 'rgba(16,185,129,0.15)',
    ruta: '/mis-libros',
  },
]

interface AccesoRapidoProps {
  onNavegar: (ruta: string) => void
}

export default function AccesoRapido({ onNavegar }: AccesoRapidoProps) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr 1fr',
      gap: '12px',
    }}>
      {ITEMS.map((item) => {
        const Icon = item.icon
        return (
          <button
            key={item.id}
            onClick={() => onNavegar(item.ruta)}
            style={{
              background: item.bgColor,
              border: 'none',
              borderRadius: '20px',
              padding: '20px 16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '12px',
              cursor: 'pointer',
              boxShadow: `0 2px 8px ${item.shadowColor}`,
              transition: 'transform 0.15s',
              textAlign: 'left',
            }}
          >
            {/* Círculo del ícono */}
            <div style={{
              width: '48px', height: '48px',
              background: 'rgba(255,255,255,0.75)',
              borderRadius: '14px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Icon size={24} color={item.iconColor} strokeWidth={2} />
            </div>
            {/* Texto */}
            <span style={{
              fontSize: '15px', fontWeight: 800,
              color: item.iconColor, lineHeight: '1',
            }}>
              {item.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
