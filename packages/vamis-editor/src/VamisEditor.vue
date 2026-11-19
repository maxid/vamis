<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import 'vamis'
import { VamisRoot } from 'vamis'
import {
  IR_API_VERSION,
  annotateEditorPaths,
  canInsertChild,
  cloneSchema,
  compileIrToWidget,
  formatSchemaAs,
  insertKeyFor,
  jsonToIr,
  parseToIr,
  provideEditorSelection,
  setByPathCopy,
  yamlFromIr,
  type IrDocument,
  type RendererEnv,
  type SchemaObject,
} from '@vamis/core'
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  ScrollArea,
  Textarea,
} from '@vamis/ui'
import './builtins'
import { EditorManager, type EditorNode } from './manager'
import type { ContextMenuEntry, PanelItem, SubRendererInfo } from './plugin'
import { buildSchemaTree } from './tree'
import { PALETTE_MIME, TREE_MIME } from './palette'
import SchemaTreeNav from './SchemaTreeNav.vue'
import SchemaControls from './SchemaControls.vue'
import EditorSourcePanel from './EditorSourcePanel.vue'
import type { EditorProps } from './types'

const props = withDefaults(defineProps<EditorProps>(), { autoFocus: true })
const emit = defineEmits<{
  change: [value: SchemaObject]
  'update:modelValue': [value: SchemaObject | string]
  'update:preview': [value: boolean]
  'update:isMobile': [value: boolean]
  save: []
}>()

interface ParsedInput {
  root: SchemaObject
  ir: IrDocument
  text?: string
}

function parseInput(input: SchemaObject | string | undefined): ParsedInput {
  const ir = typeof input === 'string' ? parseToIr(input) : jsonToIr(input || { type: 'page', body: [] })
  return { root: compileIrToWidget(ir), ir, text: typeof input === 'string' ? input : undefined }
}

const initialInput = props.value ?? props.modelValue
const initial = parseInput(initialInput)
const envelope = ref(initial.ir)
const sourceFormat = ref<'yaml' | 'json'>(
  typeof initialInput === 'string' && initialInput.trim().startsWith('{') ? 'json' : 'yaml',
)
const sourceText = ref(initial.text || formatSchemaAs(initial.root, sourceFormat.value))
const sourceError = ref('')
const dropPath = ref('')
const paletteSearch = ref('')
const activePanelKey = ref('config')
const internalPreview = ref(!!props.preview)
const internalMobile = ref(!!props.isMobile)
let lastObject: SchemaObject | null = null
let lastText = initial.text || ''

const manager = new EditorManager(
  {
    ...props,
    onChange: handleManagerChange,
    onPreview(value) {
      internalPreview.value = value
      emit('update:preview', value)
      props.onPreview?.(value)
    },
    onSave() {
      emit('save')
      props.onSave?.()
    },
  },
  initial.root,
)
const isPreview = computed(() => internalPreview.value)
const tree = computed(() => buildSchemaTree(manager.state.schema))
const selected = computed(() => {
  void manager.state.version
  return manager.activeNode
})
const selectedPath = computed({
  get: () => selected.value?.path || '',
  set: (path: string) => manager.setActivePath(path),
})
const selectionApi = {
  selectedPath,
  dropPath,
  select(path: string) {
    manager.setActivePath(path)
  },
  enabled: computed(() => !isPreview.value),
}
provideEditorSelection(selectionApi)

