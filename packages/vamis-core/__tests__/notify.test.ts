import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const toast = Object.assign(vi.fn(), {
  success: vi.fn(),
  warning: vi.fn(),
  error: vi.fn(),
})

vi.mock('vue-sonner', () => ({ toast }))

const here = dirname(fileURLToPath(import.meta.url))

describe('env.notify / toast', () => {
  beforeEach(() => {
    toast.mockClear()
    toast.success.mockClear()
    toast.warning.mockClear()
    toast.error.mockClear()
  })

  it('routes info/success/warning/error to vue-sonner', async () => {
    const { createDefaultEnv } = await import('../src/env')
    const env = createDefaultEnv()
    env.notify('info', 'hello')
    env.notify('success', 'saved')
    env.notify('warning', 'careful')
    env.notify('error', 'boom')
    expect(toast).toHaveBeenCalledWith('hello', expect.any(Object))
    expect(toast.success).toHaveBeenCalledWith('saved', expect.any(Object))
    expect(toast.warning).toHaveBeenCalledWith('careful', expect.any(Object))
    expect(toast.error).toHaveBeenCalledWith('boom', expect.any(Object))
  })

  it('forwards timeout closeButton position title to vue-sonner', async () => {
    const { createDefaultEnv } = await import('../src/env')
    const env = createDefaultEnv()
    env.notify('success', 'saved', {
      timeout: 1000,
      closeButton: true,
      position: 'bottom-left',
      title: '标题',
    })
    expect(toast.success).toHaveBeenCalledWith(
      'saved',
      expect.objectContaining({
        duration: 1000,
        closeButton: true,
        position: 'bottom-left',
        description: '标题',
      }),
    )
  })

  it('Toaster ships vue-sonner stylesheet so toasts are visible', () => {
    const sonner = readFileSync(resolve(here, '../../vamis-ui/src/ui/sonner/Sonner.vue'), 'utf8')
    expect(sonner).toMatch(/vue-sonner\/style\.css/)
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
