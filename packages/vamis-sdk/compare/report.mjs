import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { summarizeReport } from './score.mjs'
import { SCOPE, summarizeFindings } from './classify.mjs'

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')

export function writeReport(rows, options = {}) {
  const summary = summarizeReport(rows)
  const generatedAt = new Date().toISOString()
  const json = {
    generatedAt,
    summary,
    rows: rows.map((row) => ({
      id: row.id,
      group: row.group,
      layer: row.layer,
      title: row.title,
      pass: row.parity?.pass,
      reason: row.parity?.reason,
      diffs: row.parity?.diffs,
      findings: row.findings,
      amis: row.amis,
      vamis: row.vamis,
    })),
  }
  const jsonPath = path.join(path.dirname(fileURLToPath(import.meta.url)), 'last-report.json')
  fs.writeFileSync(jsonPath, `${JSON.stringify(json, null, 2)}\n`)
  const distJson = path.join(path.dirname(fileURLToPath(import.meta.url)), '../dist/compare-report.json')
  if (fs.existsSync(path.dirname(distJson))) fs.writeFileSync(distJson, `${JSON.stringify(json, null, 2)}\n`)

  const failed = rows.filter((row) => !row.parity?.pass)
  const p0Failed = failed.filter((row) => row.layer === 'p0')
  const smokeFailed = failed.filter((row) => row.layer !== 'p0')
  const classified = summarizeFindings(rows)
  function failLine(row) {
    const extra =
      (row.parity?.diffs || [])
        .map((item) => `${item.prop}: Amis \`${item.amis}\` / Vamis \`${item.vamis}\``)
        .join('；') || row.parity?.reason || ''
    return `- \`${row.id}\` ${row.title}${extra ? ` — ${extra}` : ''}`
  }
  function issueLine(issue) {
    return `- \`${issue.id}\` ${issue.prop}: Amis \`${issue.amis}\` / Vamis \`${issue.vamis}\``
  }
  function scopeSection(key) {
    const bucket = classified[key]
    const head = [
      `### ${bucket.label}（${bucket.count}）`,
      '',
      bucket.hint,
      '',
    ]
    if (!bucket.count) return [...head, '- 无。', '']
    const advice = bucket.advice.length ? ['整改：', ...bucket.advice.map((line) => `- ${line}`), ''] : []
    return [...head, ...bucket.items.slice(0, 12).map(issueLine), ...(bucket.count > 12 ? [`- …其余 ${bucket.count - 12} 条见 last-report.json`] : []), '', ...advice]
  }
  const md = [
    '# SDK 对照报告',
    '',
    `- 日期：${generatedAt.slice(0, 10)}`,
    `- 状态：自动生成。\`pnpm compare\` 用同一份 schema 跑 \`amis.embed\` / \`vamis.embed\`，判定是 **Vamis 是否对齐 Amis 实测**。`,
    `- 合计 **${summary.total}** · 通过 **${summary.passed}** · 失败 **${summary.failed}**（P0 ${p0Failed.length}）`,
    '',
    '## 问题分类',
    '',
    '| 范围 | 条数 | 怎么改 |',
    '|------|------|--------|',
    `| ${SCOPE.global.label} | ${classified.global.count} | ${SCOPE.global.hint} |`,
    `| ${SCOPE.helper.label} | ${classified.helper.count} | ${SCOPE.helper.hint} |`,
    `| ${SCOPE.component.label} | ${classified.component.count} | ${SCOPE.component.hint} |`,
    '',
    ...scopeSection('global'),
    ...scopeSection('helper'),
    ...scopeSection('component'),
    '## 分组',
    '',
    '| 组 | 合计 | 失败 |',
    '|----|------|------|',
    ...Object.entries(summary.byGroup).map(
      ([group, stat]) => `| ${group} | ${stat.total} | ${stat.failed} |`,
    ),
    '',
    '## P0 失败（驱动下一刀）',
    '',
    ...(p0Failed.length ? p0Failed.map(failLine) : ['- 无失败。']),
    '',
    '## 文档 smoke 失败（最多 20 条）',
    '',
    ...(smokeFailed.length ? smokeFailed.slice(0, 20).map(failLine) : ['- 无失败。']),
    ...(smokeFailed.length > 20 ? [`- …其余 ${smokeFailed.length - 20} 条见 \`compare/last-report.json\``] : []),
    '',
    '下一刀按问题分类：先全局 token / 默认字体，再补缺档 helper，最后改组件默认外观。`pnpm compare:p0` 是盒模型门禁。',
    '',
  ].join('\n')
  const mdPath = path.join(repo, 'docs/superpowers/specs/2026-10-24-sdk-compare-report.md')
  fs.writeFileSync(mdPath, md)
  return { jsonPath, mdPath, summary }
}
