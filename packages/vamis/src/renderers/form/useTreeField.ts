/** InputTree / TreeSelect 共用：展开、懒加载、检索、勾选。 */

import { computed, ref, watch, type Ref } from 'vue'
import {
  createVamisEvent,
  eventEvalData,
  filterOptionTree,
  findOption,
  isEffectiveApi,
  isOptionsVariableSource,
  isTreeNodeDefaultExpanded,
  optionNeedsDefer,
  optionsDeferField,
  optionsFromPayload,
  requestApi,
  resolveDeferredOption,
  runOnEvent,
  toggleTreeSelection,
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
import { dumpJoined, normalizeOptions, optionValuesEqual, parseJoined } from '../../options'
import { useFieldValue } from '../../formContext'

export function useTreeField(schema: Ref<SchemaObject>, disabled?: Ref<boolean | undefined>) {
  const fieldApi = useFieldValue()
  const data = useData()
  const env = useEnv()
  const scoped = useScoped()
  const overlay = useOverlay()
  const formApi = useFormApi()
  const scope = useScope()
  const query = ref('')
  const localOptions = ref<OptionItem[] | null>(null)
  const expanded = ref(new Map<OptionItem, boolean>())
  const deferring = ref(new Set<OptionItem>())
  const labelField = computed(() => String(schema.value.labelField || 'label'))
  const valueField = computed(() => String(schema.value.valueField || 'value'))
  const deferField = computed(() => optionsDeferField(schema.value))
  const options = computed(() =>
    localOptions.value ?? normalizeOptions(schema.value.options, labelField.value, valueField.value),
  )
  const multiple = computed(() => !!schema.value.multiple)
  const onlyLeaf = computed(() => !!schema.value.onlyLeaf)
  const autoCheckChildren = computed(() => schema.value.autoCheckChildren !== false)
  const cascade = computed(() => !!schema.value.cascade)
  const showOutline = computed(() => !!schema.value.showOutline)
  const showIcon = computed(() => schema.value.showIcon !== false)
  const searchable = computed(() => !!schema.value.searchable)
  const hideNodePathLabel = computed(() => !!schema.value.hideNodePathLabel)
  const pathSeparator = computed(() =>
    schema.value.pathSeparator == null ? '/' : String(schema.value.pathSeparator),
  )
  const filteredOptions = computed(() => filterOptionTree(options.value, query.value))
  const selected = computed({
    get: () =>
      parseJoined(
        schema.value.name ? fieldApi.getValue(schema.value.name) : '',
        multiple.value,
        schema.value.joinValues !== false,
      ),
    set: (values: unknown[]) =>
      schema.value.name &&
      fieldApi.setValue(schema.value.name, dumpJoined(values, multiple.value, schema.value.joinValues !== false)),
  })

  function seedExpanded(nodes: OptionItem[]) {
    const next = new Map<OptionItem, boolean>()
    const initiallyOpen = schema.value.initiallyOpen !== false
    const unfoldedLevelRaw = Number(schema.value.unfoldedLevel)
    const unfoldedLevel = Number.isFinite(unfoldedLevelRaw) && unfoldedLevelRaw >= 1 ? unfoldedLevelRaw : 1
    const walk = (list: OptionItem[], depth: number) => {
      for (const item of list) {
        if (item.children?.length || optionNeedsDefer(item, deferField.value)) {
          next.set(item, isTreeNodeDefaultExpanded(depth, { initiallyOpen, unfoldedLevel }))
        }
        if (item.children?.length) walk(item.children, depth + 1)
      }
    }
    walk(nodes, 0)
    expanded.value = next
  }

  watch(
    () => schema.value.options,
    () => {
      localOptions.value = null
      deferring.value = new Set()
      seedExpanded(normalizeOptions(schema.value.options, labelField.value, valueField.value))
    },
    { deep: true, immediate: true },
  )

  function isExpanded(item: OptionItem) {
    if (optionNeedsDefer(item, deferField.value)) return false
    if (query.value) return true
    return expanded.value.get(item) ?? true
  }

  function isDeferring(item: OptionItem) {
    return deferring.value.has(item)
  }

  function toggleExpand(item: OptionItem) {
    if (disabled?.value || item.disabled || isDeferring(item)) return
    if (optionNeedsDefer(item, deferField.value)) {
      void deferLoad(item)
      return
    }
    const next = new Map(expanded.value)
    next.set(item, !isExpanded(item))
    expanded.value = next
  }

  async function deferLoad(item: OptionItem) {
    const api = (item.deferApi || schema.value.deferApi || schema.value.source) as SchemaApi | undefined
    const ctx = { ...data.value, ...item }
    if (!api || isOptionsVariableSource(api) || !isEffectiveApi(api, ctx)) {
      env.notify('error', '请在选项中设置 deferApi，或在表单项中设置 deferApi，用来加载子选项')
      return
    }
    const pending = new Set(deferring.value)
    pending.add(item)
    deferring.value = pending
    try {
      const result = await requestApi(api, { env, data: ctx, reason: 'action' })
      if (result.skipped) return
      if (!result.ok) {
        env.notify('error', result.payload.msg || '选项加载失败')
        return
      }
      const next = resolveDeferredOption(
        options.value,
        item,
        optionsFromPayload(result.data).list,
        { labelField: labelField.value, valueField: valueField.value },
        deferField.value,
      )
      localOptions.value = next
      const loaded = findOption(next, item.value, valueField.value)
      if (loaded) {
        const nextExpanded = new Map(expanded.value)
        nextExpanded.set(loaded, true)
        expanded.value = nextExpanded
      }
      const name = schema.value.name ? String(schema.value.name) : ''
      const value = name ? fieldApi.getValue(name) : undefined
      const payload = {
        ...data.value,
        result: result.payload,
        items: next,
        value,
        ...(name ? { [name]: value } : {}),
      }
      const event = createVamisEvent('deferLoadFinished', payload)
      await runOnEvent(schema.value, 'deferLoadFinished', {
        env,
        data: eventEvalData(payload, event),
        scoped,
        overlay,
        form: formApi,
        scope: scope.value,
        event,
      })
    } catch (error) {
      env.notify('error', error instanceof Error ? error.message : '选项加载失败')
    } finally {
      const done = new Set(deferring.value)
      done.delete(item)
      deferring.value = done
    }
  }

  function applyToggle(item: OptionItem, current: unknown[]): unknown[] | null {
    if (disabled?.value || item.disabled) return null
    return toggleTreeSelection(current, item, {
      multiple: multiple.value,
      onlyLeaf: onlyLeaf.value,
      autoCheckChildren: autoCheckChildren.value,
      cascade: cascade.value,
    })
  }

  function toggle(item: OptionItem) {
    const next = applyToggle(item, selected.value)
    if (next) selected.value = next
    return next
  }

  function checked(item: OptionItem, values: unknown[] = selected.value) {
    return values.some((value) => optionValuesEqual(value, item.value))
  }

  return {
    query,
    options,
    filteredOptions,
    selected,
    multiple,
    deferField,
    valueField,
    showOutline,
    showIcon,
    searchable,
    hideNodePathLabel,
    pathSeparator,
    isExpanded,
    isDeferring,
    toggleExpand,
    toggle,
    applyToggle,
    checked,
  }
}
