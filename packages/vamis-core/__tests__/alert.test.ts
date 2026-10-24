import { describe, expect, it } from 'vitest'
import {
  alertActions,
  alertBody,
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
  })
})
