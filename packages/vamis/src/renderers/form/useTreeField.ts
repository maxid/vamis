/** InputTree / TreeSelect 共用：展开、懒加载、检索、勾选、增删改。 */

import { computed, onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue'
import {
  createVamisEvent,
  eventEvalData,
  filterOptionTree,
  filterTpl,
  findOption,
  insertOptionInTree,
  isEffectiveApi,
  isOptionsVariableSource,
  isTreeItemCheckDisabled,
  isTreeItemChecked,
  optionsAddDialogSchema,
  optionsDeleteConfirmText,
  optionsEditDialogSchema,
  optionsFromPayload,
  optionsHasCustomControls,
  optionsOptionFromDialog,
  persistOptionMutation,
  removeOptionFromTree,
  requestApi,
  resolveOptionsSource,
  runOptionConfirm,
  dumpTreeValue,
  getOptionValue,
  normalizeNodePath,
  optionsResetValue,
  optionsVirtualThreshold,
  runOnEvent,
  toggleTreeSelection,
  treeItemPartial,
  updateOptionInTree,
  useData,
  useEnv,
  useFormApi,
  useOverlay,
  useScope,
  useScoped,
  type OptionItem,
  type PlainObject,
  type SchemaApi,
  type SchemaObject,
} from '@vamis/core'
import { normalizeOptions, optionValuesEqual, parseOptionsValue } from '../../options'
import { useFieldValue } from '../../formContext'
import { useTreeState } from './useTreeState'

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
  const remoteFiltered = ref<OptionItem[] | null>(null)
  const isAdding = ref(false)
  const addingParent = ref<OptionItem | null>(null)
  const editingItem = ref<OptionItem | null>(null)
  const draftLabel = ref('')
  const labelField = computed(() => String(schema.value.labelField || 'label'))
  const valueField = computed(() => String(schema.value.valueField || 'value'))
  const options = computed(() =>
    localOptions.value ?? normalizeOptions(schema.value.options, labelField.value, valueField.value),
  )
  const treeState = useTreeState({
    schema,
    nodes: options,
    setNodes: (nodes) => {
      localOptions.value = nodes
    },
    disabled,
    query,
    currentValue,
  })
  const {
    deferField,
    isExpanded,
    isDeferring,
    expandItem,
    expandPaths,
    toggleExpand,
    seedExpanded,
  } = treeState
  const multiple = computed(() => !!schema.value.multiple)
  const enableNodePath = computed(() => schema.value.enableNodePath === true)
  const joinValues = computed(() => schema.value.joinValues !== false)
  const extractValue = computed(() => schema.value.extractValue === true)
  const delimiter = computed(() =>
    schema.value.delimiter == null || schema.value.delimiter === ''
      ? ','
      : String(schema.value.delimiter),
  )
  const showRadio = computed(() => !!schema.value.showRadio)
  const onlyLeaf = computed(() => !!schema.value.onlyLeaf)
  const minLength = computed(() => {
    const value = Number(schema.value.minLength)
    return Number.isFinite(value) && value > 0 ? value : 0
  })
  const maxLength = computed(() => {
    const value = Number(schema.value.maxLength)
    return Number.isFinite(value) && value > 0 ? value : 0
  })
  const hideRoot = computed(() => schema.value.hideRoot !== false)
  const rootLabel = computed(() =>
    schema.value.rootLabel != null ? String(schema.value.rootLabel) : '顶级',
  )
  const rootValue = computed(() =>
    schema.value.rootValue === undefined ? '' : schema.value.rootValue,
  )
  const autoCheckChildren = computed(() => schema.value.autoCheckChildren !== false)
  const cascade = computed(() => !!schema.value.cascade)
  const showOutline = computed(() => !!schema.value.showOutline)
  const showIcon = computed(() => schema.value.showIcon !== false)
  const searchable = computed(() => !!schema.value.searchable)
  const virtualThreshold = computed(() => optionsVirtualThreshold(schema.value))
  const placeholder = computed(() => {
    const raw =
      String(schema.value.type || '') === 'tree-select'
        ? schema.value.optionsPlaceholder
        : schema.value.placeholder
    return raw != null && raw !== ''
      ? String(raw)
      : env.translate('placeholder.noData')
  })
  const hideNodePathLabel = computed(() => !!schema.value.hideNodePathLabel)
  const pathSeparator = computed(() =>
    schema.value.pathSeparator == null ? '/' : String(schema.value.pathSeparator),
  )
  const searchConfig = computed(() => {
    const raw = schema.value.searchConfig
    return raw && typeof raw === 'object' && !Array.isArray(raw) ? (raw as PlainObject) : {}
  })
  const searchPlaceholder = computed(() =>
    searchConfig.value.placeholder != null ? String(searchConfig.value.placeholder) : '请输入',
  )
  const searchSticky = computed(() => !!searchConfig.value.sticky)
  const searchImmediately = computed(() => searchConfig.value.searchImediately !== false)
  const creatable = computed(() => !!schema.value.creatable)
  const editable = computed(() => !!schema.value.editable)
  const removable = computed(() => !!schema.value.removable)
  const rootCreatable = computed(() => schema.value.rootCreatable !== false)
  const createTip = computed(() =>
    schema.value.createTip != null ? String(schema.value.createTip) : '添加子节点',
  )
  const editTip = computed(() =>
    schema.value.editTip != null ? String(schema.value.editTip) : '编辑该节点',
  )
  const removeTip = computed(() =>
    schema.value.removeTip != null ? String(schema.value.removeTip) : '移除该节点',
  )
  const rootCreateTip = computed(() =>
    schema.value.rootCreateTip != null ? String(schema.value.rootCreateTip) : '添加一级节点',
  )
  const filteredOptions = computed(() => {
    if (remoteFiltered.value) return remoteFiltered.value
    if (schema.value.autoComplete) return options.value
    return filterOptionTree(options.value, query.value)
  })
  function serializeSelected(values: unknown[]) {
    return dumpTreeValue(values, options.value, {
      enableNodePath: enableNodePath.value,
      multiple: multiple.value,
      joinValues: joinValues.value,
      extractValue: extractValue.value,
      delimiter: delimiter.value,
      labelField: labelField.value,
      valueField: valueField.value,
      pathSeparator: pathSeparator.value,
      resetValue: optionsResetValue(schema.value),
    })
  }

  function writeSelected(values: unknown[]) {
    if (!schema.value.name) return
    fieldApi.setValue(schema.value.name, serializeSelected(values))
  }

  function rootClearValue() {
    return joinValues.value ? rootValue.value : []
  }

  function writeRootValue() {
    if (!schema.value.name) return
    fieldApi.setValue(schema.value.name, rootClearValue())
  }

  const nodePathInput = computed(() =>
    normalizeNodePath(
      currentValue(),
      enableNodePath.value,
      labelField.value,
      valueField.value,
      pathSeparator.value,
      delimiter.value,
    ),
  )
  const selected = computed({
    get: () => {
      if (enableNodePath.value) {
        return nodePathInput.value.nodeValueArray.map((value) =>
          getOptionValue(value, valueField.value),
        )
      }
      return parseOptionsValue(currentValue(), {
        multiple: multiple.value,
        joinValues: joinValues.value,
        delimiter: delimiter.value,
        valueField: valueField.value,
      })
    },
    set: writeSelected,
  })

  function currentValue() {
    return schema.value.name ? fieldApi.getValue(schema.value.name) : schema.value.value
  }

  let autoCompleteTimer: ReturnType<typeof setTimeout> | undefined
  let autoCompleteSeq = 0

  function selectedRemoteOptions(next: OptionItem[]): OptionItem[] {
    const merged = next.slice()
    for (const value of selected.value) {
      const current = findOption(options.value, value, valueField.value)
      if (!current) continue
      if (!findOption(merged, current.value, valueField.value)) merged.push(current)
    }
    return merged
  }

  function applyRemoteOptions(raw: unknown) {
    const next = selectedRemoteOptions(
      normalizeOptions(raw, labelField.value, valueField.value),
    )
    localOptions.value = next
    remoteFiltered.value = null
    seedExpanded(next)
  }

  async function loadSourceOptions() {
    const source = schema.value.source
    if (!source) return
    if (isOptionsVariableSource(source)) {
      applyRemoteOptions(resolveOptionsSource(source, data.value))
      return
    }
    if (
      !isEffectiveApi(
        source as SchemaApi,
        data.value,
        schema.value.initFetch as boolean | undefined,
        schema.value.initFetchOn as string | undefined,
      )
    ) {
      return
    }
    try {
      const result = await requestApi(source as SchemaApi, {
        env,
        data: data.value,
        reason: 'init',
      })
      if (result.skipped || !result.ok) return
      applyRemoteOptions(optionsFromPayload(result.data).list)
    } catch (error) {
      env.notify('error', error instanceof Error ? error.message : '选项加载失败')
    }
  }

  function scheduleAutoComplete(term: string) {
    if (autoCompleteTimer) clearTimeout(autoCompleteTimer)
    autoCompleteTimer = setTimeout(() => {
      autoCompleteTimer = undefined
      void loadAutoComplete(term)
    }, 250)
  }

  async function loadAutoComplete(term: string) {
    if (!term && schema.value.source) {
      await loadSourceOptions()
      return
    }
    const api = schema.value.autoComplete as SchemaApi | undefined
    const ctx = { ...data.value, term }
    if (!api || !isEffectiveApi(api, ctx)) {
      if (!term && schema.value.source) await loadSourceOptions()
      return
    }
    const seq = ++autoCompleteSeq
    try {
      const result = await requestApi(api, { env, data: ctx, reason: 'init' })
      if (seq !== autoCompleteSeq || result.skipped || !result.ok) return
      applyRemoteOptions(optionsFromPayload(result.data).list)
    } catch (error) {
      if (seq !== autoCompleteSeq) return
      env.notify('error', error instanceof Error ? error.message : '自动补全失败')
    }
  }

  watch(
    () => schema.value.options,
    () => {
      localOptions.value = null
      remoteFiltered.value = null
      cancelEdit()
      seedExpanded(normalizeOptions(schema.value.options, labelField.value, valueField.value))
    },
    { deep: true, immediate: true },
  )

  watch(
    () => [nodePathInput.value.nodePathArray, options.value] as const,
    async ([paths]) => {
      if (!enableNodePath.value || !paths.length) return
      await expandPaths(
        paths
          .filter((path) => path != null && path !== '')
          .map((path) => String(path).split(pathSeparator.value)),
      )
    },
    { immediate: true },
  )

  watch(query, (keyword) => {
    if (!keyword) remoteFiltered.value = null
    if (schema.value.autoComplete) {
      scheduleAutoComplete(keyword)
      return
    }
    const api = schema.value.searchApi as SchemaApi | undefined
    if (!api || !keyword) return
    void searchRemote(keyword, api)
  })

  onMounted(() => {
    if (schema.value.source) void loadSourceOptions()
    else if (schema.value.autoComplete) scheduleAutoComplete(query.value)
  })

  onBeforeUnmount(() => {
    if (autoCompleteTimer) clearTimeout(autoCompleteTimer)
  })

  async function searchRemote(keyword: string, api: SchemaApi) {
    const ctx = { ...data.value, term: keyword }
    if (isOptionsVariableSource(api) || !isEffectiveApi(api, ctx)) return
    try {
      const result = await requestApi(api, { env, data: ctx, reason: 'action' })
      if (result.skipped) return
      if (!result.ok) {
        env.notify('error', result.payload.msg || '选项加载失败')
        return
      }
      remoteFiltered.value = normalizeOptions(
        optionsFromPayload(result.data).list,
        labelField.value,
        valueField.value,
      )
    } catch (error) {
      env.notify('error', error instanceof Error ? error.message : '选项加载失败')
    }
  }

  function checkOpts() {
    return {
      multiple: multiple.value,
      onlyLeaf: onlyLeaf.value,
      autoCheckChildren: autoCheckChildren.value,
      cascade: cascade.value,
      withChildren: !!schema.value.withChildren,
      onlyChildren: !!schema.value.onlyChildren,
      autoCancelParent: !!schema.value.autoCancelParent,
      valueField: valueField.value,
      options: options.value,
    }
  }

  function applyToggle(item: OptionItem, current: unknown[]): unknown[] | null {
    if (disabled?.value || item.disabled) return null
    if (checkDisabled(item, current)) return null
    return toggleTreeSelection(current, item, checkOpts())
  }

  function toggle(item: OptionItem) {
    const next = applyToggle(item, selected.value)
    if (next) selected.value = next
    return next
  }

  function checked(item: OptionItem, values: unknown[] = selected.value) {
    return isTreeItemChecked(item, values, checkOpts())
  }

  function checkDisabled(item: OptionItem, values: unknown[] = selected.value) {
    if (isTreeItemCheckDisabled(item, values, checkOpts())) return true
    const on = checked(item, values)
    return (
      (maxLength.value > 0 && !on && values.length >= maxLength.value) ||
      (minLength.value > 0 && on && values.length <= minLength.value)
    )
  }

  function partial(item: OptionItem, values: unknown[] = selected.value) {
    return treeItemPartial(item, values, checkOpts())
  }

  function commitOptions(next: OptionItem[]) {
    localOptions.value = next
    seedExpanded(next)
  }

  function cancelEdit() {
    isAdding.value = false
    addingParent.value = null
    editingItem.value = null
    draftLabel.value = ''
  }

  function builtinCUD() {
    return !optionsHasCustomControls(schema.value)
  }

  async function emitOptionEvent(name: string, item: OptionItem) {
    return runOptionConfirm({
      schema: schema.value,
      eventName: name as 'addConfirm' | 'editConfirm' | 'deleteConfirm',
      data: data.value,
      value: currentValue(),
      options: options.value,
      item,
      env,
      scoped,
      overlay,
      form: formApi,
      scope: scope.value,
    })
  }

  async function emitItemClick(item: OptionItem) {
    const payload = {
      ...data.value,
      item,
      items: options.value,
      options: options.value,
    }
    const event = createVamisEvent('itemClick', payload)
    await runOnEvent(schema.value, 'itemClick', {
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

  async function openAddDialog(parent: OptionItem | null) {
    if (!overlay) return
    const result = await overlay.openDialog(optionsAddDialogSchema(schema.value), {
      ...data.value,
      ...(parent ? { parent } : {}),
    })
    if (!result) return
    const item = optionsOptionFromDialog(result, schema.value)
    if (!(await emitOptionEvent('addConfirm', item))) return
    const saved = await persistOptionMutation({
      api: schema.value.addApi,
      method: 'post',
      env,
      data: item,
      payload: { ...data.value, ...result },
      failureMessage: '新增选项失败',
    })
    if (!saved.ok) return
    if (parent) {
      expandItem(parent)
    }
    commitOptions(insertOptionInTree(options.value, parent, { ...item, ...saved.data }, valueField.value))
  }

  async function openEditDialog(item: OptionItem) {
    if (!overlay) return
    const result = await overlay.openDialog(optionsEditDialogSchema(schema.value), {
      ...data.value,
      ...item,
    })
    if (!result) return
    const patch = optionsOptionFromDialog({ ...item, ...result }, schema.value)
    const eventItem = {
      [labelField.value]: patch[labelField.value],
      [valueField.value]: patch[valueField.value],
    } as OptionItem
    if (!(await emitOptionEvent('editConfirm', eventItem))) return
    const saved = await persistOptionMutation({
      api: schema.value.editApi,
      method: 'post',
      env,
      data: patch,
      payload: { ...data.value, ...result },
      failureMessage: '编辑选项失败',
    })
    if (!saved.ok) return
    commitOptions(updateOptionInTree(options.value, item, { ...patch, ...saved.data }, valueField.value))
  }

  async function addOptionFromAction(raw: unknown, parentValue?: unknown): Promise<boolean> {
    const item = optionsOptionFromDialog(raw as PlainObject, schema.value)
    if (!(await emitOptionEvent('addConfirm', item))) return false
    const saved = await persistOptionMutation({
      api: schema.value.addApi,
      method: 'post',
      env,
      data: item,
      payload: { ...data.value, ...item },
      failureMessage: '新增选项失败',
    })
    if (!saved.ok) return false
    const parent =
      parentValue === undefined
        ? null
        : findOption(options.value, parentValue, valueField.value) || null
    if (parent) expandItem(parent)
    commitOptions(
      insertOptionInTree(
        options.value,
        parent,
        { ...item, ...saved.data },
        valueField.value,
      ),
    )
    return true
  }

  async function editOptionFromAction(raw: unknown, originValue: unknown): Promise<boolean> {
    const origin = findOption(options.value, originValue, valueField.value)
    if (!origin) return false
    const item = optionsOptionFromDialog({ ...origin, ...(raw as PlainObject) }, schema.value)
    if (!(await emitOptionEvent('editConfirm', item))) return false
    const saved = await persistOptionMutation({
      api: schema.value.editApi,
      method: 'post',
      env,
      data: item,
      payload: { ...data.value, ...item },
      failureMessage: '编辑选项失败',
    })
    if (!saved.ok) return false
    commitOptions(
      updateOptionInTree(
        options.value,
        origin,
        { ...item, ...saved.data },
        valueField.value,
      ),
    )
    return true
  }

  function startAdd(parent: OptionItem | null = null) {
    if (disabled?.value) return
    if (!builtinCUD()) {
      void openAddDialog(parent)
      return
    }
    isAdding.value = true
    addingParent.value = parent
    editingItem.value = null
    draftLabel.value = ''
    if (parent) {
      expandItem(parent)
    }
  }

  function startEdit(item: OptionItem) {
    if (disabled?.value || item.disabled) return
    if (!builtinCUD()) {
      void openEditDialog(item)
      return
    }
    isAdding.value = false
    addingParent.value = null
    editingItem.value = item
    draftLabel.value = item.label
  }

  async function removeItem(item: OptionItem): Promise<boolean> {
    if (disabled?.value || item.disabled) return false
    const confirmText = optionsDeleteConfirmText(schema.value, env.translate)
    if (confirmText) {
      const ok = await env.confirm(filterTpl(confirmText, { ...data.value, ...item }))
      if (!ok) return false
    }
    if (!(await emitOptionEvent('deleteConfirm', item))) return false
    const saved = await persistOptionMutation({
      api: schema.value.deleteApi,
      method: 'delete',
      env,
      data: item,
      payload: { ...data.value, ...item },
      failureMessage: '删除选项失败',
    })
    if (!saved.ok) return false
    const nextSelected = selected.value.filter((value) => !optionValuesEqual(value, item.value))
    commitOptions(removeOptionFromTree(options.value, item, valueField.value))
    selected.value = nextSelected
    cancelEdit()
    return true
  }

  async function deleteOptionFromAction(value: unknown): Promise<boolean> {
    const item = findOption(options.value, value, valueField.value)
    return item ? removeItem(item) : false
  }

  async function confirmEdit() {
    const label = draftLabel.value.trim()
    if (!label || disabled?.value) return
    let item: OptionItem | null = null
    if (editingItem.value) {
      item = {
        ...editingItem.value,
        [labelField.value]: label,
        label,
      }
    } else if (isAdding.value) {
      item = { label, value: label, [labelField.value]: label, [valueField.value]: label }
    }
    if (!item) return
    const eventName = editingItem.value ? 'editConfirm' : 'addConfirm'
    if (!(await emitOptionEvent(eventName, item))) return
    const saved = await persistOptionMutation({
      api: editingItem.value ? schema.value.editApi : schema.value.addApi,
      method: 'post',
      env,
      data: item,
      payload: { ...data.value, ...item },
      failureMessage: editingItem.value ? '编辑选项失败' : '新增选项失败',
    })
    if (!saved.ok) return
    const nextItem = { ...item, ...saved.data } as OptionItem
    if (editingItem.value) {
      commitOptions(updateOptionInTree(options.value, editingItem.value, nextItem, valueField.value))
    } else {
      commitOptions(insertOptionInTree(options.value, addingParent.value, nextItem, valueField.value))
    }
    cancelEdit()
  }

  return {
    query,
    options,
    filteredOptions,
    selected,
    serializeSelected,
    writeSelected,
    rootClearValue,
    writeRootValue,
    reloadOptions: loadSourceOptions,
    multiple,
    minLength,
    maxLength,
    hideRoot,
    rootLabel,
    rootValue,
    showRadio,
    deferField,
    valueField,
    showOutline,
    showIcon,
    searchable,
    virtualThreshold,
    placeholder,
    searchPlaceholder,
    searchSticky,
    searchImmediately,
    hideNodePathLabel,
    pathSeparator,
    creatable,
    editable,
    removable,
    rootCreatable,
    createTip,
    editTip,
    removeTip,
    rootCreateTip,
    isAdding,
    addingParent,
    editingItem,
    draftLabel,
    isExpanded,
    isDeferring,
    toggleExpand,
    toggle,
    applyToggle,
    checked,
    checkDisabled,
    partial,
    emitItemClick,
    startAdd,
    startEdit,
    removeItem,
    addOptionFromAction,
    editOptionFromAction,
    deleteOptionFromAction,
    confirmEdit,
    cancelEdit,
  }
}
