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
  let upstream: Response
  try {
    upstream = await fetch(target, {
      method: req.method,
      headers: forwardHeaders(req),
      redirect: 'manual',
    })
  } catch (err: any) {
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



