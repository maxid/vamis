import { describe, expect, it } from 'vitest'
import {
  spinnerBody,
  spinnerDelay,
  spinnerIconSrc,
  spinnerOverlay,
  spinnerShow,
  spinnerSize,
  spinnerTip,
  spinnerTipPlacement,
} from '../src/utils/spinner'
import { schemaNodeDisplayClass } from '../src/style'

describe('spinner defaults', () => {
  it('defaults show true / size empty / overlay false / tip bottom / delay 0', () => {
    expect(spinnerShow({})).toBe(true)
    expect(spinnerShow({ show: false })).toBe(false)
    expect(spinnerShow({ showOn: '${ok}' }, { ok: true })).toBe(true)
    expect(spinnerShow({ showOn: '${ok}' }, { ok: false })).toBe(false)
    expect(spinnerSize({})).toBe('')
    expect(spinnerSize({ size: 'sm' })).toBe('sm')
    expect(spinnerSize({ size: 'lg' })).toBe('lg')
    expect(spinnerSize({ size: 'md' })).toBe('')
    expect(spinnerOverlay({})).toBe(false)
    expect(spinnerOverlay({ overlay: true })).toBe(true)
    expect(spinnerTipPlacement({})).toBe('bottom')
    expect(spinnerTipPlacement({ tipPlacement: 'left' })).toBe('left')
    expect(spinnerDelay({})).toBe(0)
    expect(spinnerDelay({ delay: 1000 })).toBe(1000)
  })

  it('reads tip / body / url icon', () => {
    expect(spinnerTip({ tip: '加载中 ${who}' }, { who: '甲' })).toBe('加载中 甲')
    expect(spinnerTip({})).toBe('')
    expect(spinnerBody({ body: { type: 'tpl', tpl: '内容' } })).toEqual([{ type: 'tpl', tpl: '内容' }])
    expect(spinnerBody({})).toEqual([])
    expect(spinnerIconSrc({ icon: '/examples/static/logo.png' })).toBe('/examples/static/logo.png')
    expect(spinnerIconSrc({ icon: 'reload' })).toBe('')
    expect(spinnerIconSrc({})).toBe('')
  })

  it('keeps bare spinner inline-block and container spinner as a block slot', () => {
    expect(schemaNodeDisplayClass({ type: 'spinner' })).toBe('inline-block')
    expect(schemaNodeDisplayClass({ type: 'spinner', body: { type: 'tpl', tpl: 'x' } })).toBe('')
  })
})
