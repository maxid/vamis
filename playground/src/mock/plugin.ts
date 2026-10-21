import type { Plugin } from 'vite'
import { cloneRows, createSampleRows, type SampleRow } from './sample'

let sampleRows: SampleRow[] = createSampleRows()

async function readBody(req: any): Promise<any> {
  const chunks: Buffer[] = []
  for await (const chunk of req) chunks.push(chunk as Buffer)
  if (!chunks.length) return {}
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch {
    return {}
  }
}

function send(res: any, data: unknown) {
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(data))
}

function filterSample(query: Record<string, string>): SampleRow[] {
  const keywords = String(query.keywords || '').trim().toLowerCase()
  const engine = String(query.engine || '').trim().toLowerCase()
  const platform = String(query.platform || '').trim().toLowerCase()
  const grade = String(query.grade || '').trim()
  const id = String(query.id || '').trim()
  let browser = String(query.browser || '').trim().toLowerCase()
  if (browser === 'ie') browser = 'internet explorer'
  if (browser === 'aol') browser = 'aol'

  let rows = cloneRows(sampleRows)
  if (id) rows = rows.filter((row) => String(row.id) === id)
  if (keywords) {
    rows = rows.filter((row) => JSON.stringify(row).toLowerCase().includes(keywords))
  }
  if (engine) rows = rows.filter((row) => row.engine.toLowerCase().includes(engine))
  if (browser) rows = rows.filter((row) => row.browser.toLowerCase().includes(browser))
  if (platform) rows = rows.filter((row) => row.platform.toLowerCase().includes(platform))
  if (grade) rows = rows.filter((row) => row.grade === grade)

  const orderBy = String(query.orderBy || '')
  const orderDir = String(query.orderDir || 'asc')
  const sortable = new Set(['id', 'engine', 'browser', 'platform', 'version', 'grade', 'name', 'status'])
  if (sortable.has(orderBy)) {
    const direction = orderDir === 'desc' ? -1 : 1
    rows.sort((a, b) => {
      const left = String(a[orderBy as keyof SampleRow] ?? '')
      const right = String(b[orderBy as keyof SampleRow] ?? '')
      if (/^\d+(\.\d+)?$/.test(left) && /^\d+(\.\d+)?$/.test(right)) {
        return (Number(left) - Number(right)) * direction
      }
      return left.localeCompare(right) * direction
    })
  }
  return rows
}

function listPayload(rows: SampleRow[], query: Record<string, string>) {
  const page = Number(query.page || 1)
  const perPage = Number(query.perPage || 10)
  const start = Math.max(0, (page - 1) * perPage)
  const items = perPage > 0 ? rows.slice(start, start + perPage) : rows
  return {
    status: 0,
    msg: 'ok',
    data: {
      items,
      rows: items,
      total: rows.length,
      count: rows.length,
    },
  }
}

function idsFrom(pathname: string, body: Record<string, any> = {}): string[] {
  if (body.ids != null && String(body.ids).trim()) {
    return String(body.ids)
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean)
  }
  const tail = pathname.split('/').pop() || ''
  return tail
    .split(',')
    .map((id) => id.trim())
    .filter((id) => id && id !== 'sample')
}

function applyPatch(id: string, patch: Record<string, any>): boolean {
  const index = sampleRows.findIndex((row) => String(row.id) === String(id))
  if (index < 0) return false
  const next = { ...sampleRows[index], ...patch, id: sampleRows[index].id }
  if (patch.engine && !patch.name) next.name = String(patch.engine)
  if (patch.grade && !patch.status) {
    next.status = patch.grade === 'A' ? 'online' : patch.grade === 'C' ? 'offline' : 'repair'
  }
  sampleRows[index] = next
  return true
}

