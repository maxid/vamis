import type { PlainObject } from './types'
import { evalExpression, filterTpl } from './formula'

const GAP_HELPER =
  /^(m|p)(?:-(t|b|l|r|x|y))?(?:-(none|xxs|xs|sm|base|md|lg|xl|xxl))?$/
const RESPONSIVE_HELPER = /^(m|pc):(.+)$/

const CLASS_ALIASES: Record<string, string> = {
  'text-danger': 'text-destructive',
  'text-error': 'text-destructive',
  'bg-danger': 'bg-destructive',
  'border-danger': 'border-destructive',
}

const AMIS_CSS_VAR_ALIASES: Record<string, string> = {
  '--text-color': '--foreground',
  '--text--muted-color': '--muted-foreground',
  '--text--loud-color': '--foreground',
  '--body-bg': '--background',
  '--borderColor': '--border',
  '--borderRadius': '--radius',
  '--danger': '--destructive',
  '--link-color': '--primary',
  '--fonts-base-family': '--font-sans',
  '--fontFamilyBase': '--font-sans',
  '--fontFamilyMonospace': '--font-mono',
  '--Form-input-height': '--control-h',
  '--Form-item-gap': '--form-item-gap',
  '--Form-input-paddingX': '--control-px',
  '--Form--horizontal-label-widthBase': '--form-label-width',
  '--Form--horizontal-label-widthXs': '--form-label-width-xs',
  '--Form--horizontal-label-widthSm': '--form-label-width-sm',
  '--Form--horizontal-label-widthMd': '--form-label-width-md',
  '--Form--horizontal-label-widthLg': '--form-label-width-lg',
  '--Form-control-widthXs': '--form-control-width-xs',
  '--Form-control-widthSm': '--form-control-width-sm',
  '--Form-control-widthBase': '--form-control-width',
  '--Form-control-widthMd': '--form-control-width-md',
  '--Form-control-widthLg': '--form-control-width-lg',
  '--TableCell-height': '--table-row-h',
  '--TableCell-height-small': '--table-row-h-sm',
  '--TableCell-height-large': '--table-row-h-lg',
  '--TableCell-paddingX': '--table-cell-px',
  '--Page-body-padding': '--page-body-padding',
}

const CONTROL_WIDTH: Record<string, string> = {
  xs: 'var(--form-control-width-xs)',
  sm: 'var(--form-control-width-sm)',
  md: 'var(--form-control-width-md)',
  lg: 'var(--form-control-width-lg)',
  full: '100%',
}

export const CONTROL_SIZE_NAMES = ['xs', 'sm', 'md', 'lg', 'full'] as const
export type ControlSizeName = (typeof CONTROL_SIZE_NAMES)[number]

export function isControlSize(size?: unknown): size is ControlSizeName {
  return typeof size === 'string' && size in CONTROL_WIDTH
}

function truthy(value: unknown): boolean {
  return value !== false && value != null && value !== 0 && value !== ''
}

function mapToken(token: string): string {
  const trimmed = token.trim()
  if (!trimmed) return ''
  const responsive = trimmed.match(RESPONSIVE_HELPER)
  if (responsive) {
    const inner = mapToken(responsive[2])
    return inner ? `${responsive[1]}:${inner}` : ''
  }
  const aliased = CLASS_ALIASES[trimmed]
  if (aliased) return aliased
  if (GAP_HELPER.test(trimmed) || trimmed === 'm' || trimmed === 'p') return trimmed
  return trimmed
}

function tokensFromString(input: string, data: PlainObject): string[] {
  const expanded = filterTpl(input, data)
  return expanded
    .split(/\s+/)
    .map(mapToken)
    .filter(Boolean)
}

export function resolveClassName(input: unknown, data: PlainObject = {}): string {
  if (input == null || input === false) return ''
  if (typeof input === 'string') return tokensFromString(input, data).join(' ')
  if (Array.isArray(input)) {
    return input
      .map((item) => resolveClassName(item, data))
      .filter(Boolean)
      .join(' ')
  }
  if (typeof input === 'object') {
    const tokens: string[] = []
    for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
      const on =
        typeof value === 'string' && (value.includes('${') || /[=<>!]/.test(value))
          ? evalExpression(value, data)
          : truthy(value)
      if (!on) continue
      tokens.push(...tokensFromString(key, data))
    }
    return tokens.join(' ')
  }
  return ''
}

function camelCssProp(prop: string): string {
  return prop.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())
}

export function resolveInlineStyle(
  input: unknown,
  data: PlainObject = {},
): Record<string, string> {
  if (!input) return {}
  if (typeof input === 'string') {
    const out: Record<string, string> = {}
    for (const part of input.split(';')) {
      const idx = part.indexOf(':')
      if (idx < 0) continue
      const prop = part.slice(0, idx).trim()
      const value = filterTpl(part.slice(idx + 1).trim(), data)
      if (prop && value) out[camelCssProp(prop)] = value
    }
    return out
  }
  if (typeof input !== 'object' || Array.isArray(input)) return {}
  const out: Record<string, string> = {}
  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    if (value == null || value === false) continue
    const text = filterTpl(String(value), data)
    if (text) out[key] = text
  }
  return out
}

export function resolveCssVars(
  cssVars?: Record<string, string> | null,
): Record<string, string> {
  if (!cssVars) return {}
  const out: Record<string, string> = {}
  for (const [key, value] of Object.entries(cssVars)) {
    if (!key || value == null) continue
    out[key] = value
    const alias = AMIS_CSS_VAR_ALIASES[key]
    if (alias && alias !== key) out[alias] = value
  }
  return out
}

export function controlWidthForSize(size?: unknown): string | undefined {
  if (typeof size !== 'string') return undefined
  return CONTROL_WIDTH[size]
}

export function mergeCssVars(
  ...layers: Array<Record<string, string> | null | undefined>
): Record<string, string> {
  const merged: Record<string, string> = {}
  for (const layer of layers) {
    if (!layer) continue
    Object.assign(merged, layer)
  }
  return resolveCssVars(merged)
}
