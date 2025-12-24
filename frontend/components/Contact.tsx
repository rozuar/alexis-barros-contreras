'use client'

import { useState } from 'react'
import styles from './Contact.module.css'
import { useI18n } from '@/i18n/I18nProvider'

export default function Contact() {
  const { t } = useI18n()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would send the form data to your backend
    setStatus('success')
    setFormData({ name: '', email: '', message: '' })
    setTimeout(() => setStatus('idle'), 5000)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <section id="contact" className={styles.contact}>
      <div className={styles.container}>
        <h2 className={styles.title}>{t.sections.contactTitle}</h2>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <input
              type="text"
              name="name"
              placeholder={t.contact.name}
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <input
              type="email"
              name="email"
              placeholder={t.contact.email}
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <textarea
              name="message"
              placeholder={t.contact.message}
              rows={5}
              value={formData.message}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className={styles.submitBtn}>
            {t.contact.send}
          </button>
        </form>
        {status === 'success' && (
          <div className={styles.message + ' ' + styles.success}>
            {t.contact.success}
          </div>
        )}
      </div>
    </section>
  )
}

