import type { PlainObject } from './types'

export type VamisEventListener = (data: PlainObject) => Promise<void> | void

type ListenerEntry = {
  listener: VamisEventListener
  weight: number
}

export interface VamisEventBus {
  on(eventName: string, listener: VamisEventListener, weight?: number): () => void
  emit(eventName: string, data?: PlainObject): Promise<void>
}

class VamisEventBusImpl implements VamisEventBus {
  private listeners = new Map<string, ListenerEntry[]>()
  private emitting = new Set<string>()

  on(eventName: string, listener: VamisEventListener, weight = 0): () => void {
    const entries = this.listeners.get(eventName) || []
    const entry = { listener, weight }
    entries.push(entry)
    entries.sort((a, b) => b.weight - a.weight)
    this.listeners.set(eventName, entries)
    return () => {
      const current = this.listeners.get(eventName)
      if (!current) return
      const next = current.filter((item) => item !== entry)
      if (next.length) this.listeners.set(eventName, next)
      else this.listeners.delete(eventName)
    }
  }

  async emit(eventName: string, data: PlainObject = {}): Promise<void> {
    if (this.emitting.has(eventName)) return
    const entries = [...(this.listeners.get(eventName) || [])]
    if (!entries.length) return
    this.emitting.add(eventName)
    try {
      for (const entry of entries) await entry.listener(data)
    } finally {
      this.emitting.delete(eventName)
    }
  }
}

export function createEventBus(): VamisEventBus {
  return new VamisEventBusImpl()
}
