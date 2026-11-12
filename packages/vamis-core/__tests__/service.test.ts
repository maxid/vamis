import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const here = dirname(fileURLToPath(import.meta.url))
const read = (rel: string) => readFileSync(resolve(here, rel), 'utf8')

describe('service', () => {
  it('supports polling and lifecycle events', () => {
    const vue = read('../../vamis/src/renderers/Service.vue')
    for (const token of ['startPolling', 'silentPolling', 'stopAutoRefreshWhen', "emitServiceEvent('init'", "emitServiceEvent('fetchInited'", "emitServiceEvent('fetchSchemaInited'", 'showErrorMsg']) {
      expect(vue).toContain(token)
    }
  })
  it('doc covers service chapters', () => {
    const doc = read('../../../website/src/components/service.md')
    for (const heading of ['## 基本使用', '## 展示列表', '## 定时轮询刷新', '### 静默轮询', '## 隐藏错误信息', '## 属性表', '## 事件表', '## 动作表']) {
      expect(doc).toContain(heading)
    }
  })
})
