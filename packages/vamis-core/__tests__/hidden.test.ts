import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { applyFormItemDefaults, clearHiddenFormValues } from '../src/utils/form-item'

const here = dirname(fileURLToPath(import.meta.url))
const read = (rel: string) => readFileSync(resolve(here, rel), 'utf8')

describe('hidden renderer', () => {
  it('registers Amis wrap:false and keeps no DOM', () => {
    const register = read('../../vamis/src/register.ts')
    expect(register).toMatch(/type: 'hidden'[^\n]*wrap: false/)
    const vue = read('../../vamis/src/renderers/form/Hidden.vue')
    expect(vue).not.toContain('<input')
    expect(vue).not.toContain(':name=')
    const renderer = read('../src/SchemaRenderer.vue')
    expect(renderer).toContain('wrap !== false')
    expect(renderer).toContain('!rendererWrap')
  })

  it('seeds form data through path names and honors clearValueOnHidden', () => {
    const data = applyFormItemDefaults(
      [
        { type: 'hidden', name: 'id', value: 1 },
        { type: 'hidden', name: 'meta.token', value: 't' },
      ],
      {},
    )
    expect(data.id).toBe(1)
    expect(data.meta.token).toBe('t')

    const hidden = { type: 'hidden', name: 'meta.token', clearValueOnHidden: true, hiddenOn: '${hide}' }
    const values = { meta: { token: 't' }, hide: true }
    expect(clearHiddenFormValues([hidden], values)).toEqual(['meta.token'])
    expect(values.meta.token).toBeUndefined()
  })

  it('doc covers the Amis hidden chapters', () => {
    const doc = read('../../../website/src/components/form/hidden.md')
    for (const heading of ['## 基本用法', '## 属性表', '## 事件表', '## 动作表', '## 和 Amis 文档的差异']) {
      expect(doc).toContain(heading)
    }
    expect(doc).toContain('type: hidden')
    expect(doc).toContain('input-email')
    expect(doc).toContain('实现进度 100%')
    expect(doc).toContain('wrap: false')
  })
})