const previewWidget = computed(() => {
  const cloned = cloneSchema(manager.state.schema)
  annotateEditorPaths(cloned)
  return props.schemaFilter ? props.schemaFilter(cloned, isPreview.value) : cloned
})
const previewEnv = computed<Partial<RendererEnv>>(() => ({
  ...(props.amisEnv || {}),
  ...(props.vamisEnv || {}),
  theme: props.theme || props.vamisEnv?.theme || props.amisEnv?.theme,
  parseLocation: false,
}))
const panels = computed(() => manager.state.panels.filter((panel) => panel.position !== 'left'))
const currentPanel = computed<PanelItem | undefined>(
  () => panels.value.find((panel) => panel.key === activePanelKey.value) || panels.value[0],
)
const panelComponent = computed(() => {
  const panel = currentPanel.value
  const node = selected.value
  if (!panel?.render || !node) return null
  return () => panel.render!({ node, value: node.schema, manager, readonly: props.readonly })
})
const quickEditNode = computed(() => {
  void manager.state.version
  return manager.getNodeById(manager.state.quickEditId)
})
const quickEditBody = computed(() => {
  const node = quickEditNode.value
  const plugin = node?.info?.plugin
  if (!node || !plugin) return []
  return plugin.popOverBodyCreator?.(manager.buildEventContext(node)) || plugin.popOverBody || []
})
const palette = computed(() => {
  const query = paletteSearch.value.trim().toLowerCase()
  const groups = new Map<string, SubRendererInfo[]>()
  for (const renderer of manager.state.availableRenderers) {
    const haystack = `${renderer.name} ${renderer.rendererName || ''} ${renderer.searchKeywords || ''}`.toLowerCase()
    if (query && !haystack.includes(query)) continue
    const tags = Array.isArray(renderer.tags) ? renderer.tags : [renderer.tags || '自定义']
    for (const tag of tags) {
      if (!groups.has(tag)) groups.set(tag, [])
      groups.get(tag)!.push(renderer)
    }
  }
  return Array.from(groups, ([title, items]) => ({ title, items }))
})
const optionsText = computed(() => {
  const options = selected.value?.schema.options
  if (!Array.isArray(options)) return ''
  return options
    .map((item) =>
      item && typeof item === 'object' ? `${item.label ?? item.name}:${item.value ?? item.label}` : String(item),
    )
    .join('\n')
})

watch(
  () => props.preview,
  (value) => {
    internalPreview.value = !!value
  },
)
watch(
  () => props.isMobile,
  (value) => {
    internalMobile.value = !!value
  },
)
watch(panels, (value) => {
  if (!value.some((panel) => panel.key === activePanelKey.value)) activePanelKey.value = value[0]?.key || 'config'
})
watch(
  () => [props.value, props.modelValue] as const,
  ([value, modelValue]) => {
    const input = value ?? modelValue
    if (input == null || input === lastObject || input === lastText) return
    try {
      const parsed = parseInput(input)
      envelope.value = parsed.ir
      manager.setSchema(parsed.root)
      sourceText.value = parsed.text || formatSchemaAs(manager.value, sourceFormat.value)
      sourceError.value = ''
      if (parsed.text) lastText = parsed.text
    } catch (error) {
      sourceError.value = error instanceof Error ? error.message : String(error)
    }
  },
  { deep: false },
)

onMounted(() => {
  manager.init()
  nextTick(() => manager.rebuild())
})
onBeforeUnmount(() => manager.dispose())

defineExpose({ manager })

function serialize(value: SchemaObject): string {
  if (typeof (props.value ?? props.modelValue) === 'object') return formatSchemaAs(value, sourceFormat.value)
  const doc: IrDocument = {
    ...envelope.value,
    apiVersion: envelope.value.apiVersion || IR_API_VERSION,
    kind: envelope.value.kind || 'UiPage',
    metadata: envelope.value.metadata || { name: 'untitled', description: 'edited' },
    spec: value,
  }
  envelope.value = doc
  return formatSchemaAs(doc, sourceFormat.value)
}

function handleManagerChange(value: SchemaObject) {
  lastObject = value
  const text = serialize(value)
  sourceText.value = text
  lastText = text
  emit('change', value)
  if (props.value == null || props.modelValue != null) {
    emit('update:modelValue', typeof props.modelValue === 'string' ? text : value)
  }
}

function onSourceUpdate(text: string) {
  try {
    const parsed = parseInput(text)
    envelope.value = parsed.ir
    manager.setSchema(parsed.root, true)
    sourceError.value = ''
    handleManagerChange(manager.value)
  } catch (error) {
    sourceError.value = error instanceof Error ? error.message : String(error)
  }
}

function rendererByTransfer(event: DragEvent): SubRendererInfo | undefined {
  const id = event.dataTransfer?.getData(PALETTE_MIME) || event.dataTransfer?.getData('text/plain') || ''
  return manager.state.availableRenderers.find((item) => item.id === id || item.rendererName === id)
}

