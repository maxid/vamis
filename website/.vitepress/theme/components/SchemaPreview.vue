<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { VamisRoot, parseSchemaText } from 'vamis'
import { applySchemaScope } from '../../../../playground/src/docs/schema-scope'

const props = withDefaults(
  defineProps<{
    yaml: string
    scope?: string
    height?: number | string
  }>(),
  { height: 200 },
)

function decodeSource(raw: string) {
  try {
    return decodeURIComponent(raw).trim()
  } catch {
    return raw.trim()
  }
}

const draft = ref(decodeSource(props.yaml))
const lastGood = ref<unknown>({})

watch(
  () => props.yaml,
  (value) => {
    draft.value = decodeSource(value)
  },
)

const parsed = computed(() => {
  try {
    const value = applySchemaScope(parseSchemaText(draft.value), props.scope)
    lastGood.value = value
    return { ok: true as const, value, error: '' }
  } catch (err) {
    return {
      ok: false as const,
      value: lastGood.value,
      error: err instanceof Error ? err.message : String(err),
    }
  }
})

const schemaKey = computed(() => {
  try {
    return JSON.stringify(parsed.value.value)
  } catch {
    return draft.value
  }
})

const minHeight = computed(() => Math.max(160, Number(props.height) || 200))
</script>

<template>
  <div class="vamis-preview not-prose" data-density="compact">
    <div v-if="!parsed.ok" class="vamis-preview__error">{{ parsed.error }}</div>
    <div class="vamis-preview__canvas" :style="{ minHeight: `${minHeight}px` }">
      <VamisRoot :key="schemaKey" :schema="parsed.value" />
    </div>
    <details class="vamis-preview__source" open>
      <summary>YAML（可改，即时预览）</summary>
      <textarea v-model="draft" spellcheck="false" class="vamis-preview__editor" />
    </details>
  </div>
</template>
