import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  spinnerBody,
  spinnerDelay,
  spinnerIcon,
  spinnerLoadingConfig,
  spinnerOverlay,
  spinnerShow,
  spinnerSize,
  spinnerTip,
  spinnerTipPlacement,
} from '../src/utils/spinner'
import {
  resetSpinnerParents,
  spinnerCheckLoading,
  spinnerPushParent,
  spinnerRemoveParent,
  type SpinnerParent,
} from '../src/spinner-store'
import { schemaNodeDisplayClass } from '../src/style'

const here = dirname(fileURLToPath(import.meta.url))

function node(children: SpinnerParent[] = []): SpinnerParent {
  const self: SpinnerParent = {
    contains(other) {
      if (other === self) return false
      return children.some((child) => child === other || child.contains(other))
    },
  }
  return self
}

describe('spinner defaults', () => {
  it('defaults show true / size empty / overlay false / tip bottom / delay 0', () => {
    expect(spinnerShow({})).toBe(true)
    expect(spinnerShow({ show: false })).toBe(false)
    expect(spinnerShow({ showOn: '${ok}' }, { ok: true })).toBe(true)
    expect(spinnerShow({ showOn: '${ok}' }, { ok: false })).toBe(false)
    expect(spinnerSize({})).toBe('')
    expect(spinnerSize({ size: 'sm' })).toBe('sm')
    expect(spinnerSize({ size: 'lg' })).toBe('lg')
    expect(spinnerSize({ size: 'md' })).toBe('')
    expect(spinnerOverlay({})).toBe(false)
    expect(spinnerOverlay({ overlay: true })).toBe(true)
    expect(spinnerTipPlacement({})).toBe('bottom')
    expect(spinnerTipPlacement({ tipPlacement: 'left' })).toBe('left')
    expect(spinnerDelay({})).toBe(0)
    expect(spinnerDelay({ delay: 1000 })).toBe(1000)
  })

  it('reads tip / body / url / fa / builtin icon', () => {
    expect(spinnerTip({ tip: '加载中 ${who}' }, { who: '甲' })).toBe('加载中 甲')
    expect(spinnerTip({})).toBe('')
    expect(spinnerBody({ body: { type: 'tpl', tpl: '内容' } })).toEqual([{ type: 'tpl', tpl: '内容' }])
    expect(spinnerBody({})).toEqual([])
    expect(spinnerIcon({ icon: '/examples/static/logo.png' })).toEqual({
      kind: 'url',
      src: '/examples/static/logo.png',
    })
    expect(spinnerIcon({ icon: 'fa fa-spinner' })).toEqual({ kind: 'class', className: 'fa fa-spinner' })
    expect(spinnerIcon({ icon: 'reload' })).toEqual({ kind: 'builtin', name: 'reload' })
    expect(spinnerIcon({})).toEqual({ kind: 'default' })
  })

  it('loadingConfig forces overlay, ignores custom icon, can disable show', () => {
    expect(spinnerLoadingConfig({ loadingConfig: { root: '#mount' } })).toEqual({ root: '#mount' })
    expect(spinnerOverlay({ loadingConfig: { root: '#mount' } })).toBe(true)
    expect(spinnerIcon({ icon: 'reload', loadingConfig: { root: '#mount' } })).toEqual({ kind: 'default' })
    expect(spinnerShow({ show: true, loadingConfig: { show: false } })).toBe(false)
  })

  it('parent spinner blocks child until parent stops', () => {
    resetSpinnerParents()
    const child = node()
    const parent = node([child])
    spinnerPushParent(parent)
    spinnerPushParent(child)
    expect(spinnerCheckLoading(parent)).toBe(true)
    expect(spinnerCheckLoading(child)).toBe(false)
    spinnerRemoveParent(parent)
    expect(spinnerCheckLoading(child)).toBe(true)
    resetSpinnerParents()
  })

  it('keeps bare spinner inline-block and container spinner as a block slot', () => {
    expect(schemaNodeDisplayClass({ type: 'spinner' })).toBe('inline-block')
    expect(schemaNodeDisplayClass({ type: 'spinner', body: { type: 'tpl', tpl: 'x' } })).toBe('')
  })

  it('spinner styles use mark token sizes and 2s simple spin', () => {
    const css = readFileSync(resolve(here, '../../vamis-ui/src/styles.css'), 'utf8')
    expect(css).toContain('--spinner-size: 32px')
    expect(css).toContain('--spinner-size-sm: 16px')
    expect(css).toContain('--spinner-size-lg: 48px')
    expect(css).toContain('--spinner-color: var(--primary)')
    expect(css).toContain('--spinner-overlay-bg: rgba(255, 255, 255, 0.1)')
    expect(css).toContain('--z-spinner: 11')
    expect(css).toMatch(
      /\.vamis-spinner \{\s*display: inline-flex;\s*flex-direction: column;\s*align-items: center;\s*justify-content: center;\s*font-size: var\(--fontSizeLg\);\s*line-height: var\(--lineHeightBase\);\s*\}/,
    )
    expect(css).toMatch(
      /\.vamis-node:has\(> \[data-vamis-spinner\]\) \{\s*font-size: var\(--fontSizeLg\);\s*line-height: var\(--lineHeightBase\);\s*\}/,
    )
    expect(css).toContain('animation: vamis-spinner-spin 2s linear infinite')
    expect(css).toContain('.vamis-spinner__icon--default')
    const vue = readFileSync(resolve(here, '../../vamis/src/renderers/Spinner.vue'), 'utf8')
    expect(vue).toContain('VamisSpinnerMark')
    expect(vue).toContain('spinnerCheckLoading')
    expect(vue).toContain('spinnerLoadingConfig')
    const mark = readFileSync(resolve(here, '../../vamis-ui/src/ui/VamisSpinnerMark.vue'), 'utf8')
    expect(mark).toContain('class="vamis-spinner-v"')
    expect(mark).toContain('repeatCount="indefinite"')
    expect(mark).toContain('points="32 10 54 32 32 54 10 32"')
    expect(mark).not.toContain('49.6902503')
    expect(css).toContain('.vamis-spinner-v')
    const themes = readFileSync(resolve(here, '../../vamis-ui/src/themes.css'), 'utf8')
    expect(themes).not.toContain('--spinner-overlay-bg:')
  })

  it('keeps every shared Spinner host on the shared renderer', () => {
    const consumers = [
      '../../vamis/src/renderers/Page.vue',
      '../../vamis/src/renderers/Service.vue',
      '../../vamis/src/renderers/CRUD.vue',
      '../../vamis/src/renderers/Form.vue',
      '../../vamis/src/OverlayHost.vue',
      '../../vamis/src/renderers/form/Select.vue',
      '../../vamis/src/renderers/form/InputText.vue',
      '../../vamis/src/renderers/form/TreeBranch.vue',
    ]
    for (const consumer of consumers) {
      expect(readFileSync(resolve(here, consumer), 'utf8')).toMatch(/import Spinner from ['"].*Spinner\.vue['"]/)
    }
    for (const consumer of consumers.slice(0, 4).concat(consumers.slice(5, 7))) {
      expect(readFileSync(resolve(here, consumer), 'utf8')).toMatch(/loadingConfig/)
    }
    expect(readFileSync(resolve(here, consumers[7]), 'utf8')).toContain('loadingConfig')
    expect(readFileSync(resolve(here, '../../vamis/src/renderers/form/InputTree.vue'), 'utf8')).toContain(
      ':loading-config="schema.loadingConfig"',
    )
    expect(readFileSync(resolve(here, '../../vamis/src/renderers/form/TreeSelect.vue'), 'utf8')).toContain(
      ':loading-config="schema.loadingConfig"',
    )
  })
})
