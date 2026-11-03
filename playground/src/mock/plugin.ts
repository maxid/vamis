import type { Plugin } from 'vite'
import { handleMockApi, isMockFile } from './handler'

async function readBody(req: any): Promise<any> {
  const chunks: Buffer[] = []
  for await (const chunk of req) chunks.push(chunk as Buffer)
  if (!chunks.length) return {}
  const text = Buffer.concat(chunks).toString('utf8')
  try {
    return JSON.parse(text)
  } catch {
    if (text.includes('=')) return Object.fromEntries(new URLSearchParams(text))
    return {}
  }
}

function send(res: any, data: ReturnType<typeof handleMockApi>) {
  if (isMockFile(data)) {
    res.setHeader('Content-Type', data.contentType)
    res.setHeader('Content-Disposition', `attachment; filename="${data.filename}"`)
    res.end(data.body)
    return
  }
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(data))
}

function mockMiddleware() {
  return async (req: any, res: any, next: () => void) => {
    const url = req.url || ''
    if (!url.startsWith('/api/')) return next()

    const [pathname, queryString] = url.split('?')
    const query = Object.fromEntries(new URLSearchParams(queryString || ''))
    const method = (req.method || 'GET').toUpperCase()
    const body = method === 'GET' || method === 'HEAD' ? {} : await readBody(req)
    const wait = Number(query.waitSeconds || 0)
    if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait * 1000))
    send(res, handleMockApi({ method, pathname, query, body }))
  }
}

export function mockApiPlugin(): Plugin {
  return {
    name: 'vamis-mock-api',
    configureServer(server) {
      server.middlewares.use(mockMiddleware())
    },
    configurePreviewServer(server) {
      server.middlewares.use(mockMiddleware())
    },
  }
}
