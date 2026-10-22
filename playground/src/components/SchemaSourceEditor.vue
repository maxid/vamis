<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { VamisRoot } from '@vamis/core'
import { Editor, syncAuthoringText } from 'vamis'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@vamis/ui'

const props = defineProps<{
  source: string
}>()

const emit = defineEmits<{
  'update:source': [string]
  error: [string]
}>()

const tab = ref<'yaml' | 'json'>('yaml')
const yamlText = ref('')
const jsonText = ref('')
let fromSelf = false

const SCHEMA_EDITOR_OPTIONS = {
  wordWrap: 'on',
  formatOnType: false,
  formatOnPaste: false,
  minimap: { enabled: false },
} as const

function looksJson(text: string) {
  const trimmed = text.trim()
  return trimmed.startsWith('{') || trimmed.startsWith('[')
}

function hydrate(text: string) {
  const trimmed = text.trim()
  const prefer: 'yaml' | 'json' = looksJson(trimmed) ? 'json' : 'yaml'
  try {
    const synced = syncAuthoringText(prefer, trimmed ? text : prefer === 'json' ? '{}\n' : '')
    tab.value = prefer
    yamlText.value = synced.yaml
    jsonText.value = synced.json
    emit('error', '')
  } catch (err) {
    tab.value = prefer
    if (prefer === 'json') jsonText.value = text
    else yamlText.value = text
    try {
      const other = prefer === 'json' ? 'yaml' : 'json'
      const fallback = syncAuthoringText(other, prefer === 'json' ? yamlText.value : jsonText.value)
      if (prefer === 'json') yamlText.value = fallback.yaml
      else jsonText.value = fallback.json
    } catch {
      /* keep whatever is already in the other tab */
    }
    emit('error', err instanceof Error ? err.message : String(err))
  }
}

watch(
  () => props.source,
  (value) => {
    if (fromSelf) return
    hydrate(value)
  },
  { immediate: true },
)

function commit(kind: 'yaml' | 'json', text: string) {
  if (kind === 'yaml') yamlText.value = text
  else jsonText.value = text
  try {
    const synced = syncAuthoringText(kind, text)
    if (kind === 'yaml') jsonText.value = synced.json
    else yamlText.value = synced.yaml
    fromSelf = true
    emit('update:source', kind === 'yaml' ? synced.yaml : synced.json)
    emit('error', '')
    queueMicrotask(() => {
      fromSelf = false
    })
  } catch (err) {
    emit('error', err instanceof Error ? err.message : String(err))
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
    options: SCHEMA_EDITOR_OPTIONS,
  }
}

const yamlSchema = computed(() => editorSchema('yaml', yamlText.value))
const jsonSchema = computed(() => editorSchema('json', jsonText.value))
const hostSchema = { type: 'tpl', tpl: '', hidden: true }
</script>

<template>
  <VamisRoot :schema="hostSchema" class="flex min-h-0 flex-1 flex-col">
    <Tabs v-model="tab" class="flex min-h-0 flex-1 flex-col gap-2">
      <TabsList class="w-full grid grid-cols-2">
        <TabsTrigger value="yaml">YAML</TabsTrigger>
        <TabsTrigger value="json">JSON</TabsTrigger>
      </TabsList>
      <TabsContent value="yaml" force-mount class="mt-0 flex min-h-[28rem] flex-1 flex-col data-[state=inactive]:hidden">
        <Editor
          class="h-full min-h-[28rem] flex-1"
          :schema="yamlSchema"
          @change="commit('yaml', $event)"
        />
      </TabsContent>
      <TabsContent value="json" force-mount class="mt-0 flex min-h-[28rem] flex-1 flex-col data-[state=inactive]:hidden">
        <Editor
          class="h-full min-h-[28rem] flex-1"
          :schema="jsonSchema"
          @change="commit('json', $event)"
        />
      </TabsContent>
    </Tabs>
  </VamisRoot>
</template>
