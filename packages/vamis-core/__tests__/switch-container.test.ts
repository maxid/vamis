import { describe, expect, it } from 'vitest'
import {
  switchContainerActive,
  switchContainerBody,
  switchContainerItems,
} from '../src/utils/switch-container'

const items = [
  { title: '状态1', body: '状态内容1', visibleOn: '${state == "a"}' },
  { title: '状态2', body: '状态内容2', visibleOn: '${state == "b"}' },
]

describe('switchContainerItems', () => {
  it('reads object items and ignores junk', () => {
    expect(switchContainerItems({})).toEqual([])
    expect(switchContainerItems({ items })).toHaveLength(2)
  })
})

describe('switchContainerActive', () => {
  it('picks the first visible item like Amis', () => {
    expect(switchContainerActive({ items }, { state: 'a' })?.title).toBe('状态1')
    expect(switchContainerActive({ items }, { state: 'b' })?.title).toBe('状态2')
    expect(switchContainerActive({ items }, { state: '' })).toBeUndefined()
  })

  it('falls back to the first item when there is no visibleOn', () => {
    expect(switchContainerActive({ items: [{ title: '状态1', body: '状态内容1' }] }, {})?.title).toBe(
      '状态1',
    )
  })

  it('lets an explicit activeIndex override visibleOn', () => {
    expect(switchContainerActive({ items }, { state: 'a' }, 1)?.title).toBe('状态2')
  })
})

describe('switchContainerBody', () => {
  it('renders the item body', () => {
    expect(switchContainerBody({ body: '状态内容1' })).toEqual(['状态内容1'])
    expect(switchContainerBody({ body: [{ type: 'tpl', tpl: '状态内容1' }] })).toHaveLength(1)
  })
})
