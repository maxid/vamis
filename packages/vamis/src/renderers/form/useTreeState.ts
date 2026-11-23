/** InputTree / TreeSelect / Select tree mode 共用：展开与节点懒加载。 */

import { computed, ref, type Ref } from 'vue'
import {
  createVamisEvent,
  eventEvalData,
  findOption,
  isEffectiveApi,
  isOptionsVariableSource,
  isTreeNodeDefaultExpanded,
  optionNeedsDefer,
  optionValuesEqual,
  optionsDeferField,
  optionsFromPayload,
  requestApi,
  resolveDeferredOption,
  runOnEvent,
  useData,
  useEnv,
  useFormApi,
  useOverlay,
  useScope,
  useScoped,
  type OptionItem,
  type SchemaApi,
  type SchemaObject,
} from '@vamis/core'

export interface TreeStateContext {
  schema: Ref<SchemaObject>
  nodes: Ref<OptionItem[]>
  setNodes: (nodes: OptionItem[]) => void
  disabled?: Ref<boolean | undefined>
  query?: Ref<string>
  currentValue?: () => unknown
}

export function useTreeState(context: TreeStateContext) {
  const data = useData()
  const env = useEnv()
  const scoped = useScoped()
  const overlay = useOverlay()
  const formApi = useFormApi()
  const scope = useScope()
  const expanded = ref(new Map<string, boolean>())
  const deferring = ref(new Set<string>())
  const inFlight = new Map<string, Promise<OptionItem | undefined>>()
  const deferField = computed(() => optionsDeferField(context.schema.value))

  function nodePath(nodes: OptionItem[], item: OptionItem, valueField: string, prefix = ''): string | null {
    for (let index = 0; index < nodes.length; index += 1) {
      const node = nodes[index]
      const sameValue =
        item.value !== undefined &&
        node.value !== undefined &&
        optionValuesEqual(node.value, item.value, valueField)
      const sameLabel = item.value === undefined && node.value === undefined && node.label === item.label
      if (node === item || sameValue || sameLabel) return `${prefix}${index}`
      if (node.children?.length) {
        const child = nodePath(node.children, item, valueField, `${prefix}${index}.`)
        if (child) return child
      }
    }
    return null
  }

  function nodeKey(item: OptionItem) {
    const valueField = String(context.schema.value.valueField || 'value')
    return nodePath(context.nodes.value, item, valueField) ?? `label:${item.label}`
  }

  function optionDefaultExpanded(item: OptionItem, depth: number, initiallyOpen: boolean, unfoldedLevel: number) {
    if (item.unfolded !== undefined) return item.unfolded !== false
    if (item.collapsed !== undefined) return item.collapsed === false
    return isTreeNodeDefaultExpanded(depth, { initiallyOpen, unfoldedLevel })
  }

  function seedExpanded(nodes: OptionItem[]) {
    const next = new Map<string, boolean>()
    const initiallyOpen = context.schema.value.initiallyOpen !== false
    const unfoldedLevelRaw = Number(context.schema.value.unfoldedLevel)
    const unfoldedLevel =
      Number.isFinite(unfoldedLevelRaw) && unfoldedLevelRaw >= 1 ? unfoldedLevelRaw : 1
    const walk = (list: OptionItem[], depth: number) => {
      for (const item of list) {
        if (item.children?.length || optionNeedsDefer(item, deferField.value)) {
          next.set(
            nodeKey(item),
            optionDefaultExpanded(item, depth, initiallyOpen, unfoldedLevel),
          )
        }
        if (item.children?.length) walk(item.children, depth + 1)
      }
    }
    walk(nodes, 0)
    expanded.value = next
  }

  function ensureExpanded(nodes: OptionItem[]) {
    const next = new Map(expanded.value)
    const initiallyOpen = context.schema.value.initiallyOpen !== false
    const unfoldedLevelRaw = Number(context.schema.value.unfoldedLevel)
    const unfoldedLevel =
      Number.isFinite(unfoldedLevelRaw) && unfoldedLevelRaw >= 1 ? unfoldedLevelRaw : 1
    const walk = (list: OptionItem[], depth: number) => {
      for (const item of list) {
        if (
          (item.children?.length || optionNeedsDefer(item, deferField.value)) &&
          !next.has(nodeKey(item))
        ) {
          next.set(
            nodeKey(item),
            optionDefaultExpanded(item, depth, initiallyOpen, unfoldedLevel),
          )
        }
        if (item.children?.length) walk(item.children, depth + 1)
      }
    }
    walk(nodes, 0)
    expanded.value = next
  }

  function isExpanded(item: OptionItem) {
    if (optionNeedsDefer(item, deferField.value)) return false
    if (context.query?.value) return true
    return expanded.value.get(nodeKey(item)) ?? true
  }

  function isDeferring(item: OptionItem) {
    return deferring.value.has(nodeKey(item))
  }

  function expandItem(item: OptionItem) {
    const next = new Map(expanded.value)
    next.set(nodeKey(item), true)
    expanded.value = next
  }

  function toggleExpand(item: OptionItem) {
    if (context.disabled?.value || item.disabled || isDeferring(item)) return
    if (optionNeedsDefer(item, deferField.value)) {
      void deferLoad(item)
      return
    }
    const next = new Map(expanded.value)
    next.set(nodeKey(item), !isExpanded(item))
    expanded.value = next
  }

  function setExpandedLevel(level: number, folded = false) {
    if (!Number.isFinite(level)) return
    const next = new Map(expanded.value)
    const walk = (list: OptionItem[], depth: number) => {
      for (const item of list) {
        if (item.children?.length || optionNeedsDefer(item, deferField.value)) {
          const itemLevel = depth + 1
          next.set(nodeKey(item), folded ? itemLevel < level : itemLevel <= level)
        }
        if (item.children?.length) walk(item.children, depth + 1)
      }
    }
    walk(context.nodes.value, 0)
    expanded.value = next
  }

  async function loadDeferred(item: OptionItem): Promise<OptionItem | undefined> {
    const api = (item.deferApi || context.schema.value.deferApi || context.schema.value.source) as
      | SchemaApi
      | undefined
    const ctx = { ...data.value, ...item }
    if (!api || isOptionsVariableSource(api) || !isEffectiveApi(api, ctx)) {
      env.notify('error', '请在选项中设置 deferApi，或在表单项中设置 deferApi，用来加载子选项')
      return undefined
    }
    const key = nodeKey(item)
    const pending = new Set(deferring.value)
    pending.add(key)
    deferring.value = pending
    try {
      const result = await requestApi(api, { env, data: ctx, reason: 'action' })
      if (result.skipped) return undefined
      if (!result.ok) {
        env.notify('error', result.payload.msg || '选项加载失败')
        return undefined
      }
      const next = resolveDeferredOption(
        context.nodes.value,
        item,
        optionsFromPayload(result.data).list,
        {
          labelField: String(context.schema.value.labelField || 'label'),
          valueField: String(context.schema.value.valueField || 'value'),
        },
        deferField.value,
      )
      context.setNodes(next)
      const loaded = findOption(next, item.value, String(context.schema.value.valueField || 'value'))
      if (loaded) {
        const nextExpanded = new Map(expanded.value)
        nextExpanded.set(nodeKey(loaded), true)
        expanded.value = nextExpanded
      }
      const name = context.schema.value.name ? String(context.schema.value.name) : ''
      const value = context.currentValue?.()
      const payload = {
        ...data.value,
        result: result.payload,
        items: next,
        value,
        ...(name ? { [name]: value } : {}),
      }
      const event = createVamisEvent('deferLoadFinished', payload)
      await runOnEvent(context.schema.value, 'deferLoadFinished', {
        env,
        data: eventEvalData(payload, event),
        scoped,
        overlay,
        form: formApi,
        scope: scope.value,
        event,
      })
      return loaded
    } catch (error) {
      env.notify('error', error instanceof Error ? error.message : '选项加载失败')
      return undefined
    } finally {
      const done = new Set(deferring.value)
      done.delete(key)
      deferring.value = done
    }
  }

  async function deferLoad(item: OptionItem): Promise<OptionItem | undefined> {
    const key = nodeKey(item)
    const pending = inFlight.get(key)
    if (pending) return pending
    const task = loadDeferred(item)
    inFlight.set(key, task)
    try {
      return await task
    } finally {
      if (inFlight.get(key) === task) inFlight.delete(key)
    }
  }

  function directChild(nodes: OptionItem[], value: unknown): OptionItem | undefined {
    const valueField = String(context.schema.value.valueField || 'value')
    return nodes.find((item) => optionValuesEqual(item.value, value, valueField))
  }

  /**
   * 路径回显只沿值里出现的父链逐层加载。叶子不在这里加载，兄弟节点也不会被触碰。
   */
  async function expandPaths(paths: unknown[][]) {
    for (const path of paths) {
      let nodes = context.nodes.value
      for (let level = 0; level < path.length - 1; level += 1) {
        let item = directChild(nodes, path[level])
        if (!item) break
        expandItem(item)
        if (optionNeedsDefer(item, deferField.value)) {
          item = await deferLoad(item)
          if (!item) break
          expandItem(item)
        }
        nodes = item.children || []
      }
    }
  }

  return {
    deferField,
    expanded,
    isExpanded,
    isDeferring,
    expandItem,
    toggleExpand,
    setExpandedLevel,
    deferLoad,
    expandPaths,
    seedExpanded,
    ensureExpanded,
  }
}
