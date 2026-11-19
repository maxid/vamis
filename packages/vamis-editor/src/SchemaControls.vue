<script setup lang="ts">
import { reactive } from 'vue'
import { Input, Label, Switch, Textarea } from '@vamis/ui'
import { asArray, getByPath, isDisabled, isVisible, type SchemaNode, type SchemaObject } from '@vamis/core'
import EventEditor from './EventEditor.vue'

const props = withDefaults(
  defineProps<{
    nodes?: SchemaNode | SchemaNode[]
    value?: SchemaObject
    path?: string
    readonly?: boolean
  }>(),
  { value: () => ({}), path: '' },
)
const emit = defineEmits<{
  patch: [field: string, value: unknown]
}>()
const tabIndexes = reactive<Record<string, number>>({})

function list(value: SchemaNode | SchemaNode[] | undefined): SchemaNode[] {
  return asArray(value).filter((item): item is SchemaNode => item != null)
}

function children(node: SchemaObject): SchemaNode[] {
  return list(node.body || node.controls)
}

function read(node: SchemaObject): unknown {
  return node.name ? getByPath(props.value, node.name) : undefined
}

function write(node: SchemaObject, raw: unknown) {
  if (!node.name || props.readonly) return
  let value = raw
  if (node.type === 'input-number') {
    if (raw === '' || raw == null) value = undefined
    else {
      const number = Number(raw)
      value = Number.isFinite(number) ? number : undefined
    }
  }
  if (node.pipeOut && typeof node.pipeOut === 'function') value = node.pipeOut(raw)
  emit('patch', node.name, value)
}

function options(node: SchemaObject): Array<{ label: string; value: unknown }> {
  return list(node.options as SchemaNode[]).map((option) => {
    if (option && typeof option === 'object') {
      return { label: String(option.label ?? option.value ?? ''), value: option.value ?? option.label }
    }
    return { label: String(option), value: option }
  })
}

function nodeKey(index: number): string {
  return props.path ? `${props.path}.${index}` : String(index)
}

function activeTab(index: number, node: SchemaObject): number {
  const key = nodeKey(index)
  return Math.min(tabIndexes[key] || 0, Math.max(0, list(node.tabs).length - 1))
}
</script>

<template>
  <div class="space-y-3">
    <template v-for="(child, index) in list(nodes)" :key="nodeKey(index)">
      <template v-if="child && typeof child === 'object' && isVisible(child, value)">
        <div v-if="child.type === 'tabs'" class="space-y-3">
          <div class="flex gap-1 border-b">
            <button
              v-for="(tab, tabIndex) in list(child.tabs)"
              :key="tabIndex"
              type="button"
              class="border-b-2 px-3 py-2 text-sm"
              :class="activeTab(index, child) === tabIndex ? 'border-primary text-primary' : 'border-transparent'"
              @click="tabIndexes[nodeKey(index)] = tabIndex"
            >
              {{ typeof tab === 'object' ? tab.title : tab }}
            </button>
          </div>
          <template v-for="(tab, tabIndex) in list(child.tabs)" :key="tabIndex">
            <SchemaControls
              v-if="tab && typeof tab === 'object' && activeTab(index, child) === tabIndex"
              :nodes="tab.body"
              :value="value"
              :path="`${nodeKey(index)}.${tabIndex}`"
              :readonly="readonly"
              @patch="(field, next) => emit('patch', field, next)"
            />
          </template>
        </div>

        <fieldset v-else-if="child.type === 'collapse' || child.type === 'fieldset'" class="space-y-3 rounded-md border p-3">
          <legend class="px-1 text-sm font-medium">{{ child.title }}</legend>
          <SchemaControls
            :nodes="children(child)"
            :value="value"
            :path="nodeKey(index)"
            :readonly="readonly"
            @patch="(field, next) => emit('patch', field, next)"
          />
        </fieldset>

        <SchemaControls
          v-else-if="!child.name && (child.body || child.controls)"
          :nodes="children(child)"
          :value="value"
          :path="nodeKey(index)"
          :readonly="readonly"
          @patch="(field, next) => emit('patch', field, next)"
        />

        <div v-else-if="child.name" class="grid gap-1.5">
          <Label v-if="!['switch', 'checkbox'].includes(child.type || '')">{{ child.label || child.name }}</Label>
          <EventEditor
            v-if="child.type === 'event-editor'"
            :value="(read(child) as Record<string, any>) || {}"
            @change="write(child, $event)"
          />
          <label v-else-if="child.type === 'switch' || child.type === 'checkbox'" class="flex items-center gap-2 text-sm">
            <Switch
              v-if="child.type === 'switch'"
              :model-value="!!read(child)"
              :disabled="readonly || isDisabled(child, value)"
              @update:model-value="write(child, $event)"
            />
            <input
              v-else
              type="checkbox"
              :checked="!!read(child)"
              :disabled="readonly || isDisabled(child, value)"
              @change="write(child, ($event.target as HTMLInputElement).checked)"
            />
            {{ child.label || child.name }}
          </label>
          <select
            v-else-if="child.type === 'select'"
            class="h-8 rounded-md border bg-background px-2 text-sm"
            :value="String(read(child) ?? '')"
            :disabled="readonly || isDisabled(child, value)"
            @change="write(child, ($event.target as HTMLSelectElement).value)"
          >
            <option v-if="child.placeholder" value="">{{ child.placeholder }}</option>
            <option v-for="(option, optionIndex) in options(child)" :key="optionIndex" :value="String(option.value)">
              {{ option.label }}
            </option>
          </select>
          <Textarea
            v-else-if="['textarea', 'input-rich-text', 'textareaFormulaControl', 'json'].includes(child.type || '')"
            :model-value="String(read(child) ?? '')"
            :placeholder="String(child.placeholder || '')"
            :disabled="readonly || isDisabled(child, value)"
            @update:model-value="write(child, $event)"
          />
          <Input
            v-else
            :type="child.type === 'input-number' ? 'number' : 'text'"
            :model-value="(read(child) as string | number) ?? ''"
            :placeholder="String(child.placeholder || '')"
            :min="child.min"
            :max="child.max"
            :disabled="readonly || isDisabled(child, value)"
            @update:model-value="write(child, $event)"
          />
          <p v-if="child.description" class="text-xs text-muted-foreground">{{ child.description }}</p>
        </div>
      </template>
    </template>
  </div>
</template>
