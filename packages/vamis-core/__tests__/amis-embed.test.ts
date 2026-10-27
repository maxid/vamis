import { describe, expect, it } from 'vitest'
import { amisEmbedInner } from '../src/utils/amis-embed'

describe('amis embed defaults', () => {
  it('reads schema field, then value, then name in data', () => {
    expect(
      amisEmbedInner({
        schema: { type: 'tpl', tpl: 'amis render' },
      }),
    ).toEqual({ type: 'tpl', tpl: 'amis render' })
    expect(
      amisEmbedInner({
        value: { type: 'tpl', tpl: 'from value' },
      }),
    ).toEqual({ type: 'tpl', tpl: 'from value' })
    expect(
      amisEmbedInner({ name: 'amis' }, { amis: { type: 'tpl', tpl: 'from name' } }),
    ).toEqual({ type: 'tpl', tpl: 'from name' })
  })

  it('parses JSON string and overlays props as defaults that win', () => {
    expect(amisEmbedInner({ value: '{"type":"tpl","tpl":"json"}' })).toEqual({
      type: 'tpl',
      tpl: 'json',
    })
    expect(amisEmbedInner({ value: '{not json' })).toBeNull()
    expect(
      amisEmbedInner({
        props: { tpl: 'amis render' },
        value: { type: 'tpl' },
      }),
    ).toEqual({ type: 'tpl', tpl: 'amis render' })
  })

  it('name wins over schema; missing name falls through', () => {
    expect(
      amisEmbedInner(
        { name: 'amis', schema: { type: 'tpl', tpl: 'schema' } },
        { amis: { type: 'tpl', tpl: 'named' } },
      ),
    ).toEqual({ type: 'tpl', tpl: 'named' })
    expect(amisEmbedInner({ name: 'amis', schema: { type: 'tpl', tpl: 'schema' } })).toEqual({
      type: 'tpl',
      tpl: 'schema',
    })
  })
})