function insertRenderer(renderer: SubRendererInfo, path = selected.value?.path || '') {
  const target = manager.getNodeByPath(path) || manager.activeNode
  if (!target) return
  if (canInsertChild(target.schema) || target.info?.regions?.length) {
    const region = target.info?.regions?.[0]?.key || insertKeyFor(target.schema)
    const schema = cloneSchema(renderer.scaffold || { type: renderer.type || renderer.rendererName })
    manager.addChild(target.id, region, schema, undefined, renderer)
  } else {
    manager.setActiveId(target.id)
    manager.addElem(renderer)
  }
}

function onPaletteClick(renderer: SubRendererInfo) {
  if (!props.readonly) manager.addElem(renderer)
}

function onPaletteDragStart(event: DragEvent, renderer: SubRendererInfo) {
  event.dataTransfer?.setData(PALETTE_MIME, renderer.id)
  event.dataTransfer?.setData('text/plain', renderer.rendererName || renderer.type || renderer.id)
}

function handleTreeDrop(path: string, rendererId: string) {
  const renderer = manager.state.availableRenderers.find(
    (item) => item.id === rendererId || item.rendererName === rendererId,
  )
  if (renderer && !props.readonly) insertRenderer(renderer, path)
}

function moveNodeTo(fromPath: string, toPath: string, position: 'before' | 'after' | 'inside' = 'inside') {
  const source = manager.getNodeByPath(fromPath)
  const target = manager.getNodeByPath(toPath)
  if (!source || !target || props.readonly) return false
  if (position === 'inside' && (canInsertChild(target.schema) || target.info?.regions?.length)) {
    return manager.move(target.id, target.info?.regions?.[0]?.key || insertKeyFor(target.schema), source.id)
  }
  if (!target.parent) return false
  const siblings = target.parent.schema[target.region || ''] as SchemaObject[]
  const sibling = position === 'after' ? siblings?.[target.index + 1] : target.schema
  return manager.move(
    target.parent.id,
    target.region || insertKeyFor(target.parent.schema),
    source.id,
    sibling?.$$id,
  )
}

function handleTreeMove(fromPath: string, toPath: string) {
  const target = manager.getNodeByPath(toPath)
  moveNodeTo(fromPath, toPath, target && canInsertChild(target.schema) ? 'inside' : 'after')
}

function onCanvasClick(event: MouseEvent) {
  if (isPreview.value) return
  manager.closeContextMenu()
  const prevented = manager.trigger('prevent-click', { data: event }).prevented
  if (prevented) return
  const target = (event.target as HTMLElement | null)?.closest?.('[data-editor-id], [data-editor-path]')
  if (!target) return
  const id = target.getAttribute('data-editor-id')
  const path = target.getAttribute('data-editor-path')
  if (id) manager.setActiveId(id)
  else if (path != null) selectedPath.value = path
}

function onCanvasDragOver(event: DragEvent) {
  if (isPreview.value || props.readonly) return
  event.preventDefault()
  if (event.dataTransfer) event.dataTransfer.dropEffect = 'move'
  const target = (event.target as HTMLElement | null)?.closest?.('[data-editor-path]')
  dropPath.value = target?.getAttribute('data-editor-path') || ''
}

function onCanvasDragLeave(event: DragEvent) {
  const next = event.relatedTarget as Node | null
  if (next && (event.currentTarget as HTMLElement).contains(next)) return
  dropPath.value = ''
}

function onCanvasDrop(event: DragEvent) {
  if (isPreview.value || props.readonly) return
  event.preventDefault()
  event.stopPropagation()
  const from = event.dataTransfer?.getData(TREE_MIME) || ''
  const target = (event.target as HTMLElement | null)?.closest?.('[data-editor-path]')
  const path = target?.getAttribute('data-editor-path') ?? selectedPath.value
  dropPath.value = ''
  if (from) {
    const rect = target?.getBoundingClientRect()
    const position = rect && event.clientY < rect.top + rect.height / 2 ? 'before' : 'after'
    moveNodeTo(from, path, position)
    return
  }
  const renderer = rendererByTransfer(event)
  if (renderer) insertRenderer(renderer, path)
}

