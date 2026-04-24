import type { Metadata } from 'next'
import { Nunito, Playfair_Display } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-nunito',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['700', '800'],
  variable: '--font-playfair',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Plan de Lectura',
  description: 'Plataforma escolar de plan lector digital',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body
        className={`${nunito.variable} ${playfair.variable} font-sans antialiased bg-surface`}
        suppressHydrationWarning
      >
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  )
}
