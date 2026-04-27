export default function LeerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[100] bg-[#1A1A2E]">
      {children}
    </div>
  )
}
