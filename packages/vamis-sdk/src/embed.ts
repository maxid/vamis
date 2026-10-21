import { createApp, h, nextTick, reactive } from 'vue'
import { createPinia } from 'pinia'
import { Toaster } from '@vamis/ui'
import {
  VamisRoot,
  createDefaultEnv,
  parseSchemaText,
  type ApiObject,
  type Payload,
  type PlainObject,
  type RendererConfig,
  type RendererEnv,
} from 'vamis'

export type EmbedProps = {
  data?: PlainObject
  context?: PlainObject
  locale?: string
}

export type EmbedEnv = Partial<RendererEnv> & {
  theme?: string
  requestAdaptor?: (api: unknown) => unknown | Promise<unknown>
  responseAdaptor?: (...args: unknown[]) => unknown
  toastPosition?: string
}

export type VamisScoped = {
  updateProps(props: EmbedProps, callback?: () => void): void
  updateSchema(schema: unknown, props?: EmbedProps): void
  unmount(): void
  getComponentByName(name: string): unknown
  doAction(actions: unknown, ctx?: PlainObject): Promise<void>
}

export function normalizeEmbedSchema(schema: unknown): unknown {
  if (typeof schema === 'string') return parseSchemaText(schema)
  return schema
}

function resolveContainer(container: string | HTMLElement): {
  host: HTMLElement
  created: HTMLElement | null
} {
  const found =
    typeof container === 'string' ? document.querySelector(container) : container
  if (!found || !(found instanceof HTMLElement)) {
    throw new Error(
      `vamis.embed: container not found: ${typeof container === 'string' ? container : '[HTMLElement]'}`,
    )
  }
  if (found === document.body) {
    const host = document.createElement('div')
    document.body.appendChild(host)
    return { host, created: host }
  }
  return { host: found, created: null }
}

function makeEnv(env?: EmbedEnv): RendererEnv {
  const extras = env || {}
  const { requestAdaptor, responseAdaptor, toastPosition: _toastPosition, ...rest } = extras
  const resolved = createDefaultEnv(rest)
  if (!requestAdaptor && !responseAdaptor) return resolved
  const inner = resolved.fetcher
  resolved.fetcher = async (api, data) => {
    const next = requestAdaptor ? await requestAdaptor(api) : api
    const payload = await inner(next as ApiObject, data)
    return responseAdaptor ? (responseAdaptor(payload, api, data) as Payload) : payload
  }
  return resolved
}

export function embed(
  container: string | HTMLElement,
  schema: unknown,
  props?: EmbedProps,
  env?: EmbedEnv,
): VamisScoped {
  const { host, created } = resolveContainer(container)
  host.dataset.density ||= 'compact'
  if (env?.theme) host.dataset.accent = env.theme

  const state = reactive({
    schema: normalizeEmbedSchema(schema),
    data: { ...(props?.data || {}) } as PlainObject,
    env: makeEnv(env),
  })

  const app = createApp({
    name: 'VamisEmbed',
    setup() {
      return () =>
        h('div', { class: 'vamis-sdk' }, [
          h(VamisRoot, {
            schema: state.schema,
            data: state.data,
            env: state.env,
          }),
          h(Toaster, { position: (env?.toastPosition as 'top-right') || 'top-right' }),
        ])
    },
  })
  app.use(createPinia())
  app.mount(host)

  let alive = true
  function assertAlive() {
    if (!alive) throw new Error('vamis.embed: instance already unmounted')
  }

  return {
    updateProps(next, callback) {
      assertAlive()
      if (next.data) Object.assign(state.data, next.data)
      if (callback) void nextTick(callback)
    },
    updateSchema(nextSchema, nextProps) {
      assertAlive()
      state.schema = normalizeEmbedSchema(nextSchema)
      if (nextProps?.data) Object.assign(state.data, nextProps.data)
    },
    unmount() {
      if (!alive) return
      alive = false
      app.unmount()
      created?.remove()
    },
    getComponentByName(_name: string) {
      throw new Error('vamis.getComponentByName: 尚未实现（等待 D5 组件注册表）')
    },
    async doAction(_actions: unknown, _ctx?: PlainObject) {
      throw new Error('vamis.doAction: 尚未实现（等待 D4 动作注册表）')
    },
  }
}

export type { RendererConfig }
