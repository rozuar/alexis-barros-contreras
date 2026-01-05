'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './Navigation.module.css'
import { useI18n } from '@/i18n/I18nProvider'

export default function Navigation({ forceScrolled = false }: { forceScrolled?: boolean }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const isHome = pathname === '/'
  const { locale, setLocale, t } = useI18n()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (forceScrolled) setScrolled(true)
  }, [forceScrolled])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const navHeight = 80
      const targetPosition = element.offsetTop - navHeight
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      })
    }
    setIsMenuOpen(false)
  }

  const homeLink = (id: string, label: string) =>
    isHome ? (
      <a
        href={`#${id}`}
        onClick={(e) => {
          e.preventDefault()
          scrollToSection(id)
        }}
      >
        {label}
      </a>
    ) : (
      <Link href={`/#${id}`} onClick={() => setIsMenuOpen(false)}>
        {label}
      </Link>
    )

  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.container}>
        <div className={styles.logo}>
          {homeLink('home', 'ALEXIS ANIBAL BARROS CONTRERAS')}
        </div>
        <ul className={`${styles.menu} ${isMenuOpen ? styles.menuOpen : ''}`}>
          <li>{homeLink('home', t.nav.home)}</li>
          <li>{homeLink('about', t.nav.about)}</li>
          <li>{homeLink('portfolio', t.nav.portfolio)}</li>
          <li>{homeLink('contact', t.nav.contact)}</li>
          <li className={styles.langItem}>
            <button
              type="button"
              className={styles.langBtn}
              aria-label={t.nav.language}
              onClick={() => setLocale(locale === 'es' ? 'en' : 'es')}
            >
              {locale.toUpperCase()}
            </button>
          </li>
        </ul>
        <button 
          className={styles.hamburger}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  )
}

