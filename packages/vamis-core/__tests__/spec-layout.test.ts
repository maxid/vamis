import { readdirSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const here = dirname(fileURLToPath(import.meta.url))
const repo = resolve(here, '../../..')
const specsRoot = resolve(repo, 'docs/superpowers/specs')
const componentRoot = resolve(specsRoot, 'component')

const GLOBAL_SPECS = [
  '2026-10-20-amis-sync-status.md',
  '2026-10-20-vamis-component-deps.md',
  '2026-10-20-vamis-component-todo.md',
  '2026-10-20-vamis-runtime-semantics-design.md',
  '2026-10-20-vamis-vue3-runtime-design.md',
  '2026-10-21-vamis-js-sdk.md',
  '2026-10-21-vamis-online-docs.md',
  '2026-10-21-vamis-style-system.md',
  '2026-10-21-vamis-theme-shadcn.md',
  '2026-10-24-sdk-compare-report.md',
  '2026-11-15-vamis-style-standard.md',
]

const COMPONENT_CATEGORIES = new Set([
  'layout',
  'functional',
  'form',
  'display',
  'feedback',
  'other',
])

function filesBelow(dir: string, root = dir): string[] {
  const out: string[] = []
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) out.push(...filesBelow(full, root))
    else out.push(relative(root, full).split('\\').join('/'))
  }
  return out.sort()
}

describe('superpowers spec layout', () => {
  it('keeps only approved cross-component specs at the root', () => {
    const rootSpecs = readdirSync(specsRoot, { withFileTypes: true })
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)
      .sort()

    // 新增根目录 spec 时必须先证明它跨组件，再显式更新这份白名单。
    expect(rootSpecs).toEqual(GLOBAL_SPECS)
  })

  it('keeps component specs in supported dated category folders', () => {
    const files = filesBelow(componentRoot)
    const misplaced = files.filter((file) => file.split('/').length !== 2)
    const unsupported = files.filter(
      (file) => file.split('/').length === 2 && !COMPONENT_CATEGORIES.has(file.split('/')[0]),
    )
    const badlyNamed = files.filter(
      (file) => !/^\d{4}-\d{2}-\d{2}-[a-z0-9][a-z0-9-]*\.md$/.test(file.split('/').at(-1) || ''),
    )

    expect(misplaced).toEqual([])
    expect(unsupported).toEqual([])
    expect(badlyNamed).toEqual([])
  })
})
