import type { ActionSchema } from '../types'
import type { ActionContext } from './run'

export type ActionHandler = (action: ActionSchema, ctx: ActionContext) => Promise<void> | void

const handlers = new Map<string, ActionHandler>()

export function registerAction(type: string, handler: ActionHandler): void {
  handlers.set(type.toLowerCase(), handler)
}

export function getAction(type?: string): ActionHandler | undefined {
  if (!type) return undefined
  return handlers.get(type.toLowerCase())
}

export function unregisterAction(type: string): void {
  handlers.delete(type.toLowerCase())
}
