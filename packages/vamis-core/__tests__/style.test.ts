import { describe, expect, it } from 'vitest'
import {
  compileIrToWidget,
  IR_API_VERSION,
  jsonToIr,
} from '../src/ir'
import {
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
})

describe('controlWidthForSize', () => {
  it('maps xs…lg onto form control width tokens', () => {
    expect(controlWidthForSize('xs')).toBe('var(--form-control-width-xs)')
    expect(controlWidthForSize('sm')).toBe('var(--form-control-width-sm)')
    expect(controlWidthForSize('md')).toBe('var(--form-control-width-md)')
    expect(controlWidthForSize('lg')).toBe('var(--form-control-width-lg)')
    expect(controlWidthForSize('full')).toBeUndefined()
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
