<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  SchemaRenderer,
  asArray,
  useData,
  useEnv,
  wizardFinishLabel,
  wizardHasCustomActions,
  wizardJumpable,
  wizardMode,
  wizardNextButtonLabel,
  wizardPrevLabel,
  wizardShowPrev,
  wizardStartIndex,
  wizardStepTitle,
  wizardSteps,
  type SchemaObject,
} from '@vamis/core'
import { Button, Check } from '@vamis/ui'
import { provideWizardGate } from '../wizardGate'

const props = defineProps<{
  schema: SchemaObject
  data?: Record<string, unknown>
}>()
const env = useEnv()
const parentData = useData()
const gate = provideWizardGate()
const steps = computed(() => wizardSteps(props.schema))
const index = ref(wizardStartIndex(props.schema, parentData.value))
const mode = computed(() => wizardMode(props.schema))
const current = computed(() => steps.value[index.value] || {})
const currentStep = computed(() => index.value + 1)
const extra = computed(() => ({ currentStep: currentStep.value }))
const formSchema = computed<SchemaObject>(() => ({
  type: 'form',
  wrapWithPanel: false,
  title: false,
  actions: [],
  mode: current.value.mode,
  body: current.value.body,
}))
const customActions = computed(() =>
  wizardHasCustomActions(current.value) ? asArray(current.value.actions as SchemaObject[]) : [],
)
const prevText = computed(() => wizardPrevLabel(props.schema))
const nextText = computed(() => wizardNextButtonLabel(props.schema, index.value, steps.value))

function jumpable(step: unknown, i: number) {
  return wizardJumpable(step, i, currentStep.value, parentData.value)
}

function goto(i: number) {
  if (i === index.value) return
  if (i > index.value && !gate.validateCurrent()) {
    env.notify('error', '请先完成当前步骤的校验')
    return
  }
  if (i < index.value && !jumpable(steps.value[i], i)) return
  index.value = i
}

function prev() {
  if (!wizardShowPrev(index.value)) return
  goto(index.value - 1)
}

function next() {
  if (index.value >= steps.value.length - 1) return
  goto(index.value + 1)
}
</script>

<template>
  <div
    data-vamis-wizard
    class="min-w-0"
    :class="mode === 'vertical' ? 'flex gap-4' : 'space-y-4'"
  >
    <ol
      class="flex gap-2 text-sm"
      :class="mode === 'vertical' ? 'w-40 shrink-0 flex-col' : 'flex-wrap'"
    >
      <li
        v-for="(step, i) in steps"
        :key="i"
        class="rounded-full border px-3 py-1"
        :class="
          i === index
            ? 'border-primary bg-primary text-primary-foreground'
            : jumpable(step, i)
              ? 'cursor-pointer text-foreground'
              : 'text-muted-foreground'
        "
        @click="jumpable(step, i) ? goto(i) : undefined"
      >
        <span v-if="i < index" class="inline-flex"><Check class="size-3" /></span>
        <span v-else>{{ i + 1 }}</span>{{ wizardStepTitle(step, i) }}
      </li>
    </ol>
    <div class="min-w-0 flex-1 space-y-4">
      <div class="min-w-0">
        <SchemaRenderer :schema="formSchema" :extra-data="extra" />
      </div>
      <div v-if="customActions.length" class="flex flex-wrap justify-end gap-2">
        <SchemaRenderer
          v-for="(node, i) in customActions"
          :key="`${index}-a-${i}`"
          :schema="node"
          :extra-data="extra"
        />
      </div>
      <div v-else-if="!wizardHasCustomActions(current)" class="flex justify-end gap-2">
        <Button v-if="wizardShowPrev(index)" type="button" variant="outline" size="sm" @click="prev">{{
          prevText
        }}</Button>
        <Button type="button" size="sm" @click="next">{{ nextText }}</Button>
      </div>
    </div>
  </div>
</template>
