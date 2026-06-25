import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

// Clears the httpOnly session cookie set at login.
export async function POST() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set('bo_session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
  return res
}
