import { nextTick } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { embed } from '../src/embed'
import 'vamis'

const mounts: Array<ReturnType<typeof embed>> = []

afterEach(() => {
  while (mounts.length) mounts.pop()?.unmount()
  document.body.innerHTML = ''
})

function mount(schema: unknown, env?: Parameters<typeof embed>[3]) {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const scoped = embed(host, schema, undefined, env)
  mounts.push(scoped)
  return { host, scoped }
}

function selectFile(host: HTMLElement) {
  const input = host.querySelector('input[type="file"]') as HTMLInputElement
  const file = new File(['hello'], 'hello.txt', { type: 'text/plain' })
  Object.defineProperty(input, 'files', {
    configurable: true,
    value: [file],
  })
  input.dispatchEvent(new Event('change', { bubbles: true }))
}

function formSubmitter(scoped: ReturnType<typeof embed>) {
  return scoped.getComponentByName('uploadForm') as {
    submit?: () => Promise<boolean>
  }
}

describe('InputFile pending submit', () => {
  it.each(['input-file', 'input-image'])(
    'waits for a pending %s upload before calling the form submit API',
    async (type) => {
    const order: string[] = []
    let resolveUpload: ((value: unknown) => void) | undefined
    const fetcher = vi.fn(async (api: unknown) => {
      const url = typeof api === 'string' ? api : String((api as { url?: string })?.url || '')
      if (url.includes('/api/upload')) {
        order.push('upload')
        return new Promise((resolve) => {
          resolveUpload = resolve
        })
      }
      order.push('submit')
      return { status: 0, msg: 'ok', data: {} }
    })
    const { host, scoped } = mount(
      {
        type: 'form',
        name: 'uploadForm',
        api: '/api/submit',
        actions: [],
        body: {
          type,
          name: 'file',
          label: '文件',
          receiver: '/api/upload',
          accept: 'text/plain',
          autoUpload: false,
        },
      },
      { fetcher },
    )

    await nextTick()
    selectFile(host)
    await nextTick()

    const pending = formSubmitter(scoped).submit?.()
    await vi.waitFor(() => expect(resolveUpload).toBeTypeOf('function'))
    expect(order).toEqual(['upload'])

    resolveUpload?.({
      status: 0,
      msg: 'ok',
      data: { url: '/files/hello.txt', value: '/files/hello.txt', name: 'hello.txt' },
    })
    await expect(pending).resolves.toBe(true)
    expect(order).toEqual(['upload', 'submit'])
    },
  )

  it('blocks submit when a pending upload fails', async () => {
    const order: string[] = []
    const fetcher = vi.fn(async (api: unknown) => {
      const url = typeof api === 'string' ? api : String((api as { url?: string })?.url || '')
      if (url.includes('/api/upload')) {
        order.push('upload')
        return { status: 500, msg: '上传失败', data: null }
      }
      order.push('submit')
      return { status: 0, msg: 'ok', data: {} }
    })
    const { host, scoped } = mount(
      {
        type: 'form',
        name: 'uploadForm',
        api: '/api/submit',
        actions: [],
        body: {
          type: 'input-file',
          name: 'file',
          label: '文件',
          receiver: '/api/upload',
          autoUpload: false,
        },
      },
      { fetcher, notify: vi.fn() } as Parameters<typeof embed>[3],
    )

    await nextTick()
    selectFile(host)
    await nextTick()

    await expect(formSubmitter(scoped).submit?.()).resolves.toBe(false)
    expect(order).toEqual(['upload'])
  })
})
