import { handleMockApi, isMockFile, waitMockDelay } from './handler'

function requestUrl(input: RequestInfo | URL): string {
  if (typeof input === 'string') return input
  if (input instanceof URL) return input.href
  return input.url
}

function isMockPath(pathname: string) {
  return pathname === '/api' || pathname.startsWith('/api/')
}

/** GitHub Pages 没有 Vite 中间件；拦截 `/api/mock2` 走同一份 handler。 */
export function installMockFetch() {
  const orig = window.fetch.bind(window)
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(requestUrl(input), window.location.origin)
    if (!isMockPath(url.pathname)) return orig(input, init)

    const method = (
      init?.method ||
      (typeof Request !== 'undefined' && input instanceof Request ? input.method : 'GET')
    ).toUpperCase()

    let body: Record<string, any> = {}
    const raw = init?.body
    if (typeof raw === 'string') {
      try {
        body = JSON.parse(raw)
      } catch {
        body = raw.includes('=') ? Object.fromEntries(new URLSearchParams(raw)) : {}
      }
    } else if (typeof FormData !== 'undefined' && raw instanceof FormData) {
      body = Object.fromEntries(raw.entries())
    }

    const query = Object.fromEntries(url.searchParams)
    await waitMockDelay(query)
    const payload = handleMockApi({
      method,
      pathname: url.pathname,
      query,
      body,
    })
    if (isMockFile(payload)) {
      return new Response(payload.body, {
        status: 200,
        headers: {
          'Content-Type': payload.contentType,
          'Content-Disposition': `attachment; filename="${payload.filename}"`,
        },
      })
    }
    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
