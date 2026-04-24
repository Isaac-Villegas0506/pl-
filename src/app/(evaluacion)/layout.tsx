import type { ReactNode } from 'react'

export default function EvaluacionLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: '#F5F3FF' }}>
      {children}
    </div>
  )
}
