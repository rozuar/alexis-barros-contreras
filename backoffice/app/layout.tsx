import './globals.css'

export const metadata = {
  title: 'Backoffice — Alexis Art',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}


