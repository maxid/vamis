<script setup lang="ts">
import { computed, ref } from 'vue'
import { VamisRoot, jsonToIr, parseSchemaText, yamlFromIr } from 'vamis'
import { Alert, AlertDescription, AlertTitle, Badge, Button, Textarea } from '@vamis/ui'
import { defaultYaml, yamlSamples } from '../samples'
import amisForm from '../examples/amis-form.json?raw'

const source = ref(defaultYaml)
const error = ref('')

const parsed = computed(() => {
  try {
    const value = parseSchemaText(source.value)
    error.value = ''
    return jsonToIr(value)
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err)
    return null
  }
})

function load(sample: string) {
  source.value = sample
}

function fromAmisJson() {
  try {
    source.value = yamlFromIr(jsonToIr(JSON.parse(amisForm)))
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err)
  }
}
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-[minmax(20rem,28rem)_minmax(0,1fr)]">
    <section class="flex min-h-[70vh] flex-col overflow-hidden rounded-lg border bg-card">
      <div class="flex items-center justify-between gap-2 border-b px-3 py-2">
        <div>
          <p class="font-mono text-[10px] tracking-[0.2em] text-primary">AUTHORING</p>
          <h2 class="text-sm font-medium">贴 YAML 即渲染</h2>
        </div>
        <Badge variant="outline">lcdp.ir/v1</Badge>
      </div>
      <div class="flex flex-wrap gap-2 border-b p-2">
        <Button
          v-for="sample in yamlSamples"
          :key="sample.id"
          size="sm"
          variant="secondary"
          @click="load(sample.yaml)"
        >
          {{ sample.label }}
        </Button>
        <Button size="sm" variant="outline" @click="fromAmisJson">Amis JSON → YAML</Button>
      </div>
      <Textarea
        v-model="source"
        class="min-h-0 flex-1 resize-none rounded-none border-0 bg-code font-mono text-xs leading-5 text-code-foreground"
      />
    </section>
    <section class="min-h-[70vh] rounded-lg border bg-background p-4">
      <p class="mb-3 font-mono text-[10px] tracking-[0.2em] text-primary">RUNTIME</p>
      <Alert v-if="error" variant="destructive">
        <AlertTitle>无法解析</AlertTitle>
        <AlertDescription class="font-mono text-xs">{{ error }}</AlertDescription>
      </Alert>
      <VamisRoot v-else-if="parsed" :schema="parsed" />
    </section>
  </div>
</template>
