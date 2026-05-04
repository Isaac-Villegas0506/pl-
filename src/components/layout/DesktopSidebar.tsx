'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Home, Compass, BookMarked, User } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface NavItem {
  label: string
  href: string
  Icon: LucideIcon
  exactMatch?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Inicio',     href: '/inicio',     Icon: Home,      exactMatch: true },
  { label: 'Explorar',   href: '/explorar',   Icon: Compass },
  { label: 'Mis Libros', href: '/mis-libros', Icon: BookMarked },
  { label: 'Perfil',     href: '/perfil',     Icon: User },
]

export default function DesktopSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  function isActive(item: NavItem): boolean {
    if (item.exactMatch) return pathname === item.href
    return pathname.startsWith(item.href)
  }

  return (
    <aside className="estudiante-sidebar">
      {/* Logo/Brand */}
      <div style={{
        paddingBottom: '32px',
        marginBottom: '8px',
        borderBottom: '1px solid #F1F5F9',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px', padding: '0 8px',
        }}>
          <div style={{
            width: '36px', height: '36px',
            background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <BookMarked size={18} color="white" strokeWidth={2.5} />
          </div>
          <div>
            <p style={{ fontSize: '14px', fontWeight: 900, color: '#0F172A', lineHeight: '1' }}>
              Plan Lectura
            </p>
            <p style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600, marginTop: '2px' }}>
              Estudiante
            </p>
          </div>
        </div>
      </div>

      {/* Nav Items */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {NAV_ITEMS.map((item) => {
          const active = isActive(item)
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 12px',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                background: active ? '#EEF2FF' : 'transparent',
                transition: 'all 0.2s ease',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.background = '#F8FAFC'
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.background = 'transparent'
              }}
            >
              <div style={{
                width: '36px', height: '36px',
                borderRadius: '10px',
                background: active ? '#4F46E5' : '#F1F5F9',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                transition: 'all 0.2s',
              }}>
                <item.Icon
                  size={18}
                  color={active ? 'white' : '#64748B'}
                  strokeWidth={active ? 2.5 : 2}
                />
              </div>
              <span style={{
                fontSize: '14px',
                fontWeight: active ? 800 : 600,
                color: active ? '#4F46E5' : '#475569',
                transition: 'color 0.2s',
              }}>
                {item.label}
              </span>
              {active && (
                <div style={{
                  marginLeft: 'auto',
                  width: '6px', height: '6px',
                  borderRadius: '50%',
                  background: '#4F46E5',
                }} />
              )}
            </button>
          )
        })}
      </nav>

      {/* Footer hint */}
      <div style={{
        padding: '16px 12px',
        marginTop: 'auto',
        borderTop: '1px solid #F1F5F9',
        paddingTop: '20px',
      }}>
        <p style={{ fontSize: '11px', color: '#CBD5E1', fontWeight: 600, textAlign: 'center' }}>
          © Plan de Lectura
        </p>
      </div>
    </aside>
  )
}
