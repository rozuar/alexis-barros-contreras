describe('frontend/lib/contact', () => {
  afterEach(() => {
    jest.resetModules()
    delete process.env.NEXT_PUBLIC_CONTACT_EMAIL
    delete process.env.NEXT_PUBLIC_WHATSAPP_PHONE
  })

  it('buildMailto uses default email when env is not set', async () => {
    const mod = await import('./contact')
    expect(mod.buildMailto('Hola')).toBe('mailto:1819@1819.es?subject=Hola')
  })

  it('buildMailto uses env-provided email', async () => {
    process.env.NEXT_PUBLIC_CONTACT_EMAIL = 'test@example.com'
    const mod = await import('./contact')
    expect(mod.buildMailto('Asunto', 'Cuerpo')).toBe(
      'mailto:test@example.com?subject=Asunto&body=Cuerpo',
    )
  })

  it('buildWhatsAppUrl falls back to wa.me without phone when not configured', async () => {
    const mod = await import('./contact')
    expect(mod.buildWhatsAppUrl('hola')).toBe('https://wa.me/?text=hola')
  })

  it('buildWhatsAppUrl uses phone when configured', async () => {
    process.env.NEXT_PUBLIC_WHATSAPP_PHONE = '56912345678'
    const mod = await import('./contact')
    expect(mod.buildWhatsAppUrl('hola mundo')).toBe(
      'https://wa.me/56912345678?text=hola%20mundo',
    )
  })
})


