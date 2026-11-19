import type { RendererEnv, SchemaObject } from '@vamis/core'
import type { EditorManagerConfig } from './manager'

export type { RendererEnv, SchemaCollection, SchemaObject } from '@vamis/core'

export interface EditorProps extends Omit<EditorManagerConfig, 'onChange'> {
  value?: SchemaObject
  modelValue?: SchemaObject | string
  preview?: boolean
  autoFocus?: boolean
  isMobile?: boolean
  className?: string
  $schemaUrl?: string
  schemas?: Record<string, unknown>
  theme?: string
  schemaFilter?: (schema: SchemaObject, isPreview?: boolean) => SchemaObject
  vamisEnv?: Partial<RendererEnv>
  amisEnv?: Partial<RendererEnv>
  mini?: boolean
  readonly?: boolean
}
