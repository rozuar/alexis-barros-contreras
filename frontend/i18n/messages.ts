export type Locale = 'es' | 'en'

export type Messages = {
  nav: {
    home: string
    about: string
    portfolio: string
    contact: string
    language: string
  }
  hero: {
    subtitle: string
    sliderAria: string
    goToSlide: (title: string) => string
  }
  sections: {
    aboutTitle: string
    portfolioTitle: string
    contactTitle: string
  }
  portfolio: {
    loading: string
    empty: string
    backendHint: string
  }
  contact: {
    name: string
    email: string
    message: string
    send: string
    success: string
  }
  artwork: {
    contact: string
    email: string
    whatsapp: string
    instagram: string
    identification: string
    reference: string
    copy: string
    detailTitle: string
    detailFallback: (id: string) => string
    bitacoraTitle: string
    paintedLocationLabel: string
    datesLabel: string
    inProgressLabel: string
    notProvided: string
    inProgress: string
    inProgressIntro: (id: string) => string
    step1: string
    step2: string
    step3: string
    step4: string
    ctaWhatsApp: string
    ctaEmail: string
  }
}

export const messages: Record<Locale, Messages> = {
  es: {
    nav: {
      home: 'INICIO',
      about: 'SOBRE',
      portfolio: 'PORTAFOLIO',
      contact: 'CONTACTO',
      language: 'Idioma',
    },
    hero: {
      subtitle: 'Artista Contemporáneo',
      sliderAria: 'Carrusel de portada',
      goToSlide: (title) => `Ir a ${title}`,
    },
    sections: {
      aboutTitle: 'SOBRE',
      portfolioTitle: 'PORTAFOLIO',
      contactTitle: 'CONTACTO',
    },
    portfolio: {
      loading: 'Cargando obras...',
      empty: 'No hay obras para mostrar.',
      backendHint: 'Verifica que el backend esté corriendo en',
    },
    contact: {
      name: 'Nombre',
      email: 'Email',
      message: 'Mensaje',
      send: 'Enviar',
      success: '¡Gracias por tu mensaje! Te contactaremos pronto.',
    },
    artwork: {
      contact: 'Contactar',
      email: 'Email',
      whatsapp: 'WhatsApp',
      instagram: 'Instagram',
      identification: 'Identificación',
      reference: 'Referencia',
      copy: 'Copiar',
      detailTitle: 'Detalle',
      detailFallback: (id) =>
        `Descripción general no disponible. Escríbenos e incluye el ID: ${id}.`,
      bitacoraTitle: 'Bitácora',
      paintedLocationLabel: 'Lugar',
      datesLabel: 'Fechas',
      inProgressLabel: 'En progreso',
      notProvided: 'No informado',
      inProgress: 'Obra en curso',
      inProgressIntro: (id) =>
        `Para cerrar una venta rápido (y con claridad), usa el ID al escribirnos: ${id}.`,
      step1: 'Consulta: disponibilidad, precio y opciones (original/encargo).',
      step2: 'Reserva: apartamos la obra por un plazo acordado.',
      step3: 'Confirmación: pago y coordinación (envío o retiro).',
      step4: 'Entrega: embalaje, despacho y seguimiento.',
      ctaWhatsApp: 'Escribir por WhatsApp',
      ctaEmail: 'Enviar email',
    },
  },
  en: {
    nav: {
      home: 'HOME',
      about: 'ABOUT',
      portfolio: 'PORTFOLIO',
      contact: 'CONTACT',
      language: 'Language',
    },
    hero: {
      subtitle: 'Contemporary Artist',
      sliderAria: 'Hero slider',
      goToSlide: (title) => `Go to ${title}`,
    },
    sections: {
      aboutTitle: 'ABOUT',
      portfolioTitle: 'PORTFOLIO',
      contactTitle: 'CONTACT',
    },
    portfolio: {
      loading: 'Loading artworks...',
      empty: 'No artworks to display.',
      backendHint: 'Make sure the backend is running at',
    },
    contact: {
      name: 'Name',
      email: 'Email',
      message: 'Message',
      send: 'Send',
      success: 'Thanks for your message! We will get back to you soon.',
    },
    artwork: {
      contact: 'Contact',
      email: 'Email',
      whatsapp: 'WhatsApp',
      instagram: 'Instagram',
      identification: 'Identification',
      reference: 'Reference',
      copy: 'Copy',
      detailTitle: 'Details',
      detailFallback: (id) =>
        `General description not available. Message us and include the ID: ${id}.`,
      bitacoraTitle: 'Logbook',
      paintedLocationLabel: 'Location',
      datesLabel: 'Dates',
      inProgressLabel: 'In progress',
      notProvided: 'Not provided',
      inProgress: 'In progress',
      inProgressIntro: (id) =>
        `To move forward quickly, include this ID when you message us: ${id}.`,
      step1: 'Inquiry: availability, price and options (original/commission).',
      step2: 'Hold: we reserve the artwork for an agreed time window.',
      step3: 'Confirmation: payment and delivery/pickup coordination.',
      step4: 'Delivery: packaging, shipping and tracking.',
      ctaWhatsApp: 'Message on WhatsApp',
      ctaEmail: 'Send email',
    },
  },
}


