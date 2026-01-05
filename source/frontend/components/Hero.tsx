/* eslint-disable @next/next/no-img-element */
'use client'

import { useEffect, useMemo, useState } from 'react'
import styles from './Hero.module.css'
import { useI18n } from '@/i18n/I18nProvider'

type Slide = {
  id: string
  title: string
  imageUrl: string
}

type HeroProps = {
  slides?: Slide[]
  intervalMs?: number
}

export default function Hero({ slides = [], intervalMs = 6500 }: HeroProps) {
  const safeSlides = useMemo(() => slides.slice(0, 5), [slides])
  const [active, setActive] = useState(0)
  const { t } = useI18n()

  useEffect(() => {
    if (safeSlides.length <= 1) return
    const t = window.setInterval(() => {
      setActive((v) => (v + 1) % safeSlides.length)
    }, intervalMs)
    return () => window.clearInterval(t)
  }, [intervalMs, safeSlides.length])

  useEffect(() => {
    if (active >= safeSlides.length) setActive(0)
  }, [active, safeSlides.length])

  return (
    <section id="home" className={styles.hero}>
      <div className={styles.bgWrap} aria-hidden="true">
        {safeSlides.map((s, idx) => (
          <img
            key={s.id}
            className={`${styles.bg} ${idx === active ? styles.bgActive : ''}`}
            src={s.imageUrl}
            alt=""
            loading={idx === 0 ? 'eager' : 'lazy'}
            decoding="async"
          />
        ))}
      </div>
      <div className={styles.overlay} />
      <div className={styles.content}>
        <h1 className={styles.title}>
          ALEXIS ANIBAL<br />BARROS CONTRERAS
        </h1>
        <p className={styles.subtitle}>{t.hero.subtitle}</p>
      </div>

      {safeSlides.length > 1 ? (
        <div className={styles.dots} aria-label={t.hero.sliderAria}>
          {safeSlides.map((s, idx) => (
            <button
              key={s.id}
              type="button"
              className={`${styles.dot} ${idx === active ? styles.dotActive : ''}`}
              onClick={() => setActive(idx)}
              aria-label={t.hero.goToSlide(s.title)}
            />
          ))}
        </div>
      ) : null}
    </section>
  )
}

