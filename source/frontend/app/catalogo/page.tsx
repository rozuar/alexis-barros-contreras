import Link from 'next/link'
import { catalogo1819 } from '@/content/catalogo'
import styles from './catalogo.module.css'

export default function CatalogoPage() {
  return (
    <main className={styles.page}>
      <div className="container">
        <header className={styles.header}>
          <h1 className="serif caps" style={{ fontSize: 34 }}>
            Catálogo
          </h1>
          <p className={styles.kicker}>
            {catalogo1819.artistName} — {catalogo1819.sourceLabel}. Fuente:{' '}
            <a href={catalogo1819.sourcePdfUrl} target="_blank" rel="noreferrer">
              PDF
            </a>
            .
          </p>
          <p style={{ marginTop: 10 }}>
            <Link href="/">Volver</Link>
          </p>
        </header>

        <h2 className={styles.sectionTitle}>Biografía</h2>
        <div className={styles.bio}>
          {catalogo1819.bio.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>

        <h2 className={styles.sectionTitle}>Obras</h2>
        <div className={styles.grid}>
          {catalogo1819.artworks.map((a) => (
            <article key={a.title} className={styles.card}>
              <h3 className={styles.title}>{a.title}</h3>
              <div className={styles.meta}>
                <span>{a.technique}</span>
                <span>{a.size}</span>
                <span>{a.statusOrPrice}</span>
              </div>
              <p className={styles.desc}>{a.description}</p>
            </article>
          ))}
        </div>

        <footer className={styles.footer}>
          <p>
            Contacto/galería: <span style={{ letterSpacing: '0.08em' }}>1819@1819.es</span> —{' '}
            <a href="https://1819.es/" target="_blank" rel="noreferrer">
              1819.es
            </a>
          </p>
        </footer>
      </div>
    </main>
  )
}


