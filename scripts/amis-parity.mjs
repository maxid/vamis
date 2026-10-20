#!/usr/bin/env node
/**
 * 对齐 amis 与 vamis 的渲染器 type 覆盖。
 *
 * 用法：
 *   pnpm status -- --amis ../amis
 *
 * 提取口径：
 *   - amis：packages/amis/src 与 packages/amis-core/src 下所有
 *     @Renderer/@FormItem/@OptionsControl/@Control 装饰器或函数调用里的
 *     type / alias；test 正则注册（如 static、diff-editor）也会折算成 type。
 *   - vamis：packages/vamis/src/register.ts 与 extras/*.ts 里的
 *     registerRenderer({ type, alias })。
 *
 * 只比较 type 字符串，不代表属性/行为深度对齐。
 */
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const argv = process.argv.slice(2)
const amisFlag = argv.indexOf('--amis')
const amisRoot = path.resolve(repoRoot, amisFlag >= 0 ? argv[amisFlag + 1] || '' : '../amis')
const asJson = argv.includes('--json')

const REGISTER_RE = /(?:@)?(?:Renderer|FormItem|OptionsControl|Control)\(\{([\s\S]*?)\}\)/g
const VAMIS_REGISTER_RE = /registerRenderer\(\{([\s\S]*?)\}\)/g

function walk(dir, exts, out = []) {
  if (!fs.existsSync(dir)) return out
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === '__tests__') continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, exts, out)
    else if (exts.some((ext) => entry.name.endsWith(ext))) out.push(full)
  }
  return out
}

function blockValue(body, key) {
  const match = body.match(new RegExp(`${key}:\\s*(['"])([^'"]+)\\1`))
  return match ? match[2] : null
}

function blockAliases(body) {
  const match = body.match(/alias:\s*\[([^\]]*)\]/)
  return match ? [...match[1].matchAll(/['"]([^'"]+)['"]/g)].map((item) => item[1]) : []
}

/** 把 test: /(^|\/)static(\-[^\/]+)?$/ 折算成 'static' */
function typeFromTest(body) {
  const match = body.match(/(?:^|\n)\s*test:\s*\/(.+)\/\s*,?/)
  if (!match) return null
  const source = match[1]
  const name = source.match(/^\(\^\|\\\/\)([a-z][a-z0-9-]*)/) || source.match(/^([a-z][a-z0-9-]*)/)
  return name ? name[1] : null
}

function amisInventory(amisDir) {
  const files = [
    ...walk(path.join(amisDir, 'packages/amis/src'), ['.tsx', '.ts']),
    ...walk(path.join(amisDir, 'packages/amis-core/src'), ['.tsx', '.ts']),
  ]
  const types = new Map()
  const aliases = new Map()
  for (const file of files) {
    const source = fs.readFileSync(file, 'utf8')
    for (const match of source.matchAll(REGISTER_RE)) {
      const body = match[1]
      const type = blockValue(body, 'type') || typeFromTest(body)
      if (!type) continue
      if (!types.has(type)) types.set(type, path.relative(amisDir, file))
      for (const alias of blockAliases(body)) aliases.set(alias, type)
    }
  }
  return { types, aliases }
}

function vamisInventory(vamisDir) {
  const srcDir = path.join(vamisDir, 'packages/vamis/src')
  const files = [
    path.join(srcDir, 'register.ts'),
    ...walk(path.join(srcDir, 'extras'), ['.ts']),
  ].filter((file) => fs.existsSync(file))
  const types = new Map()
  const aliases = new Map()
  for (const file of files) {
    const source = fs.readFileSync(file, 'utf8')
    for (const match of source.matchAll(VAMIS_REGISTER_RE)) {
      const body = match[1]
      const type = blockValue(body, 'type')
      if (!type) continue
      if (!types.has(type)) types.set(type, path.relative(vamisDir, file))
      for (const alias of blockAliases(body)) aliases.set(alias, type)
    }
  }
  return { types, aliases }
}

