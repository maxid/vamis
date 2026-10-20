import type { Plugin } from 'vite'

type Row = { id: number; name: string; status: string }

const rows: Row[] = [
  { id: 1, name: '泵房-A', status: 'online' },
  { id: 2, name: '闸门-B', status: 'offline' },
  { id: 3, name: '传感器-C', status: 'online' },
  { id: 4, name: '液位计-D', status: 'online' },
  { id: 5, name: '阀门-E', status: 'offline' },
  { id: 6, name: '风机-F', status: 'online' },
]

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

        if (pathname === '/api/mock2/sample' && method === 'GET') {
          const keywords = String(query.keywords || '').trim()
          const page = Number(query.page || 1)
          const perPage = Number(query.perPage || 10)
          const orderBy = String(query.orderBy || '')
          const orderDir = String(query.orderDir || 'asc')
          const filtered = keywords
            ? rows.filter((row) => row.name.includes(keywords))
            : [...rows]
          if (orderBy === 'id' || orderBy === 'name' || orderBy === 'status') {
            filtered.sort((a, b) => {
              const left = a[orderBy as keyof Row]
              const right = b[orderBy as keyof Row]
              const cmp = left === right ? 0 : left > right ? 1 : -1
              return orderDir === 'desc' ? -cmp : cmp
            })
          }
          const start = (page - 1) * perPage
          return send(res, {
            status: 0,
            data: {
              items: filtered.slice(start, start + perPage),
              total: filtered.length,
            },
          })
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

        if (pathname === '/api/mock2/sample' && method === 'POST') {
          const body = await readBody(req)
          if (body.id) {
            const index = rows.findIndex((row) => row.id === Number(body.id))
            if (index >= 0) Object.assign(rows[index], body)
          } else {
            const id = Math.max(0, ...rows.map((row) => row.id)) + 1
            rows.push({ id, name: body.name || `item-${id}`, status: body.status || 'online' })
          }
          return send(res, { status: 0, msg: '保存成功', data: body })
        }

        if (pathname.startsWith('/api/mock2/sample/') && method === 'DELETE') {
          const id = Number(pathname.split('/').pop())
          const index = rows.findIndex((row) => row.id === id)
          if (index >= 0) rows.splice(index, 1)
          return send(res, { status: 0, msg: '已删除' })
        }

        return send(res, { status: 404, msg: `未实现的 mock：${method} ${pathname}` })
      })
    },
  }
}