function openContextMenu(path: string, event: MouseEvent) {
  if (isPreview.value || props.readonly) return
  event.preventDefault()
  event.stopPropagation()
  const node = manager.getNodeByPath(path)
  if (!node) return
  manager.setActiveId(node.id)
  manager.openContextMenu(node.id, '', {
    x: event.clientX,
    y: event.clientY,
    clientX: event.clientX,
    clientY: event.clientY,
    target: event.target as HTMLElement,
  })
}

function onCanvasContextMenu(event: MouseEvent) {
  const target = (event.target as HTMLElement | null)?.closest?.('[data-editor-path]')
  if (target) openContextMenu(target.getAttribute('data-editor-path') || '', event)
}

function runMenu(item: ContextMenuEntry) {
  if (item === '|' || item.disabled) return
  item.onSelect?.(item.id)
  manager.closeContextMenu()
}

function patchOptions(text: string) {
  if (!selected.value) return
  const options = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, value] = line.split(':').map((part) => part.trim())
      return value ? { label, value } : { label, value: label }
    })
  manager.updateField(selected.value.id, 'options', options)
}

function togglePreview() {
  internalPreview.value = !internalPreview.value
  emit('update:preview', internalPreview.value)
  props.onPreview?.(internalPreview.value)
}

function toggleMobile() {
  internalMobile.value = !internalMobile.value
  emit('update:isMobile', internalMobile.value)
}

function onKeydown(event: KeyboardEvent) {
  if (props.readonly || isPreview.value) return
  const target = event.target as HTMLElement
  if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable) return
  if (target.closest('.monaco-editor')) return
  const command = event.metaKey || event.ctrlKey
  if (command && event.key.toLowerCase() === 'z') {
    event.preventDefault()
    event.shiftKey ? manager.redo() : manager.undo()
  } else if (command && event.key.toLowerCase() === 's') {
    event.preventDefault()
    manager.config.onSave?.()
  } else if (command && event.key.toLowerCase() === 'p') {
    event.preventDefault()
    togglePreview()
  } else if (command && event.key === 'ArrowUp') {
    event.preventDefault()
    manager.moveUp()
  } else if (command && event.key === 'ArrowDown') {
    event.preventDefault()
    manager.moveDown()
  } else if ((event.key === 'Backspace' || event.key === 'Delete') && selected.value?.path) {
    event.preventDefault()
    manager.del(selected.value.id)
  }
}

function normalizeToIr() {
  sourceText.value = yamlFromIr({
    ...envelope.value,
    spec: manager.value,
  })
  sourceFormat.value = 'yaml'
  lastText = sourceText.value
  emit('update:modelValue', sourceText.value)
}

const scaffoldValues = ref<SchemaObject>({})
watch(
  () => manager.state.scaffoldRequest,
  (request) => {
    if (!request) return
    scaffoldValues.value = request.form.pipeIn?.(request.value) || cloneSchema(request.value)
  },
)
const scaffoldBody = computed(() => {
  const form = manager.state.scaffoldRequest?.form
  return form?.body || form?.controls || []
})
function patchScaffold(field: string, value: unknown) {
  scaffoldValues.value = setByPathCopy(scaffoldValues.value, field, value)
}

function patchPanel(field: string, value: unknown) {
  if (selected.value) manager.updateField(selected.value.id, field, value)
}

function patchQuickEdit(field: string, value: unknown) {
  if (quickEditNode.value) manager.updateField(quickEditNode.value.id, field, value)
}
</script>

