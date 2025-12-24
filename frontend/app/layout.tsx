import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import AppFrame from '@/components/AppFrame'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
})

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
      <body className={`${inter.variable} ${playfair.variable}`}>
        <AppFrame>{children}</AppFrame>
      </body>
    </html>
  )
}

