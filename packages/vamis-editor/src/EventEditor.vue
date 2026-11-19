<script setup lang="ts">
import { computed, ref } from 'vue'
import { Badge, Button, Input, Label, Textarea } from '@vamis/ui'
import { cloneSchema, type SchemaObject } from '@vamis/core'

const props = defineProps<{
  value?: Record<string, any>
}>()
const emit = defineEmits<{
  change: [value: Record<string, any>]
}>()

const eventName = ref('click')
const actionType = ref('toast')
const actionTypes = ['toast', 'ajax', 'dialog', 'drawer', 'setValue', 'reload', 'copy', 'url']
const events = computed(() => props.value || {})
const actions = computed<SchemaObject[]>(() => events.value[eventName.value]?.actions || [])

function commit(next: SchemaObject[]) {
  emit('change', { ...cloneSchema(events.value), [eventName.value]: { actions: next } })
}

function addAction() {
  const action: SchemaObject = { actionType: actionType.value }
  if (action.actionType === 'toast') action.msg = '提示'
  if (action.actionType === 'ajax') action.api = '/api/mock2/form/saveForm'
  if (action.actionType === 'dialog') action.dialog = { title: '对话框', body: { type: 'tpl', tpl: '内容' } }
  if (action.actionType === 'drawer') action.drawer = { title: '抽屉', body: { type: 'tpl', tpl: '内容' } }
  if (action.actionType === 'setValue') action.value = {}
  commit([...actions.value, action])
}

function patch(index: number, key: string, raw: unknown) {
  const next = cloneSchema(actions.value)
  if (key === 'value' && typeof raw === 'string') {
    try {
      next[index][key] = raw.trim() ? JSON.parse(raw) : {}
    } catch {
      return
    }
  } else if (raw === '') {
    delete next[index][key]
  } else {
    next[index][key] = raw
  }
  commit(next)
}
</script>

<template>
  <div class="space-y-3">
    <div class="grid grid-cols-2 gap-2">
      <Label class="self-center">事件</Label>
      <select v-model="eventName" class="h-8 rounded-md border bg-background px-2 text-sm">
        <option value="click">点击 click</option>
        <option value="change">值变化 change</option>
        <option value="focus">聚焦 focus</option>
        <option value="blur">失焦 blur</option>
        <option value="mouseenter">移入 mouseenter</option>
        <option value="mouseleave">移出 mouseleave</option>
      </select>
    </div>
    <div v-for="(action, index) in actions" :key="index" class="space-y-2 rounded-md border p-2">
      <div class="flex items-center justify-between gap-2">
        <Badge variant="outline">{{ action.actionType || 'action' }}</Badge>
        <Button size="sm" variant="ghost" @click="commit(actions.filter((_item, i) => i !== index))">删除</Button>
      </div>
      <Input
        :model-value="String(action.actionType || '')"
        aria-label="actionType"
        @update:model-value="patch(index, 'actionType', $event)"
      />
      <Textarea
        v-if="action.actionType === 'toast'"
        :model-value="String(action.msg || '')"
        placeholder="msg"
        @update:model-value="patch(index, 'msg', $event)"
      />
      <Input
        v-if="action.actionType === 'ajax'"
        :model-value="String(action.api || '')"
        placeholder="api"
        @update:model-value="patch(index, 'api', $event)"
      />
      <Input
        v-if="['reload', 'setValue', 'copy'].includes(String(action.actionType))"
        :model-value="String(action.componentId || action.target || '')"
        placeholder="componentId / target"
        @update:model-value="patch(index, 'componentId', $event)"
      />
      <Textarea
        v-if="action.actionType === 'setValue'"
        :model-value="JSON.stringify(action.value || {}, null, 2)"
        class="font-mono text-xs"
        placeholder='{"name":"value"}'
        @update:model-value="patch(index, 'value', $event)"
      />
      <Input
        v-if="action.actionType === 'url'"
        :model-value="String(action.url || '')"
        placeholder="url"
        @update:model-value="patch(index, 'url', $event)"
      />
    </div>
    <div class="flex gap-2">
      <select v-model="actionType" class="h-8 min-w-0 flex-1 rounded-md border bg-background px-2 text-sm">
        <option v-for="type in actionTypes" :key="type" :value="type">{{ type }}</option>
      </select>
      <Button size="sm" variant="outline" @click="addAction">添加动作</Button>
    </div>
  </div>
</template>

