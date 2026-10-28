import type { PlainObject } from './types'
import { evalExpression, filterTpl, resolveValue } from './formula'

const GAP_HELPER =
  /^(m|p)(?:-(t|b|l|r|x|y))?(?:-(none|xxs|xs|sm|base|md|lg|xl|xxl))?$/
const RESPONSIVE_HELPER = /^(m|pc):(.+)$/

const CLASS_ALIASES: Record<string, string> = {
  'text-danger': 'text-destructive',
  'text-error': 'text-destructive',
  'bg-danger': 'bg-destructive',
  'border-danger': 'border-destructive',
  'm-b-none': 'mb-0',
  'm-none': 'm-0',
}

const AMIS_CSS_VAR_ALIASES: Record<string, string> = {
  '--text-color': '--foreground',
  '--text--muted-color': '--muted-foreground',
  '--text--loud-color': '--foreground',
  '--body-bg': '--background',
  '--borderColor': '--border',
  '--borderRadius': '--radius',
  '--danger': '--destructive',
  '--primary-onHover': '--primary-hover',
  '--primary-onActive': '--primary-active',
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
  '--Panel-marginBottom': '--panel-margin-bottom',
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

/** Layout containers and form shells fill the parent slot (cxd block 100%). Buttons stay content-sized. */
const LAYOUT_SLOT_TYPES = new Set([
  'page',
  'form',
  'crud',
  'crud2',
  'service',
  'grid',
  'flex',
  'hbox',
  'panel',
  'container',
  'wrapper',
  'portlet',
  'switch-container',
  'app',
  'anchor-nav',
  'wizard',
  'tabs',
  'table',
  'card',
  'cards',
  'list',
  'chart',
])

export function fillsLayoutSlot(type?: string): boolean {
  return !!type && LAYOUT_SLOT_TYPES.has(type.toLowerCase())
}

/** Amis Tpl 默认 inline（span）。block 外层会把 each 的 item 竖起来。 */
const INLINE_SCHEMA_TYPES = new Set(['tpl', 'html', 'plain'])

/** 按钮 / 徽标不占满一行，和 Amis 一样并排。className（如 m-l）打在这层盒子上。 */
const INLINE_BLOCK_SCHEMA_TYPES = new Set([
  'action',
  'button',
  'submit',
  'reset',
  'dropdown-button',
  'badge',
  'link',
  'avatar',
])

export function isInlineSchema(schema?: { type?: string; inline?: unknown } | null): boolean {
  if (!schema) return false
  if (schema.inline === false) return false
  if (schema.inline === true) return true
  return INLINE_SCHEMA_TYPES.has(String(schema.type || '').toLowerCase())
}

type SchemaDisplayNode = {
  type?: string
  inline?: unknown
  direction?: unknown
  body?: unknown
} | null

export function isInlineBlockSchema(schema?: SchemaDisplayNode): boolean {
  if (!schema) return false
  if (schema.inline === false) return false
  const type = String(schema.type || '').toLowerCase()
  if (type === 'divider' && schema.direction === 'vertical') return true
  if (schema.inline === true && type === 'tooltip-wrapper') return true
  if (type === 'spinner') {
    return schema.body == null || schema.body === false || schema.body === ''
  }
  return INLINE_BLOCK_SCHEMA_TYPES.has(type)
}

/** SchemaRenderer 外层 `div.vamis-node` 的 display class。 */
export function schemaNodeDisplayClass(schema?: SchemaDisplayNode): string {
  if (isInlineBlockSchema(schema)) return 'inline-block'
  if (isInlineSchema(schema)) return 'inline'
  return ''
}

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

/** React/Amis 对数字 style 不加单位的属性。其余长度数字补 px。 */
const UNITLESS_STYLE_PROPS = new Set([
  'animationIterationCount',
  'aspectRatio',
  'flex',
  'flexGrow',
  'flexShrink',
  'fontWeight',
  'lineHeight',
  'opacity',
  'order',
  'zIndex',
  'zoom',
  'scale',
  'rotate',
])

function cssStyleValue(key: string, value: unknown, data: PlainObject): string {
  if (typeof value === 'number') {
    if (UNITLESS_STYLE_PROPS.has(key) || value === 0) return String(value)
    return `${value}px`
  }
  return filterTpl(String(value), data)
}

export function resolveInlineStyle(
  input: unknown,
  data: PlainObject = {},
): Record<string, string> {
  if (!input) return {}
  if (typeof input === 'string') {
    const resolved = resolveValue(input, data)
    if (resolved && typeof resolved === 'object' && !Array.isArray(resolved)) {
      return resolveInlineStyle(resolved, data)
    }
    const css = resolved == null || resolved === false ? input : String(resolved)
    const out: Record<string, string> = {}
    for (const part of css.split(';')) {
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
    const text = cssStyleValue(key, value, data)
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

function isUnsafeCss(value: string): boolean {
  return /<\/|@import|expression\s*\(/i.test(value)
}

/** Amis `page.css` 对象 → CSS 文本。挂到 Page 上，卸载时一起带走。 */
export function buildCssBlock(rules: unknown): string {
  if (!rules || typeof rules !== 'object' || Array.isArray(rules)) return ''
  let css = ''
  for (const [selector, declaration] of Object.entries(rules as Record<string, unknown>)) {
    if (!selector || isUnsafeCss(selector) || !declaration || typeof declaration !== 'object' || Array.isArray(declaration)) {
      continue
    }
    let body = ''
    for (const [property, raw] of Object.entries(declaration as Record<string, unknown>)) {
      if (!property || isUnsafeCss(property)) continue
      if (typeof raw === 'string') {
        if (isUnsafeCss(raw) || raw.includes(';')) continue
        body += `  ${property}: ${raw};\n`
      } else if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
        let inner = ''
        for (const [nested, nestedVal] of Object.entries(raw as Record<string, unknown>)) {
          if (typeof nestedVal !== 'string' || isUnsafeCss(nested) || isUnsafeCss(nestedVal) || nestedVal.includes(';')) {
            continue
          }
          inner += ` ${nested}:${nestedVal};`
        }
        if (inner) body += `  ${property} {${inner}}\n`
      }
    }
    if (body) css += `\n${selector} {\n${body}}\n`
  }
  return css
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
