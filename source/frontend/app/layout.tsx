import type { Metadata } from 'next'
import './globals.css'
import AppFrame from '@/components/AppFrame'

export const metadata: Metadata = {
  title: 'Alexis Anibal Barros Contreras',
  description: 'Portafolio de arte — Alexis Aníbal Barros Contreras',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Playfair+Display:wght@400;600;700&display=swap"
        />
      </head>
      <body>
        <AppFrame>{children}</AppFrame>
      </body>
    </html>
  )
}

