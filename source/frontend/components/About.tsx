import styles from './About.module.css'
import { useI18n } from '@/i18n/I18nProvider'

export default function About() {
  const { t, locale } = useI18n()
  return (
    <section id="about" className={styles.about}>
      <div className={styles.container}>
        <h2 className={styles.title}>{t.sections.aboutTitle}</h2>
        <div className={styles.content}>
          {locale === 'es' ? (
            <>
              <p>
                Alexis Aníbal Barros Contreras nace el 30 de octubre de 1990 en Molina,
                región del Maule, Chile. A los 4 años se traslada junto a su familia a la
                comuna de Colina, en donde vive hasta el día de hoy.
              </p>
              <p>
                Se gradúa el año 2017 de la carrera de mantenimiento en minería. Su primer
                acercamiento al arte va de la mano con el dibujo para luego especializarse
                en pintura al óleo de forma autodidacta hasta la actualidad.
              </p>
              <p>
                En paralelo a su oficio, Barros ha mantenido una relación cercana al arte,
                realizando pinturas desde temprana edad, gracias a una fuerte influencia
                familiar ligada a distintas ramas de arte.
              </p>
            </>
          ) : (
            <>
              <p>
                Alexis Aníbal Barros Contreras was born on October 30, 1990 in Molina,
                Maule Region, Chile. At age 4 he moved with his family to Colina, where he
                still lives today.
              </p>
              <p>
                In 2017 he graduated in mining maintenance. His first approach to art came
                through drawing, later specializing in self-taught oil painting up to the
                present.
              </p>
              <p>
                Alongside his profession, Barros has maintained a close relationship with
                art since an early age, strongly influenced by a family connected to
                different branches of art.
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

