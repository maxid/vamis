import { describe, expect, it } from 'vitest'
import {
  appBrandName,
  appDefaultPage,
  appNav,
  appNotFoundPage,
  appSlot,
} from '../src/utils/app'

const pages = [
  {
    label: '分组1',
    children: [
      {
        label: '父页面',
        url: '/parent',
        children: [
          {
            label: '子页面',
            url: 'pageA',
            schema: { type: 'page', body: 'Page A' },
          },
        ],
      },
      {
        label: '隐藏页',
        visible: false,
        schema: { type: 'page', body: 'hidden' },
      },
      {
        label: '外链',
        link: 'https://example.com',
      },
      {
        label: '404',
        isDefaultPage: true,
        schema: { type: 'page', body: 'not found' },
      },
    ],
  },
]

describe('appNav', () => {
  it('joins relative urls and drops visible:false from the menu', () => {
    const nav = appNav({ pages })
    expect(nav).toHaveLength(1)
    expect(nav[0].label).toBe('分组1')
    const kids = nav[0].children
    expect(kids.map((item) => item.label)).toEqual(['父页面', '外链', '404'])
    expect(kids[0].children[0].key).toBe('/parent/pageA')
    expect(kids[0].children[0].schema).toEqual({ type: 'page', body: 'Page A' })
    expect(kids[1].link).toBe('https://example.com')
  })

  it('interpolates brand and labels', () => {
    expect(appBrandName({ brandName: '${name} 应用' }, { name: 'Vamis' })).toBe('Vamis 应用')
    const nav = appNav({ pages: [{ label: '欢迎 ${name}', schema: { type: 'page', body: 'hi' } }] }, { name: 'Ada' })
    expect(nav[0].label).toBe('欢迎 Ada')
  })
})

describe('appDefaultPage / appNotFoundPage', () => {
  it('uses the first schema leaf as home and isDefaultPage as 404', () => {
    const nav = appNav({ pages })
    expect(appDefaultPage(nav)?.label).toBe('子页面')
    expect(appNotFoundPage(nav)?.label).toBe('404')
  })
})

describe('appSlot', () => {
  it('reads header / asideBefore / asideAfter / footer', () => {
    expect(appSlot({ header: { type: 'tpl', tpl: '顶' } }, 'header')).toEqual([{ type: 'tpl', tpl: '顶' }])
    expect(appSlot({ footer: '页脚' }, 'footer')).toEqual(['页脚'])
    expect(appSlot({}, 'asideBefore')).toEqual([])
  })
})
