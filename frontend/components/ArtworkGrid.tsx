'use client'

import { Artwork } from '@/app/page'
import styles from './ArtworkGrid.module.css'
import { useI18n } from '@/i18n/I18nProvider'

interface ArtworkGridProps {
  artworks: Artwork[]
  onArtworkClick: (artwork: Artwork) => void
  loading: boolean
}

export default function ArtworkGrid({ artworks, onArtworkClick, loading }: ArtworkGridProps) {
  const { t } = useI18n()
  if (loading) {
    return (
      <section id="portfolio" className={styles.portfolio}>
        <div className={styles.container}>
          <h2 className={styles.title}>{t.sections.portfolioTitle}</h2>
          <div className={styles.loading}>{t.portfolio.loading}</div>
        </div>
      </section>
    )
  }

  if (!artworks || artworks.length === 0) {
    return (
      <section id="portfolio" className={styles.portfolio}>
        <div className={styles.container}>
          <h2 className={styles.title}>{t.sections.portfolioTitle}</h2>
          <div className={styles.loading}>
            {t.portfolio.empty} {t.portfolio.backendHint}{' '}
            <span style={{ fontFamily: 'monospace' }}>http://localhost:8090</span>.
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="portfolio" className={styles.portfolio}>
      <div className={styles.container}>
        <h2 className={styles.title}>{t.sections.portfolioTitle}</h2>
        <div className={styles.grid}>
          {artworks.map((artwork) => (
            <div
              key={artwork.id}
              className={styles.card}
              onClick={() => onArtworkClick(artwork)}
            >
              <div className={styles.imageContainer}>
                {artwork.images.length > 0 && (
                  <img
                    src={`/api/v1/artworks/${artwork.id}/images/${artwork.images[0]}`}
                    alt={artwork.title}
                    className={styles.image}
                    loading="lazy"
                  />
                )}
              </div>
              <div className={styles.info}>
                <h3 className={styles.artworkTitle}>{artwork.title}</h3>
                {artwork.inProgress ? (
                  <div style={{ marginBottom: 8 }}>
                    <span
                      style={{
                        display: 'inline-block',
                        fontSize: 11,
                        letterSpacing: '0.14em',
                        textTransform: 'uppercase',
                        color: 'var(--primary-color)',
                        border: '1px solid rgba(0,0,0,0.14)',
                        padding: '6px 8px',
                        borderRadius: 999,
                      }}
                    >
                      {t.artwork.inProgressLabel}
                    </span>
                  </div>
                ) : null}
                <p className={styles.count}>
                  {artwork.images.length} imagen{artwork.images.length !== 1 ? 'es' : ''}
                  {artwork.videos && artwork.videos.length > 0 && (
                    <>, {artwork.videos.length} video{artwork.videos.length !== 1 ? 's' : ''}</>
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

