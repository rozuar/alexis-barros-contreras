'use client'

import { useEffect } from 'react'
import { Artwork } from '@/app/page'
import { buildMailto, buildWhatsAppUrl, INSTAGRAM_URL } from '@/lib/contact'
import styles from './ArtworkModal.module.css'
import { useI18n } from '@/i18n/I18nProvider'

interface ArtworkModalProps {
  artwork: Artwork
  onClose: () => void
}

export default function ArtworkModal({ artwork, onClose }: ArtworkModalProps) {
  const { t, locale } = useI18n()
  const primaryRef = `${artwork.id}${artwork.images?.[0] ? `/${artwork.images[0]}` : ''}`
  const contactMessage =
    locale === 'es'
      ? `Hola, me interesa la obra "${artwork.title}".\n\nID: ${artwork.id}\nRef: ${primaryRef}\n\n¿Está disponible?`
      : `Hi, I'm interested in the artwork "${artwork.title}".\n\nID: ${artwork.id}\nRef: ${primaryRef}\n\nIs it available?`
  const mailto = buildMailto(
    locale === 'es'
      ? `Consulta obra: ${artwork.title} (ID: ${artwork.id})`
      : `Artwork inquiry: ${artwork.title} (ID: ${artwork.id})`,
    contactMessage
  )
  const waUrl = buildWhatsAppUrl(contactMessage)

  const isInProgress = !!artwork.inProgress

  const formatDate = (s?: string) => {
    if (!s) return ''
    // Expect YYYY-MM-DD, but keep fallback to raw string.
    const d = new Date(s)
    if (Number.isNaN(d.getTime())) return s
    return new Intl.DateTimeFormat(locale === 'es' ? 'es-CL' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    }).format(d)
  }

  const dateText = () => {
    const start = formatDate(artwork.startDate)
    const end = formatDate(artwork.endDate)
    if (isInProgress) {
      return start ? `${start} — ${t.artwork.inProgressLabel}` : t.artwork.inProgressLabel
    }
    if (start && end) return `${start} — ${end}`
    if (start) return start
    if (end) return end
    return ''
  }

  const goToContact = () => {
    onClose()
    // Ensure we land on home and then the contact section
    window.location.href = '/#contact'
  }

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(artwork.id)
      // best-effort: no toast framework yet
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose])

  return (
    <div className={styles.modal} onClick={onClose}>
      <div className={styles.content} onClick={(e) => e.stopPropagation()}>
        <button className={styles.close} onClick={onClose} aria-label="Close">
          ×
        </button>
        <div className={styles.body}>
          <div className={styles.header}>
            <h2>{artwork.title}</h2>
            <div className={styles.actions}>
              <button type="button" className={styles.primaryBtn} onClick={goToContact}>
                {t.artwork.contact}
              </button>
              <a className={styles.secondaryBtn} href={mailto}>
                {t.artwork.email}
              </a>
              <a
                className={styles.secondaryBtn}
                href={waUrl}
                target="_blank"
                rel="noreferrer"
              >
                {t.artwork.whatsapp}
              </a>
              {INSTAGRAM_URL ? (
                <a
                  className={styles.secondaryBtn}
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noreferrer"
                >
                  {t.artwork.instagram}
                </a>
              ) : null}
            </div>
          </div>

          <div className={styles.gallery}>
            {artwork.images.map((image, index) => (
              <div key={index} className={styles.galleryItem}>
                <img
                  src={`/api/v1/artworks/${artwork.id}/images/${image}`}
                  alt={`${artwork.title} - ${index + 1}`}
                  loading="lazy"
                />
              </div>
            ))}
            {artwork.videos?.map((video, index) => (
              <div key={`video-${index}`} className={styles.galleryItem}>
                <video
                  src={`/api/v1/artworks/${artwork.id}/videos/${video}`}
                  controls
                  muted
                />
              </div>
            ))}
          </div>

          {artwork.detalle ? (
            <div className={styles.detail}>
              <h3 className={styles.detailTitle}>{t.artwork.detailTitle}</h3>
              <div className={styles.detailMeta}>
                <div className={styles.detailMetaRow}>
                  <span className={styles.detailMetaLabel}>{t.artwork.identification}</span>
                  <span className={styles.detailMetaValue}>
                    <span className={styles.mono}>{artwork.id}</span>{' '}
                    <button type="button" className={styles.copyBtn} onClick={copyId}>
                      {t.artwork.copy}
                    </button>
                  </span>
                </div>
                <div className={styles.detailMetaRow}>
                  <span className={styles.detailMetaLabel}>{t.artwork.paintedLocationLabel}</span>
                  <span className={styles.detailMetaValue}>
                    {artwork.paintedLocation || t.artwork.notProvided}
                  </span>
                </div>
                <div className={styles.detailMetaRow}>
                  <span className={styles.detailMetaLabel}>{t.artwork.datesLabel}</span>
                  <span className={styles.detailMetaValue}>
                    {dateText() || t.artwork.notProvided}
                  </span>
                </div>
              </div>
              <div className={styles.detailContent}>{artwork.detalle}</div>
            </div>
          ) : (
            <div className={styles.detail}>
              <h3 className={styles.detailTitle}>{t.artwork.detailTitle}</h3>
              <div className={styles.detailMeta}>
                <div className={styles.detailMetaRow}>
                  <span className={styles.detailMetaLabel}>{t.artwork.identification}</span>
                  <span className={styles.detailMetaValue}>
                    <span className={styles.mono}>{artwork.id}</span>{' '}
                  </span>
                </div>
  
                <div className={styles.detailMetaRow}>
                  <span className={styles.detailMetaLabel}>{t.artwork.paintedLocationLabel}</span>
                  <span className={styles.detailMetaValue}>
                    {artwork.paintedLocation || t.artwork.notProvided}
                  </span>
                </div>
                <div className={styles.detailMetaRow}>
                  <span className={styles.detailMetaLabel}>{t.artwork.datesLabel}</span>
                  <span className={styles.detailMetaValue}>
                    {dateText() || t.artwork.notProvided}
                  </span>
                </div>
              </div>
              <div className={styles.detailContent}>{t.artwork.detailFallback(artwork.id)}</div>
            </div>
          )}

          {isInProgress ? (
            <div className={styles.itinerary}>
              <h3 className={styles.itineraryTitle}>{t.artwork.inProgress}</h3>
              <p className={styles.itineraryIntro}>{t.artwork.inProgressIntro(artwork.id)}</p>
              <ol className={styles.steps}>
                <li>{t.artwork.step1}</li>
                <li>{t.artwork.step2}</li>
                <li>{t.artwork.step3}</li>
                <li>{t.artwork.step4}</li>
              </ol>
              <div className={styles.itineraryCtas}>
                <a className={styles.primaryBtn} href={waUrl} target="_blank" rel="noreferrer">
                  {t.artwork.ctaWhatsApp}
                </a>
                <a className={styles.secondaryBtn} href={mailto}>
                  {t.artwork.ctaEmail}
                </a>
              </div>
            </div>
          ) : null}

          {artwork.bitacora && (
            <div className={styles.bitacora}>
              <h3 className={styles.bitacoraTitle}>{t.artwork.bitacoraTitle}</h3>
              <div className={styles.bitacoraContent}>
                {artwork.bitacora}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

