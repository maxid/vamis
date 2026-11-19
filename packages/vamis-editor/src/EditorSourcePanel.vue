<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { VamisRoot } from '@vamis/core'
import { Editor, syncAuthoringText } from 'vamis'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@vamis/ui'

const props = defineProps<{
  source: string
  format?: 'yaml' | 'json'
  readonly?: boolean
}>()
const emit = defineEmits<{
  'update:source': [string]
  'update:format': ['yaml' | 'json']
  error: [string]
}>()

const tab = ref<'yaml' | 'json'>(props.format || 'yaml')
const yamlText = ref('')
const jsonText = ref('')
let fromSelf = false

const editorOptions = {
  wordWrap: 'on',
  formatOnType: false,
  formatOnPaste: false,
  minimap: { enabled: false },
} as const

function hydrate(text: string) {
  const trimmed = text.trim()
  const prefer = props.format || (trimmed.startsWith('{') || trimmed.startsWith('[') ? 'json' : 'yaml')
  try {
    const synced = syncAuthoringText(prefer, trimmed ? text : prefer === 'json' ? '{}\n' : '')
    tab.value = prefer
    yamlText.value = synced.yaml
    jsonText.value = synced.json
    emit('error', '')
  } catch (error) {
    tab.value = prefer
    if (prefer === 'json') jsonText.value = text
    else yamlText.value = text
    emit('error', error instanceof Error ? error.message : String(error))
  }
}

watch(
  () => props.source,
  (value) => {
    if (!fromSelf) hydrate(value)
  },
  { immediate: true },
)
watch(
  () => props.format,
  (format) => {
    if (format) tab.value = format
  },
)
watch(tab, (format) => emit('update:format', format))

function commit(kind: 'yaml' | 'json', text: string) {
  if (kind === 'yaml') yamlText.value = text
  else jsonText.value = text
  try {
    const synced = syncAuthoringText(kind, text)
    if (kind === 'yaml') jsonText.value = synced.json
    else yamlText.value = synced.yaml
    fromSelf = true
    emit('update:format', kind)
    emit('update:source', kind === 'yaml' ? synced.yaml : synced.json)
    emit('error', '')
    queueMicrotask(() => {
      fromSelf = false
    })
  } catch (error) {
    emit('error', error instanceof Error ? error.message : String(error))
  }
}

function editorSchema(kind: 'yaml' | 'json', text: string) {
  return {
    type: kind === 'json' ? 'json-editor' : 'yaml-editor',
    language: kind,
    value: text,
    size: 'full',
    hideButtons: true,
    intellisense: 'schema' as const,
    options: { ...editorOptions, readOnly: props.readonly },
  }
}

const yamlSchema = computed(() => editorSchema('yaml', yamlText.value))
const jsonSchema = computed(() => editorSchema('json', jsonText.value))
const hostSchema = { type: 'tpl', tpl: '', hidden: true }
</script>

<template>
  <VamisRoot :schema="hostSchema" class="flex min-h-0 flex-1 flex-col">
    <Tabs v-model="tab" class="flex min-h-0 flex-1 flex-col gap-2">
      <TabsList class="grid w-full grid-cols-2">
        <TabsTrigger value="yaml">YAML</TabsTrigger>
        <TabsTrigger value="json">JSON</TabsTrigger>
      </TabsList>
      <TabsContent value="yaml" force-mount class="mt-0 flex min-h-72 flex-1 flex-col data-[state=inactive]:hidden">
        <Editor class="h-full min-h-72 flex-1" :schema="yamlSchema" @change="commit('yaml', $event)" />
      </TabsContent>
      <TabsContent value="json" force-mount class="mt-0 flex min-h-72 flex-1 flex-col data-[state=inactive]:hidden">
        <Editor class="h-full min-h-72 flex-1" :schema="jsonSchema" @change="commit('json', $event)" />
      </TabsContent>
    </Tabs>
  </VamisRoot>
</template>
