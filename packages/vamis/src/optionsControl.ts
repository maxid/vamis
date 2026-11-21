/** 选择器表单项运行时：source / 值形状 / 全选 / 检索。控件 UI 自己画。 */

import { computed, onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue'
import {
  applyOptionsAutoFill,
  autoFillMapping,
  createVamisEvent,
  dumpOptionsValue,
  eventEvalData,
  filterOptionTree,
  filterTpl,
  findOption,
  firstEnabledOption,
  getSelectedOptions,
  isApiOutdated,
  isEffectiveApi,
  isOptionsAutoComplete,
  isOptionsEmpty,
  isOptionsVariableSource,
  matchOptionValue,
  normalizeOptions,
  optionsClearValue,
  optionsControlConfig,
  optionsCreateBtnLabel,
  optionsAddDialogSchema,
  optionsEditDialogTitle,
  optionsFromPayload,
  optionsSetDataValue,
  persistOptionMutation,
  omitSelectedOptions,
  runSelectFilterOption,
  overlayContainerFrom,
  removeOptionFromTree,
  requestApi,
  resolveOptionsSource,
  runOptionConfirm,
  runOnEvent,
  toggleAllOptions,
  toggleOption,
  updateOptionInTree,
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
import { useFieldValue, useForm } from './formContext'

export function useOptionsControl(schema: Ref<SchemaObject>, disabled?: Ref<boolean | undefined>) {
  const form = useForm()
  const fieldApi = useFieldValue()
  const env = useEnv()
  const scoped = useScoped()
  const scope = useScope()
  const overlay = useOverlay()
  const formApi = useFormApi()
  const data = useData()

  const remote = ref<OptionItem[]>([])
  const extra = ref<OptionItem[]>([])
  const override = ref<OptionItem[] | null>(null)
  const loading = ref(false)
  const keyword = ref('')
  const open = ref(false)
  const searchResults = ref<OptionItem[] | null>(null)
  let autoCompleteTimer: ReturnType<typeof setTimeout> | undefined
  let autoCompleteSeq = 0
  const name = computed(() => (schema.value.name ? String(schema.value.name) : ''))
  const config = computed((): OptionsControlConfig => optionsControlConfig(schema.value))
  const overlayContainer = computed(() =>
    overlayContainerFrom({ popOverContainerSelector: schema.value.popOverContainerSelector }, env),
  )
  const placeholder = computed(() =>
    schema.value.placeholder != null ? String(schema.value.placeholder) : env.translate('Select.placeholder'),
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
    const base = override.value ?? (remote.value.length ? remote.value : local)
    if (!extra.value.length) return base
    return [...base, ...extra.value]
  })

  const rawValue = computed(() => (name.value ? fieldApi.getValue(name.value) : schema.value.value))

  const selected = computed(() => getSelectedOptions(rawValue.value, options.value, config.value))

  const filtered = computed(() => {
    let list = searchResults.value ?? options.value
    if (!searchResults.value && !autoComplete.value && config.value.searchable && keyword.value.trim()) {
      const custom = runSelectFilterOption(
        options.value,
        keyword.value,
        schema.value.filterOption,
        env.trusted === true,
      )
      list = custom ?? filterOptionTree(options.value, keyword.value)
    }
    if (schema.value.hideSelected === true) {
      list = omitSelectedOptions(list, selected.value, config.value.valueField)
    }
    return list
  })

  const hasValue = computed(() => !isOptionsEmpty(rawValue.value))

  function write(next: unknown, fill: boolean | 'fillIfNotSet' | 'always' = 'always') {
    if (!name.value) return
    fieldApi.setValue(name.value, next)
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
      fieldApi.setValue(key, next)
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
    if (Array.isArray(option.children)) return
    const nextItems = toggleOption(option, selected.value, config.value)
    await commit(nextItems)
    if (!config.value.multiple) open.value = false
  }

  async function toggleAll() {
    if (!config.value.multiple) return
    const pool =
      config.value.checkAllBySearch !== false && keyword.value.trim() ? filtered.value : options.value
    await commit(toggleAllOptions(selected.value, pool, config.value.valueField))
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

  function applyTree(next: OptionItem[]) {
    override.value = next
    extra.value = []
  }

  function replaceOptions(next: OptionItem[]) {
    applyTree(next)
  }

  function defaultEditControls() {
    const labelField = config.value.labelField || 'label'
    return [
      {
        type: 'input-text',
        name: labelField,
        label: false,
        placeholder: '请输入名称',
      },
    ]
  }

  async function openAddDialog() {
    if (disabled?.value || !overlay) return
    const result = await overlay.openDialog(
      optionsAddDialogSchema(schema.value),
      { ...data.value },
    )
    if (!result) return
    await createOption(result)
  }

  async function persistOptionApi(
    api: unknown,
    data: Record<string, unknown>,
    payload: Record<string, unknown>,
    method: 'post' | 'delete',
  ) {
    return persistOptionMutation({
      api,
      method,
      env,
      data,
      payload,
      failureMessage: method === 'delete' ? '删除选项失败' : '编辑选项失败',
    })
  }

  async function reloadAfterMutate() {
    extra.value = []
    override.value = null
    await loadOptionsFromSource()
  }

  function hasSource() {
    return !!schema.value.source
  }

  async function syncEditedSelection(
    selectedItems: OptionItem[],
    originValue: unknown,
    nextPatch: OptionItem,
    valueField: string,
  ) {
    if (!selectedItems.some((item) => matchOptionValue(originValue, item, valueField))) return
    const replacement = findOption(options.value, nextPatch.value, valueField) ?? nextPatch
    const nextSelected = selectedItems.map((item) =>
      matchOptionValue(originValue, item, valueField) ? replacement : item,
    )
    await commit(nextSelected)
  }

  async function editOption(origin: OptionItem) {
    if (origin.disabled || disabled?.value) return
    if (!overlay) return
    const labelField = config.value.labelField || 'label'
    const valueField = config.value.valueField || 'value'
    const editControls = Array.isArray(schema.value.editControls) && schema.value.editControls.length
      ? schema.value.editControls
      : defaultEditControls()
    const editDialog =
      schema.value.editDialog && typeof schema.value.editDialog === 'object' && !Array.isArray(schema.value.editDialog)
        ? (schema.value.editDialog as SchemaObject)
        : {}
    const result = await overlay.openDialog(
      {
        type: 'dialog',
        title: optionsEditDialogTitle(schema.value),
        ...editDialog,
        body: {
          type: 'form',
          initApi: schema.value.editInitApi,
          body: editControls,
        },
      },
      { ...data.value, ...origin },
    )
    if (!result) return
    const patch = {
      ...origin,
      ...result,
      label: String(result[labelField] ?? result.label ?? origin.label),
      value: result[valueField] ?? result.value ?? origin[valueField] ?? origin.value ?? result[labelField] ?? origin.label,
    } as OptionItem
    const eventItem = {
      [labelField]: patch[labelField],
      [valueField]: patch[valueField],
    } as OptionItem
    const allowed = await runOptionConfirm({
      schema: schema.value,
      eventName: 'editConfirm',
      data: data.value,
      value: rawValue.value,
      options: options.value,
      item: eventItem,
      env,
      scoped,
      overlay,
      form: formApi,
      scope: scope.value,
    })
    if (!allowed) return
    const selectedBefore = selected.value
    const saved = await persistOptionMutation({
      api: schema.value.editApi,
      method: 'post',
      env,
      data: patch,
      payload: { ...data.value, ...patch },
      failureMessage: '编辑选项失败',
    })
    if (!saved.ok) return
    const nextPatch = saved.data as OptionItem
    if (hasSource() && schema.value.editApi) {
      await reloadAfterMutate()
      await syncEditedSelection(selectedBefore, origin.value, nextPatch, valueField)
      return
    }
    applyTree(updateOptionInTree(options.value, origin, nextPatch, valueField))
    await syncEditedSelection(selectedBefore, origin.value, nextPatch, valueField)
  }

  async function deleteOption(origin: OptionItem) {
    if (origin.disabled || disabled?.value) return
    const valueField = config.value.valueField || 'value'
    const ctx = { ...data.value, ...origin }
    const confirmText = schema.value.deleteConfirmText
    if (confirmText) {
      const ok = await env.confirm(filterTpl(String(confirmText), ctx))
      if (!ok) return
    }
    const allowed = await runOptionConfirm({
      schema: schema.value,
      eventName: 'deleteConfirm',
      data: data.value,
      value: rawValue.value,
      options: options.value,
      item: origin,
      env,
      scoped,
      overlay,
      form: formApi,
      scope: scope.value,
    })
    if (!allowed) return
    const saved = await persistOptionApi(schema.value.deleteApi, origin, ctx, 'delete')
    if (!saved.ok) return
    if (hasSource()) {
      await reloadAfterMutate()
    } else {
      applyTree(removeOptionFromTree(options.value, origin, valueField))
    }
    const still = selected.value.filter((item) => !matchOptionValue(origin.value, item, valueField))
    if (still.length !== selected.value.length) await commit(still)
  }

  async function createOption(values: Record<string, unknown>) {
    const labelField = config.value.labelField || 'label'
    const valueField = config.value.valueField || 'value'
    const label = String(values[labelField] ?? values.label ?? '')
    const value = values[valueField] ?? values.value ?? label
    if (!label && value == null) return
    const item: OptionItem = {
      ...values,
      label: label || String(value ?? ''),
      value,
    }
    const eventItem = {
      [labelField]: item[labelField],
      [valueField]: item[valueField],
    } as OptionItem
    const allowed = await runOptionConfirm({
      schema: schema.value,
      eventName: 'addConfirm',
      data: data.value,
      value: rawValue.value,
      options: options.value,
      item: eventItem,
      env,
      scoped,
      overlay,
      form: formApi,
      scope: scope.value,
    })
    if (!allowed) return
    const saved = await persistOptionMutation({
      api: schema.value.addApi,
      method: 'post',
      env,
      data: item,
      payload: { ...data.value, ...values },
      failureMessage: '新增选项失败',
    })
    if (!saved.ok) return
    const nextItem = saved.data as OptionItem
    if (hasSource() && schema.value.addApi) {
      await reloadAfterMutate()
      const reloaded = findOption(options.value, nextItem.value, valueField)
      if (reloaded) await toggle(reloaded)
      return
    }
    addLocalOption(nextItem)
    await toggle(nextItem)
  }

  function applyDefaultSelection(list: OptionItem[], sourceValue?: unknown) {
    if (!name.value) return
    const current = fieldApi.getValue(name.value)
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

  async function loadOptionsFromSource(): Promise<void> {
    const source = schema.value.source
    const labelField = config.value.labelField || 'label'
    const valueField = config.value.valueField || 'value'
    if (!source) return
    override.value = null
    extra.value = []
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
    const seq = ++autoCompleteSeq
    loading.value = true
    try {
      const result = await requestApi(api as any, { env, data: { ...data.value, term }, reason: 'init' })
      if (seq !== autoCompleteSeq) return
      if (result.skipped || !result.ok) return
      const payload = optionsFromPayload(result.data)
      remote.value = normalizeOptions(payload.list, config.value.labelField, config.value.valueField)
    } catch (error) {
      if (seq !== autoCompleteSeq) return
      env.notify('error', error instanceof Error ? error.message : '自动补全失败')
    } finally {
      if (seq === autoCompleteSeq) loading.value = false
    }
  }

  async function loadSearch(term: string) {
    const api = schema.value.searchApi
    if (!api || !isEffectiveApi(api as any, { ...data.value, term })) {
      searchResults.value = null
      return
    }
    if (!term.trim()) {
      searchResults.value = null
      return
    }
    const seq = ++autoCompleteSeq
    loading.value = true
    try {
      const result = await requestApi(api as any, { env, data: { ...data.value, term }, reason: 'init' })
      if (seq !== autoCompleteSeq) return
      if (result.skipped || !result.ok) return
      const payload = optionsFromPayload(result.data)
      searchResults.value = normalizeOptions(payload.list, config.value.labelField, config.value.valueField)
    } catch (error) {
      if (seq !== autoCompleteSeq) return
      env.notify('error', error instanceof Error ? error.message : '搜索失败')
    } finally {
      if (seq === autoCompleteSeq) loading.value = false
    }
  }

  function scheduleAutoComplete(term: string) {
    if (autoCompleteTimer) clearTimeout(autoCompleteTimer)
    autoCompleteTimer = setTimeout(() => {
      if (autoComplete.value) void loadAutoComplete(term)
      else if (schema.value.searchApi) void loadSearch(term)
    }, 250)
  }

  async function emitNamed(eventName: 'focus' | 'blur') {
    const payload = {
      ...data.value,
      value: rawValue.value,
      items: options.value,
      options: options.value,
      selectedItems: selected.value,
      ...(name.value ? { [name.value]: rawValue.value } : {}),
    }
    const event = createVamisEvent(eventName, payload)
    await runOnEvent(schema.value, eventName, {
      env,
      data: eventEvalData(payload, event),
      scoped,
      overlay,
      form: formApi,
      scope: scope.value,
      event,
    })
  }

  const api = {
    get name() {
      return String(schema.value.id || schema.value.name || '')
    },
    reload: loadOptionsFromSource,
    getData: () => (name.value ? { value: fieldApi.getValue(name.value) } : {}),
    setData,
    async doAction(action: unknown) {
      const type = action && typeof action === 'object' ? String((action as { actionType?: string }).actionType || '') : ''
      if (type === 'clear') await clear()
      else if (type === 'reset') await reset()
      else if (type === 'reload') await loadOptionsFromSource()
      else if (type === 'setValue') {
        const args = action && typeof action === 'object' ? (action as { args?: { value?: unknown } }).args : undefined
        if (args && 'value' in args) write(args.value, true)
      }
    },
  }

  scoped?.register(api)

  onMounted(() => {
    pristine.value = name.value ? fieldApi.getValue(name.value) : schema.value.value
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
    if (autoComplete.value || schema.value.searchApi) scheduleAutoComplete(term)
    else searchResults.value = null
  })

  watch(open, (now) => {
    void emitNamed(now ? 'focus' : 'blur')
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
    openAddDialog,
    createOption,
    addLocalOption,
    replaceOptions,
    editOption,
    deleteOption,
    loadOptionsFromSource,
    loadAutoComplete,
    scheduleAutoComplete,
    emitNamed,
  }
}

function autoFillMappingHasApi(schema: SchemaObject): boolean {
  const raw = schema.autoFill
  return !!raw && typeof raw === 'object' && !Array.isArray(raw) && 'api' in raw
}
