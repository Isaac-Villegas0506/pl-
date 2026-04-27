'use client'

export default function OfflinePage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #EEF2FF 0%, #F5F3FF 50%, #FAF5FF 100%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '32px 20px', textAlign: 'center',
    }}>
      <div style={{
        width: '100px', height: '100px',
        background: 'linear-gradient(135deg, #4F46E5, #6D28D9)',
        borderRadius: '28px',
        boxShadow: '0 12px 32px rgba(79,70,229,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '24px',
        animation: 'pulse 2s ease-in-out infinite',
      }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
          stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="1" y1="1" x2="23" y2="23"/>
          <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/>
          <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/>
          <path d="M10.71 5.05A16 16 0 0 1 22.56 9"/>
          <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/>
          <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
          <line x1="12" y1="20" x2="12.01" y2="20"/>
        </svg>
      </div>

      <h1 style={{
        fontFamily: 'var(--font-playfair, serif)',
        fontSize: '28px', fontWeight: '800', color: '#111827',
        lineHeight: '1.2', marginBottom: '12px',
      }}>
        Sin conexión
      </h1>

      <p style={{
        fontSize: '16px', color: '#6B7280',
        lineHeight: '1.6', maxWidth: '280px', marginBottom: '32px',
      }}>
        Revisa tu conexión a internet e intenta nuevamente.
        Las lecturas descargadas siguen disponibles.
      </p>

      <button
        onClick={() => typeof window !== 'undefined' && window.location.reload()}
        style={{
          height: '52px', padding: '0 32px',
          background: 'linear-gradient(135deg, #4F46E5, #6D28D9)',
          color: 'white', border: 'none', borderRadius: '14px',
          fontSize: '16px', fontWeight: '700',
          cursor: 'pointer', fontFamily: 'inherit',
          boxShadow: '0 4px 14px rgba(79,70,229,0.35)',
          display: 'flex', alignItems: 'center', gap: '8px',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <polyline points="23 4 23 10 17 10"/>
          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
        </svg>
        Reintentar
      </button>

      <style>{`
        @keyframes pulse {
          0%,100%{transform:scale(1);box-shadow:0 12px 32px rgba(79,70,229,0.3);}
          50%{transform:scale(1.04);box-shadow:0 16px 40px rgba(79,70,229,0.45);}
        }
      `}</style>
    </div>
  )
}
