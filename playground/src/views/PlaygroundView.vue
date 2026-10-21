<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { VamisRoot, jsonToIr, parseSchemaText, yamlFromIr } from 'vamis'
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Button,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
} from '@vamis/ui'
import CatalogTree from '../components/CatalogTree.vue'
import {
  componentGroups,
  componentLeaves,
  defaultExample,
  exampleGroups,
  exampleLeaves,
  type CatalogLeaf,
} from '../catalog'

const route = useRoute()
const router = useRouter()
const tab = ref('examples')
const source = ref(defaultExample?.yaml || '')
const selectedId = ref(defaultExample?.id || '')
const selectedLabel = ref(defaultExample?.label || '表单页面')
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

function applyLeaf(leaf: CatalogLeaf) {
  selectedId.value = leaf.id
  selectedLabel.value = leaf.label
  source.value = leaf.yaml
  tab.value = leaf.kind === 'component' ? 'components' : 'examples'
}

function onSelect(leaf: CatalogLeaf) {
  applyLeaf(leaf)
  if (route.query.example !== leaf.id) {
    void router.replace({ query: { example: leaf.id } })
  }
}

function leafById(id: string) {
  return exampleLeaves.find((item) => item.id === id) || componentLeaves.find((item) => item.id === id)
}

watch(
  () => route.query.example,
  (id) => {
    if (typeof id !== 'string' || !id) return
    const leaf = leafById(id)
    if (leaf && leaf.id !== selectedId.value) applyLeaf(leaf)
  },
  { immediate: true },
)

function formatSource(kind: 'yaml' | 'json') {
  try {
    const ir = jsonToIr(parseSchemaText(source.value))
    source.value = kind === 'json' ? `${JSON.stringify(ir, null, 2)}\n` : yamlFromIr(ir)
    error.value = ''
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err)
  }
}
</script>

<template>
  <div class="grid min-h-0 flex-1 gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(24rem,32rem)]">
    <section class="flex min-h-0 flex-col overflow-hidden rounded-lg border bg-muted/40">
      <div class="flex shrink-0 items-center justify-between gap-2 border-b bg-card px-4 py-2">
        <div class="min-w-0">
          <p class="text-[11px] text-muted-foreground">预览</p>
          <h2 class="truncate text-sm font-medium">{{ selectedLabel }}</h2>
        </div>
        <Badge variant="outline">lcdp.ir/v1</Badge>
      </div>
      <div class="min-h-0 flex-1 overflow-auto bg-background p-5">
        <Alert v-if="error" variant="destructive">
          <AlertTitle>无法解析</AlertTitle>
          <AlertDescription class="font-mono text-xs">{{ error }}</AlertDescription>
        </Alert>
        <VamisRoot v-else-if="parsed" :schema="parsed" :env="{ trusted: true }" />
      </div>
    </section>

    <section class="flex min-h-0 flex-col overflow-hidden rounded-lg border bg-card">
      <Tabs v-model="tab" default-value="examples" class="flex min-h-0 flex-1 flex-col gap-0">
        <div class="flex shrink-0 items-center justify-between gap-2 border-b px-3 py-2">
          <TabsList class="grid h-8 w-full grid-cols-3">
            <TabsTrigger value="components">组件</TabsTrigger>
            <TabsTrigger value="examples">示例</TabsTrigger>
            <TabsTrigger value="ir">Schema</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="components" class="mt-0 flex h-full min-h-0 flex-1 flex-col overflow-hidden">
          <CatalogTree
            class="h-full"
            :groups="componentGroups"
            :selected-id="selectedId"
            placeholder="筛选组件 type / 名称"
            @select="onSelect"
          />
        </TabsContent>

        <TabsContent value="examples" class="mt-0 flex h-full min-h-0 flex-1 flex-col overflow-hidden">
          <CatalogTree
            class="h-full"
            :groups="exampleGroups"
            :selected-id="selectedId"
            placeholder="筛选示例"
            @select="onSelect"
          />
        </TabsContent>

        <TabsContent value="ir" class="mt-0 flex min-h-0 flex-1 flex-col overflow-hidden">
          <div class="flex shrink-0 items-center justify-between gap-2 border-b px-3 py-2">
            <p class="truncate text-xs text-muted-foreground">{{ selectedLabel }}</p>
            <div class="flex gap-1">
              <Button size="xs" variant="outline" @click="formatSource('yaml')">YAML</Button>
              <Button size="xs" variant="outline" @click="formatSource('json')">JSON</Button>
            </div>
          </div>
          <Textarea
            v-model="source"
            class="min-h-0 flex-1 resize-none rounded-none border-0 bg-code font-mono text-xs leading-5 text-code-foreground field-sizing-fixed"
          />
        </TabsContent>
      </Tabs>
    </section>
  </div>
</template>
