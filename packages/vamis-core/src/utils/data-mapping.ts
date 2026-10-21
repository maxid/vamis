import type { PlainObject } from '../types'
import { resolveValue } from '../formula'

function isPlainObject(value: unknown): value is PlainObject {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function setPath(target: PlainObject, key: string, value: unknown, convertKeyToPath?: boolean) {
  if (convertKeyToPath === false || !/[.[\]]/.test(key)) {
    target[key] = value
    return
  }
  const parts = key.replace(/\[([^\]]+)\]/g, '.$1').split('.').filter(Boolean)
  if (!parts.length) return
  let cursor = target
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i]
    const next = cursor[part]
    if (!isPlainObject(next)) cursor[part] = {}
    cursor = cursor[part] as PlainObject
  }
  cursor[parts[parts.length - 1]] = value
}

/** Amis `dataMapping`：`api.data` / `responseData` / `&: $$` 展开。 */
export function dataMapping(
  to: unknown,
  from: PlainObject = {},
  convertKeyToPath?: boolean,
): any {
  if (Array.isArray(to)) return to.map((item) => dataMapping(item, from, convertKeyToPath))
  if (typeof to === 'string') return resolveValue(to, from)
  if (!isPlainObject(to)) return to

  const keys = Object.keys(to)
  let ret: any = {}

  const amp = keys.indexOf('&')
  const rest = amp >= 0 ? keys.filter((key) => key !== '&') : keys
  if (amp >= 0) {
    const value = to['&']
    if (value === '$$' || value === '$$$$') {
      ret = { ...from }
    } else {
      const mapped = dataMapping(value, from, convertKeyToPath)
      ret = Array.isArray(mapped) || typeof mapped === 'string' ? mapped : { ...mapped }
    }
  }

  if (!isPlainObject(ret)) return ret

  for (const key of rest) {
    const value = to[key]
    let mapped: unknown
    if (value === '$$' || value === '$$$$') mapped = from
    else if (isPlainObject(value) || Array.isArray(value)) mapped = dataMapping(value, from, convertKeyToPath)
    else if (typeof value === 'string') mapped = resolveValue(value, from)
    else mapped = value
    if (mapped === undefined) continue
    setPath(ret, key, mapped, convertKeyToPath)
  }
  return ret
}
