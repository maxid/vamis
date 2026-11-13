import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { serviceRemoteSchema } from '../src/utils/service'

const here = dirname(fileURLToPath(import.meta.url))
const read = (rel: string) => readFileSync(resolve(here, rel), 'utf8')

describe('service', () => {
  it('supports polling and lifecycle events', () => {
    const vue = read('../../vamis/src/renderers/Service.vue')
    for (const token of [
      'startPolling',
      'silentPolling',
      'stopAutoRefreshWhen',
      "emitServiceEvent('init'",
      "emitServiceEvent('fetchInited'",
      "emitServiceEvent('fetchSchemaInited'",
      'showErrorMsg',
      'rebuild',
      'setData',
      'data-vamis-service',
    ]) {
      expect(vue).toContain(token)
    }
    expect(vue).not.toContain('space-y-3')
  })
  it('schemaApi controls become form items', () => {
    expect(serviceRemoteSchema({ type: 'tabs', tabs: [{ title: 'A' }] })).toEqual([
      { type: 'tabs', tabs: [{ title: 'A' }] },
    ])
    expect(
      serviceRemoteSchema({
        controls: [
          { type: 'input-text', name: 'name' },
          { type: 'input-text', name: 'author' },
        ],
      }),
    ).toEqual([
      { type: 'input-text', name: 'name' },
      { type: 'input-text', name: 'author' },
    ])
  })
  it('doc covers service chapters', () => {
    const doc = read('../../../website/src/components/service.md')
    for (const heading of [
      '## 基本使用',
      '## 展示列表',
      '## 动态渲染页面',
      '## 动态渲染表单项',
      '## 接口联动',
      '## 定时轮询刷新',
      '### 静默轮询',
      '## 通过 WebSocket 实时获取数据',
      '## 调用外部函数获取数据',
      '## 隐藏错误信息',
      '## 属性表',
      '## 事件表',
      '## 动作表',
      '### rebuild',
    ]) {
      expect(doc).toContain(heading)
    }
  })
})
