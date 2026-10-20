import type { SchemaNode, SchemaObject } from '@varmis/core'
import { asArray } from '@varmis/core'

export interface SchemaTreeNode {
  id: string
  type: string
  label: string
  path: string
  schema: SchemaObject
  children: SchemaTreeNode[]
}

function labelOf(schema: SchemaObject): string {
  return (
    schema.title ||
    schema.label ||
    schema.name ||
    schema.type ||
    'node'
  )
}

function walk(schema: SchemaNode, path: string, acc: SchemaTreeNode[]): SchemaTreeNode | null {
  if (schema == null) return null
  if (typeof schema === 'string') {
    const node: SchemaTreeNode = {
      id: path,
      type: 'tpl',
      label: schema.slice(0, 24),
      path,
      schema: { type: 'tpl', tpl: schema },
      children: [],
    }
    acc.push(node)
    return node
  }
  const object = schema as SchemaObject
  const node: SchemaTreeNode = {
    id: path,
    type: object.type || 'object',
    label: labelOf(object),
    path,
    schema: object,
    children: [],
  }
  const buckets: SchemaNode[] = [
    ...asArray(object.body),
    ...asArray(object.columns),
    ...asArray(object.tabs),
    ...asArray(object.items),
    ...asArray(object.actions),
    ...asArray(object.filter ? [object.filter] : []),
  ]
  buckets.forEach((child, index) => {
    const childNode = walk(child, `${path}/${index}`, acc)
    if (childNode) node.children.push(childNode)
  })
  acc.push(node)
  return node
}

export function buildSchemaTree(schema: SchemaNode): SchemaTreeNode[] {
  const flat: SchemaTreeNode[] = []
  const root = walk(schema, '0', [])
  return root ? [root] : flat
}
