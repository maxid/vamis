<script setup lang="ts">
import { ref, watch } from 'vue'
import { syncAuthoringText } from 'vamis'
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
</script>

<template>
  <Tabs v-model="tab" class="flex min-h-0 flex-1 flex-col gap-2">
    <TabsList class="w-full grid grid-cols-2">
      <TabsTrigger value="yaml">YAML</TabsTrigger>
      <TabsTrigger value="json">JSON</TabsTrigger>
    </TabsList>
    <TabsContent value="yaml" force-mount class="mt-0 flex min-h-0 flex-1 flex-col data-[state=inactive]:hidden">
      <textarea
        :value="yamlText"
        spellcheck="false"
        aria-label="YAML"
        class="min-h-[28rem] flex-1 resize-none rounded-md border bg-background p-3 font-mono text-xs leading-relaxed outline-none focus-visible:ring-2 focus-visible:ring-ring"
        @input="commit('yaml', ($event.target as HTMLTextAreaElement).value)"
      />
    </TabsContent>
    <TabsContent value="json" force-mount class="mt-0 flex min-h-0 flex-1 flex-col data-[state=inactive]:hidden">
      <textarea
        :value="jsonText"
        spellcheck="false"
        aria-label="JSON"
        class="min-h-[28rem] flex-1 resize-none rounded-md border bg-background p-3 font-mono text-xs leading-relaxed outline-none focus-visible:ring-2 focus-visible:ring-ring"
        @input="commit('json', ($event.target as HTMLTextAreaElement).value)"
      />
    </TabsContent>
  </Tabs>
</template>
