<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted } from 'vue'
import {
  SchemaRenderer,
  asArray,
  createStoreId,
  normalizeApi,
  provideFormApi,
  runOnEvent,
  useEnv,
  useOverlay,
  useRendererHub,
  useScoped,
  validateValue,
  type SchemaObject,
} from '@vamis/core'
import { Button, Card, CardContent, CardFooter, CardHeader, CardTitle } from '@vamis/ui'
import { provideForm } from '../formContext'
import { registerWizardValidate } from '../wizardGate'

const props = defineProps<{
  schema: SchemaObject
  data: Record<string, any>
}>()

const env = useEnv()
const hub = useRendererHub()
const scoped = useScoped()
const overlay = useOverlay()
const store = hub.add({
  id: createStoreId('form'),
  type: 'form',
  name: props.schema.name,
  data: { ...(props.data || {}), ...(props.schema.data || {}) },
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
    const message = validateValue(item, store.data[item.name])
    if (message) {
      store.errors[item.name] = message
      ok = false
    }
  }
  return ok
}

function reset() {
  store.data = { ...(props.data || {}), ...(props.schema.data || {}) }
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
    await runOnEvent(props.schema, 'submit', {
      env,
      data: { ...props.data, ...store.data },
      scoped,
      overlay,
      form: formApi,
    })
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
      await scoped?.reload(props.schema.reload, store.data)
    }
    await runOnEvent(props.schema, 'submit', {
      env,
      data: { ...props.data, ...store.data },
      scoped,
      overlay,
      form: formApi,
    })
  } catch (error) {
    env.notify('error', error instanceof Error ? error.message : '提交失败')
  } finally {
    store.saving = false
  }
}

const formApi = {
  name: props.schema.name,
  getValue,
  setValue,
  reset,
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
  validate,
}

provideForm({
  store,
  mode: String(props.schema.mode || 'normal'),
  getValue,
  setValue,
  submit,
  reset,
  setError,
})
provideFormApi(formApi)
scoped?.register(formApi)
registerWizardValidate(validate)

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
    class="w-full max-w-3xl"
    @submit.prevent="submit"
  >
    <Card v-if="schema.wrapWithPanel !== false" class="w-full">
      <CardHeader v-if="schema.title" class="border-b">
        <CardTitle>{{ schema.title }}</CardTitle>
      </CardHeader>
      <CardContent class="space-y-0">
        <SchemaRenderer v-for="(node, i) in body" :key="i" :schema="node" :extra-data="store.data" />
      </CardContent>
      <CardFooter class="border-t">
        <template v-if="hasCustomActions">
          <SchemaRenderer v-for="(node, i) in actions" :key="'a'+i" :schema="node" />
        </template>
        <template v-else>
          <Button type="submit" :disabled="store.saving">
            {{ store.saving ? '提交中…' : (schema.submitText || '提交') }}
          </Button>
          <Button v-if="schema.reset !== false" type="button" variant="outline" @click="reset">
            重置
          </Button>
        </template>
      </CardFooter>
    </Card>
    <template v-else>
      <h2 v-if="schema.title" class="mb-3 text-sm font-medium">{{ schema.title }}</h2>
      <SchemaRenderer v-for="(node, i) in body" :key="i" :schema="node" :extra-data="store.data" />
      <div class="flex gap-2 pt-3">
        <template v-if="hasCustomActions">
          <SchemaRenderer v-for="(node, i) in actions" :key="'a'+i" :schema="node" />
        </template>
        <template v-else>
          <Button type="submit" :disabled="store.saving">
            {{ store.saving ? '提交中…' : (schema.submitText || '提交') }}
          </Button>
          <Button v-if="schema.reset !== false" type="button" variant="outline" @click="reset">
            重置
          </Button>
        </template>
      </div>
    </template>
  </form>
</template>
