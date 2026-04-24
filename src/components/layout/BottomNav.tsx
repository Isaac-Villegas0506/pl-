'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Home, Compass, BookMarked, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  exactMatch?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Inicio',    href: '/inicio',    icon: Home,      exactMatch: true },
  { label: 'Explorar',  href: '/explorar',  icon: Compass },
  { label: 'Mis Libros',href: '/mis-libros',icon: BookMarked },
  { label: 'Perfil',    href: '/perfil',    icon: User },
]

export default function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()

  function isActive(item: NavItem): boolean {
    if (item.exactMatch) return pathname === item.href
    return pathname.startsWith(item.href)
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderTop: '1px solid rgba(229,231,235,0.6)',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.06)',
        height: '68px',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="max-w-md mx-auto flex items-stretch justify-around h-full px-2">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item)
          const Icon = item.icon

          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={cn(
                'flex flex-col items-center justify-center gap-1 flex-1 py-2 cursor-pointer',
                'transition-transform duration-100 active:scale-90',
                'relative outline-none'
              )}
            >
              {/* Active pill indicator at top */}
              <span
                className={cn(
                  'absolute top-0 left-1/2 -translate-x-1/2',
                  'h-1 w-8 rounded-full transition-all duration-300',
                  active ? 'bg-[#4F46E5] opacity-100 scale-100' : 'bg-transparent opacity-0 scale-0'
                )}
              />

              <Icon
                size={24}
                className={cn(
                  'transition-colors duration-200',
                  active ? 'text-[#4F46E5]' : 'text-[#9CA3AF]'
                )}
              />
              <span
                className={cn(
                  'text-[11px] leading-none transition-colors duration-200',
                  active ? 'font-bold text-[#4F46E5]' : 'font-semibold text-[#9CA3AF]'
                )}
              >
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
