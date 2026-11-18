import { shallowReactive } from 'vue'

const themes = shallowReactive<Record<string, Record<string, string>>>({})

export function registerTheme(name: string, tokens: Record<string, string>): void {
  const theme = String(name || '').trim()
  if (!theme || !tokens || typeof tokens !== 'object') return
  const normalized: Record<string, string> = {}
  for (const [key, value] of Object.entries(tokens)) {
    if (key.startsWith('--') && typeof value === 'string') normalized[key] = value
  }
  themes[theme] = normalized
}

export function themeTokens(name?: string): Record<string, string> {
  return name && themes[name] ? { ...themes[name] } : {}
}
