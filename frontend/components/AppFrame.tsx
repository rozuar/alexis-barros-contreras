'use client'

import { usePathname } from 'next/navigation'
import Navigation from './Navigation'
import Footer from './Footer'
import { I18nProvider } from '@/i18n/I18nProvider'

export default function AppFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isHome = pathname === '/'

  return (
    <I18nProvider>
      <Navigation forceScrolled={!isHome} />
      {children}
      <Footer />
    </I18nProvider>
  )
}


