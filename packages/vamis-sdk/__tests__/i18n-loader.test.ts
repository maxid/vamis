// @vitest-environment node
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('classic SDK loader i18n', () => {
  it('queues locale registrations before the ESM runtime is ready', () => {
    const loader = readFileSync(new URL('../sdk-loader.js', import.meta.url), 'utf8')
    for (const method of ['registerLocale', 'extendLocale', 'removeLocaleData', 'setDefaultLocale']) {
      expect(loader).toContain(`${method}: bind('${method}')`)
    }
  })
})
