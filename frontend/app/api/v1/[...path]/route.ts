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

function forwardHeaders(req: NextRequest): Headers {
  // Forward most headers (incl. Range for video streaming), but drop hop-by-hop and host headers.
  const h = new Headers(req.headers)
  h.delete('host')
  h.delete('connection')
  h.delete('content-length')
  return h
}

async function proxy(req: NextRequest, params: { path: string[] }) {
  const target = buildTargetURL(req, params.path)
  const upstream = await fetch(target, {
    method: req.method,
    headers: forwardHeaders(req),
    redirect: 'manual',
  })

  const headers = new Headers(upstream.headers)
  headers.delete('content-encoding')

  return new Response(upstream.body, {
    status: upstream.status,
    headers,
  })
}

export async function GET(req: NextRequest, ctx: { params: { path: string[] } }) {
  return proxy(req, ctx.params)
}

export async function HEAD(req: NextRequest, ctx: { params: { path: string[] } }) {
  return proxy(req, ctx.params)
}


