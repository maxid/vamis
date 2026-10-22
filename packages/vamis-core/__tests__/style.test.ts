import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  compileIrToWidget,
  IR_API_VERSION,
  jsonToIr,
} from '../src/ir'
import {
  buildCssBlock,
  controlWidthForSize,
  fillsLayoutSlot,
  resolveClassName,
  resolveCssVars,
  resolveInlineStyle,
} from '../src/style'

describe('resolveClassName', () => {
  it('passes through a Tailwind string', () => {
    expect(resolveClassName('text-sm font-medium', {})).toBe('text-sm font-medium')
  })

  it('keeps Amis gap helpers so CSS tokens apply', () => {
    expect(resolveClassName('m-t-xs p-l-md', {})).toBe('m-t-xs p-l-md')
  })

  it('maps m-b-none to mb-0 so it can override panel margin', () => {
    expect(resolveClassName('m-b-none', {})).toBe('mb-0')
  })

  it('maps text-danger to the destructive token class', () => {
    expect(resolveClassName('text-danger', {})).toBe('text-destructive')
  })

  it('evaluates object className against data', () => {
    expect(
      resolveClassName({ 'text-danger': '${status == 1}', 'text-success': '${status == 2}' }, { status: 1 }),
    ).toBe('text-destructive')
    expect(
      resolveClassName({ 'text-danger': '${status == 1}', 'text-success': '${status == 2}' }, { status: 2 }),
    ).toBe('text-success')
  })

  it('expands templates inside class names', () => {
    expect(resolveClassName('text-${tone}', { tone: 'success' })).toBe('text-success')
  })

  it('keeps m: / pc: prefixes for helper CSS', () => {
    expect(resolveClassName('m:m-t-md pc:m-t-xl', {})).toBe('m:m-t-md pc:m-t-xl')
  })

  it('keeps Amis width helpers including m: / pc: and fractions', () => {
    expect(resolveClassName('w-full pc:w-1/2 m:w-full', {})).toBe('w-full pc:w-1/2 m:w-full')
  })

  it('keeps Amis height helpers including m: / pc: and fractions', () => {
    expect(resolveClassName('h-full pc:h-1/2 m:min-h-full', {})).toBe('h-full pc:h-1/2 m:min-h-full')
  })
})

describe('resolveInlineStyle', () => {
  it('returns a style object from a map', () => {
    expect(resolveInlineStyle({ color: '#111', fontSize: '14px' }, {})).toEqual({
      color: '#111',
      fontSize: '14px',
    })
  })

  it('parses a css string', () => {
    expect(resolveInlineStyle('color: red; margin-top: 8px', {})).toEqual({
      color: 'red',
      marginTop: '8px',
    })
  })

  it('filters templates in style values', () => {
    expect(resolveInlineStyle({ color: '${color}' }, { color: 'oklch(0.5 0.1 20)' })).toEqual({
      color: 'oklch(0.5 0.1 20)',
    })
  })
})

describe('resolveCssVars', () => {
  it('aliases Amis box vars onto Vamis tokens', () => {
    const out = resolveCssVars({
      '--Form-input-height': '32px',
      '--Form-control-widthMd': '240px',
      '--TableCell-height': '40px',
      '--TableCell-paddingX': '10px',
    })
    expect(out['--control-h']).toBe('32px')
    expect(out['--form-control-width-md']).toBe('240px')
    expect(out['--table-row-h']).toBe('40px')
    expect(out['--table-cell-px']).toBe('10px')
    expect(out['--Form-input-height']).toBe('32px')
  })

  it('aliases Amis font family vars onto --font-sans / --font-mono', () => {
    const out = resolveCssVars({
      '--fonts-base-family': 'Georgia, serif',
      '--fontFamilyMonospace': 'Courier, monospace',
    })
    expect(out['--font-sans']).toBe('Georgia, serif')
    expect(out['--font-mono']).toBe('Courier, monospace')
    expect(out['--fonts-base-family']).toBe('Georgia, serif')
  })
})

describe('controlWidthForSize', () => {
  it('maps xs…lg onto form control width tokens and full to 100%', () => {
    expect(controlWidthForSize('xs')).toBe('var(--form-control-width-xs)')
    expect(controlWidthForSize('sm')).toBe('var(--form-control-width-sm)')
    expect(controlWidthForSize('md')).toBe('var(--form-control-width-md)')
    expect(controlWidthForSize('lg')).toBe('var(--form-control-width-lg)')
    expect(controlWidthForSize('full')).toBe('100%')
    expect(controlWidthForSize(undefined)).toBeUndefined()
  })
})

