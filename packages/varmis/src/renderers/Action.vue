<script setup lang="ts">
import { ref } from 'vue'
import {
  SchemaRenderer,
  normalizeApi,
  useEnv,
  useScoped,
  type SchemaObject,
} from '@varmis/core'
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@varmis/ui'
import { useForm } from '../formContext'

const props = defineProps<{
  schema: SchemaObject
  data: Record<string, any>
  disabled?: boolean
}>()

const env = useEnv()
const scoped = useScoped()
const form = useForm()
const dialogOpen = ref(false)
const loading = ref(false)

const label = props.schema.label || props.schema.title || '按钮'
const actionType =
  props.schema.actionType ||
  (props.schema.type === 'submit' ? 'submit' : props.schema.type === 'reset' ? 'reset' : 'button')
const variant =
  props.schema.level === 'primary' || actionType === 'submit'
    ? 'default'
    : props.schema.level === 'danger'
      ? 'destructive'
      : 'outline'

async function runAjax() {
  const api = props.schema.api
  if (!api) return
  if (props.schema.confirmText && !(await env.confirm(props.schema.confirmText))) return
  loading.value = true
  try {
    const payload = await env.fetcher(normalizeApi(api, props.data), props.data)
    if (payload.status !== 0 && payload.status !== 200) {
      throw new Error(payload.msg || '请求失败')
    }
    env.notify('success', payload.msg || '完成')
    if (props.schema.reload) await scoped?.reload(props.schema.reload)
  } catch (error) {
    env.notify('error', error instanceof Error ? error.message : '请求失败')
  } finally {
    loading.value = false
  }
}

async function onClick() {
  if (actionType === 'submit') return form?.submit()
  if (actionType === 'reset') return form?.reset()
  if (actionType === 'dialog' || props.schema.dialog) {
    dialogOpen.value = true
    return
  }
  if (actionType === 'ajax') return runAjax()
  if (actionType === 'toast' || actionType === 'reload') {
    if (actionType === 'reload' && props.schema.target) {
      await scoped?.reload(props.schema.target)
      return
    }
    env.notify('info', props.schema.msg || label)
  }
  if (actionType === 'link' || actionType === 'url') {
    env.jumpTo(props.schema.link || props.schema.url || '#')
  }
}
</script>

<template>
  <Button :variant="variant as any" :disabled="disabled || loading" type="button" @click="onClick">
    {{ loading ? '处理中…' : label }}
  </Button>
  <Dialog v-model:open="dialogOpen">
    <DialogContent class="max-w-2xl">
      <DialogHeader>
        <DialogTitle>{{ schema.dialog?.title || label }}</DialogTitle>
      </DialogHeader>
      <SchemaRenderer v-if="schema.dialog" :schema="schema.dialog.body || schema.dialog" />
    </DialogContent>
  </Dialog>
</template>
