export interface OptionItem {
  label: string
  value: unknown
  children?: OptionItem[]
  disabled?: boolean
}

export function normalizeOptions(raw: unknown): OptionItem[] {
  if (!Array.isArray(raw)) return []
  return raw.map((item) => {
    if (item == null) return { label: '', value: '' }
    if (typeof item !== 'object') return { label: String(item), value: item }
    const node = item as Record<string, unknown>
    return {
      label: String(node.label ?? node.name ?? node.value ?? ''),
      value: node.value ?? node.id ?? node.label ?? '',
      disabled: !!node.disabled,
      children: Array.isArray(node.children) ? normalizeOptions(node.children) : undefined,
    }
  })
}

export function flattenOptions(options: OptionItem[], prefix = ''): OptionItem[] {
  const out: OptionItem[] = []
  for (const item of options) {
    const label = `${prefix}${item.label}`
    if (item.children?.length) {
      out.push(...flattenOptions(item.children, `${label} / `))
    } else {
      out.push({ ...item, label })
    }
  }
  return out
}

export function optionValuesEqual(a: unknown, b: unknown): boolean {
  return String(a ?? '') === String(b ?? '')
}

export function parseJoined(value: unknown, multiple: boolean, joinValues = true, delimiter = ','): unknown[] {
  if (value == null || value === '') return []
  if (Array.isArray(value)) return value
  if (multiple && joinValues && typeof value === 'string') {
    return value.split(delimiter).map((item) => item.trim()).filter(Boolean)
  }
  return [value]
}

export function dumpJoined(values: unknown[], multiple: boolean, joinValues = true, delimiter = ','): unknown {
  if (!multiple) return values[0] ?? ''
  return joinValues ? values.map((item) => String(item)).join(delimiter) : values
}
