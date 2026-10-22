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

  it('extracts fields from an array when the only key starts with $', () => {
    expect(
      dataMapping(
        {
          items: {
            $table: {
              a: '${a}',
              c: '${c}',
            },
          },
        },
        {
          table: [
            { a: 'a1', b: 'b1', c: 'c1' },
            { a: 'a2', b: 'b2', c: 'c2' },
          ],
        },
      ),
    ).toEqual({
      items: [
        { a: 'a1', c: 'c1' },
        { a: 'a2', c: 'c2' },
      ],
    })
  })

  it('spreads a nested object when & is a template', () => {
    expect(
      dataMapping(
        { name: '${name}', '&': '${c}' },
        { name: 'Ada', c: { e: '3', f: '4' } },
      ),
    ).toEqual({ name: 'Ada', e: '3', f: '4' })
  })
})
