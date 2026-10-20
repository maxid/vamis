<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import 'vamis'
import { VamisRoot } from 'vamis'
import {
  IR_API_VERSION,
  annotateEditorPaths,
  canInsertChild,
  cloneSchema,
  compileIrToWidget,
  getNodeAt,
  insertSnippet,
  moveAt,
  movePathTo,
  parseToIr,
  patchAt,
  provideEditorSelection,
  removeAt,
  yamlFromIr,
  type IrDocument,
  type SchemaObject,
} from '@vamis/core'
import {
  Badge,
  Button,
  Input,
  Label,
  ScrollArea,
  Textarea,
  Alert,
  AlertDescription,
  AlertTitle,
} from '@vamis/ui'
import { buildSchemaTree, findTreeNode } from './tree'
import { PALETTE_MIME, TREE_MIME, paletteGroups, snippetByType } from './palette'
import SchemaTreeNav from './SchemaTreeNav.vue'
import PropertyPanel from './PropertyPanel.vue'
import { type EventActionType } from './panels'

const props = defineProps<{
  modelValue?: string
}>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const yamlText = ref(props.modelValue || '')
const parseError = ref('')
const selectedPath = ref('')
const dropPath = ref('')

watch(
  () => props.modelValue,
  (value) => {
    if (value != null && value !== yamlText.value) yamlText.value = value
  },
)

const ir = computed<IrDocument | null>(() => {
  try {
    const doc = parseToIr(yamlText.value)
    parseError.value = ''
    return doc
  } catch (error) {
    parseError.value = error instanceof Error ? error.message : String(error)
    return null
  }
})

const widget = computed<SchemaObject | null>(() => (ir.value ? compileIrToWidget(ir.value) : null))
const tree = computed(() => (widget.value ? buildSchemaTree(widget.value) : []))
const selected = computed(() => findTreeNode(tree.value, selectedPath.value) || tree.value[0])
const previewIr = computed(() => {
  if (!ir.value) return null
  const cloned = cloneSchema(ir.value)
  annotateEditorPaths(compileIrToWidget(cloned))
  return cloned
})

provideEditorSelection({
  selectedPath,
  dropPath,
  select(path) {
    selectedPath.value = path
  },
  enabled: true,
})

function onYamlInput(value: string) {
  yamlText.value = value
  emit('update:modelValue', value)
}

function commit(root: SchemaObject, nextPath?: string) {
  const metadata = ir.value?.metadata || { name: 'untitled', description: 'edited' }
  onYamlInput(
    yamlFromIr({
      apiVersion: ir.value?.apiVersion || IR_API_VERSION,
      kind: 'UiPage',
      metadata,
      spec: root,
    }),
  )
  if (nextPath != null) selectedPath.value = nextPath
}

function withDraft(mutator: (draft: SchemaObject) => string | void) {
  if (!widget.value) return
  const draft = cloneSchema(widget.value)
  const nextPath = mutator(draft)
  commit(draft, typeof nextPath === 'string' ? nextPath : undefined)
}

function addSnippet(snippet: SchemaObject, path = selected.value?.path || '') {
  withDraft((draft) => insertSnippet(draft, path, cloneSchema(snippet)))
}

function onPaletteClick(type: string) {
  const snippet = snippetByType(type)
  if (snippet) addSnippet(snippet)
}

function onPaletteDragStart(event: DragEvent, type: string) {
  event.dataTransfer?.setData(PALETTE_MIME, type)
  event.dataTransfer?.setData('text/plain', type)
}

function handleDrop(path: string, type: string) {
  if (!type || type.startsWith('body.') || type.includes('/')) return
  const snippet = snippetByType(type)
  if (snippet) addSnippet(snippet, path)
}

function handleTreeMove(fromPath: string, toPath: string) {
  withDraft((draft) => {
    const dest = getNodeAt(draft, toPath)
    const position = canInsertChild(dest) ? 'inside' : 'after'
    return movePathTo(draft, fromPath, toPath, position)
  })
}

