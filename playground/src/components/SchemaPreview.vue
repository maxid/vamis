<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { VamisRoot, LazyComponent, parseSchemaText } from 'vamis'
import { Button, Sheet, SheetContent, SheetHeader, SheetTitle } from '@vamis/ui'
import { applySchemaScope } from '../docs/schema-scope'
import SchemaSourceEditor from './SchemaSourceEditor.vue'

const props = withDefaults(
  defineProps<{
    yaml: string
    scope?: string
    height?: number
  }>(),
  { height: 200 },
)

const draft = ref(props.yaml.trim())
const editing = ref(false)
const lastGood = ref<unknown>({})
const editError = ref('')

watch(
  () => props.yaml,
  (value) => {
    draft.value = value.trim()
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
  <div class="doc-play my-5 overflow-hidden rounded-lg border bg-card" data-density="compact">
    <div class="relative">
      <Button
        type="button"
        size="xs"
        variant="outline"
        class="absolute right-3 top-3 z-10"
        @click="editing = true"
      >
        编辑 Schema
      </Button>
      <div v-if="banner && !editing" class="border-b bg-destructive/10 px-4 py-2 font-mono text-xs text-destructive">
        {{ banner }}
      </div>
      <div class="bg-background p-5 pr-24" :style="{ minHeight: `${minHeight}px` }">
        <LazyComponent placeholder="加载中，请稍后。。。">
          <VamisRoot :schema="parsed.value" :env="{ trusted: true }" />
        </LazyComponent>
      </div>
    </div>
    <Sheet :open="editing" @update:open="editing = $event">
      <SheetContent side="right" class="flex h-full w-full flex-col sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>编辑 Schema（改完即时预览）</SheetTitle>
        </SheetHeader>
        <div v-if="banner" class="mx-4 rounded-md bg-destructive/10 px-3 py-2 font-mono text-xs text-destructive">
          {{ banner }}
        </div>
        <div class="mx-4 mb-4 flex min-h-0 flex-1 flex-col">
          <SchemaSourceEditor
            :source="draft"
            @update:source="draft = $event"
            @error="editError = $event"
          />
        </div>
      </SheetContent>
    </Sheet>
  </div>
</template>