describe('IR metadata.style', () => {
  it('lifts page.cssVars into metadata.style when wrapping Amis JSON', () => {
    const ir = jsonToIr({
      type: 'page',
      title: '染色',
      cssVars: { '--primary': '#1d4ed8' },
      body: [{ type: 'tpl', tpl: 'hi' }],
    })
    expect(ir.metadata.style?.cssVars?.['--primary']).toBe('#1d4ed8')
    expect((ir.spec as { cssVars?: Record<string, string> }).cssVars?.['--primary']).toBe('#1d4ed8')
  })

  it('compiles metadata.style.cssVars onto the page widget', () => {
    const widget = compileIrToWidget({
      apiVersion: IR_API_VERSION,
      kind: 'UiPage',
      metadata: {
        name: 'themed',
        style: { cssVars: { '--primary': '#111' }, className: 'm-t-md', density: 'comfortable' },
      },
      spec: { type: 'page', body: [{ type: 'tpl', tpl: 'x' }] },
    })
    expect(widget.cssVars?.['--primary']).toBe('#111')
    expect(widget.className).toBe('m-t-md')
    expect(widget.density).toBe('comfortable')
  })
})

describe('Amis width helpers', () => {
  it('ships w-* / m: / pc: matching helper.css Width', () => {
    const here = dirname(fileURLToPath(import.meta.url))
    const css = readFileSync(resolve(here, '../../vamis-ui/src/helpers-width.css'), 'utf8')
    expect(css).toContain('.w-full { width: 100%; }')
    expect(css).toContain('.m\\:w-full { width: 100%; }')
    expect(css).toContain('.pc\\:w-1\\/2 { width: 50%; }')
    expect(css).toContain('@media (max-width: 767px)')
    expect(css).toContain('@media (min-width: 768px)')
  })

  it('ships h-* / m: / pc: matching helper.css Height', () => {
    const here = dirname(fileURLToPath(import.meta.url))
    const css = readFileSync(resolve(here, '../../vamis-ui/src/helpers-height.css'), 'utf8')
    expect(css).toContain('.h-full { height: 100%; }')
    expect(css).toContain('.min-h-full { min-height: 100%; }')
    expect(css).toContain('.m\\:h-full { height: 100%; }')
    expect(css).toContain('.pc\\:h-1\\/2 { height: 50%; }')
    expect(css).toContain('.vamis-node.h-full')
  })

  it('pins form control sizes only from the sm breakpoint', () => {
    const here = dirname(fileURLToPath(import.meta.url))
    const css = readFileSync(resolve(here, '../../vamis-ui/src/styles.css'), 'utf8')
    expect(css).toContain('@media (min-width: 576px)')
    expect(css).toContain('.vamis-control--fluid')
    expect(css).toContain('.vamis-control--full')
    expect(css).toContain('.vamis-control--sm')
    expect(css).toContain('grid-template-columns: 28% minmax(0, 1fr)')
  })

  it('keeps Form filling its slot by default without a max-width cap', () => {
    const here = dirname(fileURLToPath(import.meta.url))
    const form = readFileSync(resolve(here, '../../vamis/src/renderers/Form.vue'), 'utf8')
    expect(form).toContain('class="w-full min-w-0"')
    expect(form).toContain('vamis-form-panel')
    expect(form).toContain('panelClassName')
    expect(form).toContain('vamis-form-actions')
    expect(form).not.toContain('max-w-3xl')
  })

  it('makes page toolbar a full-width slot when there is no title', () => {
    const here = dirname(fileURLToPath(import.meta.url))
    const page = readFileSync(resolve(here, '../../vamis/src/renderers/Page.vue'), 'utf8')
    expect(page).toContain('hasTitleBlock')
    expect(page).toContain("'mb-0 w-full min-w-0'")
    expect(page).not.toContain('mb-4')
  })

  it('assembles page chrome with div like Amis, not landmark tags', () => {
    const here = dirname(fileURLToPath(import.meta.url))
    const page = readFileSync(resolve(here, '../../vamis/src/renderers/Page.vue'), 'utf8')
    expect(page).not.toMatch(/<(section|header|aside)\b/)
    expect(page).toContain('<h1')
  })

  it('degrades nested form wrappers to div and keeps wrapperComponent', () => {
    const here = dirname(fileURLToPath(import.meta.url))
    const form = readFileSync(resolve(here, '../../vamis/src/renderers/Form.vue'), 'utf8')
    expect(form).toContain('const parentForm = useForm()')
    expect(form).toContain('wrapperComponent')
    expect(form).toContain('wrapTag')
    expect(form).toContain("return parentForm ? 'div' : 'form'")
    expect(form).toContain('onNestedEnter')
    expect(form).toContain('submitButtonType')
    expect(form).toContain(':is="wrapTag"')
  })

  it('only creates a child Scope for self/isolate renderers, not inherit data overlays', () => {
    const here = dirname(fileURLToPath(import.meta.url))
    const sr = readFileSync(resolve(here, '../src/SchemaRenderer.vue'), 'utf8')
    expect(sr).toContain("scopeMode.value !== 'inherit'")
    expect(sr).not.toContain('hasOverlay.value')
    expect(sr).toContain("!key.startsWith('__')")
    expect(sr).toContain('[needsChildScope.value, scopeMode.value]')
    expect(sr).not.toContain('props.schema] as const')
  })

  it('refetches remote apis with isApiOutdated like Amis, not on every data change', () => {
    const here = dirname(fileURLToPath(import.meta.url))
    const page = readFileSync(resolve(here, '../../vamis/src/renderers/Page.vue'), 'utf8')
    const form = readFileSync(resolve(here, '../../vamis/src/renderers/Form.vue'), 'utf8')
    const service = readFileSync(resolve(here, '../../vamis/src/renderers/Service.vue'), 'utf8')
    const select = readFileSync(resolve(here, '../../vamis/src/renderers/form/Select.vue'), 'utf8')
    const markdown = readFileSync(resolve(here, '../../vamis/src/renderers/display/Markdown.vue'), 'utf8')
    const chart = readFileSync(resolve(here, '../../vamis/src/renderers/Chart.vue'), 'utf8')
    const crud = readFileSync(resolve(here, '../../vamis/src/renderers/CRUD.vue'), 'utf8')
    const crud2 = readFileSync(resolve(here, '../../vamis/src/renderers/data/CRUD2.vue'), 'utf8')
    for (const src of [page, form, service, select, markdown, chart, crud, crud2]) {
      expect(src).toContain('isApiOutdated')
      expect(src).not.toContain('apiTrackKey')
    }
    expect(select).not.toContain('watch(() => props.schema.source, loadSource)')
    expect(markdown).not.toContain("watch(() => props.schema.src, load)")
  })

  it('keeps doc playground alive when body templates change, and mounts when visible', () => {
    const here = dirname(fileURLToPath(import.meta.url))
    const preview = readFileSync(resolve(here, '../../../playground/src/components/SchemaPreview.vue'), 'utf8')
    const lazy = readFileSync(resolve(here, '../src/LazyComponent.vue'), 'utf8')
    const form = readFileSync(resolve(here, '../../vamis/src/renderers/Form.vue'), 'utf8')
    const chart = readFileSync(resolve(here, '../../vamis/src/renderers/Chart.vue'), 'utf8')
    const docView = readFileSync(resolve(here, '../../../playground/src/views/DocView.vue'), 'utf8')
    expect(preview).toContain('LazyComponent')
    expect(preview).not.toContain('LazyInView')
    expect(preview).not.toContain('schemaKey')
    expect(preview).not.toContain(':key="schemaKey"')
    // SPA 切页必须拆掉旧 LazyComponent：Amis MdRenderer 每页新建 root。
    expect(docView).toContain('`${route.path}:${i}`')
    expect(docView).not.toContain(':key="i"')
    expect(docView).toContain("flush: 'pre'")
    expect(lazy).toContain('defaultVisible: false')
    expect(lazy).toContain('unMountOnHidden: false')
    expect(lazy).toContain('partialVisibility: true')
    expect(lazy).not.toContain('rootMargin')
    expect(form).toContain('schema.lazyLoad')
    expect(form).toContain(':default-visible="!lazyLoad"')
    expect(chart).toContain('unMountOnHidden')
    expect(chart).toContain('placeholder="..."')
    const schemaDoc = readFileSync(resolve(here, '../../../website/src/concepts/schema.md'), 'utf8')
    const nav = readFileSync(resolve(here, '../../../website/nav.mjs'), 'utf8')
    expect(schemaDoc).toContain('## LazyComponent')
    expect(schemaDoc).toContain('defaultVisible')
    expect(schemaDoc).toContain('lazyLoad')
    expect(nav).not.toContain("link: '/extend/lazy'")
    const code = readFileSync(resolve(here, '../../vamis/src/renderers/display/Code.vue'), 'utf8')
    const highlight = readFileSync(resolve(here, '../../vamis/src/renderers/display/code-highlight.ts'), 'utf8')
    const render = readFileSync(resolve(here, '../../../playground/src/docs/render.ts'), 'utf8')
    const vamisPkg = readFileSync(resolve(here, '../../vamis/package.json'), 'utf8')
    expect(code).toContain('mountCodeEditor')
    expect(code).toContain('lineNumbers')
    expect(code).toContain('folding')
    expect(code).toContain('min-w-0')
    expect(code).toContain('schemaFlag(props.schema.folding, false)')
    expect(code).toContain('schemaFlag(props.schema.wordWrap, true)')
    expect(code).not.toContain("isMultiLine.value ? 'on'")
    expect(code).toContain('customLang')
    expect(code).toContain('editorTheme')
    expect(code).not.toContain('Badge')
    expect(code).not.toContain('colorizeSync')
    expect(code).not.toContain('v-html')
    expect(highlight).toContain("import('monaco-editor')")
    expect(highlight).toContain('setMonarchTokensProvider')
    expect(highlight).toContain('editor.create')
    expect(highlight).toContain('inherit: true')
    expect(highlight).toContain('quickSuggestions: false')
    expect(highlight).toContain('hover: { enabled: false }')
    expect(highlight).not.toContain('highlight.js')
    expect(vamisPkg).toContain('monaco-editor')
    expect(vamisPkg).not.toContain('highlight.js')
    const docCode = readFileSync(resolve(here, '../../../playground/src/components/DocCode.vue'), 'utf8')
    expect(docCode).toContain('LazyComponent')
    expect(docView).toContain('DocCode')
    expect(render).toContain("kind: 'code'")
    expect(render).not.toContain('colorizeSync')
    const codeDoc = readFileSync(resolve(here, '../../../website/src/components/code.md'), 'utf8')
    expect(codeDoc).toContain('value: |')
    expect(codeDoc).not.toContain('\\n  let schema')
  })

  it('lets panelClassName mb-0 override the default panel margin', () => {
    const here = dirname(fileURLToPath(import.meta.url))
    const form = readFileSync(resolve(here, '../../vamis/src/renderers/Form.vue'), 'utf8')
    expect(form).toContain('mb-[var(--panel-margin-bottom)]')
    expect(form).toContain('schema.panelClassName')
    const css = readFileSync(resolve(here, '../../vamis-ui/src/helpers.css'), 'utf8')
    expect(css).toContain('.mb-0 { margin-bottom: 0; }')
    const theme = readFileSync(resolve(here, '../../vamis-ui/src/styles.css'), 'utf8')
    expect(theme).toContain('--panel-margin-bottom')
    expect(theme).toContain('.vamis-form-panel')
    expect(theme).not.toMatch(/\.vamis-form-panel \{[^}]*margin-bottom/)
  })
})

describe('fillsLayoutSlot', () => {
  it('marks form/panel/page as filling the parent and leaves buttons content-sized', () => {
    expect(fillsLayoutSlot('form')).toBe(true)
    expect(fillsLayoutSlot('panel')).toBe(true)
    expect(fillsLayoutSlot('button')).toBe(false)
    expect(fillsLayoutSlot('action')).toBe(false)
  })
})

describe('buildCssBlock', () => {
  it('turns Amis page.css objects into CSS text', () => {
    const css = buildCssBlock({ '.myClass': { color: 'blue' } })
    expect(css).toContain('.myClass')
    expect(css).toContain('color: blue')
  })

  it('drops unsafe selectors and values', () => {
    expect(buildCssBlock({ '.x</style>': { color: 'red' } })).toBe('')
    expect(buildCssBlock({ '.x': { color: 'red; } body { display:none' } })).toBe('')
  })
})
