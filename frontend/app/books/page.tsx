import styles from '../simple-page.module.css'

export default function BooksPage() {
  return (
    <main className={styles.page}>
      <div className="container">
        <header className={styles.header}>
          <h1 className="serif caps">Books</h1>
          <p className={styles.kicker}>Próximamente.</p>
        </header>
      </div>
    </main>
  )
}


