import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createDefaultEnv } from '../src/env'
import { claimToastHost, releaseToastHost, resetToasts, useToastState } from '../src/toast-store'

const here = dirname(fileURLToPath(import.meta.url))

function stubMobile(matches: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: String(query).includes('768') ? matches : false,
    media: query,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent() {
      return false
    },
    onchange: null,
  }))
}

describe('env.notify / toast', () => {
  beforeEach(() => {
    resetToasts()
    stubMobile(false)
  })
  afterEach(() => {
    vi.unstubAllGlobals()
    resetToasts()
  })

  it('only the first ToastHost is primary', () => {
    expect(claimToastHost()).toBe(true)
    expect(claimToastHost()).toBe(false)
    expect(claimToastHost()).toBe(false)
    releaseToastHost()
    releaseToastHost()
    releaseToastHost()
    expect(claimToastHost()).toBe(true)
    releaseToastHost()
  })

  it('routes info/success/warning/error onto the toast bus', () => {
    const env = createDefaultEnv()
    env.notify('info', 'hello')
    env.notify('success', 'saved')
    env.notify('warning', 'careful')
    env.notify('error', 'boom')
    expect(useToastState().items.map((item) => [item.level, item.body])).toEqual([
      ['info', 'hello'],
      ['success', 'saved'],
      ['warning', 'careful'],
      ['error', 'boom'],
    ])
  })

  it('forwards timeout closeButton position title onto the toast item', () => {
    const env = createDefaultEnv()
    env.notify('success', 'saved', {
      timeout: 1000,
      closeButton: true,
      position: 'bottom-left',
      title: '标题',
    })
    expect(useToastState().items[0]).toMatchObject({
      level: 'success',
      body: 'saved',
      title: '标题',
      timeout: 1000,
      closeButton: true,
      position: 'bottom-left',
      mobile: false,
    })
  })

  it('desktop defaults top-center / 4000 / error 6000 and stacks', () => {
    const env = createDefaultEnv()
    env.notify('info', 'a')
    env.notify('error', 'b')
    const items = useToastState().items
    expect(items).toHaveLength(2)
    expect(items[0]).toMatchObject({ position: 'top-center', timeout: 4000, closeButton: false })
    expect(items[1]).toMatchObject({ position: 'top-center', timeout: 6000 })
  })

  it('mobile max-width 768 uses center / 3000 / one toast / no closeButton', () => {
    stubMobile(true)
    const env = createDefaultEnv()
    env.notify('info', '普通消息提示')
    env.notify('success', '成功消息提示')
    env.notify('error', '错误消息提示')
    env.notify('warning', '警告消息提示')
    const items = useToastState().items
    expect(items).toHaveLength(1)
    expect(items[0]).toMatchObject({
      level: 'warning',
      body: '警告消息提示',
      position: 'center',
      timeout: 3000,
      closeButton: false,
      mobile: true,
      showIcon: true,
    })
  })

  it('ToastHost teleports into body so overflow-hidden previews do not clip', () => {
    const host = readFileSync(resolve(here, '../../vamis/src/ToastHost.vue'), 'utf8')
    const app = readFileSync(resolve(here, '../../vamis/src/VamisApp.vue'), 'utf8')
    const message = readFileSync(resolve(here, '../../vamis/src/ToastMessage.vue'), 'utf8')
    const store = readFileSync(resolve(here, '../src/toast-store.ts'), 'utf8')
    expect(host).toContain('Teleport')
    expect(host).toContain('data-vamis-toast')
    expect(host).toContain('claimToastHost')
    expect(app).toContain('ToastHost')
    expect(message).toContain('vamis-toast--in')
    expect(message).toContain('vamis-toast--has-icon')
    expect(message).toContain('levelToFeedbackIcon')
    expect(message).not.toContain('viewBox="0 0 1024 1024"')
    expect(store).toContain('function claimToastHost')
  })

  it('toast CSS pins Amis 400px bounce desktop and dark center mobile', () => {
    const css = readFileSync(resolve(here, '../../vamis-ui/src/styles.css'), 'utf8')
    const sdk = readFileSync(resolve(here, '../../vamis-sdk/src/style.css'), 'utf8')
    const envSrc = readFileSync(resolve(here, '../src/env.ts'), 'utf8')
    expect(css).toContain('width: 400px')
    expect(css).toContain('@keyframes vamiss-toast-in')
    expect(css).toContain("data-position='center'")
    expect(css).toContain('rgba(0, 0, 0, 0.9)')
    expect(css).toContain('min-width: 120px')
    expect(css).toContain('width: 40px')
    expect(css).not.toContain('vue-sonner')
    expect(sdk).not.toContain('vue-sonner')
    expect(envSrc).not.toContain('vue-sonner')
    expect(envSrc).toContain('pushToast')
    const probe = readFileSync(resolve(here, '../../vamis-sdk/embed-case.html'), 'utf8')
    expect(probe).toContain('.vamis-toast')
    expect(probe).not.toContain("[data-vamis-toast]")
  })

  it('editor canvas selection does not swallow action clicks', () => {
    const editor = readFileSync(resolve(here, '../../vamis-editor/src/VamisEditor.vue'), 'utf8')
    const start = editor.indexOf('function onCanvasClick')
    const end = editor.indexOf('function onCanvasDragOver')
    const fn = editor.slice(start, end)
    expect(fn).toMatch(/selectedPath/)
    expect(fn).not.toMatch(/stopPropagation/)
    expect(fn).not.toMatch(/preventDefault/)
  })
})
