import { describe, expect, it } from 'vitest'
import {
  cloneSchema,
  getNodeAt,
  insertSnippet,
  moveAt,
  patchAt,
  removeAt,
} from '../src/schema-path'
import type { SchemaObject } from '../src/types'

function page(): SchemaObject {
  return {
    type: 'page',
    title: 'P',
    body: [
      { type: 'form', name: 'f', body: [{ type: 'input-text', name: 'a', label: 'A' }] },
      { type: 'tpl', tpl: 'x' },
    ],
  }
}

describe('schema-path mutations', () => {
  it('inserts into a container body', () => {
    const root = page()
    const path = insertSnippet(root, 'body.0', { type: 'switch', name: 'vip', label: 'VIP' })
    expect(path).toBe('body.0.body.1')
    expect(getNodeAt(root, path).name).toBe('vip')
  })

  it('inserts after a leaf', () => {
    const root = page()
    const path = insertSnippet(root, 'body.1', { type: 'alert', title: 'hi' })
    expect(path).toBe('body.2')
    expect((root.body as SchemaObject[])[2].type).toBe('alert')
  })

  it('moves and removes siblings', () => {
    const root = page()
    expect(moveAt(root, 'body.1', -1)).toBe('body.0')
    expect(getNodeAt(root, 'body.0').type).toBe('tpl')
    expect(removeAt(root, 'body.0')).toBe('body.0')
    expect((root.body as SchemaObject[]).length).toBe(1)
  })

  it('patches without losing siblings', () => {
    const root = cloneSchema(page())
    patchAt(root, 'body.0.body.0', { label: '名称', required: true })
    expect(getNodeAt(root, 'body.0.body.0').label).toBe('名称')
    expect(getNodeAt(root, 'body.0.body.0').name).toBe('a')
  })
})