<template>
  <div
    class="flex h-[70vh] min-h-[36rem] overflow-hidden rounded-lg border bg-card outline-none"
    :class="props.className"
    tabindex="0"
    @keydown="onKeydown"
    @click="manager.closeContextMenu()"
  >
    <template v-if="!isPreview">
      <aside v-if="!mini" class="flex w-72 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground">
        <div class="border-b border-sidebar-border px-3 py-2">
          <p class="font-mono text-[10px] tracking-[0.2em] text-sidebar-primary">COMPONENTS</p>
          <h2 class="text-sm font-medium">组件</h2>
        </div>
        <div class="border-b border-sidebar-border p-2">
          <Input v-model="paletteSearch" placeholder="搜索组件" aria-label="搜索组件" />
        </div>
        <ScrollArea class="h-[42%] border-b">
          <div class="space-y-3 p-2">
            <div v-for="group in palette" :key="group.title">
              <p class="mb-1 px-1 font-mono text-[10px] tracking-wider text-sidebar-foreground/60">{{ group.title }}</p>
              <div class="grid grid-cols-2 gap-1">
                <button
                  v-for="item in group.items"
                  :key="item.id"
                  type="button"
                  draggable="true"
                  :title="item.description"
                  class="cursor-pointer rounded-md border border-sidebar-border bg-sidebar-accent/50 px-2 py-1 text-left text-[11px] text-sidebar-foreground hover:border-sidebar-primary hover:bg-sidebar-accent focus-visible:ring-sidebar-primary outline-none focus-visible:ring-2"
                  @click="onPaletteClick(item)"
                  @dragstart="onPaletteDragStart($event, item)"
                >
                  {{ item.name }}
                </button>
              </div>
            </div>
            <p v-if="!palette.length" class="p-2 text-xs text-muted-foreground">没有匹配的组件</p>
          </div>
        </ScrollArea>
        <div class="border-b border-sidebar-border px-3 py-2">
          <p class="font-mono text-[10px] tracking-[0.2em] text-sidebar-primary">OUTLINE</p>
          <h2 class="text-sm font-medium">大纲</h2>
        </div>
        <ScrollArea class="flex-1">
          <nav class="p-2 text-sm">
            <SchemaTreeNav
              :nodes="tree"
              :selected-path="selectedPath"
              @select="manager.setActivePath($event)"
              @drop="handleTreeDrop"
              @move="handleTreeMove"
              @contextmenu="openContextMenu"
            />
          </nav>
        </ScrollArea>
      </aside>

      <section class="flex min-w-0 flex-1 flex-col">
        <div class="flex min-h-12 items-center justify-between gap-2 border-b px-3 py-2">
          <div class="flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
            <span>页面</span>
            <template v-if="selected">
              <span>/</span>
              <span class="truncate text-foreground">{{ selected.info?.name || selected.label }}</span>
            </template>
          </div>
          <div class="flex shrink-0 items-center gap-1">
            <Button size="sm" variant="ghost" :disabled="!manager.canUndo" title="撤销" @click="manager.undo()">撤销</Button>
            <Button size="sm" variant="ghost" :disabled="!manager.canRedo" title="重做" @click="manager.redo()">重做</Button>
            <Button size="sm" variant="outline" @click="toggleMobile">{{ internalMobile ? '桌面' : '移动' }}</Button>
            <Button size="sm" variant="outline" @click="togglePreview">预览</Button>
          </div>
        </div>
        <ScrollArea class="flex-1 bg-background">
          <div
            class="min-h-full p-4"
            @click.capture="onCanvasClick"
            @dragover="onCanvasDragOver"
            @dragleave="onCanvasDragLeave"
            @drop="onCanvasDrop"
            @contextmenu="onCanvasContextMenu"
          >
            <Alert v-if="sourceError" variant="destructive" class="mb-3">
              <AlertTitle>无法解析</AlertTitle>
              <AlertDescription class="font-mono text-xs">{{ sourceError }}</AlertDescription>
            </Alert>
            <div
              class="mx-auto min-h-96 bg-card transition-[width]"
              :class="internalMobile ? 'w-[375px] max-w-full rounded-2xl border p-2 shadow-sm' : 'w-full'"
            >
              <VamisRoot :schema="previewWidget" :env="previewEnv" />
            </div>
          </div>
        </ScrollArea>
        <div v-if="selected && manager.state.toolbars.length && !props.readonly" class="flex flex-wrap gap-1 border-t px-3 py-2">
          <Button
            v-for="item in manager.state.toolbars"
            :key="item.id"
            size="sm"
            variant="outline"
            :disabled="item.disabled"
            :title="item.tooltip"
            @click="item.onClick?.($event)"
          >
            {{ item.label || item.tooltip || item.id }}
          </Button>
        </div>
      </section>

      <aside v-if="!mini" class="flex w-96 shrink-0 flex-col border-l">
        <div class="flex items-center justify-between border-b px-3 py-2">
          <div>
            <p class="font-mono text-[10px] tracking-[0.2em] text-primary">PROPERTIES</p>
            <h2 class="text-sm font-medium">{{ selected?.info?.name || selected?.label || '属性' }}</h2>
          </div>
          <Badge v-if="selected" variant="outline">{{ selected.type }}</Badge>
        </div>
        <div v-if="panels.length" class="flex gap-1 border-b px-3 py-2">
          <Button
            v-for="panel in panels"
            :key="panel.key"
            size="sm"
            :variant="currentPanel?.key === panel.key ? 'default' : 'ghost'"
            @click="activePanelKey = panel.key"
          >
            {{ panel.title || panel.key }}
          </Button>
        </div>
        <ScrollArea class="max-h-[45%] min-h-48 border-b">
          <div v-if="selected" class="p-3">
            <component :is="panelComponent" v-if="panelComponent" />
            <SchemaControls
              v-else-if="currentPanel?.body"
              :nodes="currentPanel.body"
              :value="selected.schema"
              :readonly="readonly"
              @patch="patchPanel"
            />
            <p v-else class="text-xs text-muted-foreground">该组件没有注册编辑器面板，可在 JSON / YAML 中编辑。</p>
            <div v-if="selected.schema.options" class="mt-3 grid gap-1.5 border-t pt-3">
              <label class="text-sm font-medium">options（每行 label:value）</label>
              <Textarea
                :model-value="optionsText"
                class="h-20 font-mono text-xs"
                :disabled="readonly"
                @update:model-value="patchOptions(String($event))"
              />
            </div>
          </div>
        </ScrollArea>
        <div class="flex items-center justify-between border-b px-3 py-2">
          <span class="text-sm font-medium">Schema</span>
          <Button
            v-if="typeof modelValue === 'string'"
            size="sm"
            variant="ghost"
            :disabled="readonly"
            @click="normalizeToIr"
          >
            规范化为 IR
          </Button>
        </div>
        <EditorSourcePanel
          :source="sourceText"
          :format="sourceFormat"
          :readonly="readonly"
          @update:source="onSourceUpdate"
          @update:format="sourceFormat = $event"
          @error="sourceError = $event"
        />
      </aside>
    </template>
    <div v-else class="relative min-w-0 flex-1 bg-background p-4">
      <Button class="absolute right-6 top-6 z-10" size="sm" variant="outline" @click="togglePreview">退出预览</Button>
      <VamisRoot :schema="previewWidget" :env="previewEnv" />
    </div>

    <Teleport to="body">
      <div
        v-if="manager.state.contextMenu"
        class="fixed z-[2000] min-w-40 rounded-md border bg-card p-1 shadow-lg"
        :style="{ left: `${manager.state.contextMenu.x}px`, top: `${manager.state.contextMenu.y}px` }"
        @click.stop
        @contextmenu.prevent
      >
        <template v-for="(item, index) in manager.state.contextMenu.menus" :key="item === '|' ? `divider-${index}` : item.id || index">
          <div v-if="item === '|'" class="my-1 border-t" />
          <button
            v-else
            type="button"
            class="block w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent disabled:opacity-50"
            :class="item.className"
            :disabled="item.disabled"
            @click="runMenu(item)"
          >
            {{ item.label }}
          </button>
        </template>
      </div>
    </Teleport>

    <Dialog :open="!!manager.state.scaffoldRequest" @update:open="!$event && manager.cancelScaffold()">
      <DialogContent class="max-w-lg">
        <DialogHeader>
          <DialogTitle>{{ manager.state.scaffoldRequest?.form.title || '配置组件' }}</DialogTitle>
        </DialogHeader>
        <SchemaControls :nodes="scaffoldBody" :value="scaffoldValues" @patch="patchScaffold" />
        <DialogFooter>
          <Button variant="outline" @click="manager.cancelScaffold()">取消</Button>
          <Button @click="manager.completeScaffold(scaffoldValues)">确认</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <Dialog :open="!!quickEditNode" @update:open="!$event && manager.closeNodePopOverForm()">
      <DialogContent class="max-w-lg">
        <DialogHeader>
          <DialogTitle>{{ quickEditNode?.info?.name || '快速配置' }}</DialogTitle>
        </DialogHeader>
        <SchemaControls
          v-if="quickEditNode"
          :nodes="quickEditBody"
          :value="quickEditNode.schema"
          @patch="patchQuickEdit"
        />
        <DialogFooter>
          <Button @click="manager.closeNodePopOverForm()">完成</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
