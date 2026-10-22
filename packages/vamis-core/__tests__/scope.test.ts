import { describe, expect, it } from 'vitest'
import { createScope, parseSearch } from '../src/scope'

describe('parseSearch', () => {
  it('reads query pairs from a search string', () => {
    expect(parseSearch('?word=myquery&n=2')).toEqual({ word: 'myquery', n: '2' })
  })

  it('returns empty object when search is missing', () => {
    expect(parseSearch('')).toEqual({})
    expect(parseSearch()).toEqual({})
  })
})

describe('Scope', () => {
  it('resolves own data and walks parent for missing keys', () => {
    const parent = createScope({ title: 'outer', shared: 'p' })
    const child = createScope({ title: 'inner' }, parent)
    expect(child.get('title')).toBe('inner')
    expect(child.get('shared')).toBe('p')
    expect(child.resolved().title).toBe('inner')
    expect(child.resolved().shared).toBe('p')
  })

  it('exposes parent snapshot as __super without copying parent into own', () => {
    const parent = createScope({ word: 'myquery' })
    const page = createScope({ title: '页面' }, parent)
    expect(page.resolved().__super).toEqual(expect.objectContaining({ word: 'myquery' }))
    expect(page.data.word).toBeUndefined()
    expect(page.get('word')).toBe('myquery')
  })

  it('set writes the current layer only and records __prev / __changeReason', () => {
    const parent = createScope({ n: 1 })
    const child = createScope({ n: 2 }, parent)
    child.set('n', 3, 'action')
    expect(child.get('n')).toBe(3)
    expect(parent.get('n')).toBe(1)
    expect(child.resolved().__prev).toEqual({ n: 2 })
    expect(child.resolved().__changeReason).toEqual({ type: 'action' })
  })

  it('merge overlays own keys; override replaces the layer', () => {
    const scope = createScope({ a: 1, b: 2 })
    scope.merge({ b: 9, c: 3 })
    expect(scope.data).toEqual({ a: 1, b: 9, c: 3 })
    scope.merge({ z: 1 }, 'override')
    expect(scope.data).toEqual({ z: 1 })
  })

  it('isolate does not look up parent', () => {
    const parent = createScope({ secret: 'nope' })
    const child = createScope({ local: 1 }, parent, { isolate: true })
    expect(child.get('secret')).toBeUndefined()
    expect(child.resolved().secret).toBeUndefined()
    expect(child.resolved().local).toBe(1)
  })
})
