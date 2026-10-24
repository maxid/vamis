/** 对照差异分成全局 / 样式 helper / 组件，并给出整改建议。 */

export const SCOPE = {
  global: {
    id: 'global',
    label: '全局',
    hint: 'html/body、SDK 根、主题 token。修一处会大面积变化，不要逐组件打补丁。',
  },
  helper: {
    id: 'helper',
    label: '样式 helper',
    hint: 'schema className 工具类，对标 Amis helper SCSS / 计算样式。',
  },
  component: {
    id: 'component',
    label: '组件',
    hint: '某个 type 的默认外观。只改该渲染器 / cva，不要改全局 token。',
  },
}

const COMPACT_CLASS =
  /^(?:m|p)(?:-[trblxy])?(?:-(?:none|xs|sm|md|lg|xl|xxl|n|base))?$/
const TYPE_SIZE_CLASS = /^(text|leading|tracking)-(xs|sm|base|md|lg|xl|[2-8]xl)$/
const TYPE_FACE_CLASS = /^(font-sans|font-serif|font-mono)$/

function walk(node, visit) {
  if (!node || typeof node !== 'object') return
  if (Array.isArray(node)) {
    node.forEach((item) => walk(item, visit))
    return
  }
  visit(node)
  walk(node.body, visit)
  walk(node.columns, visit)
  walk(node.items, visit)
  walk(node.buttons, visit)
  walk(node.actions, visit)
  walk(node.dialog, visit)
}

export function collectClassNames(schema) {
  const out = []
  walk(schema, (node) => {
    if (typeof node.className === 'string') {
      out.push(...node.className.split(/\s+/).filter(Boolean))
    }
    if (typeof node.tpl === 'string') {
      const re = /class(?:Name)?="([^"]+)"/g
      let match
      while ((match = re.exec(node.tpl))) {
        out.push(...match[1].split(/\s+/).filter(Boolean))
      }
    }
  })
  return out
}

export function collectTypes(schema) {
  const out = []
  walk(schema, (node) => {
    if (typeof node.type === 'string') out.push(node.type)
  })
  return out
}

function isZero(value) {
  const n = Number.parseFloat(value)
  return Number.isFinite(n) && n === 0
}

export function classifyIssue(diff, item) {
  const prop = String(diff?.prop || '')
  const classes = collectClassNames(item?.schema)
  const types = collectTypes(item?.schema)
  const hay = `${item?.id || ''} ${item?.title || ''} ${classes.join(' ')}`
  const compact =
    classes.find((name) => COMPACT_CLASS.test(name)) ||
    (hay.match(/\b((?:m|p)(?:-[trblxy])?(?:-(?:none|xs|sm|md|lg|xl|xxl|n|base))?)\b/) || [])[1]

  if (prop === 'bodyFont' || prop === 'bodyFontSize') return 'global'
  if (prop === 'fontFamily' && !classes.some((name) => TYPE_FACE_CLASS.test(name))) return 'global'

  if (prop === 'gap' || prop === 'marginLeft') {
    if (compact && isZero(diff.vamis) && !isZero(diff.amis)) return 'helper'
    if (compact) return 'global'
    if (classes.some((name) => name.startsWith('space-') || name.startsWith('gap-'))) return 'helper'
    return 'component'
  }

  if (prop === 'fontSize') {
    if (classes.some((name) => TYPE_SIZE_CLASS.test(name))) return 'helper'
    return 'global'
  }

  if (prop === 'fontWeight' || prop === 'lineHeight') {
    if (classes.some((name) => TYPE_SIZE_CLASS.test(name) || name.startsWith('leading-') || name.startsWith('font-'))) {
      return 'helper'
    }
    if (types.some((type) => type === 'button' || type === 'action' || type === 'submit' || type === 'reset')) {
      return 'component'
    }
    return 'component'
  }

  if (prop === 'sameRow') return 'component'
  if (
    /\.(value|valueAfter|rendered|named|dialog|toast|node|type)$/.test(prop) ||
    prop.startsWith('page/') ||
    prop.includes('/body/')
  ) {
    return 'component'
  }
  return 'helper'
}

