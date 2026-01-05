export const CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL || '1819@1819.es'

export const INSTAGRAM_URL = process.env.NEXT_PUBLIC_INSTAGRAM_URL || ''

// E.164 format without "+" recommended, e.g. "56912345678"
export const WHATSAPP_PHONE = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || ''

export function buildMailto(subject: string, body?: string) {
  const params = new URLSearchParams()
  params.set('subject', subject)
  if (body) params.set('body', body)
  return `mailto:${CONTACT_EMAIL}?${params.toString()}`
}

export function buildWhatsAppUrl(message: string) {
  const text = encodeURIComponent(message)
  // If phone is not provided, fallback to wa.me without phone (opens picker in some clients)
  if (!WHATSAPP_PHONE) return `https://wa.me/?text=${text}`
  return `https://wa.me/${WHATSAPP_PHONE}?text=${text}`
}


