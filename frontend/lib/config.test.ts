describe('frontend/lib/config', () => {
  afterEach(() => {
    jest.resetModules()
    delete process.env.NEXT_PUBLIC_API_URL
  })

  it('uses default API_URL when NEXT_PUBLIC_API_URL is not set', async () => {
    const mod = await import('./config')
    expect(mod.API_URL).toBe('http://localhost:8090')
  })

  it('uses env API_URL when NEXT_PUBLIC_API_URL is set', async () => {
    process.env.NEXT_PUBLIC_API_URL = 'https://api.example.com'
    const mod = await import('./config')
    expect(mod.API_URL).toBe('https://api.example.com')
  })
})


