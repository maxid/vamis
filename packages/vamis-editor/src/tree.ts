import type { SchemaNode, SchemaObject } from '@vamis/core'
import { childCollections } from '@vamis/core'

export interface SchemaTreeNode {
  id: string
  type: string
  label: string
  path: string
  schema: SchemaObject
  children: SchemaTreeNode[]
}

function labelOf(schema: SchemaObject): string {
  return schema.title || schema.label || schema.name || schema.type || 'node'
}

function walk(schema: SchemaNode, path: string): SchemaTreeNode | null {
  if (schema == null) return null
  if (typeof schema === 'string') {
    return {
      id: path || 'root',
      type: 'tpl',
      label: schema.slice(0, 24),
      path,
      schema: { type: 'tpl', tpl: schema },
      children: [],
    }
  }
  const object = schema as SchemaObject
  const node: SchemaTreeNode = {
    id: path || 'root',
    type: object.type || 'object',
    label: labelOf(object),
    path,
    schema: object,
    children: [],
  }
  for (const { key, nodes } of childCollections(object)) {
    nodes.forEach((child, index) => {
      const childPath = path ? `${path}.${key}.${index}` : `${key}.${index}`
      const childNode = walk(child, childPath)
      if (childNode) node.children.push(childNode)
    })
  }
  return node
}

export function buildSchemaTree(schema: SchemaNode): SchemaTreeNode[] {
  const root = walk(schema, '')
  return root ? [root] : []
}

export function findTreeNode(nodes: SchemaTreeNode[], path: string): SchemaTreeNode | undefined {
  for (const node of nodes) {
    if (node.path === path) return node
    const child = findTreeNode(node.children, path)
    if (child) return child
  }
}
