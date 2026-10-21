import type { SchemaObject } from '@vamis/core'

export type CatalogKind = 'component' | 'example'

export interface CatalogLeaf {
  id: string
  label: string
  yaml: string
  searchable: string
  type?: string
  kind: CatalogKind
}

export interface CatalogGroup {
  id: string
  label: string
  children: CatalogLeaf[]
}

export type ComponentRole = 'root' | 'form' | 'item' | 'widget'

export interface ComponentDef {
  type: string
  label: string
  role?: ComponentRole
  snippet?: SchemaObject
  data?: Record<string, unknown>
  subTitle?: string
}
