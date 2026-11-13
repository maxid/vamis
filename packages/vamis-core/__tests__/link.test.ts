import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const here = dirname(fileURLToPath(import.meta.url))
const read = (rel: string) => readFileSync(resolve(here, rel), 'utf8')

describe('link', () => {
  it('supports href/target/disabled/icon and badge', () => {
    const vue = read('../../vamis/src/renderers/Link.vue')
    for (const token of ['htmlTarget', 'rightIcon', 'disabled', 'BadgeHost', 'resolveIcon', 'filterTpl', 'is-disabled']) {
      expect(vue).toContain(token)
    }
    expect(vue).not.toContain('hover:underline')
    expect(vue).not.toContain('text-muted-foreground')
    const css = read('../../vamis-ui/src/styles.css')
    expect(css).toContain('--link-disabled-color')
    expect(css).toContain('--link-color: var(--primary)')
    expect(css).toContain('--link-hover-color: #528eff')
    expect(css).toContain('oklch(from var(--primary) calc(l + 0.16) c h)')
    expect(css).toContain('.vamis-link.is-disabled')
    const doc = read('../../../website/src/components/link.md')
    for (const heading of ['## 基本用法', '## 新标签页打开', '## 禁用超链接', '## 添加图标', '## 属性表', '## 和 Amis 文档的差异']) {
      expect(doc).toContain(heading)
    }
    expect(doc).toContain('htmlTarget')
    expect(doc).toContain('rightIcon')
  })
})