function gitInfo(dir) {
  try {
    const head = execFileSync('git', ['-C', dir, 'rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).trim()
    const date = execFileSync('git', ['-C', dir, 'log', '-1', '--format=%cs'], { encoding: 'utf8' }).trim()
    const branch = execFileSync('git', ['-C', dir, 'rev-parse', '--abbrev-ref', 'HEAD'], { encoding: 'utf8' }).trim()
    return { head, date, branch }
  } catch {
    return null
  }
}

if (!fs.existsSync(amisRoot)) {
  console.error(`找不到 amis 仓库：${amisRoot}\n用 --amis <path> 指定路径。`)
  process.exit(1)
}

const amis = amisInventory(amisRoot)
const vamis = vamisInventory(repoRoot)
const amisVersion = JSON.parse(fs.readFileSync(path.join(amisRoot, 'packages/amis/package.json'), 'utf8')).version

const amisAll = new Set([...amis.types.keys(), ...amis.aliases.keys()])
const vamisAll = new Set([...vamis.types.keys(), ...vamis.aliases.keys()])
const amisAliasOnly = [...amis.aliases.keys()].filter((alias) => !amis.types.has(alias)).length
const vamisAliasOnly = [...vamis.aliases.keys()].filter((alias) => !vamis.types.has(alias)).length
const intersect = [...amisAll].filter((type) => vamisAll.has(type))
const missing = [...amisAll].filter((type) => !vamisAll.has(type)).sort()
const extra = [...vamisAll].filter((type) => !amisAll.has(type)).sort()
const missingNames = missing.filter((type) => !amis.aliases.has(type))
const missingAliases = missing.filter((type) => amis.aliases.has(type))

const report = {
  generatedAt: new Date().toISOString().slice(0, 10),
  amis: {
    path: amisRoot,
    version: amisVersion,
    ...(gitInfo(amisRoot) || {}),
    typeNames: amis.types.size,
    aliases: amis.aliases.size,
    aliasOnly: amisAliasOnly,
    typeStrings: amisAll.size,
  },
  vamis: {
    ...(gitInfo(repoRoot) || {}),
    typeNames: vamis.types.size,
    aliases: vamis.aliases.size,
    aliasOnly: vamisAliasOnly,
    typeStrings: vamisAll.size,
  },
  coverage: intersect.length,
  coverageRatio: Number((intersect.length / amisAll.size).toFixed(4)),
  missing,
  missingNames,
  missingAliases,
  extra,
}

if (asJson) {
  console.log(JSON.stringify(report, null, 2))
  process.exit(0)
}

const line = (name, value) => `| ${name} | ${value} |`
console.log(`# amis × vamis type 覆盖（${report.generatedAt}）`)
console.log('')
console.log('| 项 | 值 |')
console.log('|----|----|')
console.log(line('amis 路径', amisRoot))
console.log(line('amis 版本', amisVersion))
if (report.amis.head) console.log(line('amis HEAD', `${report.amis.head} (${report.amis.date}, ${report.amis.branch})`))
if (report.vamis.head) console.log(line('vamis HEAD', `${report.vamis.head} (${report.vamis.date}, ${report.vamis.branch})`))
console.log(line('amis type 名 / 独有别名 / 合计', `${amis.types.size} / ${amisAliasOnly} / ${amisAll.size}`))
console.log(line('vamis 注册 type / 独有别名 / 合计', `${vamis.types.size} / ${vamisAliasOnly} / ${vamisAll.size}`))
console.log(line('交集 / 覆盖率', `${intersect.length} / ${(report.coverageRatio * 100).toFixed(1)}%`))
console.log(line('遗漏 / vamis 扩展', `${missing.length} / ${extra.length}`))
console.log('')
if (amis.aliases.size !== amisAliasOnly) {
  console.log(`> amis 另有 ${amis.aliases.size - amisAliasOnly} 个别名与 type 同名，已计入 type 名。`)
  console.log('')
}
console.log(`## 遗漏（${missing.length}）`)
console.log('')
console.log('| type | amis 出处 | 说明 |')
console.log('|------|-----------|------|')
for (const type of missing) {
  const source = amis.types.get(type) || amis.types.get(amis.aliases.get(type)) || '—'
  const note = amis.aliases.has(type) ? `别名，指向 \`${amis.aliases.get(type)}\`` : '独立 type'
  console.log(`| \`${type}\` | \`${source}\` | ${note} |`)
}
console.log('')
console.log(`## vamis 扩展（${extra.length}）`)
console.log('')
console.log(extra.map((type) => `\`${type}\``).join('、'))
console.log('')
console.log(`> 只比较 type 名称；属性、事件、数据行为是否对齐需人工评估。`)
