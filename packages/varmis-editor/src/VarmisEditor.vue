<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import 'varmis'
import { VarmisRoot } from 'varmis'
import {
  IR_API_VERSION,
  cloneSchema,
  compileIrToWidget,
  insertSnippet,
  moveAt,
  parseToIr,
  patchAt,
  removeAt,
  yamlFromIr,
  type IrDocument,
  type SchemaObject,
} from '@varmis/core'
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
} from '@varmis/ui'
import { buildSchemaTree, findTreeNode } from './tree'
import { PALETTE_MIME, paletteGroups, snippetByType } from './palette'
import SchemaTreeNav from './SchemaTreeNav.vue'

const props = defineProps<{
  modelValue?: string
}>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const yamlText = ref(props.modelValue || '')
const parseError = ref('')
const selectedPath = ref('')

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
  const snippet = type ? snippetByType(type) : null
  if (snippet) addSnippet(snippet, path)
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

function patchTitle(value: string) {
  if (!selected.value) return
  const schema = selected.value.schema
  const field = schema.title != null || ['page', 'form', 'panel', 'dialog', 'wizard', 'alert', 'crud'].includes(schema.type || '')
    ? 'title'
    : 'label'
  patchSelected(field, value)
}

function patchRequired(checked: boolean) {
  patchSelected('required', checked)
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
            <p class="mb-1 px-1 font-mono text-[10px] tracking-wider text-muted-foreground">{{ group.title }}</p>
            <div class="flex flex-wrap gap-1">
              <button
                v-for="item in group.items"
                :key="item.type"
                type="button"
                draggable="true"
                class="rounded-md border bg-background px-2 py-1 text-[11px] hover:border-primary"
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
        <div class="p-4">
          <Alert v-if="parseError" variant="destructive">
            <AlertTitle>YAML 无法解析</AlertTitle>
            <AlertDescription class="font-mono text-xs">{{ parseError }}</AlertDescription>
          </Alert>
          <VarmisRoot v-else-if="widget" :schema="ir" />
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
        <div class="grid gap-1.5">
          <Label>title / label</Label>
          <Input
            :model-value="selected?.schema.title || selected?.schema.label"
            @update:model-value="patchTitle(String($event))"
          />
        </div>
        <div class="grid gap-1.5">
          <Label>name</Label>
          <Input :model-value="selected?.schema.name" @update:model-value="patchSelected('name', String($event))" />
        </div>
        <div class="grid gap-1.5">
          <Label>placeholder</Label>
          <Input
            :model-value="selected?.schema.placeholder"
            @update:model-value="patchSelected('placeholder', String($event))"
          />
        </div>
        <div class="grid gap-1.5">
          <Label>tpl / 文本</Label>
          <Input :model-value="selected?.schema.tpl" @update:model-value="patchSelected('tpl', String($event))" />
        </div>
        <div class="grid gap-1.5">
          <Label>api</Label>
          <Input :model-value="selected?.schema.api" @update:model-value="patchSelected('api', String($event))" />
        </div>
        <div class="flex items-center gap-2">
          <input
            id="required"
            type="checkbox"
            :checked="!!selected?.schema.required"
            @change="patchRequired(($event.target as HTMLInputElement).checked)"
          />
          <Label for="required">required</Label>
        </div>
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
