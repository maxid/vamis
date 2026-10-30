import { cloneRows, createSampleRows, type SampleRow } from './sample'

export type MockPayload = {
  status: number
  msg?: string
  data?: unknown
  errors?: unknown
}

let sampleRows: SampleRow[] = createSampleRows()

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

function listPayload(rows: SampleRow[], query: Record<string, string>): MockPayload {
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

/** 与 dev 中间件同一套 `/api/mock2` 语义；Pages 上没有后端，走这份纯函数。 */
export function handleMockApi(input: {
  method: string
  pathname: string
  query?: Record<string, string>
  body?: Record<string, any>
}): MockPayload {
  const method = (input.method || 'GET').toUpperCase()
  const pathname = (input.pathname || '').split('?')[0]
  const query = input.query || {}
  const body = input.body || {}

  if (pathname === '/api/mock2/page/initData') {
    const now = new Date()
    return {
      status: 0,
      msg: 'ok',
      data: {
        title: '页面标题',
        date: now.toLocaleString(),
        time: now.getTime(),
      },
    }
  }

  if (pathname === '/api/mock2/form/saveForm') {
    const data = method === 'GET' ? query : body
    return { status: 0, msg: '保存成功', data: { ...data, id: 1 } }
  }

  if (pathname === '/api/mock2/form/saveFormFailed') {
    return {
      status: 422,
      msg: '',
      errors: { test2: '服务器端说，这个有错误。' },
      data: null,
    }
  }

  if (pathname === '/api/mock2/form/formitemFailed') {
    return { status: 422, msg: '', errors: '当前用户已存在', data: null }
  }

  if (pathname === '/api/mock2/form/formitemSuccess') {
    return { status: 0 }
  }

  if (pathname === '/api/mock2/form/autoUpdate') {
    const browser = String(query.browser || body.browser || '')
    const rows = [
      { browser: 'Chrome', version: '1', platform: 'linux 1', Chrome: 'xxx1' },
      { browser: 'Chrome', version: '2', platform: 'windows xp', Chrome: 'xxx2' },
      { browser: 'Firefox', version: '3', platform: 'linux 2', Chrome: 'xxx3' },
      { browser: 'Firefox', version: '4', platform: 'windows 8', Chrome: 'xxx4' },
      { browser: 'Opera', version: '5', platform: 'linux 3', Chrome: 'xxx5' },
      { browser: 'Opera', version: '6', platform: 'windows 10', Chrome: 'xxx6' },
    ]
    const hit = browser
      ? rows.find((row) => row.browser.toLowerCase().includes(browser.toLowerCase()))
      : undefined
    return { status: 0, msg: '', data: query.items ? rows : hit }
  }

  if (pathname === '/api/mock2/form/getOptions') {
    const size = Number(query.size || body.size || 0)
    const options =
      size > 0
        ? Array.from({ length: Math.ceil(size) }, (_, index) => ({
            label: `Option ${index}`,
            value: String(index),
          }))
        : [
            { label: 'Option A', value: 'a' },
            { label: 'Option B', value: 'b' },
            { label: 'Option C', value: 'c' },
            { label: 'Option D', value: 'd' },
            { label: 'Option E', value: 'e' },
            { label: 'Option F', value: 'f' },
          ]
    return { status: 0, msg: 'ok', data: { options } }
  }

  if (pathname === '/api/mock2/form/initData') {
    const tpl = String(query.tpl || body.tpl || 'tpl1')
    const now = new Date()
    const names: Record<string, { name: string; author: string }> = {
      tpl1: { name: 'Amis Renderer', author: 'fex' },
      tpl2: { name: 'Vamis Runtime', author: 'vamis' },
      tpl3: { name: 'LCDP IR', author: 'lcdp' },
    }
    const picked = names[tpl] || names.tpl1
    return {
      status: 0,
      msg: 'ok',
      data: {
        ...picked,
        tpl,
        date: now.toISOString(),
      },
    }
  }

  if (pathname === '/api/mock2/options/level2') {
    const a = String(query.a || body.a || '')
    const byA: Record<string, { label: string; value: string }[]> = {
      '1': [
        { label: '选项 A-1', value: 'a1' },
        { label: '选项 A-2', value: 'a2' },
      ],
      '2': [
        { label: '选项 B-1', value: 'b1' },
        { label: '选项 B-2', value: 'b2' },
      ],
      '3': [
        { label: '选项 C-1', value: 'c1' },
      ],
    }
    return { status: 0, data: { options: byA[a] || [] } }
  }

  if (pathname === '/api/mock2/options') {
    return {
      status: 0,
      data: {
        options: [
          { label: '在线', value: 'online' },
          { label: '离线', value: 'offline' },
          { label: '维修', value: 'repair' },
        ],
      },
    }
  }

  if (pathname === '/api/mock2/chart/chart1') {
    return {
      status: 0,
      data: {
        title: { text: '远程图表' },
        xAxis: { type: 'category', data: ['A', 'B', 'C'] },
        yAxis: { type: 'value' },
        series: [{ type: 'bar', data: [4, 7, 2] }],
      },
    }
  }

  if (pathname === '/api/mock2/sample/reset') {
    sampleRows = createSampleRows()
    return { status: 0, msg: '测试数据已重置', data: { total: sampleRows.length } }
  }

  if (pathname === '/api/mock2/sample/bulkUpdate' || pathname === '/api/mock2/sample/bulkUpdate2') {
    const ids = idsFrom(pathname, body)
    const patch = { ...body }
    delete patch.ids
    delete patch.rowsDiff
    const ok = ids.every((id: string, index: number) => {
      const rowPatch = Array.isArray(body.rowsDiff) ? body.rowsDiff[index] || patch : patch
      return applyPatch(id, rowPatch)
    })
    if (!ok) return { status: 404, msg: '保存失败，数据可能已被删除！' }
    return { status: 0, msg: '保存成功' }
  }

  if (pathname.startsWith('/api/mock2/sample/') && method === 'GET') {
    const id = pathname.split('/').pop() || ''
    const row = sampleRows.find((item) => String(item.id) === String(id))
    if (!row) return { status: 404, msg: '未找到数据' }
    return { status: 0, msg: 'ok', data: row }
  }

  if (pathname === '/api/mock2/sample' && method === 'GET') {
    return listPayload(filterSample(query), query)
  }

  if (pathname === '/api/mock2/sample' && (method === 'POST' || method === 'PUT')) {
    if (body.id) {
      if (!applyPatch(String(body.id), body)) {
        return { status: 404, msg: '保存失败，数据可能已被删除！' }
      }
    } else {
      const id = Math.max(0, ...sampleRows.map((row) => row.id)) + 1
      sampleRows.push(decorateFromBody(body, id))
    }
    return { status: 0, msg: '保存成功', data: body }
  }

  if (pathname.startsWith('/api/mock2/sample/') && method === 'DELETE') {
    const ids = idsFrom(pathname)
    const ok = ids.every((id) => {
      const index = sampleRows.findIndex((row) => String(row.id) === String(id))
      if (index < 0) return false
      sampleRows.splice(index, 1)
      return true
    })
    if (!ok) return { status: 404, msg: '删除失败，数据可能已被删除！' }
    return { status: 0, msg: '删除成功' }
  }

  if (pathname.startsWith('/api/mock2/sample/') && (method === 'POST' || method === 'PUT')) {
    const ids = idsFrom(pathname, body)
    const ok = ids.every((id) => applyPatch(id, body))
    if (!ok) return { status: 404, msg: '保存失败，数据可能已被删除！' }
    return { status: 0, msg: '保存成功' }
  }

  return { status: 404, msg: `未实现的 mock：${method} ${pathname}` }
}
