export function measureKind(measure) {
  return measure?.type || 'smoke'
}

export function fontColumns() {
  return [
    { key: 'fontSize', label: '字号' },
    { key: 'lineHeight', label: '行高' },
    { key: 'fontFamily', label: '字体' },
  ]
}

export function resultColumns(measure) {
  const type = measureKind(measure)
  const fonts = fontColumns()
  if (type === 'pair') {
    return [
      { key: 'sameRow', label: '同一行' },
      { key: 'gap', label: '缝 gap' },
      { key: 'box', label: '第二颗 top / left / 宽' },
      ...fonts,
      { key: 'pass', label: '判定' },
    ]
  }
  if (type === 'style') {
    const props = measure.props || ['marginLeft', 'display']
    return [...props.map((prop) => ({ key: `style:${prop}`, label: prop })), ...fonts, { key: 'pass', label: '判定' }]
  }
  return [
    { key: 'status', label: '状态' },
    { key: 'text', label: '摘要' },
    ...fonts,
    { key: 'pass', label: '判定' },
  ]
}

export function measureLabel(measure) {
  const type = measureKind(measure)
  if (type === 'pair') return '量测：盒模型（同一行 / 缝）'
  if (type === 'style') return `量测：计算样式（${(measure.props || []).join(', ') || 'style'}）`
  return '量测：渲染 smoke（两边都能画出即过）'
}

const PX = (value) => {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  const n = Number.parseFloat(String(value || ''))
  return Number.isFinite(n) ? n : null
}

function pushDiff(diffs, prop, amis, vamis) {
  diffs.push({ prop, amis, vamis })
}

function firstFamily(value) {
  if (!value) return ''
  return String(value)
    .split(',')[0]
    .trim()
    .replace(/^["']|["']$/g, '')
}

function faceName(font = {}) {
  return font.used || firstFamily(font.fontFamily)
}

/** 字体差不挡 smoke / P0 盒模型，但要进问题分类。 */
export function collectFontDiffs(amis, vamis) {
  const a = amis?.measure?.font || {}
  const b = vamis?.measure?.font || {}
  const ar = amis?.measure?.rootFont || {}
  const br = vamis?.measure?.rootFont || {}
  const diffs = []
  function add(prop, left, right, numeric) {
    if (numeric) {
      const ln = PX(left)
      const rn = PX(right)
      if (ln != null && rn != null) {
        if (Math.abs(ln - rn) > 0.5) pushDiff(diffs, prop, left, right)
        return
      }
    }
    if (String(left || '').toLowerCase() !== String(right || '').toLowerCase()) {
      pushDiff(diffs, prop, left, right)
    }
  }
  add('fontSize', a.fontSize, b.fontSize, true)
  add('lineHeight', a.lineHeight, b.lineHeight, true)
  add('fontWeight', a.fontWeight, b.fontWeight, false)
  add('fontFamily', faceName(a), faceName(b), false)
  add('bodyFont', faceName(ar), faceName(br), false)
  return diffs
}

export function scoreCase(item, amis, vamis) {
  if (vamis?.error) {
    return { pass: false, reason: `vamis: ${vamis.error}`, diffs: [] }
  }
  if (amis?.error) {
    return { pass: false, reason: `amis: ${amis.error}`, diffs: [] }
  }
  const kind = item?.measure?.type || 'smoke'
  if (kind === 'smoke') return { pass: true, diffs: [] }

  const a = amis?.measure || {}
  const b = vamis?.measure || {}
  const diffs = []

  if (kind === 'pair') {
    if (Boolean(a.sameRow) !== Boolean(b.sameRow)) pushDiff(diffs, 'sameRow', a.sameRow, b.sameRow)
    const ag = PX(a.gap)
    const bg = PX(b.gap)
    if (ag == null || bg == null || Math.abs(ag - bg) > 1) pushDiff(diffs, 'gap', a.gap, b.gap)
    return { pass: diffs.length === 0, diffs }
  }

  if (kind === 'style') {
    const keys = item.measure.props || Object.keys(a.style || {})
    for (const key of keys) {
      const left = a.style?.[key]
      const right = b.style?.[key]
      const ln = PX(left)
      const rn = PX(right)
      if (ln != null && rn != null) {
        if (Math.abs(ln - rn) > 1) pushDiff(diffs, key, left, right)
      } else if (String(left) !== String(right)) {
        pushDiff(diffs, key, left, right)
      }
    }
    return { pass: diffs.length === 0, diffs }
  }

  return { pass: true, diffs: [] }
}

export function summarizeReport(rows) {
  const total = rows.length
  const passed = rows.filter((row) => row.parity?.pass).length
  const failed = total - passed
  const byGroup = {}
  for (const row of rows) {
    const group = row.group || 'other'
    if (!byGroup[group]) byGroup[group] = { total: 0, failed: 0 }
    byGroup[group].total += 1
    if (!row.parity?.pass) byGroup[group].failed += 1
  }
  const next = rows
    .filter((row) => !row.parity?.pass)
    .slice(0, 8)
    .map((row) => {
      const diff = (row.parity?.diffs || [])
        .map((item) => `${item.prop}: Amis ${item.amis} / Vamis ${item.vamis}`)
        .join('；')
      return `- \`${row.id}\` ${row.title}${diff ? `（${diff}）` : row.parity?.reason ? `（${row.parity.reason}）` : ''}`
    })
  return { total, passed, failed, byGroup, next }
}
