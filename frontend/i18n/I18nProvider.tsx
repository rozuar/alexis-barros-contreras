'use client'

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { Locale, messages, Messages } from './messages'

type Ctx = {
  locale: Locale
  setLocale: (l: Locale) => void
  t: Messages
}

const I18nContext = createContext<Ctx | null>(null)

const STORAGE_KEY = 'alexis.locale'

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('es')

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (saved === 'es' || saved === 'en') setLocaleState(saved)
  }, [])

  const setLocale = (l: Locale) => {
    setLocaleState(l)
    window.localStorage.setItem(STORAGE_KEY, l)
  }

  const value = useMemo<Ctx>(
    () => ({
      locale,
      setLocale,
      t: messages[locale],
    }),
    [locale]
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}


