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
    <div className="grid grid-cols-2 gap-3">
      {ITEMS.map((item) => {
        const Icon = item.icon
        return (
          <button
            key={item.id}
            onClick={() => onNavegar(item.ruta)}
            className="flex flex-col gap-2 rounded-[20px] px-4 py-[18px] cursor-pointer transition-transform duration-150 active:scale-[0.95] text-left"
            style={{
              backgroundColor: item.bgColor,
              boxShadow: `0 2px 8px ${item.shadowColor}`,
            }}
          >
            {/* Icon container */}
            <div
              className="w-11 h-11 rounded-[12px] flex items-center justify-center"
              style={{ backgroundColor: 'rgba(255,255,255,0.7)' }}
            >
              <Icon size={24} style={{ color: item.iconColor }} />
            </div>
            <span
              className="text-[14px] font-extrabold mt-auto"
              style={{ color: item.iconColor }}
            >
              {item.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
