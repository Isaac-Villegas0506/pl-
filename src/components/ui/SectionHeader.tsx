interface SectionHeaderProps {
  title: string
  linkText?: string
  onLinkPress?: () => void
}

export default function SectionHeader({ title, linkText, onLinkPress }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h2
        className="text-[18px] font-extrabold text-[#111827]"
        style={{ fontFamily: 'var(--font-nunito)' }}
      >
        {title}
      </h2>
      {linkText && onLinkPress && (
        <button
          onClick={onLinkPress}
          className="text-[13px] font-bold text-[#4F46E5] cursor-pointer hover:underline active:opacity-70 transition-opacity"
        >
          {linkText}
        </button>
      )}
    </div>
  )
}
