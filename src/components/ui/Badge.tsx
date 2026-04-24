interface BadgeProps {
  variant?: 'primary' | 'orange' | 'purple' | 'teal' | 'success' | 'error' | 'default'
    | 'rose' | 'sky' | 'amber' | 'emerald' | 'violet'
  size?: 'sm' | 'md'
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

const variantStyles: Record<string, { background: string; color: string; dotColor: string }> = {
  primary:  { background: '#EEF2FF', color: '#4F46E5',  dotColor: '#4F46E5' },
  orange:   { background: '#FFF7ED', color: '#C2410C',  dotColor: '#F97316' },
  purple:   { background: '#F5F3FF', color: '#7C3AED',  dotColor: '#8B5CF6' },
  violet:   { background: '#F5F3FF', color: '#7C3AED',  dotColor: '#8B5CF6' },
  teal:     { background: '#F0FDFA', color: '#0F766E',  dotColor: '#14B8A6' },
  success:  { background: '#ECFDF5', color: '#065F46',  dotColor: '#10B981' },
  emerald:  { background: '#ECFDF5', color: '#065F46',  dotColor: '#10B981' },
  error:    { background: '#FFF1F2', color: '#BE123C',  dotColor: '#F43F5E' },
  rose:     { background: '#FFF1F2', color: '#BE123C',  dotColor: '#F43F5E' },
  sky:      { background: '#F0F9FF', color: '#0369A1',  dotColor: '#0EA5E9' },
  amber:    { background: '#FFFBEB', color: '#92400E',  dotColor: '#F59E0B' },
  default:  { background: '#F3F4F6', color: '#4B5563',  dotColor: '#9CA3AF' },
}

export default function Badge({
  variant = 'default',
  size = 'sm',
  children,
  className,
  style,
}: BadgeProps) {
  const v = variantStyles[variant] ?? variantStyles.default

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: size === 'sm' ? '11px' : '12px',
        fontWeight: 600,
        borderRadius: '6px',
        padding: size === 'sm' ? '2px 8px' : '4px 10px',
        lineHeight: '1.4',
        whiteSpace: 'nowrap',
        background: v.background,
        color: v.color,
        ...style,
      }}
    >
      <span style={{
        width: '5px',
        height: '5px',
        borderRadius: '50%',
        background: v.dotColor,
        flexShrink: 0,
        display: 'inline-block',
      }} />
      {children}
    </span>
  )
}
