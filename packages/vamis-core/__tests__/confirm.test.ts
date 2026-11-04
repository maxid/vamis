import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  claimConfirmHost,
  confirmTitleOf,
  hasConfirmHost,
  openConfirm,
  releaseConfirmHost,
  resetConfirms,
  settleConfirm,
  useConfirmState,
} from '../src/confirm-store'
import { createDefaultEnv } from '../src/env'

const here = dirname(fileURLToPath(import.meta.url))

describe('env.confirm / Alert.confirm', () => {
  beforeEach(() => {
    resetConfirms()
  })
  afterEach(() => {
    resetConfirms()
    while (hasConfirmHost()) releaseConfirmHost()
  })

  it('falls back Alert.info title 系统消息; empty string hides header', () => {
    expect(confirmTitleOf()).toBe('系统消息')
    expect(confirmTitleOf(undefined)).toBe('系统消息')
    expect(confirmTitleOf('炸弹')).toBe('炸弹')
    expect(confirmTitleOf('')).toBe('')
  })

  it('queues a modal request instead of window.confirm when a host is live', async () => {
    const native = vi.fn(() => true)
    vi.stubGlobal('confirm', native)
    claimConfirmHost()
    const env = createDefaultEnv()
    const pending = env.confirm('确认要发出这个请求？', '炸弹')
    const current = useConfirmState().current
    expect(current).toMatchObject({
      msg: '确认要发出这个请求？',
      title: '炸弹',
      confirmText: '确认',
      cancelText: '取消',
      confirmBtnLevel: 'danger',
      cancelBtnLevel: 'default',
      closeOnEsc: false,
      size: '',
    })
    expect(native).not.toHaveBeenCalled()
    settleConfirm(true)
    await expect(pending).resolves.toBe(true)
    vi.unstubAllGlobals()
  })

  it('forwards confirm / cancel copy, danger level, closeOnEsc and size', async () => {
    claimConfirmHost()
    const pending = openConfirm('删掉？', '警告', {
      confirmText: '删除',
      cancelText: '再想想',
      confirmBtnLevel: 'danger',
      cancelBtnLevel: 'default',
      closeOnEsc: true,
      size: 'sm',
      className: 'my-confirm',
    })
    expect(useConfirmState().current).toMatchObject({
      msg: '删掉？',
      title: '警告',
      confirmText: '删除',
      cancelText: '再想想',
      closeOnEsc: true,
      size: 'sm',
      className: 'my-confirm',
    })
    settleConfirm(false)
    await expect(pending).resolves.toBe(false)
  })

  it('serializes overlapping confirms so the second waits', async () => {
    claimConfirmHost()
    const first = openConfirm('one')
    const second = openConfirm('two')
    expect(useConfirmState().current?.msg).toBe('one')
    settleConfirm(true)
    await expect(first).resolves.toBe(true)
    expect(useConfirmState().current?.msg).toBe('two')
    settleConfirm(false)
    await expect(second).resolves.toBe(false)
  })

  it('falls back to window.confirm only when no ConfirmHost is mounted', async () => {
    const native = vi.fn(() => false)
    vi.stubGlobal('window', { confirm: native })
    const env = createDefaultEnv()
    await expect(env.confirm('plain', 'title')).resolves.toBe(false)
    expect(native).toHaveBeenCalledWith('title\n\nplain')
    vi.unstubAllGlobals()
  })

  it('ConfirmHost is a Dialog without close X; env does not use native confirm as the playground path', () => {
    const host = readFileSync(resolve(here, '../../vamis/src/ConfirmHost.vue'), 'utf8')
    const app = readFileSync(resolve(here, '../../vamis/src/VamisApp.vue'), 'utf8')
    const envSrc = readFileSync(resolve(here, '../src/env.ts'), 'utf8')
    const css = readFileSync(resolve(here, '../../vamis-ui/src/styles.css'), 'utf8')
    expect(app).toContain('ConfirmHost')
    expect(host).toContain('data-vamis-confirm')
    expect(host).toContain(':show-close-button="false"')
    expect(host).toContain('pointer-down-outside')
    expect(host).toContain('escape-key-down')
    expect(host).toContain('levelToVariant')
    expect(host).toContain('settleConfirm(true)')
    expect(host).toContain('settleConfirm(false)')
    expect(host).toContain('v-html')
    expect(envSrc).toContain('openConfirm')
    expect(envSrc).toContain('hasConfirmHost')
    expect(css).toContain('[data-vamis-confirm]')
    expect(css).toContain('min-width: 72px')
    expect(css).toContain('z-index: var(--z-modal)')
    expect(css).toContain('padding: 24px 0')
    expect(css).toContain('margin: 16px 0 24px')
  })
})
