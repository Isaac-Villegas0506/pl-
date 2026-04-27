interface Props {
  tipo?: 'libro' | 'lectura' | 'usuario' | 'notificacion' | 'stat'
  cantidad?: number
}

export default function SkeletonCard({ tipo = 'libro', cantidad = 3 }: Props) {
  const items = Array.from({ length: cantidad }, (_, i) => i)

  if (tipo === 'libro') return (
    <div style={{ padding: '0 16px' }}>
      {items.map(i => (
        <div key={i} style={{
          background: 'white', borderRadius: '20px', padding: '16px',
          marginBottom: '12px', display: 'flex', gap: '14px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        }}>
          <div className="skeleton" style={{ width: 72, height: 96, borderRadius: 12, flexShrink: 0 }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div className="skeleton" style={{ height: 12, width: '40%', borderRadius: 6 }} />
            <div className="skeleton" style={{ height: 16, width: '90%', borderRadius: 6 }} />
            <div className="skeleton" style={{ height: 14, width: '60%', borderRadius: 6 }} />
            <div className="skeleton" style={{ height: 10, width: '35%', borderRadius: 6, marginTop: 4 }} />
          </div>
        </div>
      ))}
    </div>
  )

  if (tipo === 'stat') return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
      gap: 10, padding: '0 16px',
    }}>
      {items.map(i => (
        <div key={i} className="skeleton" style={{
          height: 72, borderRadius: 16,
        }} />
      ))}
    </div>
  )

  if (tipo === 'notificacion') return (
    <div style={{ padding: '0 16px' }}>
      {items.map(i => (
        <div key={i} style={{
          display: 'flex', gap: 12, padding: '14px 0',
          borderBottom: '1px solid #F3F4F6',
        }}>
          <div className="skeleton" style={{ width: 42, height: 42, borderRadius: 12, flexShrink: 0 }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div className="skeleton" style={{ height: 14, width: '70%', borderRadius: 6 }} />
            <div className="skeleton" style={{ height: 12, width: '100%', borderRadius: 6 }} />
          </div>
        </div>
      ))}
    </div>
  )

  return null
}
