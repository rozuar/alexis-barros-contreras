import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.row}>
          <div className={styles.left}>2025 @alexisanibal</div>
          <div className={styles.right}>
            <span className={styles.dev}>Developed by Rozuar</span>
            <a className={styles.link} href="#contact">
              Contacto
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}