function handleCanvasReorder(fromPath: string, toPath: string, event: DragEvent) {
  const target = (event.target as HTMLElement | null)?.closest?.('[data-editor-path]')
  const rect = target?.getBoundingClientRect()
  const position = rect && event.clientY < rect.top + rect.height / 2 ? 'before' : 'after'
  withDraft((draft) => movePathTo(draft, fromPath, toPath, position))
}

function onCanvasClick(event: MouseEvent) {
  const target = (event.target as HTMLElement | null)?.closest?.('[data-editor-path]')
  if (!target) return
  selectedPath.value = target.getAttribute('data-editor-path') || ''
}

function onCanvasDragOver(event: DragEvent) {
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
  event.preventDefault()
  const from = event.dataTransfer?.getData(TREE_MIME) || ''
  const type = event.dataTransfer?.getData(PALETTE_MIME) || ''
  const target = (event.target as HTMLElement | null)?.closest?.('[data-editor-path]')
  const path = target?.getAttribute('data-editor-path') ?? selectedPath.value ?? ''
  dropPath.value = ''
  if (from) {
    handleCanvasReorder(from, path, event)
    return
  }
  if (type) handleDrop(path, type)
}

function addEventAction(actionType: EventActionType) {
  if (!selected.value) return
  const onEvent = cloneSchema(selected.value.schema.onEvent || {})
  const actions = [...(onEvent.click?.actions || [])]
  if (actionType === 'toast') actions.push({ actionType: 'toast', msg: '提示' })
  if (actionType === 'ajax') actions.push({ actionType: 'ajax', api: '/api/mock2/form/saveForm' })
  if (actionType === 'dialog') {
    actions.push({
      actionType: 'dialog',
      dialog: { title: '对话框', body: { type: 'tpl', tpl: '内容' } },
    })
  }
  if (actionType === 'drawer') {
    actions.push({
      actionType: 'drawer',
      drawer: { title: '抽屉', body: { type: 'tpl', tpl: '内容' } },
    })
  }
  if (actionType === 'setValue') actions.push({ actionType: 'setValue', value: { name: 'Ada' } })
  if (actionType === 'reload') actions.push({ actionType: 'reload', target: selected.value.schema.name || '' })
  onEvent.click = { actions }
  patchSelected('onEvent', onEvent)
}

function removeSelected() {
  if (!selected.value || selected.value.path === '') return
  withDraft((draft) => removeAt(draft, selected.value!.path))
}

function moveSelected(direction: -1 | 1) {
  if (!selected.value) return
  withDraft((draft) => moveAt(draft, selected.value!.path, direction))
}

function patchSelected(field: string, value: unknown) {
  if (!selected.value) return
  withDraft((draft) => {
    patchAt(draft, selected.value!.path, { [field]: value })
    return selected.value!.path
  })
}

function patchOptions(text: string) {
  const options = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, value] = line.split(':').map((part) => part.trim())
      return value ? { label, value } : { label, value: label }
    })
  patchSelected('options', options)
}

const optionsText = computed(() => {
  const options = selected.value?.schema.options
  if (!Array.isArray(options)) return ''
  return options
    .map((item: any) =>
      typeof item === 'object' ? `${item.label ?? item.name}:${item.value ?? item.label}` : String(item),
    )
    .join('\n')
})

function normalizeToIr() {
  if (!ir.value) return
  onYamlInput(yamlFromIr(ir.value))
}
</script>

