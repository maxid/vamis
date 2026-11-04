/** 选择器表单项运行时：source / 值形状 / 全选 / 检索。控件 UI 自己画。 */

import { computed, onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue'
import {
  applyOptionsAutoFill,
  autoFillMapping,
  createVamisEvent,
  dumpOptionsValue,
  eventEvalData,
  filterOptions,
  firstEnabledOption,
  getSelectedOptions,
  isApiOutdated,
  isEffectiveApi,
  isOptionsAutoComplete,
  isOptionsEmpty,
  isOptionsVariableSource,
  normalizeOptions,
  optionsClearValue,
  optionsControlConfig,
  optionsCreateBtnLabel,
  optionsFromPayload,
  optionsSetDataValue,
  overlayContainerFrom,
  requestApi,
  resolveOptionsSource,
  runOnEvent,
  toggleAllOptions,
  toggleOption,
  useData,
  useEnv,
  useFormApi,
  useOverlay,
  useScope,
  useScoped,
  type OptionItem,
  type OptionsControlConfig,
  type SchemaObject,
} from '@vamis/core'
import { useForm } from './formContext'

export function useOptionsControl(schema: Ref<SchemaObject>, disabled?: Ref<boolean | undefined>) {
  const form = useForm()
  const env = useEnv()
  const scoped = useScoped()
  const scope = useScope()
  const overlay = useOverlay()
  const formApi = useFormApi()
  const data = useData()

  const remote = ref<OptionItem[]>([])
  const extra = ref<OptionItem[]>([])
  const loading = ref(false)
  const keyword = ref('')
  const open = ref(false)
  let autoCompleteTimer: ReturnType<typeof setTimeout> | undefined
  const name = computed(() => (schema.value.name ? String(schema.value.name) : ''))
  const config = computed((): OptionsControlConfig => optionsControlConfig(schema.value))
  const overlayContainer = computed(() =>
    overlayContainerFrom({ popOverContainerSelector: schema.value.popOverContainerSelector }, env),
  )
  const placeholder = computed(() =>
    schema.value.placeholder != null ? String(schema.value.placeholder) : '请选择',
  )
  const createLabel = computed(() => optionsCreateBtnLabel(schema.value))
  const autoComplete = computed(() => isOptionsAutoComplete(schema.value))
  const pristine = ref<unknown>(undefined)

  const options = computed(() => {
    const labelField = config.value.labelField || 'label'
    const valueField = config.value.valueField || 'value'
    const local = schema.value.options
      ? normalizeOptions(schema.value.options, labelField, valueField)
      : []
    const base = remote.value.length ? remote.value : local
    if (!extra.value.length) return base
    return [...base, ...extra.value]
  })

  const rawValue = computed(() => (name.value ? form?.getValue(name.value) : schema.value.value))

  const selected = computed(() => getSelectedOptions(rawValue.value, options.value, config.value))

  const filtered = computed(() => {
    if (autoComplete.value) return options.value
    if (!config.value.searchable) return options.value
    return filterOptions(options.value, keyword.value)
  })

  const hasValue = computed(() => !isOptionsEmpty(rawValue.value))

  function write(next: unknown, fill: boolean | 'fillIfNotSet' | 'always' = 'always') {
    if (!name.value || !form) return
    form.setValue(name.value, next)
    if (fill === false) return
    applyFill(next, fill === 'always' || fill === true ? true : fill)
  }

  function applyFill(value: unknown, initAutoFill: boolean | 'fillIfNotSet') {
    const mapping = autoFillMapping(schema.value)
    if (!mapping || autoFillMappingHasApi(schema.value)) return
    const selectedItems = getSelectedOptions(value, options.value, config.value)
    const filled = applyOptionsAutoFill(
      mapping,
      selectedItems,
      !!config.value.multiple,
      data.value,
      initAutoFill,
    )
    for (const [key, next] of Object.entries(filled)) {
      form?.setValue(key, next)
    }
  }

  async function emitChange(next: unknown) {
    const payload = {
      ...data.value,
      value: next,
      options: options.value,
      items: options.value,
      selectedItems: getSelectedOptions(next, options.value, config.value),
      ...(name.value ? { [name.value]: next } : {}),
    }
    const event = createVamisEvent('change', payload)
    await runOnEvent(schema.value, 'change', {
      env,
      data: eventEvalData(payload, event),
      scoped,
      overlay,
      form: formApi,
      scope: scope.value,
      event,
    })
    return event
  }

  async function commit(selectedItems: OptionItem[]) {
    const next = dumpOptionsValue(selectedItems, config.value)
    const event = await emitChange(next)
    if (event.prevented) return
    write(next, true)
  }

  async function toggle(option: OptionItem) {
    if (option.disabled || disabled?.value) return
    const nextItems = toggleOption(option, selected.value, config.value)
    await commit(nextItems)
    if (!config.value.multiple) open.value = false
  }

  async function toggleAll() {
    if (!config.value.multiple) return
    await commit(toggleAllOptions(selected.value, options.value, config.value.valueField))
  }

  async function clear() {
    const next = optionsClearValue(schema.value)
    const event = await emitChange(next)
    if (event.prevented) return
    write(next, true)
    keyword.value = ''
  }

  async function reset() {
    const next = pristine.value !== undefined ? pristine.value : schema.value.value ?? optionsClearValue(schema.value)
    const event = await emitChange(next)
    if (event.prevented) return
    write(next, true)
  }

  function setData(values: Record<string, unknown>) {
    const next = optionsSetDataValue(values, name.value)
    if (next !== undefined) write(next, true)
  }

  function addLocalOption(item: OptionItem) {
    if (options.value.some((cur) => String(cur.value) === String(item.value))) return item
    extra.value = [...extra.value, item]
    return item
  }

  async function createOption(values: Record<string, unknown>) {
    const labelField = config.value.labelField || 'label'
    const valueField = config.value.valueField || 'value'
    const label = String(values[labelField] ?? values.label ?? '')
    const value = values[valueField] ?? values.value ?? label
    if (!label && value == null) return
    const item = addLocalOption({
      ...values,
      label: label || String(value ?? ''),
      value,
    })
    const api = schema.value.addApi
    if (api && isEffectiveApi(api as any, { ...data.value, ...values })) {
      try {
        const result = await requestApi(api as any, { env, data: { ...data.value, ...values }, reason: 'action' })
        if (result.ok && schema.value.source) await loadOptionsFromSource()
      } catch (error) {
        env.notify('error', error instanceof Error ? error.message : '新增选项失败')
      }
    }
    await toggle(item)
  }

  function applyDefaultSelection(list: OptionItem[], sourceValue?: unknown) {
    if (!name.value || !form) return
    const current = form.getValue(name.value)
    if (sourceValue != null && isOptionsEmpty(current)) {
      write(sourceValue, schema.value.initAutoFill ?? 'fillIfNotSet')
      return
    }
    if (!isOptionsEmpty(current)) return
    if (config.value.selectFirst) {
      const first = firstEnabledOption(list)
      if (first) write(dumpOptionsValue([first], config.value), schema.value.initAutoFill ?? 'fillIfNotSet')
      return
    }
    if (config.value.multiple && config.value.defaultCheckAll && list.length) {
      write(dumpOptionsValue(toggleAllOptions([], list, config.value.valueField), config.value), schema.value.initAutoFill ?? 'fillIfNotSet')
    }
  }

  async function loadOptionsFromSource() {
    const source = schema.value.source
    const labelField = config.value.labelField || 'label'
    const valueField = config.value.valueField || 'value'
    if (!source) return
    if (isOptionsVariableSource(source)) {
      const resolved = resolveOptionsSource(source, data.value)
      const list = normalizeOptions(resolved, labelField, valueField)
      if (config.value.clearValueOnSourceChange && remote.value.length) {
        const prev = JSON.stringify(remote.value.map((item) => item.value))
        const next = JSON.stringify(list.map((item) => item.value))
        if (prev !== next) write(optionsClearValue(schema.value), false)
      }
      remote.value = list
      applyDefaultSelection(list)
      return
    }
    if (!isEffectiveApi(source as any, data.value, schema.value.initFetch as boolean | undefined, schema.value.initFetchOn as string | undefined)) {
      return
    }
    loading.value = true
    try {
      const result = await requestApi(source as any, { env, data: data.value, reason: 'init' })
      if (result.skipped || !result.ok) return
      const payload = optionsFromPayload(result.data)
      const list = normalizeOptions(payload.list, labelField, valueField)
      remote.value = list
      applyDefaultSelection(list, payload.value)
    } catch (error) {
      env.notify('error', error instanceof Error ? error.message : '选项加载失败')
    } finally {
      loading.value = false
    }
  }

  async function loadAutoComplete(term: string) {
    const api = schema.value.autoComplete
    if (!api || api === false || !isEffectiveApi(api as any, data.value)) return
    loading.value = true
    try {
      const result = await requestApi(api as any, { env, data: { ...data.value, term }, reason: 'init' })
      if (result.skipped || !result.ok) return
      const payload = optionsFromPayload(result.data)
      remote.value = normalizeOptions(payload.list, config.value.labelField, config.value.valueField)
    } catch (error) {
      env.notify('error', error instanceof Error ? error.message : '自动补全失败')
    } finally {
      loading.value = false
    }
  }

  function scheduleAutoComplete(term: string) {
    if (!autoComplete.value) return
    if (autoCompleteTimer) clearTimeout(autoCompleteTimer)
    autoCompleteTimer = setTimeout(() => {
      void loadAutoComplete(term)
    }, 250)
  }

  const api = {
    get name() {
      return String(schema.value.id || schema.value.name || '')
    },
    reload: loadOptionsFromSource,
    getData: () => (name.value ? { value: form?.getValue(name.value) } : {}),
    setData,
    async doAction(action: unknown) {
      const type = action && typeof action === 'object' ? String((action as { actionType?: string }).actionType || '') : ''
      if (type === 'clear') await clear()
      else if (type === 'reset') await reset()
      else if (type === 'reload') await loadOptionsFromSource()
    },
  }

  scoped?.register(api)

  onMounted(() => {
    pristine.value = name.value ? form?.getValue(name.value) : schema.value.value
    if (schema.value.source) void loadOptionsFromSource()
    else applyDefaultSelection(options.value)
    if (autoComplete.value) void loadAutoComplete(keyword.value)
  })

  onBeforeUnmount(() => {
    scoped?.unregister(api)
    if (autoCompleteTimer) clearTimeout(autoCompleteTimer)
  })

  watch(
    () => [schema.value.source, data.value] as const,
    (curr, prev) => {
      if (!prev) return
      const source = curr[0]
      if (isOptionsVariableSource(source)) {
        void loadOptionsFromSource()
        return
      }
      if (isApiOutdated(prev[0] as any, curr[0] as any, prev[1], curr[1])) void loadOptionsFromSource()
    },
    { deep: true },
  )

  watch(keyword, (term) => {
    if (autoComplete.value) scheduleAutoComplete(term)
  })

  return {
    name,
    config,
    options,
    filtered,
    selected,
    rawValue,
    hasValue,
    loading,
    keyword,
    open,
    overlayContainer,
    placeholder,
    createLabel,
    autoComplete,
    toggle,
    toggleAll,
    clear,
    reset,
    commit,
    createOption,
    addLocalOption,
    loadOptionsFromSource,
    loadAutoComplete,
    scheduleAutoComplete,
  }
}

function autoFillMappingHasApi(schema: SchemaObject): boolean {
  const raw = schema.autoFill
  return !!raw && typeof raw === 'object' && !Array.isArray(raw) && 'api' in raw
}
