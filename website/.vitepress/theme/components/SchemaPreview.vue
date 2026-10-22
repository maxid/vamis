<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { VamisRoot, LazyComponent, parseSchemaText } from 'vamis'
import { applySchemaScope } from '../../../../playground/src/docs/schema-scope'
import SchemaSourceEditor from '../../../../playground/src/components/SchemaSourceEditor.vue'

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
const editError = ref('')

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

const minHeight = computed(() => Math.max(160, Number(props.height) || 200))
const banner = computed(() => editError.value || (!parsed.value.ok ? parsed.value.error : ''))
</script>

<template>
  <div class="vamis-preview not-prose" data-density="compact">
    <div v-if="banner" class="vamis-preview__error">{{ banner }}</div>
    <div class="vamis-preview__canvas" :style="{ minHeight: `${minHeight}px` }">
      <LazyComponent placeholder="加载中，请稍后。。。">
        <VamisRoot :schema="parsed.value" />
      </LazyComponent>
    </div>
    <details class="vamis-preview__source" open>
      <summary>编辑 Schema（YAML / JSON）</summary>
      <SchemaSourceEditor
        class="px-4 pb-4"
        :source="draft"
        @update:source="draft = $event"
        @error="editError = $event"
      />
    </details>
  </div>
</template>