<template>
  <div class="flex h-[70vh] min-h-96 overflow-hidden rounded-lg border bg-card">
    <aside class="flex w-72 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground">
      <div class="border-b border-sidebar-border px-3 py-2">
        <p class="font-mono text-[10px] tracking-[0.2em] text-sidebar-primary">PALETTE</p>
        <h2 class="text-sm font-medium">组件色板</h2>
      </div>
      <ScrollArea class="h-48 border-b">
        <div class="space-y-3 p-2">
          <div v-for="group in paletteGroups" :key="group.title">
            <p class="mb-1 px-1 font-mono text-[10px] tracking-wider text-sidebar-foreground/60">{{ group.title }}</p>
            <div class="flex flex-wrap gap-1">
              <button
                v-for="item in group.items"
                :key="item.type"
                type="button"
                draggable="true"
                class="cursor-pointer rounded-md border border-sidebar-border bg-sidebar-accent/50 px-2 py-1 text-[11px] text-sidebar-foreground hover:border-sidebar-primary hover:bg-sidebar-accent focus-visible:ring-sidebar-primary outline-none focus-visible:ring-2"
                @click="onPaletteClick(item.type)"
                @dragstart="onPaletteDragStart($event, item.type)"
              >
                {{ item.label }}
              </button>
            </div>
          </div>
        </div>
      </ScrollArea>
      <div class="border-b border-sidebar-border px-3 py-2">
        <p class="font-mono text-[10px] tracking-[0.2em] text-sidebar-primary">SCHEMA TREE</p>
        <h2 class="text-sm font-medium">节点</h2>
      </div>
      <ScrollArea class="flex-1">
        <nav class="p-2 text-sm">
          <SchemaTreeNav
            :nodes="tree"
            :selected-path="selectedPath"
            @select="selectedPath = $event"
            @drop="handleDrop"
            @move="handleTreeMove"
          />
        </nav>
      </ScrollArea>
    </aside>

    <section class="flex min-w-0 flex-1 flex-col">
      <div class="flex items-center justify-between border-b px-3 py-2">
        <div>
          <p class="font-mono text-[10px] tracking-[0.2em] text-primary">PREVIEW</p>
          <h2 class="text-sm font-medium">实时预览</h2>
        </div>
        <Badge v-if="ir" variant="outline">{{ ir.kind }}</Badge>
      </div>
      <ScrollArea class="flex-1 bg-background">
        <div
          class="min-h-full p-4"
          @click.capture="onCanvasClick"
          @dragover="onCanvasDragOver"
          @dragleave="onCanvasDragLeave"
          @drop="onCanvasDrop"
        >
          <Alert v-if="parseError" variant="destructive">
            <AlertTitle>YAML 无法解析</AlertTitle>
            <AlertDescription class="font-mono text-xs">{{ parseError }}</AlertDescription>
          </Alert>
          <VamisRoot v-else-if="previewIr" :schema="previewIr" />
        </div>
      </ScrollArea>
    </section>

    <aside class="flex w-80 shrink-0 flex-col border-l">
      <div class="border-b px-3 py-2">
        <p class="font-mono text-[10px] tracking-[0.2em] text-primary">SOURCE</p>
        <h2 class="text-sm font-medium">YAML · 属性</h2>
      </div>
      <div class="space-y-3 border-b p-3">
        <div class="flex gap-1">
          <Button size="sm" variant="outline" :disabled="!selected?.path" @click="moveSelected(-1)">上移</Button>
          <Button size="sm" variant="outline" :disabled="!selected?.path" @click="moveSelected(1)">下移</Button>
          <Button size="sm" variant="destructive" :disabled="!selected?.path" @click="removeSelected">删除</Button>
        </div>
        <div class="grid gap-1.5">
          <Label>type</Label>
          <Input :model-value="selected?.schema.type" @update:model-value="patchSelected('type', String($event))" />
        </div>
        <PropertyPanel
          :schema="selected?.schema"
          @patch="patchSelected"
          @add-action="addEventAction"
        />
        <div v-if="selected?.schema.type === 'select' || selected?.schema.options" class="grid gap-1.5">
          <Label>options（每行 label:value）</Label>
          <Textarea :model-value="optionsText" class="h-20 font-mono text-xs" @update:model-value="patchOptions(String($event))" />
        </div>
        <Button size="sm" variant="outline" @click="normalizeToIr">规范化为 IR 信封</Button>
      </div>
      <Textarea
        class="min-h-0 flex-1 resize-none rounded-none border-0 bg-code font-mono text-xs text-code-foreground"
        :model-value="yamlText"
        @update:model-value="onYamlInput(String($event))"
      />
    </aside>
  </div>
</template>
