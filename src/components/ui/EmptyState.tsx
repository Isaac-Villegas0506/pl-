import { LucideIcon, FolderOpen } from 'lucide-react'

interface Props {
  emoji?: string
  icon?: LucideIcon
  titulo?: string
  title?: string
  subtexto?: string
  description?: string
  botonLabel?: string
  onBoton?: () => void
  colorBoton?: string
  action?: { label: string; onClick: () => void }
}

export default function EmptyState({
  icon: Icon, titulo, title, subtexto, description, botonLabel, onBoton, colorBoton = '#4F46E5', action
}: Props) {
  const displayTitle = titulo || title || ''
  const displaySubtext = subtexto || description || ''
  const finalBotonLabel = botonLabel || action?.label
  const finalOnBoton = onBoton || action?.onClick
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '56px 32px', textAlign: 'center',
      animation: 'fadeIn 0.4s ease',
    }}>
      {/* Icono grande con fondo circular */}
      <div style={{
        width: '80px', height: '80px', borderRadius: '24px',
        background: 'linear-gradient(135deg, #EEF2FF, #F5F3FF)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 16px rgba(79,70,229,0.12)',
        marginBottom: '20px',
        animation: 'float 3s ease-in-out infinite',
      }}>
        {Icon ? <Icon size={32} color={colorBoton} /> : <FolderOpen size={32} color={colorBoton} />}
      </div>

      <h3 style={{
        fontSize: '18px', fontWeight: '800', color: '#111827',
        marginBottom: '8px', lineHeight: '1.3',
      }}>
        {displayTitle}
      </h3>

      {displaySubtext && (
        <p style={{
          fontSize: '14px', color: '#9CA3AF', lineHeight: '1.6',
          maxWidth: '260px', marginBottom: '24px',
        }}>
          {displaySubtext}
        </p>
      )}

      {finalBotonLabel && finalOnBoton && (
        <button onClick={finalOnBoton} style={{
          height: '46px', padding: '0 24px',
          background: `linear-gradient(135deg, ${colorBoton}, ${colorBoton}BB)`,
          color: 'white', border: 'none', borderRadius: '13px',
          fontSize: '14px', fontWeight: '700',
          cursor: 'pointer', fontFamily: 'inherit',
          boxShadow: `0 4px 14px ${colorBoton}44`,
        }}>
          {finalBotonLabel}
        </button>
      )}
    </div>
  )
}