export function adviseIssue(diff, item, scope) {
  const prop = String(diff?.prop || '')
  const classes = collectClassNames(item?.schema)
  const compact = classes.find((name) => COMPACT_CLASS.test(name))
  if (scope === 'global' && (prop === 'bodyFont' || prop === 'fontFamily')) {
    return 'Amis SDK 把 html/body 钉成 PingFang SC；Vamis 走 --fonts-base-family 长栈，实际落到 Helvetica Neue。在 sdk 根 / embed 的 html,body 对齐 Amis 默认中文栈。'
  }
  if (scope === 'global' && (prop === 'gap' || prop === 'marginLeft')) {
    return 'compact 阶应对齐 Amis 5/10/15/20/30/40/50。现在 --gap-* 是 4/8/12/16/20/24。改 token 一处，m/p 整阶回来。'
  }
  if (scope === 'helper' && (prop === 'gap' || prop === 'marginLeft') && isZero(diff?.vamis)) {
    return `缺档：补 Amis 同名 helper（${compact || '该类'}），不要用邻近档或 token 近似。`
  }
  if (scope === 'helper' && prop === 'fontSize') {
    return '对标 Amis helper 计算字号（text-sm 实测 12px，不是 TW 0.875rem=14px）。以计算样式为准，不要只抄 markdown 表。'
  }
  if (scope === 'component' && prop === 'fontWeight') {
    return 'Button 默认字重：Amis 400，Vamis shadcn font-medium=500。改 button cva，不要改全局。'
  }
  if (scope === 'component' && prop === 'lineHeight') {
    return '控件行高跟该 type 默认走，不要改 html 行高。对照 Amis 该 type 的计算样式。'
  }
  if (prop.endsWith('.value') || prop.endsWith('.valueAfter')) {
    return '运行时值应对齐 Amis：schema.value / 表单域 / 控件当前值，不要只看能不能画出。'
  }
  if (prop.endsWith('.named')) {
    return '有 name 的结点应能 getComponentByName。Vamis 要在该 type 注册 Scoped。'
  }
  if (prop.endsWith('.rendered') || prop.endsWith('.node')) {
    return 'schema 树该结点要能在 DOM 里定位（name / label）。'
  }
  if (prop.endsWith('.dialog') || prop.endsWith('.toast')) {
    return '点一下后动作效果应对齐 Amis（dialog / toast / setValue）。'
  }
  return SCOPE[scope]?.hint || ''
}

export function attachFindings(item, diffs) {
  const seen = new Set()
  const out = []
  for (const diff of diffs || []) {
    const key = String(diff?.prop || '')
    if (!key || seen.has(key)) continue
    seen.add(key)
    const scope = classifyIssue(diff, item)
    out.push({
      prop: diff.prop,
      amis: diff.amis,
      vamis: diff.vamis,
      scope,
      advice: adviseIssue(diff, item, scope),
    })
  }
  return out
}

export function summarizeFindings(rows) {
  const byScope = { global: [], helper: [], component: [] }
  for (const row of rows || []) {
    for (const issue of row.findings || []) {
      const scope = issue.scope || 'helper'
      if (!byScope[scope]) byScope[scope] = []
      byScope[scope].push({
        id: row.id,
        title: row.title,
        prop: issue.prop,
        amis: issue.amis,
        vamis: issue.vamis,
        advice: issue.advice,
      })
    }
  }
  const adviceOf = (list) => {
    const unique = []
    const seen = new Set()
    for (const issue of list) {
      if (!issue.advice || seen.has(issue.advice)) continue
      seen.add(issue.advice)
      unique.push(issue.advice)
    }
    return unique
  }
  return {
    global: { label: SCOPE.global.label, hint: SCOPE.global.hint, count: byScope.global.length, items: byScope.global, advice: adviceOf(byScope.global) },
    helper: { label: SCOPE.helper.label, hint: SCOPE.helper.hint, count: byScope.helper.length, items: byScope.helper, advice: adviceOf(byScope.helper) },
    component: { label: SCOPE.component.label, hint: SCOPE.component.hint, count: byScope.component.length, items: byScope.component, advice: adviceOf(byScope.component) },
  }
}
