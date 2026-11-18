export interface EventDebounceConfig {
  maxWait?: number
  wait?: number
  leading?: boolean
  trailing?: boolean
}

export function createEventDebounce(config: EventDebounceConfig) {
  const wait = config.wait ?? 100
  const leading = config.leading ?? false
  const trailing = config.trailing ?? true
  const maxWait = config.maxWait ?? 10000
  let timer: ReturnType<typeof setTimeout> | undefined
  let maxTimer: ReturnType<typeof setTimeout> | undefined
  let active = false
  let calls = 0
  let latest: () => Promise<void> = async () => {}

  function clear() {
    if (timer) clearTimeout(timer)
    if (maxTimer) clearTimeout(maxTimer)
    timer = undefined
    maxTimer = undefined
    active = false
    calls = 0
  }

  async function fire() {
    const callback = latest
    const shouldCall = trailing && (!leading || calls > 1)
    clear()
    if (shouldCall) await callback()
  }

  return {
    async run(callback: () => Promise<void>) {
      latest = callback
      const leadNow = leading && !active
      if (!active && maxWait > 0) maxTimer = setTimeout(() => void fire(), maxWait)
      active = true
      calls += 1
      if (timer) clearTimeout(timer)
      if (leadNow) await callback()
      if (trailing) timer = setTimeout(() => void fire(), wait)
      else timer = setTimeout(() => clear(), wait)
    },
    cancel: clear,
  }
}
