import { describe, expect, it } from 'vitest'
import {
  actionActive,
  actionActiveClassName,
  actionActiveLevel,
  actionBlank,
  actionBody,
  actionCopyFormat,
  actionCountDown,
  actionCountDownTpl,
  actionDisabledTip,
  actionHotKey,
  actionIconClass,
  actionIconOnly,
  actionIconSrc,
  actionIsContainer,
  actionKind,
  actionLabel,
  actionLevel,
  actionMailto,
  actionRequiredNames,
  actionSchemaLoading,
  actionShowLabel,
  actionTooltip,
  actionTooltipPlacement,
  countdownRemaining,
  countdownStorageKey,
  fileNameFromUrl,
  matchHotKey,
  parseContentDisposition,
  readCountdownEnd,
  writeCountdownEnd,
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

describe('actionIconOnly', () => {
  it('matches Amis icon && !label && level !== link, plus schema iconOnly', () => {
    expect(actionIconOnly({ icon: 'fa fa-plus', label: '' })).toBe(true)
    expect(actionIconOnly({ icon: 'fa fa-plus' })).toBe(true)
    expect(actionIconOnly({ icon: 'fa fa-plus', label: false })).toBe(true)
    expect(actionIconOnly({ icon: 'fa fa-plus', iconOnly: true, label: '隐藏' })).toBe(true)
    expect(actionShowLabel({ icon: 'fa fa-plus', iconOnly: true, label: '隐藏' })).toBe(false)
    expect(actionIconOnly({ icon: 'fa fa-plus', label: '弹框' })).toBe(false)
    expect(actionIconOnly({ label: '' })).toBe(false)
    expect(actionIconOnly({ icon: 'fa fa-plus', label: '', level: 'link' })).toBe(false)
    expect(actionIconOnly({ icon: 'fa fa-plus', title: '弹框' })).toBe(false)
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
    expect(actionDisabledTip({ disabledTip: '禁用了' })).toBe('禁用了')
    expect(actionTooltipPlacement({ tooltipPlacement: 'right' })).toBe('right')
    expect(actionTooltipPlacement({})).toBe('top')
    expect(actionMailto({ to: 'amis@baidu.com', subject: '这是邮件主题', body: '这是邮件正文' })).toBe(
      'mailto:amis@baidu.com?subject=%E8%BF%99%E6%98%AF%E9%82%AE%E4%BB%B6%E4%B8%BB%E9%A2%98&body=%E8%BF%99%E6%98%AF%E9%82%AE%E4%BB%B6%E6%AD%A3%E6%96%87',
    )
  })
})

describe('countDown / hotKey / body / active / loading', () => {
  it('reads countdown seconds and default tpl', () => {
    expect(actionCountDown({})).toBe(0)
    expect(actionCountDown({ countDown: 60 })).toBe(60)
    expect(actionCountDownTpl({})).toBe('${timeLeft} 秒')
    expect(actionCountDownTpl({ countDownTpl: '${timeLeft} 秒后重发' })).toBe('${timeLeft} 秒后重发')
    expect(countdownRemaining(Date.now() + 3500, Date.now())).toBe(3)
    expect(countdownStorageKey({ name: 'countdown1' }, 'x')).toBe('vamis-countdownend-countdown1')
    const store = new Map<string, string>()
    const fake = {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => void store.set(key, value),
      removeItem: (key: string) => void store.delete(key),
    } as Storage
    writeCountdownEnd('k', 9, fake)
    expect(readCountdownEnd('k', fake)).toBe(9)
    writeCountdownEnd('k', 0, fake)
    expect(readCountdownEnd('k', fake)).toBe(0)
  })

  it('matches Amis-style hotKey combos', () => {
    expect(actionHotKey({ hotKey: 'command+o,ctrl+o' })).toBe('command+o,ctrl+o')
    const ctrlO = { key: 'o', metaKey: false, ctrlKey: true, altKey: false, shiftKey: false, code: 'KeyO' } as KeyboardEvent
    const metaO = { key: 'o', metaKey: true, ctrlKey: false, altKey: false, shiftKey: false, code: 'KeyO' } as KeyboardEvent
    const shiftO = { key: 'o', metaKey: false, ctrlKey: false, altKey: false, shiftKey: true, code: 'KeyO' } as KeyboardEvent
    expect(matchHotKey('command+o,ctrl+o', ctrlO)).toBe(true)
    expect(matchHotKey('command+o,ctrl+o', metaO)).toBe(true)
    expect(matchHotKey('command+o,ctrl+o', shiftO)).toBe(false)
    expect(matchHotKey('shift+enter', { key: 'Enter', metaKey: false, ctrlKey: false, altKey: false, shiftKey: true, code: 'Enter' } as KeyboardEvent)).toBe(true)
  })

  it('treats non-email body as a container', () => {
    expect(actionIsContainer({ body: { type: 'color', value: '#108cee' } })).toBe(true)
    expect(actionBody({ body: { type: 'color', value: '#108cee' } })).toEqual([{ type: 'color', value: '#108cee' }])
    expect(actionIsContainer({ actionType: 'email', body: '邮件正文' })).toBe(false)
    expect(actionBody({ actionType: 'email', body: '邮件正文' })).toEqual([])
  })

  it('reads blank / copyFormat / active / loadingOn / required', () => {
    expect(actionBlank({ blank: true })).toBe(true)
    expect(actionBlank({})).toBe(false)
    expect(actionCopyFormat({})).toBe('text/plain')
    expect(actionCopyFormat({ copyFormat: 'text/html' })).toBe('text/html')
    expect(actionActive({ active: true })).toBe(true)
    expect(actionActiveLevel({ activeLevel: 'primary' })).toBe('primary')
    expect(actionActiveClassName({})).toBe('is-active')
    expect(actionSchemaLoading({ loading: true }, {})).toBe(true)
    expect(actionSchemaLoading({ loadingOn: '${busy}' }, { busy: true })).toBe(true)
    expect(actionSchemaLoading({ loadingOn: '${busy}' }, { busy: false })).toBe(false)
    expect(actionRequiredNames({ required: ['b', 'c'] })).toEqual(['b', 'c'])
  })

  it('parses Content-Disposition and url file names', () => {
    expect(parseContentDisposition('attachment; filename="download.pdf"')).toBe('download.pdf')
    expect(parseContentDisposition("attachment; filename*=UTF-8''%E4%B8%8B%E8%BD%BD.pdf")).toBe('下载.pdf')
    expect(fileNameFromUrl('/api/download/report.csv?x=1')).toBe('report.csv')
    expect(fileNameFromUrl('/api/download')).toBe('download')
  })
})
