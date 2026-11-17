/** 文档活示例里 Amis 有、handler 主路径还没接的 mock。对齐 `../amis/mock/cfc/mock/`。 */
import type { MockPayload } from './handler'

type Input = {
  method: string
  pathname: string
  query: Record<string, string>
  body: Record<string, any>
}

const ok = (data: unknown, msg = ''): MockPayload => ({ status: 0, msg, data })

const LETTER_OPTIONS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  .split('')
  .slice(0, 17)
  .map((ch) => ({ label: `Option ${ch}`, value: ch.toLowerCase() }))

const LOAD_ONCE = [
  'Laura Lewis', 'David Gonzalez', 'Christopher Rodriguez', 'Sarah Young', 'James Jones',
  'Larry Robinson', 'Christopher Perez', 'Sharon Davis', 'Kenneth Anderson', 'Deborah Lewis',
  'Jennifer Lewis', 'Laura Miller', 'Larry Harris', 'Patricia Robinson', 'Mark Davis',
  'Jessica Harris', 'Anna Brown', 'Lisa Young', 'Donna Williams', 'Shirley Davis',
  'Richard Clark', 'Cynthia Martinez', 'Kimberly Walker', 'Timothy Anderson', 'Betty Lee',
  'Jeffrey Allen', 'Karen Martinez', 'Anna Lopez', 'Dorothy Anderson', 'David Perez',
  'Dorothy Martin', 'George Johnson', 'Donald Jackson', 'Mary Brown', 'Deborah Martinez',
  'Lisa Robinson', 'Laura Martinez', 'Timothy Taylor', 'Joseph Martinez', 'Karen Wilson',
  'Karen Walker', 'William Martinez', 'Linda Brown', 'Elizabeth Brown', 'Anna Moore',
  'Robert Martinez', 'Edward Hernandez', 'Elizabeth Hall', 'Linda Jackson', 'Brian Jones',
  'Amy Thompson', 'Kimberly Wilson', 'Nancy Garcia', 'Mary Thompson', 'Betty Clark',
].map((label, index) => ({ label, value: String(index + 1), id: index + 1 }))

const DEPARTMENTS = [
  {
    label: '总公司',
    value: 1,
    children: [
      { label: '部门 A', value: 2 },
      {
        label: '部门 B',
        value: 3,
        children: [
          { label: '子部门1', value: 5 },
          { label: '子部门2', value: 6 },
        ],
      },
      { label: '部门 C', value: 4 },
    ],
  },
]

const DEPART_USERS: Record<number, { label: string; value: string }[]> = {
  1: [
    { label: '用户 1', value: 'user1' },
    { label: '用户 2', value: 'user2' },
  ],
  2: [
    { label: '用户 a', value: 'usera' },
    { label: '用户 b', value: 'userb' },
  ],
  3: [
    { label: '用户 x', value: 'userx' },
    { label: '用户 y', value: 'usery' },
  ],
  4: [
    { label: '用户 I', value: 'useri' },
    { label: '用户 II', value: 'userii' },
  ],
  5: [
    { label: '用户一', value: 'useryi' },
    { label: '用户二', value: 'userer' },
  ],
  6: [
    { label: '用户k', value: 'userk' },
    { label: '用户j', value: 'userj' },
  ],
}

const DEPART_USER_FLAT = Object.values(DEPART_USERS).flat()

function findTree(tree: any[], iterator: (item: any) => boolean): any | null {
  for (const item of tree) {
    if (iterator(item)) return item
    if (Array.isArray(item.children)) {
      const hit = findTree(item.children, iterator)
      if (hit) return hit
    }
  }
  return null
}

function stripChildrenForDefer(item: any) {
  const next = { ...item }
  if (next.children) {
    next.defer = true
    delete next.children
  }
  return next
}

