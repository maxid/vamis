import { describe, expect, it } from 'vitest'
import { deletePathValue, getPathValue, keyToPath, setPathValue } from '../src/utils/path-value'

describe('keyToPath', () => {
  it('splits a.b and a.b[0].c', () => {
    expect(keyToPath('person.name')).toEqual(['person', 'name'])
    expect(keyToPath('a.b[0].c')).toEqual(['a', 'b', '0', 'c'])
  })
})

describe('getPathValue / setPathValue / deletePathValue', () => {
  it('reads nested person.name and prefers a literal key', () => {
    expect(getPathValue({ person: { name: 'Ada' } }, 'person.name')).toBe('Ada')
    expect(getPathValue({ 'person.name': 'flat' }, 'person.name')).toBe('flat')
    expect(getPathValue({ a: { b: [{ c: 3 }] } }, 'a.b[0].c')).toBe(3)
  })

  it('writes nested paths without flattening the key', () => {
    const data: Record<string, unknown> = {}
    setPathValue(data, 'person.name', 'Ada')
    expect(data).toEqual({ person: { name: 'Ada' } })
    setPathValue(data, 'a.b[0].c', 1)
    expect(data.a).toEqual({ b: [{ c: 1 }] })
  })

  it('deletes a nested field and a literal key', () => {
    const nested = { person: { name: 'Ada', age: 1 } }
    deletePathValue(nested, 'person.name')
    expect(nested).toEqual({ person: { age: 1 } })
    const flat = { 'person.name': 'x', keep: 1 }
    deletePathValue(flat, 'person.name')
    expect(flat).toEqual({ keep: 1 })
  })
})