export function mockApiPlugin(): Plugin {
  return {
    name: 'vamis-mock-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || ''
        if (!url.startsWith('/api/')) return next()

        const [pathname, queryString] = url.split('?')
        const query = Object.fromEntries(new URLSearchParams(queryString || ''))
        const method = (req.method || 'GET').toUpperCase()

        if (pathname === '/api/mock2/form/saveForm') {
          const body = method === 'GET' ? query : await readBody(req)
          return send(res, { status: 0, msg: '保存成功', data: body })
        }

        if (pathname === '/api/mock2/options') {
          return send(res, {
            status: 0,
            data: {
              options: [
                { label: '在线', value: 'online' },
                { label: '离线', value: 'offline' },
                { label: '维修', value: 'repair' },
              ],
            },
          })
        }

        if (pathname === '/api/mock2/chart/chart1') {
          return send(res, {
            status: 0,
            data: {
              title: { text: '远程图表' },
              xAxis: { type: 'category', data: ['A', 'B', 'C'] },
              yAxis: { type: 'value' },
              series: [{ type: 'bar', data: [4, 7, 2] }],
            },
          })
        }

        if (pathname === '/api/mock2/sample/reset') {
          sampleRows = createSampleRows()
          return send(res, { status: 0, msg: '测试数据已重置', data: { total: sampleRows.length } })
        }

        if (pathname === '/api/mock2/sample/bulkUpdate' || pathname === '/api/mock2/sample/bulkUpdate2') {
          const body = await readBody(req)
          const ids = idsFrom(pathname, body)
          const patch = { ...body }
          delete patch.ids
          delete patch.rowsDiff
          const ok = ids.every((id: string, index: number) => {
            const rowPatch = Array.isArray(body.rowsDiff) ? body.rowsDiff[index] || patch : patch
            return applyPatch(id, rowPatch)
          })
          if (!ok) return send(res, { status: 404, msg: '保存失败，数据可能已被删除！' })
          return send(res, { status: 0, msg: '保存成功' })
        }

        if (pathname === '/api/mock2/sample' && method === 'GET') {
          return send(res, listPayload(filterSample(query), query))
        }

        if (pathname === '/api/mock2/sample' && (method === 'POST' || method === 'PUT')) {
          const body = await readBody(req)
          if (body.id) {
            if (!applyPatch(String(body.id), body)) {
              return send(res, { status: 404, msg: '保存失败，数据可能已被删除！' })
            }
          } else {
            const id = Math.max(0, ...sampleRows.map((row) => row.id)) + 1
            sampleRows.push(
              decorateFromBody(body, id),
            )
          }
          return send(res, { status: 0, msg: '保存成功', data: body })
        }

        if (pathname.startsWith('/api/mock2/sample/') && method === 'DELETE') {
          const ids = idsFrom(pathname)
          const ok = ids.every((id) => {
            const index = sampleRows.findIndex((row) => String(row.id) === String(id))
            if (index < 0) return false
            sampleRows.splice(index, 1)
            return true
          })
          if (!ok) return send(res, { status: 404, msg: '删除失败，数据可能已被删除！' })
          return send(res, { status: 0, msg: '删除成功' })
        }

        if (pathname.startsWith('/api/mock2/sample/') && (method === 'POST' || method === 'PUT')) {
          const body = await readBody(req)
          const ids = idsFrom(pathname, body)
          const ok = ids.every((id) => applyPatch(id, body))
          if (!ok) return send(res, { status: 404, msg: '保存失败，数据可能已被删除！' })
          return send(res, { status: 0, msg: '保存成功' })
        }

        return send(res, { status: 404, msg: `未实现的 mock：${method} ${pathname}` })
      })
    },
  }
}

function decorateFromBody(body: Record<string, any>, id: number): SampleRow {
  const engine = String(body.engine || body.name || `item-${id}`)
  const grade = String(body.grade || 'A')
  return {
    id,
    engine,
    browser: String(body.browser || '-'),
    platform: String(body.platform || '-'),
    version: String(body.version || '-'),
    grade,
    name: String(body.name || engine),
    status: String(body.status || (grade === 'A' ? 'online' : 'offline')),
  }
}
