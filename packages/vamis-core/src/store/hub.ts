import { defineStore } from 'pinia'
import { reactive } from 'vue'
import type { PlainObject } from '../types'

let seq = 0
export function createStoreId(prefix = 'node'): string {
  seq += 1
  return `${prefix}-${seq}`
}

export interface NodeState {
  id: string
  type: string
  parentId?: string
  name?: string
  data: PlainObject
  pristine: PlainObject
  fetching: boolean
  saving: boolean
  error?: string
  errors: Record<string, string>
  items: PlainObject[]
  page: number
  perPage: number
  total: number
  query: PlainObject
  selectedItems: PlainObject[]
  inited: boolean
}

function emptyNode(partial: Pick<NodeState, 'id' | 'type'> & Partial<NodeState>): NodeState {
  return {
    data: {},
    pristine: {},
    fetching: false,
    saving: false,
    errors: {},
    items: [],
    page: 1,
    perPage: 10,
    total: 0,
    query: {},
    selectedItems: [],
    inited: false,
    ...partial,
  }
}

/**
 * Pinia hub modeled after Amis RendererStore + MST node tree:
 * a map of per-renderer node states (form / crud / service / root).
 */
export const useRendererHub = defineStore('vamis-renderer-hub', () => {
  const nodes = reactive(new Map<string, NodeState>())

  function add(partial: Pick<NodeState, 'id' | 'type'> & Partial<NodeState>): NodeState {
    const node = reactive(emptyNode(partial)) as NodeState
    nodes.set(node.id, node)
    return node
  }

  function get(id: string): NodeState | undefined {
    return nodes.get(id)
  }

  function remove(id: string) {
    nodes.delete(id)
  }

  function parentOf(id: string): NodeState | undefined {
    const node = nodes.get(id)
    return node?.parentId ? nodes.get(node.parentId) : undefined
  }

  function mergedData(id: string): PlainObject {
    const chain: PlainObject[] = []
    let current = nodes.get(id)
    while (current) {
      chain.unshift(current.data)
      current = current.parentId ? nodes.get(current.parentId) : undefined
    }
    return Object.assign({}, ...chain)
  }

  return { nodes, add, get, remove, parentOf, mergedData }
})
