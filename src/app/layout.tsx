import type { Metadata, Viewport } from 'next'
import { Nunito, Playfair_Display } from 'next/font/google'
import { Toaster } from 'sonner'
import ServiceWorkerRegistrar from '@/components/pwa/ServiceWorkerRegistrar'
import ToastGlobal from '@/components/ui/ToastGlobal'
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
  description: 'Tu biblioteca escolar digital — Lee, evalúa y aprende',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Plan de Lectura',
  },
  formatDetection: { telephone: false },
  other: {
    'mobile-web-app-capable': 'yes',
    'msapplication-TileColor': '#4F46E5',
    'msapplication-tap-highlight': 'no',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#4F46E5' },
    { media: '(prefers-color-scheme: dark)',  color: '#3730A3' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-96x96.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Plan de Lectura" />
      </head>
      <body
        className={`${nunito.variable} ${playfair.variable} font-sans antialiased bg-surface`}
        suppressHydrationWarning
      >
        {children}
        <Toaster position="top-right" richColors closeButton />
        <ToastGlobal />
        <ServiceWorkerRegistrar />
      </body>
    </html>
  )
}