const TREE_OPTIONS = [
  {
    label: 'node-0',
    value: 'node-0',
    children: [
      {
        label: 'node-0-0',
        value: 'node-0-0',
        children: [
          { label: 'node-0-0-0', value: 'node-0-0-0' },
          { label: 'node-0-0-1', value: 'node-0-0-1' },
        ],
      },
      { label: 'node-0-1', value: 'node-0-1' },
    ],
  },
  {
    label: 'node-1',
    value: 'node-1',
    children: [
      { label: 'node-1-0', value: 'node-1-0' },
      { label: 'node-1-1', value: 'node-1-1' },
    ],
  },
]

function searchTree(data: any[], keyword: string): any[] {
  const matched: any[] = []
  for (const node of data) {
    if (node.value && String(node.value).includes(keyword)) matched.push({ ...node })
    else if (node.children) {
      const filtered = searchTree(node.children, keyword)
      if (filtered.length) matched.push({ ...node, children: filtered })
    }
  }
  return matched
}

function pad(num: number) {
  return num < 10 ? `0${num}` : String(num)
}

function rand(min = 1, max = 100) {
  return Math.ceil(min + (max - min) * Math.random())
}

/** 命中则返回 payload；不认识的路径返回 null，交给 handler 404。 */
export function handleMockExtras(input: Input): MockPayload | null {
  const { pathname, query, body, method } = input

  if (pathname === '/api/mock2/initWizard') {
    return ok({
      email: 'xxxx@baidu.com',
      website: 'http://www.baidu.com',
      email2: 'yyyy@baidu.com',
      step: 2,
    })
  }

  if (pathname === '/api/mock2/json-schema') {
    return ok({
      type: 'object',
      properties: {
        id: { type: 'number', title: 'ID' },
        name: { type: 'string', title: '名称' },
        description: { type: 'string', title: '描述' },
      },
    })
  }

  if (pathname === '/api/mock2/timeline/timelineItems') {
    return ok({
      items: [
        { time: '2019-02-07', title: '数据开发', detail: '2019-02-07detail', color: '#ffb200', icon: 'close' },
        { time: '2019-02-08', title: '管理中心', detail: '2019-02-08detail' },
        { time: '2019-02-09', title: 'SQL语句', detail: '2019-02-09detail', color: 'warning' },
        { time: '2019-02-10', title: '一键部署', detail: '2019-02-10detail', icon: 'compress-alt' },
        { time: '2019-02-10', title: '一键部署', detail: '2019-02-11detail' },
        { time: '2019-02-10', title: '一键部署', detail: '2019-02-12detail', icon: 'close' },
        { time: '2019-02-10', title: '一键部署', detail: '2019-02-13detail' },
      ],
    })
  }

  if (pathname === '/api/mock2/options/carousel') {
    return ok({
      imageList: [
        { image: 'https://internal-amis-res.cdn.bcebos.com/images/2019-12/1577157239810/da6376bf988c.png' },
        {
          html: '<div style="width: 100%; height: 300px; background: #e3e3e3; text-align: center; line-height: 300px;">carousel data</div>',
        },
        { image: 'https://suda.cdn.bcebos.com/amis/images/alice-macaw.jpg' },
      ],
    })
  }

  if (pathname === '/api/mock2/options/chainedOptions') {
    const level = parseInt(query.level || '0', 10) || 0
    const maxLevel = parseInt(query.maxLevel || '0', 10) || 0
    if (level >= maxLevel) return ok(null)
    return ok([
      { label: `A ${level}`, value: 'a' },
      { label: `B ${level}`, value: 'b' },
      { label: `C ${level}`, value: 'c' },
      { label: `D ${level}`, value: 'd' },
    ])
  }

  if (pathname === '/api/mock2/options/loadDataOnce') {
    return { status: 0, msg: 'ok', data: { count: LOAD_ONCE.length, items: LOAD_ONCE } }
  }

  if (pathname === '/api/mock2/options/matrix') {
    return {
      status: 0,
      msg: 'ok',
      data: {
        columns: [
          { label: 'Col A', col: 'a' },
          { label: 'Col B', col: 'b' },
          { label: 'Col C', col: 'c' },
          { label: 'Col D', col: 'd' },
          { label: 'Col E', col: 'e' },
        ],
        rows: [
          { label: 'Row 1', rol: 1 },
          { label: 'Row 2', rol: 2 },
          { label: 'Row 3', rol: 3 },
          { label: 'Row 4', rol: 4 },
          { label: 'Row 5', rol: 5 },
          { label: 'Row 6', rol: 6 },
        ],
      },
    }
  }

  if (pathname === '/api/mock2/options/transfer') {
    const perPage = Number(query.perPage || 10)
    const page = Number(query.page || 1)
    const start = Math.max(0, (page - 1) * perPage)
    return {
      status: 0,
      msg: 'ok',
      data: { count: LOAD_ONCE.length, page, items: LOAD_ONCE.slice(start, start + perPage) },
    }
  }

  if (pathname === '/api/mock2/form/deferOptions') {
    const prevLabel = query.label || ''
    let labelPrefix = 'lazy-option-'
    let valuePrefix = 'lazy-'
    const nested = /^lazy-option-(.*)$/.exec(prevLabel)
    if (nested) {
      labelPrefix = `lazy-option-${nested[1]}-`
      valuePrefix = `lazy-${nested[1]}-`
    }
    const options = Array.from({ length: 5 }, (_, i) => ({
      label: `${labelPrefix}${i + 1}`,
      value: `${valuePrefix}${i + 1}`,
      defer: i < 2,
    }))
    return ok({ options })
  }

  if (pathname === '/api/mock2/form/departUser') {
    if (query.ref) {
      return ok({ options: DEPART_USERS[Number(query.ref)] || [] })
    }
    if (query.dep) {
      const resolved = findTree(DEPARTMENTS, (item) => String(item.value) === String(query.dep))
      return ok({
        options: resolved?.children ? resolved.children.map(stripChildrenForDefer) : [],
      })
    }
    return ok({
      options: [
        {
          leftOptions: DEPARTMENTS.map(stripChildrenForDefer),
          children: [1, 2, 3, 4, 5, 6].map((ref) => ({ ref, defer: true })),
        },
      ],
    })
  }

  if (pathname === '/api/mock2/form/departUserSearch') {
    const term = query.term || ''
    const options = term ? DEPART_USER_FLAT.filter((item) => item.value === term) : DEPART_USER_FLAT
    return ok({ options })
  }

  if (pathname === '/api/mock2/form/getTreeOptions') {
    return {
      status: 0,
      msg: 'ok',
      data: {
        options: [
          {
            label: 'Option A',
            value: 'a',
            children: [
              { label: 'Option X', value: 'x' },
              { label: 'Option Y', value: 'y' },
              { label: 'Option Z', value: 'z' },
            ],
          },
          {
            label: 'Option B',
            value: 'b',
            collapsed: true,
            children: [
              { label: 'Option 1', value: '1' },
              { label: 'Option 2', value: '2' },
              { label: 'Option 3', value: '3' },
            ],
          },
          { label: 'Option C', value: 'c' },
          { label: 'Option D', value: 'd' },
          { label: 'Option E', value: 'e' },
        ],
      },
    }
  }

  if (pathname === '/api/mock2/form/options') {
    return { status: 0, msg: 'ok', data: { options: LETTER_OPTIONS } }
  }

  if (pathname === '/api/mock2/form/x') {
    return ok({ ...(method === 'GET' ? query : body) })
  }

  if (pathname === '/api/mock2/crud/permissions') {
    return {
      status: 0,
      msg: 'ok',
      data: {
        count: 4,
        rows: [
          { id: 1, name: 'admin:permission', description: '权限(Resource)管理能力', is_readonly: true },
          { id: 2, name: 'admin:role', description: '角色管理能力', is_readonly: true },
          { id: 4, name: 'admin:acl', description: 'Acl 配置能力', is_readonly: true },
          { id: 5, name: 'admin:page', description: '页面管理能力', is_readonly: true },
        ],
      },
    }
  }

  if (pathname === '/api/mock2/crud/users') {
    return {
      status: 0,
      msg: 'ok',
      data: {
        count: 3,
        rows: [
          { id: 1, name: 'buzhihuowu', email: 'buzhihuowu@xxx.com', realName: '不知火舞', isOwner: 0 },
          { id: 6, name: 'shangguanwaner', email: 'shangguanwaner@xxx.com', realName: '上官婉儿', isOwner: 0 },
          { id: 7, name: 'diaochan', email: 'diaochan@xxx.com', realName: '貂蝉', isOwner: 1 },
        ],
      },
    }
  }

  if (pathname === '/api/mock2/table/addSuccess') return { status: 0, msg: '新增成功' }
  if (pathname === '/api/mock2/table/editSuccess') return { status: 0, msg: '编辑成功' }
  if (pathname === '/api/mock2/table/deleteSuccess') return { status: 0, msg: '删除成功' }
  if (pathname === '/api/mock2/table/addFail') {
    return { status: 422, msg: '', errors: { test2: '服务器端说，新增错误。' }, data: null }
  }
  if (pathname === '/api/mock2/table/editFail') {
    return { status: 422, msg: '', errors: { test2: '服务器端说，编辑有错误。' }, data: null }
  }
  if (pathname === '/api/mock2/table/deleteFail') {
    return { status: 422, msg: '', errors: { test2: '服务器端说，删除错误。' }, data: null }
  }

  if (pathname === '/api/mock2/chart/chart2') {
    return ok({
      title: { text: '一天用电量分布', subtext: '纯属虚构' },
      tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
      },
      yAxis: { type: 'value', axisLabel: { formatter: '{value} W' } },
      series: [
        { name: '用电量', type: 'line', smooth: true, data: [rand(), rand(), rand(50, 200), rand(), rand(), rand(), rand()] },
      ],
    })
  }

  if (pathname === '/api/mock2/chart/chartData') {
    return { status: 0, msg: 'ok', data: { line: [rand(), rand(), rand(), rand(), rand(), rand()] } }
  }

  if (pathname === '/api/mock2/log/date') {
    const now = new Date()
    const seconds = now.getSeconds()
    const from = query.offset ? parseInt(query.offset, 10) || 0 : 0
    const finished = seconds === 59
    const logs: string[] = []
    for (let i = from; i <= seconds; i++) {
      logs.push(
        `Date: ${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(i)}\n`,
      )
    }
    if (finished) logs.push('Finished')
    return ok({ offset: seconds + 1, log: logs, finished })
  }

  if (pathname === '/api/mock2/tree/search') {
    const term = query.term || ''
    return ok({ options: term ? searchTree(TREE_OPTIONS, term) : TREE_OPTIONS })
  }

  if (pathname === '/api/mock2/steps/get') {
    return ok({ step: 1, status: 'error' })
  }

  if (pathname === '/api/mock2/steps/steps') {
    return ok({
      steps: [
        { title: 'First', subTitle: 'this is sub title', value: 'first' },
        { title: 'Secord', description: 'this is description', value: 'secord' },
        { title: 'Last', value: 'last' },
      ],
      value: 'secord',
      status: 'error',
    })
  }

  if (pathname === '/api/mock2/service/jsonp') {
    return ok({ type: 'page', title: 'jsonp 示例', body: 'this is tpl from jsonp' })
  }

  if (pathname === '/api/mock2/service/jsschema') {
    return ok({ type: 'button', label: '按钮修改' })
  }

  if (pathname === '/api/mock2/notFound') {
    return { status: 404, msg: 'Not Found!' }
  }

  if (pathname === '/api/options/nav') {
    if (query.parentId) {
      const n = 2 + Math.round(Math.random() * 5)
      const options = Array.from({ length: n }, () => {
        const value = Math.round(Math.random() * 1_000_000)
        return { label: String(value), to: `?cat=${value}`, value: String(value), defer: Math.random() > 0.7 }
      })
      return ok({ links: options })
    }
    return ok({
      links: [
        { label: 'Nav 1', to: '?cat=1', value: '1', icon: 'fa fa-user' },
        {
          label: 'Nav 2',
          unfolded: true,
          children: [
            { label: 'Nav 2-1', children: [{ label: 'Nav 2-1-1', to: '?cat=2-1', value: '2-1' }] },
            { label: 'Nav 2-2', to: '?cat=2-2', value: '2-2' },
          ],
        },
        { label: 'Nav 3', to: '?cat=3', value: '3', defer: true },
      ],
      value: '?cat=1',
    })
  }

  if (pathname === '/api/condition-fields/chained') {
    return {
      status: 0,
      msg: '',
      data: {
        fields: [
          { label: '文本', type: 'text', name: 'text' },
          { label: '数字', type: 'number', name: 'number' },
          { label: '布尔', type: 'boolean', name: 'boolean' },
          {
            label: '日期',
            name: 'date',
            children: [
              { label: '日期1', type: 'date', name: 'date1' },
              { label: '时间2', type: 'time', name: 'time2' },
              { label: '日期时间3', type: 'datetime', name: 'datetime' },
            ],
          },
        ],
      },
    }
  }

  if (pathname === '/api/condition-fields/custom') {
    return {
      status: 0,
      msg: '',
      data: {
        fields: [
          { label: '文本', type: 'text', name: 'text' },
          { label: '数字', type: 'number', name: 'number' },
          { label: '布尔', type: 'boolean', name: 'boolean' },
          {
            label: '选项',
            type: 'select',
            name: 'select',
            options: [
              { label: 'A', value: 'a' },
              { label: 'B', value: 'b' },
              { label: 'C', value: 'c' },
              { label: 'D', value: 'd' },
              { label: 'E', value: 'e' },
            ],
          },
          { label: '动态选项', type: 'select', name: 'select2', source: '/api/mock2/form/getOptions?waitSeconds=1' },
          {
            label: '日期',
            children: [
              { label: '日期', type: 'date', name: 'date' },
              { label: '时间', type: 'time', name: 'time' },
              { label: '日期时间', type: 'datetime', name: 'datetime' },
            ],
          },
        ],
      },
    }
  }

  if (pathname === '/api/map/HK') {
    return {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { name: 'Hong Kong', ISO: 'HKG' },
          geometry: {
            type: 'Polygon',
            coordinates: [[[113.8, 22.15], [114.45, 22.15], [114.45, 22.57], [113.8, 22.57], [113.8, 22.15]]],
          },
        },
      ],
    } as unknown as MockPayload
  }

  if (pathname === '/api/pages') {
    return ok({
      pages: [
        { label: '远程页', url: '/pageA', schema: { type: 'page', body: '远程页内容' } },
        { label: '跳转', url: '/old', redirect: '/pageA' },
      ],
    })
  }

  if (pathname === '/api/pageA') {
    return ok({ type: 'page', title: 'Page A', body: 'pageA 内容' })
  }

  if (pathname === '/api/initData' || pathname === '/api/form/form3') {
    return ok({ ...(method === 'GET' ? query : body) })
  }

  if (pathname === '/api/xxx' || pathname === '/api/xxx/save' || pathname === '/api/xxxx' || pathname === '/api/upload') {
    return ok({ ...(method === 'GET' ? query : body), ok: true })
  }

  if (pathname === '/api/mock2') {
    return ok({})
  }

  if (pathname === '/api/mock2/sample/mirror') {
    let json: unknown = {}
    try {
      json = query.json ? JSON.parse(query.json) : body
    } catch {
      json = {}
    }
    if (json && typeof json === 'object' && 'status' in (json as object)) return json as MockPayload
    return ok(json)
  }

  return null
}
