interface SectionHeaderProps {
  title: string
  linkText?: string
  onLinkPress?: () => void
}

export default function SectionHeader({ title, linkText, onLinkPress }: SectionHeaderProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <h2
        style={{
          fontSize: '18px', fontWeight: '800', color: '#111827',
          fontFamily: 'var(--font-nunito)', margin: 0
        }}
      >
        {title}
      </h2>
      {linkText && onLinkPress && (
        <button
          onClick={onLinkPress}
          style={{
            fontSize: '13px', fontWeight: '700', color: '#4F46E5',
            cursor: 'pointer', background: 'transparent', border: 'none',
            padding: 0, fontFamily: 'inherit',
          }}
        >
          {linkText}
        </button>
      )}
    </div>
  )
}
