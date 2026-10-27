import { describe, expect, it } from 'vitest'
import { webComponentBody, webComponentProps, webComponentTag } from '../src/utils/web-component'

describe('web-component defaults', () => {
  it('defaults tag to div and leaves missing props empty', () => {
    expect(webComponentTag({})).toBe('div')
    expect(webComponentTag({ tag: 'random-number' })).toBe('random-number')
    expect(webComponentProps({})).toEqual({})
    expect(webComponentBody({})).toBeUndefined()
  })

  it('resolves string props with ${} and keeps non-strings', () => {
    expect(webComponentProps({ props: { prefix: 'hello', count: 3 } })).toEqual({
      prefix: 'hello',
      count: 3,
    })
    expect(webComponentProps({ props: { prefix: '${text}' } }, { text: 'World' })).toEqual({
      prefix: 'World',
    })
    expect(webComponentProps({ props: { prefix: '${missing}' } })).toEqual({
      prefix: '${missing}',
    })
  })

  it('passes body through for nested schema', () => {
    const body = { type: 'tpl', tpl: 'hello' }
    expect(webComponentBody({ body })).toEqual(body)
    expect(webComponentBody({ body: 'hello' })).toBe('hello')
  })
})
