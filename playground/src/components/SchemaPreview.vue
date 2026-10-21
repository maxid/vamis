<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { VamisRoot, parseSchemaText } from 'vamis'
import { Button, Sheet, SheetContent, SheetHeader, SheetTitle } from '@vamis/ui'
import { applySchemaScope } from '../docs/schema-scope'

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
  <div class="doc-play my-5 overflow-hidden rounded-lg border bg-card" data-density="compact">
    <div class="relative">
      <Button
        type="button"
        size="xs"
        variant="outline"
        class="absolute right-3 top-3 z-10"
        @click="editing = true"
      >
        编辑 YAML
      </Button>
      <div v-if="!parsed.ok" class="border-b bg-destructive/10 px-4 py-2 font-mono text-xs text-destructive">
        {{ parsed.error }}
      </div>
      <div class="bg-background p-5 pr-24" :style="{ minHeight: `${minHeight}px` }">
        <VamisRoot :key="schemaKey" :schema="parsed.value" />
      </div>
    </div>
    <Sheet :open="editing" @update:open="editing = $event">
      <SheetContent side="right" class="w-full sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>编辑 YAML（改完即时预览）</SheetTitle>
        </SheetHeader>
        <p class="px-4 text-xs text-muted-foreground">
          这段会交给同一个 VamisRoot 运行时，不是截图。作者态是 YAML 1.2 Core，也可以贴 JSON。
        </p>
        <textarea
          v-model="draft"
          spellcheck="false"
          class="mx-4 mb-4 min-h-[28rem] flex-1 resize-none rounded-md border bg-background p-3 font-mono text-xs leading-relaxed outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </SheetContent>
    </Sheet>
  </div>
</template>
