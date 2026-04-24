export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8"
      style={{
        background: 'linear-gradient(160deg, #EEF2FF 0%, #F5F3FF 50%, #FAF5FF 100%)',
      }}
    >
      {children}
    </div>
  )
}
