/** InputTree / TreeSelect 共用：展开、懒加载、检索、勾选、增删改。 */

import { computed, ref, watch, type Ref } from 'vue'
import {
  createVamisEvent,
  eventEvalData,
  filterOptionTree,
  findOption,
  insertOptionInTree,
  isEffectiveApi,
  isOptionsVariableSource,
  isTreeItemCheckDisabled,
  isTreeItemChecked,
  isTreeNodeDefaultExpanded,
  optionNeedsDefer,
  optionsAddDialogSchema,
  optionsDeferField,
  optionsEditDialogSchema,
  optionsFromPayload,
  optionsHasCustomControls,
  optionsOptionFromDialog,
  removeOptionFromTree,
  requestApi,
  resolveDeferredOption,
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
  const remoteFiltered = ref<OptionItem[] | null>(null)
  const expanded = ref(new Map<OptionItem, boolean>())
  const deferring = ref(new Set<OptionItem>())
  const isAdding = ref(false)
  const addingParent = ref<OptionItem | null>(null)
  const editingItem = ref<OptionItem | null>(null)
  const draftLabel = ref('')
  const labelField = computed(() => String(schema.value.labelField || 'label'))
  const valueField = computed(() => String(schema.value.valueField || 'value'))
  const deferField = computed(() => optionsDeferField(schema.value))
  const options = computed(() =>
    localOptions.value ?? normalizeOptions(schema.value.options, labelField.value, valueField.value),
  )
  const multiple = computed(() => !!schema.value.multiple)
  const showRadio = computed(() => !!schema.value.showRadio)
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
    return filterOptionTree(options.value, query.value)
  })
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
      remoteFiltered.value = null
      deferring.value = new Set()
      cancelEdit()
      seedExpanded(normalizeOptions(schema.value.options, labelField.value, valueField.value))
    },
    { deep: true, immediate: true },
  )

  watch(query, (keyword) => {
    if (!keyword) remoteFiltered.value = null
    const api = schema.value.searchApi as SchemaApi | undefined
    if (!api || !keyword) return
    void searchRemote(keyword, api)
  })

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
    return isTreeItemCheckDisabled(item, values, checkOpts())
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
    const payload = { ...data.value, item }
    const event = createVamisEvent(name, payload)
    await runOnEvent(schema.value, name, {
      env,
      data: eventEvalData(payload, event),
      scoped,
      overlay,
      form: formApi,
      scope: scope.value,
      event,
    })
    return !event.prevented
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
    if (parent) {
      const next = new Map(expanded.value)
      next.set(parent, true)
      expanded.value = next
    }
    commitOptions(insertOptionInTree(options.value, parent, item, valueField.value))
  }

  async function openEditDialog(item: OptionItem) {
    if (!overlay) return
    const result = await overlay.openDialog(optionsEditDialogSchema(schema.value), {
      ...data.value,
      ...item,
    })
    if (!result) return
    const patch = optionsOptionFromDialog({ ...item, ...result }, schema.value)
    if (!(await emitOptionEvent('editConfirm', patch))) return
    commitOptions(updateOptionInTree(options.value, item, patch, valueField.value))
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
      const next = new Map(expanded.value)
      next.set(parent, true)
      expanded.value = next
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

  async function removeItem(item: OptionItem) {
    if (disabled?.value || item.disabled) return
    const confirmText =
      schema.value.deleteConfirmText != null ? String(schema.value.deleteConfirmText) : '确认要删除？'
    if (confirmText) {
      const ok = await env.confirm(confirmText)
      if (!ok) return
    }
    const nextSelected = selected.value.filter((value) => !optionValuesEqual(value, item.value))
    commitOptions(removeOptionFromTree(options.value, item, valueField.value))
    selected.value = nextSelected
    cancelEdit()
  }

  function confirmEdit() {
    const label = draftLabel.value.trim()
    if (!label || disabled?.value) return
    if (editingItem.value) {
      commitOptions(
        updateOptionInTree(options.value, editingItem.value, { [labelField.value]: label, label }, valueField.value),
      )
    } else if (isAdding.value) {
      const child: OptionItem = { label, value: label, [labelField.value]: label, [valueField.value]: label }
      commitOptions(insertOptionInTree(options.value, addingParent.value, child, valueField.value))
    }
    cancelEdit()
  }

  return {
    query,
    options,
    filteredOptions,
    selected,
    multiple,
    showRadio,
    deferField,
    valueField,
    showOutline,
    showIcon,
    searchable,
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
    startAdd,
    startEdit,
    removeItem,
    confirmEdit,
    cancelEdit,
  }
}
