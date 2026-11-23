import { createApp, defineComponent, h, nextTick } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { VamisScrollbar } from '@vamis/ui'

const apps: Array<ReturnType<typeof createApp>> = []

afterEach(() => {
  while (apps.length) apps.pop()?.unmount()
  document.body.innerHTML = ''
})

function mountScrollbar(target: HTMLElement) {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const app = createApp(
    defineComponent({
      setup() {
        return () =>
          h(
            'div',
            {
              style: {
                position: 'relative',
                width: '200px',
                height: '100px',
              },
            },
            [h(VamisScrollbar, { target })],
          )
      },
    }),
  )
  app.mount(host)
  apps.push(app)
  return host
}

function setMetrics(
  target: HTMLElement,
  metrics: { clientHeight: number; scrollHeight: number; scrollTop?: number },
) {
  Object.defineProperties(target, {
    clientHeight: { configurable: true, value: metrics.clientHeight },
    scrollHeight: { configurable: true, value: metrics.scrollHeight },
    scrollTop: { configurable: true, writable: true, value: metrics.scrollTop ?? 0 },
  })
}

describe('VamisScrollbar', () => {
  it('keeps an application thumb visible whenever the target really overflows', async () => {
    const target = document.createElement('div')
    setMetrics(target, { clientHeight: 100, scrollHeight: 300, scrollTop: 50 })
    document.body.appendChild(target)

    const host = mountScrollbar(target)
    await nextTick()

    const bar = host.querySelector('[data-vamis-scrollbar]')
    const thumb = host.querySelector('[data-vamis-scrollbar-thumb]') as HTMLElement | null
    expect(bar?.classList.contains('is-visible')).toBe(true)
    expect(bar?.getAttribute('aria-hidden')).toBe('false')
    expect(bar?.getAttribute('aria-valuenow')).toBe('50')
    expect(thumb?.style.height).not.toBe('')

    target.scrollTop = 120
    target.dispatchEvent(new Event('scroll'))
    await nextTick()
    expect(bar?.getAttribute('aria-valuenow')).toBe('120')
    expect(thumb?.style.transform).not.toBe('translateY(0px)')

    setMetrics(target, { clientHeight: 100, scrollHeight: 100, scrollTop: 0 })
    target.dispatchEvent(new Event('scroll'))
    await nextTick()
    expect(bar?.classList.contains('is-visible')).toBe(false)
    expect(bar?.getAttribute('aria-hidden')).toBe('true')
  })
})
