import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { buttonGroupButtons } from '../src/utils/button-group'

const here = dirname(fileURLToPath(import.meta.url))
const read = (rel: string) => readFileSync(resolve(here, rel), 'utf8')

describe('button-group', () => {
  it('has seam styles and doc property rows', () => {
    const vue = read('../../vamis/src/renderers/ButtonGroup.vue')
    const css = read('../../vamis-ui/src/styles.css')
    expect(vue).toContain('data-vamis-button-group')
    expect(vue).toContain('is-vertical')
    expect(css).toContain('[data-vamis-button-group] > .vamis-node + .vamis-node')
    expect(css).toContain('margin-left: -1px')
    expect(css).toContain('z-index: 1')
    expect(css).toContain('border-top-right-radius: 0')
    const doc = read('../../../website/src/components/button-group.md')
    expect(doc).toContain('btnActiveLevel')
    expect(doc).toContain('## 属性表')
    expect(doc).toContain('百度一下')
    expect(doc).toContain('"label": "按钮1"')
  })

  it('fills btnLevel unless the button has its own level', () => {
    const buttons = buttonGroupButtons({
      type: 'button-group',
      btnLevel: 'light',
      buttons: [
        { type: 'button', label: '按钮1' },
        { type: 'button', label: '按钮3', level: 'primary' },
      ],
    })
    expect(buttons[0]?.level).toBe('light')
    expect(buttons[1]?.level).toBe('primary')
  })
})
