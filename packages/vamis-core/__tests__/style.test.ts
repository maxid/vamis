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
    expect(form).not.toContain('max-w-3xl')
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
