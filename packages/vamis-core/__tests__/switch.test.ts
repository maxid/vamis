import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const here = dirname(fileURLToPath(import.meta.url))
const css = readFileSync(resolve(here, '../../vamis-ui/src/styles.css'), 'utf8')
const vue = readFileSync(resolve(here, '../../vamis/src/renderers/form/Switch.vue'), 'utf8')
const doc = readFileSync(resolve(here, '../../../website/src/components/form/switch.md'), 'utf8')

describe('switch chrome', () => {
  it('tokens follow Amis 44×20 track / 16 thumb + 2px margin / 30 radius', () => {
    expect(css).toContain('--switch-height: 20px')
    expect(css).toContain('--switch-width: 44px')
    expect(css).toContain('--switch-radius: 30px')
    expect(css).toContain('--switch-thumb-size: 16px')
    expect(css).toContain('--switch-thumb-margin: 2px')
    expect(css).toContain('--switch-checked-hover-bg: #144bcc')
    expect(css).toContain('--switch-sm-height: 16px')
    expect(css).toContain('--switch-sm-width: 28px')
    expect(css).toContain('--switch-sm-thumb-size: 12px')
    expect(css).toMatch(/\.vamis-switch \{[^}]*display: inline-block/)
    expect(css).toMatch(/\.vamis-switch__input \{[^}]*opacity: 0/)
    expect(css).toContain('.vamis-switch-option')
  })

  it('dark theme overrides the same switch tokens', () => {
    const dark = css.slice(css.indexOf('.dark {'))
    expect(dark).toContain('--switch-bg: #84878c')
    expect(dark).toContain('--switch-thumb-bg: #f7f8fa')
    expect(dark).toContain('--switch-checked-hover-bg: var(--primary-hover)')
  })

  it('form switch keeps a native checkbox, no shadcn Switch / RadioGroup skin', () => {
    expect(vue).toContain('checkboxIsChecked')
    expect(vue).toContain('checkboxWriteValue')
    expect(vue).toContain('type="checkbox"')
    expect(vue).toContain('vamis-switch__slider')
    expect(vue).toContain('vamis-switch__spinner')
    expect(vue).toContain('loadingOn')
    expect(vue).toContain('optionAtLeft')
    expect(vue).toContain('getValue: () => current.value')
    expect(vue).not.toContain("from '@vamis/ui'")
    expect(vue).not.toContain('SwitchRoot')
  })

  it('doc covers the Amis switch chapters', () => {
    for (const heading of [
      '## 基本用法',
      '## 禁用状态',
      '## 配置真假值',
      '## 配置开启和关闭状态的文本',
      '## 默认值',
      '## 不同尺寸',
      '## 加载状态',
      '## 属性表',
      '## 事件表',
      '## 动作表',
    ]) {
      expect(doc).toContain(heading)
    }
    expect(doc).toContain('trueValue')
    expect(doc).toContain('loadingOn')
    expect(doc).toContain('componentId: clear_text')
    expect(doc).toContain('componentId: u:6613bfa3a18e')
    expect(doc).toContain('loadingOn: "${isFetching}"')
  })
})
