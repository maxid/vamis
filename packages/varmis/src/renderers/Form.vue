<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted } from 'vue'
import {
  SchemaRenderer,
  asArray,
  createStoreId,
  normalizeApi,
  useEnv,
  useRendererHub,
  useScoped,
  type SchemaObject,
} from '@varmis/core'
import { Button } from '@varmis/ui'
import { provideForm } from '../formContext'

const props = defineProps<{
  schema: SchemaObject
  data: Record<string, any>
}>()

const env = useEnv()
const hub = useRendererHub()
const scoped = useScoped()
const store = hub.add({
  id: createStoreId('form'),
  type: 'form',
  name: props.schema.name,
  data: { ...(props.schema.data || {}) },
})

const body = computed(() => asArray(props.schema.body || props.schema.controls))
const actions = computed(() => asArray(props.schema.actions))
const hasCustomActions = computed(() => actions.value.length > 0)

function getValue(name: string) {
  return store.data[name]
}

function setValue(name: string, value: unknown) {
  store.data[name] = value
  if (store.errors[name]) delete store.errors[name]
}

function setError(name: string, message: string) {
  store.errors[name] = message
}

function validate(): boolean {
  store.errors = {}
  let ok = true
  for (const node of body.value) {
    if (!node || typeof node === 'string') continue
    const item = node as SchemaObject
    if (!item.name) continue
    if (item.required && (store.data[item.name] == null || store.data[item.name] === '')) {
      store.errors[item.name] = `${item.label || item.name} 不能为空`
      ok = false
    }
  }
  return ok
}

function reset() {
  store.data = { ...(props.schema.data || {}) }
  store.errors = {}
}

async function submit() {
  if (!validate()) {
    env.notify('error', '请检查表单')
    return
  }
  const api = props.schema.api
  if (!api) {
    if (props.schema.reload) {
      await scoped?.reload(props.schema.reload, store.data)
    } else {
      env.notify('success', '已提交（未配置 api）')
    }
    return
  }
  store.saving = true
  try {
    const payload = await env.fetcher(normalizeApi(api, store.data), store.data)
    if (payload.status !== 0 && payload.status !== 200) {
      throw new Error(payload.msg || '提交失败')
    }
    env.notify('success', payload.msg || '保存成功')
    if (props.schema.reload) {
      await scoped?.reload(props.schema.reload)
    }
  } catch (error) {
    env.notify('error', error instanceof Error ? error.message : '提交失败')
  } finally {
    store.saving = false
  }
}

const formApi = {
  name: props.schema.name,
  reload: async () => {
    if (!props.schema.initApi) return
    store.fetching = true
    try {
      const payload = await env.fetcher(normalizeApi(props.schema.initApi, props.data), props.data)
      Object.assign(store.data, payload.data || {})
    } finally {
      store.fetching = false
    }
  },
  getData: () => ({ ...store.data }),
  setData: (values: Record<string, any>) => Object.assign(store.data, values),
  submit,
}

provideForm({ store, getValue, setValue, submit, reset, setError })
scoped?.register(formApi)

onMounted(() => {
  formApi.reload()
})
onBeforeUnmount(() => {
  scoped?.unregister(formApi)
  hub.remove(store.id)
})
</script>

<template>
  <form
    class="space-y-1"
    :class="schema.mode === 'horizontal' ? 'max-w-3xl' : 'max-w-xl'"
    @submit.prevent="submit"
  >
    <h2 v-if="schema.title" class="mb-3 text-base font-semibold">{{ schema.title }}</h2>
    <SchemaRenderer v-for="(node, i) in body" :key="i" :schema="node" :extra-data="store.data" />
    <div class="flex gap-2 pt-3">
      <template v-if="hasCustomActions">
        <SchemaRenderer v-for="(node, i) in actions" :key="'a'+i" :schema="node" />
      </template>
      <template v-else>
        <Button type="submit" :disabled="store.saving">
          {{ store.saving ? '提交中…' : (schema.submitText || '提交') }}
        </Button>
        <Button v-if="schema.resetAfterSubmit !== false" type="button" variant="outline" @click="reset">
          重置
        </Button>
      </template>
    </div>
  </form>
</template>
