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
  // Forward Authorization etc., but remove hop-by-hop / invalid headers.
  const h = new Headers(req.headers)
  h.delete('host')
  h.delete('connection')
  h.delete('content-length')
  return h
}

async function proxy(req: NextRequest, params: { path: string[] }) {
  const target = buildTargetURL(req, params.path)
  const headers = forwardHeaders(req)

  // For PUT/POST/PATCH we need to forward the body.
  let body: ArrayBuffer | undefined
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    body = await req.arrayBuffer()
  }

  const upstream = await fetch(target, {
    method: req.method,
    headers,
    body,
    redirect: 'manual',
  })

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

export async function OPTIONS(req: NextRequest, ctx: { params: { path: string[] } }) {
  return proxy(req, ctx.params)
}


