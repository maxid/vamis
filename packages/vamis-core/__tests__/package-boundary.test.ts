import { readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

// 包分工的硬边界。口径见 .cursor/rules/packages.mdc。
const here = dirname(fileURLToPath(import.meta.url))
const packagesDir = resolve(here, '../..')

function sourceFiles(dir: string): string[] {
  const out: string[] = []
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === 'dist') continue
    const full = join(dir, name)
    if (statSync(full).isDirectory()) out.push(...sourceFiles(full))
    else if (/\.(ts|vue|mjs)$/.test(name)) out.push(full)
  }
  return out
}

/** 每个包 src 里出现过的 workspace 包名（import / export from / 动态 import）。 */
function workspaceImports(pkg: string): Map<string, string[]> {
  const found = new Map<string, string[]>()
  const src = join(packagesDir, pkg, 'src')
  const pattern = /(?:from|import)\s*\(?\s*['"](@vamis\/[a-z-]+|vamis)(?:\/[^'"]*)?['"]/g
  for (const file of sourceFiles(src)) {
    const text = readFileSync(file, 'utf8')
    for (const match of text.matchAll(pattern)) {
      const list = found.get(match[1]) ?? []
      list.push(relative(packagesDir, file))
      found.set(match[1], list)
    }
  }
  return found
}

function expectOnly(pkg: string, self: string, allowed: string[]) {
  const imports = workspaceImports(pkg)
  imports.delete(self)
  const extra = [...imports.keys()].filter(name => !allowed.includes(name))
  expect(extra.map(name => `${name} <- ${imports.get(name)![0]}`)).toEqual([])
}

describe('package boundaries', () => {
  it('@vamis/formula depends on no workspace package', () => {
    expectOnly('vamis-formula', '@vamis/formula', [])
  })

  it('@vamis/core depends only on @vamis/formula', () => {
    expectOnly('vamis-core', '@vamis/core', ['@vamis/formula'])
  })

  it('@vamis/ui depends on no workspace package', () => {
    expectOnly('vamis-ui', '@vamis/ui', [])
  })

  it('vamis depends only on core / ui / formula', () => {
    expectOnly('vamis', 'vamis', ['@vamis/core', '@vamis/ui', '@vamis/formula'])
  })

  it('@vamis/ui does not ship shadcn recipes that Amis types replace', () => {
    const index = readFileSync(join(packagesDir, 'vamis-ui/src/index.ts'), 'utf8')
    const pkg = readFileSync(join(packagesDir, 'vamis-ui/package.json'), 'utf8')
    // Toast 走 @vamis/core 的 store + ToastHost；Tooltip 走 VamisTooltipLayer。
    expect(index).not.toMatch(/ui\/(sonner|tooltip)'/)
    expect(pkg).not.toContain('vue-sonner')
  })

  it('renderers carry no <style> block', () => {
    // Amis 的组件样式全在 amis-ui/scss；Vamis 的默认皮肤同样只有 @vamis/ui 的 styles.css 一个家。
    const src = join(packagesDir, 'vamis/src')
    const withStyle = sourceFiles(src)
      .filter(file => file.endsWith('.vue') && /<style[\s>]/.test(readFileSync(file, 'utf8')))
      .map(file => relative(src, file).split('\\').join('/'))
      .sort()
    expect(withStyle).toEqual([])
  })

  it('chrome SVG icons live in @vamis/ui, not next to renderers', () => {
    const src = join(packagesDir, 'vamis/src')
    const strays = sourceFiles(src)
      .map(file => relative(src, file).split('\\').join('/'))
      .filter(file => /(^|\/)[A-Za-z]*Icon\.vue$/.test(file))
    // Icon.vue 是 `type: icon` 渲染器，不是图标资源。
    expect(strays.filter(file => file !== 'renderers/Icon.vue')).toEqual([])
  })
})
