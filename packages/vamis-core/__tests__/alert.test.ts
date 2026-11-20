import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  alertActions,
  alertBody,
  alertIcon,
  alertIconSrc,
  alertLevel,
  alertShowClose,
  alertShowIcon,
  alertTitle,
} from '../src/utils/alert'

describe('alert defaults', () => {
  it('defaults level info / showIcon false / showClose false', () => {
    expect(alertLevel({})).toBe('info')
    expect(alertLevel({ level: 'success' })).toBe('success')
    expect(alertLevel({ level: 'danger' })).toBe('danger')
    expect(alertLevel({ level: 'error' })).toBe('danger')
    expect(alertLevel({ level: 'oops' })).toBe('info')
    expect(alertShowIcon({})).toBe(false)
    expect(alertShowIcon({ showIcon: true })).toBe(true)
    expect(alertShowClose({})).toBe(false)
    expect(alertShowClose({ showCloseButton: true })).toBe(true)
  })

  it('resolves level / showIcon expressions', () => {
    expect(alertLevel({ level: "${IFS(status===1, 'danger', status===2, 'warning')}" }, { status: 1 })).toBe(
      'danger',
    )
    expect(alertLevel({ level: "${IFS(status===1, 'danger', status===2, 'warning')}" }, { status: 2 })).toBe(
      'warning',
    )
    expect(alertShowIcon({ showIcon: '${on}' }, { on: true })).toBe(true)
    expect(alertShowIcon({ showIcon: '${on}' }, { on: false })).toBe(false)
  })

  it('reads title / body / actions / url icon', () => {
    expect(alertTitle({ title: '提示 ${who}' }, { who: '甲' })).toBe('提示 甲')
    expect(alertTitle({})).toBe('')
    expect(alertBody({ body: '文案' })).toEqual(['文案'])
    expect(alertBody({ body: { type: 'tpl', tpl: '节点' } })).toEqual([{ type: 'tpl', tpl: '节点' }])
    expect(alertBody({ msg: '同 body' })).toEqual(['同 body'])
    expect(alertBody({})).toEqual([])
    expect(alertActions({ actions: { type: 'button', label: '详情' } })).toEqual([
      { type: 'button', label: '详情' },
    ])
    expect(alertActions({})).toEqual([])
    expect(alertIconSrc({ icon: '/examples/static/logo.png' })).toBe('/examples/static/logo.png')
    expect(alertIconSrc({ icon: 'info-circle' })).toBe('')
    expect(alertIcon({ icon: 'info-circle' })).toBe('info-circle')
    expect(alertIcon({ icon: 'fa fa-list' })).toBe('fa fa-list')
  })

  it('shares lucide status icons with Toast', () => {
    const here = dirname(fileURLToPath(import.meta.url))
    const alert = readFileSync(resolve(here, '../../vamis/src/renderers/Alert.vue'), 'utf8')
    const toast = readFileSync(resolve(here, '../../vamis/src/ToastMessage.vue'), 'utf8')
    const ui = readFileSync(resolve(here, '../../vamis-ui/src/ui/alert/index.ts'), 'utf8')
    expect(ui).toContain('export function levelToFeedbackIcon')
    expect(alert).toContain('levelToFeedbackIcon')
    expect(toast).toContain('levelToFeedbackIcon')
  })

  it('uses the Amis Alert flex/content box and neutral warning text', () => {
    const here = dirname(fileURLToPath(import.meta.url))
    const alert = readFileSync(resolve(here, '../../vamis/src/renderers/Alert.vue'), 'utf8')
    const styles = readFileSync(resolve(here, '../../vamis-ui/src/styles.css'), 'utf8')
    expect(alert).toContain(':data-variant="variant"')
    expect(alert).toContain('vamis-alert__content')
    expect(alert).toContain('resolveClassName(props.schema.className')
    expect(alert).toContain(':class="[rootClass,')
    expect(alert).toContain('VAMIS_ICONS')
    expect(alert).toContain('resolveIcon(icon.value)')
    expect(alert).toContain('<IconMark')
    expect(alert).not.toContain("showClose ? 'pr-8'")
    expect(styles).toContain('.vamis-alert[data-variant=\'warning\']')
    expect(styles).toContain('.vamis-alert__content')
    expect(styles).toContain('color: var(--colors-neutral-text-2)')
    expect(styles).toContain('font-size: var(--fontSizeSm)')
    expect(styles).toMatch(
      /\.vamis-alert__icon \{\s*display: flex;\s*width: var\(--fontSizeLg\);\s*height: var\(--gap-xl\);\s*flex: 0 0 auto;\s*align-items: center;\s*justify-content: center;/,
    )
    expect(styles).toContain('.vamis-alert__icon:not(.vamis-alert__icon--custom)')
    expect(styles).toContain('@layer components {\n  /* 默认跟 Amis 的 Alert margin token')
    expect(styles).toContain('  .vamis-alert {\n    margin-bottom: var(--gap-md);\n  }')
    expect(styles).toMatch(
      /\.vamis-alert--has-title \.vamis-alert__content \[data-slot='alert-title'\] \{\s*line-height: 22px;/,
    )
    expect(styles).toMatch(
      /\.vamis-alert--has-title \.vamis-alert__content \[data-slot='alert-description'\] \{\s*line-height: 20px;/,
    )
    expect(styles.indexOf(".vamis-alert .vamis-alert__content [data-slot='alert-description']")).toBeLessThan(
      styles.indexOf(".vamis-alert--has-title .vamis-alert__content [data-slot='alert-description']"),
    )

    const website = readFileSync(resolve(here, '../../../website/src/components/alert.md'), 'utf8')
    const examples = [...website.matchAll(/```schema[^\n]*\n([\s\S]*?)```/g)].map((match) =>
      JSON.parse(match[1].trim()),
    )
    expect(examples).toHaveLength(5)
    expect(examples[0]).toHaveLength(8)
    expect(examples[1]).toHaveLength(10)
    expect(examples[1][8]).toMatchObject({ icon: 'info-circle', className: 'mb-1' })
    expect(examples[1][9]).toMatchObject({ icon: 'fa fa-list' })
    expect(examples[2]).toMatchObject({ type: 'page', data: { status: 1 } })
    expect(examples[3]).toHaveLength(2)
    expect(examples[4]).toHaveLength(2)
    expect(examples[4][0].actions[0].style).toMatchObject({ top: '25px', left: '30px' })
    expect(examples[4][1].actions).toMatchObject({
      type: 'flex',
      style: { padding: '6px' },
    })
    expect(examples[4][1].actions.items[0].style).toMatchObject({ marginBottom: '5px' })
    expect(website).not.toMatch(/\|\s*版本\s*\||`\d+\.\d+\.\d+`/)
  })
})
