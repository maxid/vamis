/** InputTree / TreeSelect 共用：展开、懒加载、检索、勾选、增删改。 */

import { computed, ref, watch, type Ref } from 'vue'
import {
  filterOptionTree,
  filterTpl,
  insertOptionInTree,
  isEffectiveApi,
  isOptionsVariableSource,
  isTreeItemCheckDisabled,
  isTreeItemChecked,
  optionsAddDialogSchema,
  optionsEditDialogSchema,
  optionsFromPayload,
  optionsHasCustomControls,
  optionsOptionFromDialog,
  persistOptionMutation,
  removeOptionFromTree,
  requestApi,
  runOptionConfirm,
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
  const { deferField, isExpanded, isDeferring, expandItem, toggleExpand, seedExpanded } = treeState
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

  function currentValue() {
    return schema.value.name ? fieldApi.getValue(schema.value.name) : schema.value.value
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

  watch(query, (keyword) => {
    if (!keyword) remoteFiltered.value = null
    const api = schema.value.searchApi as SchemaApi | undefined
    if (!api || !keyword) return
    void searchRemote(keyword, api)
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

  async function removeItem(item: OptionItem) {
    if (disabled?.value || item.disabled) return
    const confirmText =
      schema.value.deleteConfirmText != null ? String(schema.value.deleteConfirmText) : ''
    if (confirmText) {
      const ok = await env.confirm(filterTpl(confirmText, { ...data.value, ...item }))
      if (!ok) return
    }
    if (!(await emitOptionEvent('deleteConfirm', item))) return
    const saved = await persistOptionMutation({
      api: schema.value.deleteApi,
      method: 'delete',
      env,
      data: item,
      payload: { ...data.value, ...item },
      failureMessage: '删除选项失败',
    })
    if (!saved.ok) return
    const nextSelected = selected.value.filter((value) => !optionValuesEqual(value, item.value))
    commitOptions(removeOptionFromTree(options.value, item, valueField.value))
    selected.value = nextSelected
    cancelEdit()
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
