import './globals.css'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'Backoffice — Alexis Art',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        {children}
        <div className="container">
          <Footer />
        </div>
      </body>
    </html>
  )
}


