import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
const here = dirname(fileURLToPath(import.meta.url))
const read = (rel: string) => readFileSync(resolve(here, rel), 'utf8')
describe('tag', () => {
  it('supports close/check events, status icon and doc chapters', () => {
    const vue = read('../../vamis/src/renderers/rest/Tag.vue')
    for (const t of [
      'closable',
      'checkable',
      "emitTagEvent('close'",
      "emitTagEvent('click'",
      'VamisClose',
      'resolveIcon',
      'vamis-tag-default-icon',
      'vamis-tag-dot-wave',
    ])
      expect(vue).toContain(t)
    expect(vue).not.toContain('closed.value = true')
    const host = read('../src/SchemaRenderer.vue')
    expect(host).toContain("'tag'")
    const css = read('../../vamis-ui/src/styles.css')
    expect(css).toContain('.vamis-node:has(> .vamis-tag):not(:last-child)')
    expect(css).toContain('--tag-close-size: 8px')
    expect(css).toContain('color: var(--tag-on-color)')
    expect(css).toContain('--tag-active: var(--colors-brand-5)')
    expect(css).toContain('--tag-processing: var(--colors-brand-6)')
    expect(css).toContain('--tag-success: var(--colors-success-5)')
    expect(css).toContain('--tag-error: var(--colors-error-5)')
    expect(css).toContain('--tag-warning: var(--colors-warning-5)')
    expect(css).toContain('--tag-inactive: var(--colors-neutral-fill-6)')
    const themes = read('../../vamis-ui/src/themes.css')
    expect(themes).toContain('[data-theme="antd"]')
    expect(themes).toContain('[data-theme="ang"]')
    const doc = read('../../../website/src/components/tag.md')
    for (const h of [
      '## 基本用法',
      '## 不同的模式',
      '## 标签颜色',
      '## 自定义样式',
      '## 属性表',
      '## 事件表',
      '### click',
      '### mouseenter',
      '### mouseleave',
      '### close',
    ])
      expect(doc).toContain(h)
    expect(doc).not.toContain('## 可关闭 / 可选')
    expect(doc).toContain('`icon`')
    expect(doc).toContain('`closeIcon`')
  })
})
