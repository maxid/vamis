import { describe, expect, it } from 'vitest'
import {
  portletDescription,
  portletDivider,
  portletHideHeader,
  portletMountOnEnter,
  portletToolbarItems,
} from '../src/utils/portlet'

describe('portletHideHeader / portletDivider', () => {
  it('hides header only when set, and keeps a divider by default', () => {
    expect(portletHideHeader({})).toBe(false)
    expect(portletHideHeader({ hideHeader: true })).toBe(true)
    expect(portletDivider({})).toBe(true)
    expect(portletDivider({ divider: false })).toBe(false)
  })
})

describe('portletDescription', () => {
  it('filters the description template', () => {
    expect(portletDescription({ description: '${text}' }, { text: '这是一段描述信息' })).toBe(
      '这是一段描述信息',
    )
    expect(portletDescription({})).toBe('')
  })
})

describe('portletMountOnEnter', () => {
  it('defaults to false unlike Tabs', () => {
    expect(portletMountOnEnter({})).toBe(false)
    expect(portletMountOnEnter({ mountOnEnter: true })).toBe(true)
  })
})

describe('portletToolbarItems', () => {
  it('fills type button, level link, size sm like Amis', () => {
    const items = portletToolbarItems([{ label: '固定操作' }])
    expect(items[0]).toMatchObject({ type: 'button', level: 'link', size: 'sm', label: '固定操作' })
    expect(portletToolbarItems([{ type: 'dropdown-button', label: '更多' }])[0].type).toBe(
      'dropdown-button',
    )
  })
})
