import { NextRequest } from 'next/server'

export const runtime = 'nodejs'

function getBackendURL(): string {
  return process.env.BACKEND_URL?.trim() || 'http://localhost:8090'
}

function buildTargetURL(req: NextRequest, path: string[]): URL {
  const incoming = new URL(req.url)
  const base = getBackendURL()
  const target = new URL(`/api/v1/${path.join('/')}`, base)
  target.search = incoming.search
  return target
}

function forwardHeaders(req: NextRequest, token: string): Headers {
  const h = new Headers(req.headers)
  h.delete('host')
  h.delete('connection')
  h.delete('content-length')
  // Never trust a client-supplied token or forward our session cookie upstream.
  // The backend admin token is injected here, server-side only.
  h.delete('cookie')
  h.delete('authorization')
  h.set('authorization', `Bearer ${token}`)
  return h
}

async function proxy(req: NextRequest, params: { path: string[] }) {
  // Require a valid session. The cookie value IS the backend admin token; it is
  // httpOnly so it never reaches client JS.
  const session = req.cookies.get('bo_session')?.value?.trim() || ''
  if (!session) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), {
      status: 401,
      headers: { 'content-type': 'application/json; charset=utf-8' },
    })
  }

  const target = buildTargetURL(req, params.path)
  const headers = forwardHeaders(req, session)
  const pathStr = params.path.join('/')
  const shouldLog = pathStr.startsWith('admin/artworks')

  // For PUT/POST/PATCH we need to forward the body.
  let body: ArrayBuffer | undefined
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    body = await req.arrayBuffer()
  }

  let upstream: Response
  try {
    if (shouldLog) {
      console.log('[backoffice-proxy]', req.method, '/api/v1/' + pathStr, '->', target.toString())
    }
    upstream = await fetch(target, {
      method: req.method,
      headers,
      body,
      redirect: 'manual',
    })
  } catch (err: any) {
    // Avoid crashing the route handler (which becomes a 500 in Next.js).
    // Most common cause in Railway is BACKEND_URL missing/incorrect.
    const backendURL = process.env.BACKEND_URL?.trim() || 'http://localhost:8090'
    return new Response(
      JSON.stringify({
        error: 'Upstream backend unreachable',
        backendURL,
      }),
      {
        status: 502,
        headers: { 'content-type': 'application/json; charset=utf-8' },
      },
    )
  }

  if (shouldLog && !upstream.ok) {
    console.log('[backoffice-proxy]', 'upstream status', upstream.status, '/api/v1/' + pathStr)
  }

  const outHeaders = new Headers(upstream.headers)
  outHeaders.delete('content-encoding')

  return new Response(upstream.body, {
    status: upstream.status,
    headers: outHeaders,
  })
}

export async function GET(req: NextRequest, ctx: { params: { path: string[] } }) {
  return proxy(req, ctx.params)
}

export async function HEAD(req: NextRequest, ctx: { params: { path: string[] } }) {
  return proxy(req, ctx.params)
}

export async function PUT(req: NextRequest, ctx: { params: { path: string[] } }) {
  return proxy(req, ctx.params)
}

export async function POST(req: NextRequest, ctx: { params: { path: string[] } }) {
  return proxy(req, ctx.params)
}

export async function DELETE(req: NextRequest, ctx: { params: { path: string[] } }) {
  return proxy(req, ctx.params)
}

export async function OPTIONS(req: NextRequest, ctx: { params: { path: string[] } }) {
  return proxy(req, ctx.params)
}




