export default function ProfesorLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="min-h-screen bg-[#F0F4F8]">
      {children}
    </div>
  )
}
