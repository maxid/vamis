import { describe, expect, it } from 'vitest'
import {
  actionIconClass,
  actionIconSrc,
  actionKind,
  actionLabel,
  actionLevel,
  actionMailto,
  actionShowLabel,
  actionTooltip,
} from '../src/utils/action'

describe('actionKind / actionLevel', () => {
  it('defaults type button and maps primary to level', () => {
    expect(actionKind({})).toBe('button')
    expect(actionKind({ type: 'submit' })).toBe('submit')
    expect(actionKind({ actionType: 'dialog' })).toBe('dialog')
    expect(actionLevel({})).toBe('')
    expect(actionLevel({ level: 'danger' })).toBe('danger')
    expect(actionLevel({ primary: true })).toBe('primary')
    expect(actionLevel({ primary: true, level: 'info' })).toBe('info')
  })
})

describe('actionLabel', () => {
  it('keeps an empty label and interpolates templates', () => {
    expect(actionLabel({ label: '弹框' })).toBe('弹框')
    expect(actionLabel({ title: '弹框' })).toBe('弹框')
    expect(actionLabel({ label: '' })).toBe('')
    expect(actionShowLabel({ label: '' })).toBe(false)
    expect(actionLabel({ label: 'hi ${name}' }, { name: 'Ada' })).toBe('hi Ada')
  })

  it('does not invent 按钮 when label is omitted', () => {
    expect(actionLabel({})).toBe('')
    expect(actionShowLabel({})).toBe(false)
    expect(actionLabel({ icon: 'fa fa-eye' })).toBe('')
    expect(actionShowLabel({ icon: 'fa fa-eye' })).toBe(false)
    expect(actionShowLabel({ icon: 'fa fa-eye', label: '查看详情' })).toBe(true)
    expect(actionShowLabel({ title: '弹框' })).toBe(true)
  })
})

describe('actionIconSrc / actionIconClass', () => {
  it('treats a path as url and fa as class', () => {
    expect(actionIconSrc({ icon: 'https://suda.cdn.bcebos.com/diamond.svg' })).toBe(
      'https://suda.cdn.bcebos.com/diamond.svg',
    )
    expect(actionIconSrc({ icon: 'fa fa-plus' })).toBe('')
    expect(actionIconClass({ icon: 'fa fa-plus' })).toBe('fa fa-plus')
    expect(actionIconClass({ icon: 'https://example.com/a.svg' })).toBe('')
    expect(actionIconSrc({ icon: 'plus.png' })).toBe('plus.png')
    expect(actionIconClass({ icon: 'plus.png' })).toBe('')
  })
})

describe('actionTooltip / actionMailto', () => {
  it('reads tooltip content and builds mailto', () => {
    expect(actionTooltip({ tooltip: '点击链接跳转' })).toBe('点击链接跳转')
    expect(actionTooltip({ tooltip: { content: '点我' } })).toBe('点我')
    expect(actionMailto({ to: 'amis@baidu.com', subject: '这是邮件主题', body: '这是邮件正文' })).toBe(
      'mailto:amis@baidu.com?subject=%E8%BF%99%E6%98%AF%E9%82%AE%E4%BB%B6%E4%B8%BB%E9%A2%98&body=%E8%BF%99%E6%98%AF%E9%82%AE%E4%BB%B6%E6%AD%A3%E6%96%87',
    )
  })
})
