import { describe, expect, it } from 'vitest'
import { serviceRemoteSchema } from '../src/utils/service'

describe('serviceRemoteSchema', () => {
  it('treats schemaApi data as a widget tree', () => {
    expect(serviceRemoteSchema({ type: 'tabs', tabs: [{ title: 'TabA', body: '卡片A内容' }] })).toEqual([
      { type: 'tabs', tabs: [{ title: 'TabA', body: '卡片A内容' }] },
    ])
    expect(serviceRemoteSchema({ body: { type: 'tpl', tpl: '动态' } })).toEqual([{ type: 'tpl', tpl: '动态' }])
    expect(serviceRemoteSchema([{ type: 'tpl', tpl: '列表' }])).toHaveLength(1)
    expect(serviceRemoteSchema({})).toEqual([])
  })
})
