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
  isInlineSchema,
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

  it('aliases Amis primary hover vars onto --primary-hover / --primary-active', () => {
    const out = resolveCssVars({
      '--primary-onHover': '#F23F3A',
      '--primary-onActive': '#BB312D',
    })
    expect(out['--primary-hover']).toBe('#F23F3A')
    expect(out['--primary-active']).toBe('#BB312D')
    expect(out['--primary-onHover']).toBe('#F23F3A')
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

  it('restores document tags inside tpl/html after Preflight, not on shadcn hosts', () => {
    const here = dirname(fileURLToPath(import.meta.url))
    const css = readFileSync(resolve(here, '../../vamis-ui/src/styles.css'), 'utf8')
    expect(css).toContain('.vamis-html :where(h1)')
    expect(css).toContain('font-size: 2em')
    expect(css).toContain('.vamis-html :where(h6)')
    expect(css).toContain('.vamis-html :where(p)')
    expect(css).toContain('.vamis-html :where(ul)')
    expect(css).toContain('list-style: disc')
    expect(css).toContain('.vamis-html :where(a)')
    expect(css).not.toContain('.vamis-root :where(h1)')
    expect(css).toContain('.vamis-html :where(button)')
    expect(css).toContain('border-style: outset')
    expect(css).not.toContain('.vamis-html :where(input)')
    expect(css).not.toContain('.vamis-html button {')
    expect(css).not.toContain('.vamis-html input')
    const tpl = readFileSync(resolve(here, '../../vamis/src/renderers/Tpl.vue'), 'utf8')
    const custom = readFileSync(resolve(here, '../../vamis/src/renderers/rest/Custom.vue'), 'utf8')
    const root = readFileSync(resolve(here, '../src/VamisRoot.vue'), 'utf8')
    const page = readFileSync(resolve(here, '../../vamis/src/renderers/Page.vue'), 'utf8')
    const button = readFileSync(resolve(here, '../../vamis-ui/src/ui/button/Button.vue'), 'utf8')
    expect(tpl).toContain('vamis-html')
    expect(tpl).toContain('v-html')
    expect(tpl).not.toContain('leading-relaxed')
    expect(custom).toContain('vamis-html')
    expect(root).not.toContain('vamis-html')
    expect(page).not.toContain('vamis-html')
    expect(button).not.toContain('vamis-html')
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
    expect(docView).toContain('scrollWithin')
    expect(docView).not.toMatch(/\.scrollIntoView\s*\(/)
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
    expect(code).not.toContain('schema.options')
    expect(code).not.toContain('extra.value')
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
    expect(highlight).toContain("hover: { enabled: 'off' }")
    expect(highlight).toContain('colorDecorators: true')
    expect(highlight).toContain("colorDecoratorsActivatedOn: 'click'")
    expect(highlight).not.toContain('colorDecorators: false')
    expect(highlight).toContain('cursorWidth: 0')
    expect(highlight).toContain("matchBrackets: 'never'")
    expect(highlight).toContain('mountFormEditor')
    expect(highlight).toContain('createDiffEditor')
    expect(highlight).toContain('readOnly: opts.readOnly')
    expect(highlight).toContain('fixedOverflowWidgets: true')
    expect(highlight).toContain('monacoOverflowHost')
    expect(highlight).toContain('syncOverflowHostTheme')
    expect(highlight).not.toContain('overflowWidgetsDomNode: document.body')
    expect(highlight).toContain('syncEditorPlaceholder')
    expect(highlight).toContain("import './monaco-host.css'")
    expect(highlight).toContain("size === 'full'")
    expect(highlight).toContain("opts.intellisense === 'schema'")
    expect(highlight).toContain("import('./schema-intellisense')")
    const intellisense = readFileSync(
      resolve(here, '../../vamis/src/renderers/display/schema-intellisense.ts'),
      'utf8',
    )
    expect(intellisense).toContain('registerCompletionItemProvider')
    expect(intellisense).toContain('registerHoverProvider')
    expect(intellisense).toContain('documentation')
    expect(intellisense).toContain('schemaHoverAt')
    expect(intellisense).toContain('schemaCompletionsAt')
    expect(intellisense).toContain('getOffsetAt')
    expect(intellisense).toContain("'yaml'")
    expect(intellisense).toContain('vamis-schema-')
    expect(intellisense).toContain('componentJsonSchema')
    const monacoHostCss = readFileSync(resolve(here, '../../vamis/src/renderers/display/monaco-host.css'), 'utf8')
    expect(monacoHostCss).toContain('vamis-monaco-overflow')
    expect(monacoHostCss).toMatch(/\.vamis-monaco-overflow\.monaco-editor \{[^}]*position:\s*fixed/s)
    expect(monacoHostCss).toContain('vamis-monaco--fullscreen')
    expect(monacoHostCss).toContain('editorSuggestWidget-background')
    expect(monacoHostCss).toContain('--vscode-editor-line-height')
    expect(monacoHostCss).toMatch(/^\s*line-height:\s*inherit/m)
    expect(monacoHostCss).toContain('span:not(.colorpicker-color-decoration)')
    expect(monacoHostCss).toMatch(/span\.colorpicker-color-decoration \{/)
    expect(monacoHostCss).toContain('line-height: 0.8em')
    expect(monacoHostCss).not.toContain('display: none !important')
    expect(monacoHostCss).toMatch(/\.vamis-monaco,\s*\n\.vamis-code--editor \{/)
    expect(highlight).toContain('syncMonacoHostTypo')
    expect(highlight).toContain('EditorOption.lineHeight')
    expect(code).toContain('.cursors-layer')
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
    expect(codeDoc).not.toContain('### options')
    expect(codeDoc).not.toContain('schema.options')
    const formExtras = readFileSync(resolve(here, '../../vamis/src/extras/form.ts'), 'utf8')
    const editorVue = readFileSync(resolve(here, '../../vamis/src/renderers/form/Editor.vue'), 'utf8')
    const diffVue = readFileSync(resolve(here, '../../vamis/src/renderers/form/DiffEditor.vue'), 'utf8')
    const editorDoc = readFileSync(resolve(here, '../../../website/src/components/form/editor.md'), 'utf8')
    const diffDoc = readFileSync(resolve(here, '../../../website/src/components/form/diff-editor.md'), 'utf8')
    expect(formExtras).toContain("'js-editor'")
    expect(formExtras).toContain("'ts-editor'")
    expect(editorVue).toContain('mountFormEditor')
    expect(editorVue).not.toContain('精简编辑器')
    expect(editorVue).not.toContain(
      'props.schema.name ? form?.getValue(props.schema.name) : props.schema.value',
    )
    expect(editorVue).toContain('schema.value')
    expect(editorVue).toContain('seedFormValue')
    expect(editorVue).toContain('syncEditorPlaceholder')
    expect(editorVue).not.toContain('left-16')
    expect(editorVue).not.toContain('top-2')
    expect(editorVue).not.toContain('overflow-hidden')
    expect(editorVue).toContain('Teleport')
    expect(editorVue).toContain('vamis-monaco--fullscreen')
    expect(editorVue).toContain('hideButtons')
    expect(editorVue).toContain("intellisense.value === 'schema'")
    expect(editorVue).toContain("defineEmits<{")
    expect(editorVue).toContain("emit('change'")
    expect(editorVue).toContain('createDefaultEnv')
    expect(editorVue).toContain('EnvKey')
    const formVue = readFileSync(resolve(here, '../../vamis/src/renderers/Form.vue'), 'utf8')
    expect(formVue).toContain('schemaHidesButtons')
    expect(formVue).toContain('hideButtons === true')
    const schemaEditor = readFileSync(
      resolve(here, '../../../playground/src/components/SchemaSourceEditor.vue'),
      'utf8',
    )
    expect(schemaEditor).toContain("from 'vamis'")
    expect(schemaEditor).toContain("from '@vamis/core'")
    expect(schemaEditor).toContain('VamisRoot')
    expect(schemaEditor).toContain('hidden: true')
    expect(schemaEditor).toContain("intellisense: 'schema'")
    expect(schemaEditor).toContain('hideButtons: true')
    expect(schemaEditor).not.toContain('<textarea')
    const vamissIndex = readFileSync(resolve(here, '../../vamis/src/index.ts'), 'utf8')
    expect(vamissIndex).toContain("default as Editor")
    expect(vamissIndex).toContain('registerSchemaIntellisense')
    expect(vamissIndex).toContain('mountFormEditor')
    expect(vamissIndex).toContain('registerSchemaTypeDoc')
    expect(vamissIndex).toContain('SCHEMA_TYPE_DOCS')
    expect(diffVue).toContain('mountDiffEditor')
    expect(diffVue).not.toContain('overflow-hidden')
    expect(diffVue).not.toContain(
      'props.schema.name ? form?.getValue(props.schema.name) : props.schema.value',
    )
    expect(diffVue).toContain('seedFormValue')
    expect(diffVue).not.toContain('未加载 Monaco')
    expect(editorDoc).toMatch(/## 基本用法[\s\S]{0,400}value: \|/)
    expect(editorDoc).toContain('## 占位')
    expect(editorDoc).toContain('## 隐藏按钮区')
    expect(editorDoc).toContain('## Schema 代码感知')
    expect(editorDoc).toContain('hideButtons')
    expect(editorDoc).toContain('intellisense: schema')
    expect(editorDoc).toContain('registerSchemaIntellisense')
    expect(editorDoc).toContain('registerRenderer')
    expect(editorDoc).toContain('自述')
    expect(editorDoc).toContain('registerSchemaTypeDoc')
    expect(editorDoc).toContain('registerSchemaFieldDoc')
    expect(editorDoc).toContain('组件树')
    expect(editorDoc).toContain('@vamis/core')
    const completionsSrc = readFileSync(resolve(here, '../src/schema-completions.ts'), 'utf8')
    expect(completionsSrc).toContain('$defs')
    expect(completionsSrc).toContain('locateSchemaCursor')
    expect(completionsSrc).toContain('if: { properties: { type:')
    expect(editorDoc).toContain('### options')
    expect(editorDoc).toContain('IEditorOptions')
    expect(diffDoc).toContain('diffValue')
    expect(diffDoc).toContain('monaco')
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

  it('wires Form / FormItem / Panel xxxClassName onto child regions', () => {
    const here = dirname(fileURLToPath(import.meta.url))
    const form = readFileSync(resolve(here, '../../vamis/src/renderers/Form.vue'), 'utf8')
    const item = readFileSync(resolve(here, '../../vamis/src/renderers/FormItem.vue'), 'utf8')
    const panel = readFileSync(resolve(here, '../../vamis/src/renderers/Panel.vue'), 'utf8')
    expect(form).toContain('schema.headerClassName')
    expect(form).toContain('schema.titleClassName')
    expect(form).toContain('schema.bodyClassName')
    expect(form).toContain('schema.actionsClassName')
    expect(form).toContain("wrapWithPanel.value ? '表单' : ''")
    expect(form).toContain('schema.reset === true')
    expect(form).toContain('bg-muted')
    expect(item).toContain('schema.labelClassName')
    expect(item).toContain('schema.className')
    expect(item).toContain('schema.inputClassName')
    expect(item).toContain('schema.descriptionClassName')
    expect(panel).toContain('schema.headerClassName')
    expect(panel).toContain('schema.bodyClassName')
  })

  it('does not force space-y-3 when Container bodyClassName is set', () => {
    const here = dirname(fileURLToPath(import.meta.url))
    const container = readFileSync(resolve(here, '../../vamis/src/renderers/Container.vue'), 'utf8')
    expect(container).toContain("return extra || 'space-y-3'")
    expect(container).not.toContain('space-y-3 ${extra}')
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

describe('isInlineSchema', () => {
  it('treats tpl/html as inline unless inline: false', () => {
    expect(isInlineSchema({ type: 'tpl' })).toBe(true)
    expect(isInlineSchema({ type: 'html' })).toBe(true)
    expect(isInlineSchema({ type: 'tpl', inline: false })).toBe(false)
    expect(isInlineSchema({ type: 'each' })).toBe(false)
    expect(isInlineSchema({ type: 'each', inline: true })).toBe(true)
  })
})

describe('style docs surface', () => {
  it('exposes 样式 as a first-class playground section aligned with Amis', () => {
    const here = dirname(fileURLToPath(import.meta.url))
    const app = readFileSync(resolve(here, '../../../playground/src/App.vue'), 'utf8')
    const router = readFileSync(resolve(here, '../../../playground/src/router.ts'), 'utf8')
    const nav = readFileSync(resolve(here, '../../../website/nav.mjs'), 'utf8')
    const index = readFileSync(resolve(here, '../../../website/src/style/index.md'), 'utf8')
    expect(app).toContain('to="/style"')
    expect(app).toContain("navClass('/style')")
    expect(app).toContain('h-full')
    expect(app).not.toContain('h-screen')
    expect(router).toContain('return false')
    expect(router).not.toContain('return { top: 0 }')
    const playgroundCss = readFileSync(resolve(here, '../../../playground/src/style.css'), 'utf8')
    expect(playgroundCss).toContain('html,')
    expect(playgroundCss).toContain('#app {')
    expect(playgroundCss).toContain('overflow: hidden;')
    expect(playgroundCss).toContain('.doc-prose ol {')
    expect(playgroundCss).toContain('list-style: decimal')
    expect(playgroundCss).toContain('.doc-prose ul {')
    expect(playgroundCss).toContain('list-style: disc')
    expect(playgroundCss).toContain('list-style: circle')
    expect(playgroundCss).toContain('.doc-prose blockquote')
    expect(router).toContain("path: '/style'")
    expect(router).toContain("redirect: '/style/'")
    expect(nav).toContain("text: '快速开始'")
    expect(nav).toContain("link: '/style/layout/display'")
    expect(nav).toContain("link: '/style/spacing/margin'")
    expect(nav).toContain("link: '/style/typography/text-overflow'")
    expect(nav).toContain("text: '辅助类-响应式设计'")
    expect(index).toContain('# 快速开始')
    expect(index).toContain('实现进度 45%')
    expect(index).toContain('--primary-onHover')
    expect(index).not.toContain('主按钮')
    expect(index).toContain('className: text-green-700')
    expect(index).not.toContain('labelClassName: text-green-700')
    const theme = readFileSync(resolve(here, '../../vamis-ui/src/styles.css'), 'utf8')
    expect(theme).toContain('@custom-variant m')
    expect(theme).toContain('helpers-utility.css')
    expect(theme).toContain('helpers-palette.css')
    const util = readFileSync(resolve(here, '../../vamis-ui/src/helpers-utility.css'), 'utf8')
    expect(util).toMatch(/@layer components\s*\{/)
    expect(util).toContain('.flex { display: flex; }')
    expect(util).toContain('.m\\:text-red-500')
    expect(util).toContain('.pc\\:flex')
    expect(util).toContain('.p-4 { padding: 1rem; }')
    expect(util).toContain('.m-4 { margin: 1rem; }')
    expect(util).toContain('.pc\\:float-left { float: left; }')
    expect(util).toContain('.pc\\:float-right { float: right; }')
    expect(util).toContain('.pc\\:float-none { float: none; }')
    expect(util).toContain('.space-x-6 > :not([hidden]) ~ :not([hidden]) { margin-left: 1.5rem; }')
    expect(util).toContain('.space-x-6 > :not(:last-child)')
    expect(util).toMatch(/\.space-x-6 > :not\(:last-child\)[\s\S]*margin-inline-end: 0/)
    expect(util).not.toContain(':where(.space-x-6 > :not(:last-child))')
    const boxSizing = readFileSync(
      resolve(here, '../../../website/src/style/layout/box-sizing.md'),
      'utf8',
    )
    expect(boxSizing).toContain('实现进度 90%')
    expect(boxSizing).toContain('## 用法')
    expect(boxSizing).toContain('一共160px')
    expect(boxSizing).toContain('box-border h-32 w-32 p-4')
    expect(boxSizing).toContain('box-content h-32 w-32 p-4')
    const floats = readFileSync(resolve(here, '../../../website/src/style/layout/float.md'), 'utf8')
    expect(floats).toContain('实现进度 90%')
    expect(floats).toContain('## 左浮')
    expect(floats).toContain('## 右浮')
    expect(floats).toContain('## 不浮动')
    expect(floats).toContain('pc:float-left')
    expect(floats).toContain('pc:float-right')
    expect(floats).toContain('pc:float-none')
    expect(floats).toContain('w-32 m-4')
    expect(floats).not.toContain('靠右浮动')
    expect(theme).toContain('.vamis-html :where(*)')
    expect(theme).toContain('--tw-border-style: none')
    const palette = readFileSync(resolve(here, '../../vamis-ui/src/helpers-palette.css'), 'utf8')
    expect(palette).toContain('.text-green-700 { color: #047857; }')
    expect(palette).toContain('.bg-blue-100 { background-color: #dbeafe; }')
    expect(palette).toContain('.border-red-500 { border-color: #ef4444; }')
    expect(palette).toContain('.text-danger { color: var(--destructive); }')
    expect(palette).toContain('.text-light { color: #f8f9fa; }')
    expect(palette).toContain('.bg-dark { background-color: #343a40; }')
    expect(palette).toContain('.border-dark { border-color: #343a40; }')
    expect(palette).toContain('.hover\\:bg-pink-500:hover { background-color: #ec4899; }')
    expect(palette).toContain('.group:hover .group-hover\\:text-red-500 { color: #ef4444; }')
    expect(palette).toContain('.active\\:text-red-500.is-active')
    expect(palette).toContain('.disabled\\:bg-pink-200.is-disabled')
    expect(palette).toContain('.pc\\:hover\\:bg-pink-500:hover { background-color: #ec4899; }')
    expect(palette).toContain('.m\\:hover\\:bg-blue-500:hover { background-color: #3b82f6; }')
    expect(util).toContain('.Button {')
    expect(util).toContain('display: inline-flex')
    expect(util).toContain('.rounded-xl { border-radius: 0.75rem; }')
    expect(theme).toContain('.vamis-html :where(button)')
    expect(theme).toContain('border-style: outset')
    const state = readFileSync(resolve(here, '../../../website/src/style/state.md'), 'utf8')
    expect(state).toContain('实现进度 90%')
    expect(state).toContain('## Hover')
    expect(state).toContain('## Group-Hover')
    expect(state).toContain('## Focus')
    expect(state).toContain('## Active')
    expect(state).toContain('## Disabled')
    expect(state).toContain('结合响应式')
    expect(state).toContain('class="Button')
    expect(state).toContain('hover:bg-pink-500')
    expect(state).toContain('group-hover:text-red-500')
    expect(state).toContain('is-active')
    expect(state).toContain('pc:hover:bg-pink-500')
    expect(state).toContain('m:hover:bg-blue-500')
  })

  it('ships a markdown page for every styleNav link', () => {
    const here = dirname(fileURLToPath(import.meta.url))
    const nav = readFileSync(resolve(here, '../../../website/nav.mjs'), 'utf8')
    const links = [...nav.matchAll(/link: '(\/style[^']*)'/g)].map((row) => row[1])
    expect(links.length).toBeGreaterThan(40)
    const src = resolve(here, '../../../website/src')
    for (const link of links) {
      const rel = link.replace(/\/+$/, '') || '/style'
      const file = rel === '/style' ? `${src}/style/index.md` : `${src}${rel}.md`
      expect(readFileSync(file, 'utf8'), file).toContain('实现进度')
    }
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
