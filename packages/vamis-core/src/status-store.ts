/** 对齐 Amis `statusStore`：动作 `static` / `nonstatic` 按 id / name 覆盖 schema。 */

import { reactive } from 'vue'

const state = reactive({
  staticState: {} as Record<string, boolean>,
})

function keyOf(value: unknown): string {
  return typeof value === 'string' ? value : value == null ? '' : String(value)
}

export function setStatusStatic(key: unknown, value: boolean): void {
  const id = keyOf(key)
  if (!id) return
  state.staticState[id] = value
}

export function statusStaticOf(schema: { id?: unknown; name?: unknown } | null | undefined): boolean | undefined {
  if (!schema) return undefined
  const id = keyOf(schema.id)
  const name = keyOf(schema.name)
  // 必须直接读 `staticState[key]`：hasOwnProperty 不会建立 Vue 依赖，
  // 动作后才写入的 key 否则不会让 FormItem computed 重跑。
  if (id) {
    const value = state.staticState[id]
    if (typeof value === 'boolean') return value
  }
  if (name) {
    const value = state.staticState[name]
    if (typeof value === 'boolean') return value
  }
  return undefined
}

export function resetStatusStore(): void {
  state.staticState = {}
}
