import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

// Server-side login. Credentials are checked against env vars (never shipped to
// the browser). On success we set an httpOnly cookie whose value is the backend
// ADMIN_TOKEN; the proxy (/api/v1/[...path]) reads it and authorizes requests.
// The token therefore never leaves the server.
export async function POST(req: NextRequest) {
  let body: { username?: string; password?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 })
  }

  const user = process.env.BACKOFFICE_USER || 'admin'
  const pass = process.env.BACKOFFICE_PASS || 'admin123'

  if (body.username !== user || body.password !== pass) {
    return NextResponse.json({ error: 'invalid credentials' }, { status: 401 })
  }

  const token = process.env.ADMIN_TOKEN?.trim()
  if (!token) {
    return NextResponse.json({ error: 'server is missing ADMIN_TOKEN' }, { status: 500 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set('bo_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 12, // 12h
  })
  return res
}
