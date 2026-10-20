<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import 'varmis'
import {
  VarmisRoot,
  compileIrToWidget,
  jsonToIr,
  parseToIr,
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
import { buildSchemaTree, type SchemaTreeNode } from './tree'

const props = defineProps<{
  modelValue?: string
}>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const yamlText = ref(props.modelValue || '')
const parseError = ref('')
const selectedPath = ref('0')

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

function findNode(nodes: SchemaTreeNode[], path: string): SchemaTreeNode | undefined {
  for (const node of nodes) {
    if (node.path === path) return node
    const child = findNode(node.children, path)
    if (child) return child
  }
}

const selected = computed(() => findNode(tree.value, selectedPath.value) || tree.value[0])

function onYamlInput(value: string) {
  yamlText.value = value
  emit('update:modelValue', value)
}

function patchSelected(field: string, value: string) {
  if (!selected.value || !ir.value) return
  selected.value.schema[field] = value
  const next = yamlFromIr(jsonToIr(widget.value))
  onYamlInput(next)
}

function normalizeToIr() {
  if (!ir.value) return
  onYamlInput(yamlFromIr(ir.value))
}
</script>

<template>
  <div class="flex h-[70vh] min-h-96 overflow-hidden rounded-lg border bg-card">
    <aside class="flex w-64 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground">
      <div class="border-b border-sidebar-border px-3 py-2">
        <p class="font-mono text-[10px] tracking-[0.2em] text-sidebar-primary">SCHEMA TREE</p>
        <h2 class="text-sm font-medium">节点</h2>
      </div>
      <ScrollArea class="flex-1">
        <nav class="p-2 text-sm">
          <template v-for="node in tree" :key="node.path">
            <button
              class="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-sidebar-accent"
              :class="selectedPath === node.path ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''"
              @click="selectedPath = node.path"
            >
              <Badge variant="outline" class="font-mono text-[10px]">{{ node.type }}</Badge>
              <span class="truncate">{{ node.label }}</span>
            </button>
            <button
              v-for="child in node.children"
              :key="child.path"
              class="ml-4 flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-xs hover:bg-sidebar-accent"
              :class="selectedPath === child.path ? 'bg-sidebar-accent' : ''"
              @click="selectedPath = child.path"
            >
              <Badge variant="secondary" class="font-mono text-[10px]">{{ child.type }}</Badge>
              <span class="truncate">{{ child.label }}</span>
            </button>
          </template>
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
        <div class="grid gap-1.5">
          <Label>type</Label>
          <Input :model-value="selected?.schema.type" @update:model-value="patchSelected('type', String($event))" />
        </div>
        <div class="grid gap-1.5">
          <Label>title / label</Label>
          <Input
            :model-value="selected?.schema.title || selected?.schema.label"
            @update:model-value="patchSelected(selected?.schema.title != null ? 'title' : 'label', String($event))"
          />
        </div>
        <div class="grid gap-1.5">
          <Label>name</Label>
          <Input :model-value="selected?.schema.name" @update:model-value="patchSelected('name', String($event))" />
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
