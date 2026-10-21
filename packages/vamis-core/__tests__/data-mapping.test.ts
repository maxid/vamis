import { describe, expect, it } from 'vitest'
import { dataMapping } from '../src/utils/data-mapping'

describe('dataMapping', () => {
  it('maps template values from the data domain', () => {
    expect(dataMapping({ myName: '${name}', myEmail: '${email}' }, { name: 'Ada', email: 'a@x' })).toEqual({
      myName: 'Ada',
      myEmail: 'a@x',
    })
  })

  it('flattens current data when & is $$', () => {
    expect(dataMapping({ '&': '$$', first: '${items|first}' }, { items: [{ a: 1 }, { a: 2 }] })).toEqual({
      items: [{ a: 1 }, { a: 2 }],
      first: { a: 1 },
    })
  })

  it('converts dotted keys to nested objects by default', () => {
    expect(dataMapping({ 'a.b': '${name}' }, { name: 'x' })).toEqual({ a: { b: 'x' } })
  })

  it('keeps dotted keys when convertKeyToPath is false', () => {
    expect(dataMapping({ 'a.b': '${name}' }, { name: 'x' }, false)).toEqual({ 'a.b': 'x' })
  })

  it('omits undefined mapped values', () => {
    expect(dataMapping({ keep: '${a}', drop: '${missing}' }, { a: 1 })).toEqual({ keep: 1 })
  })
})
