import { nextTick } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { embed } from '../src/embed'
import 'vamis'

const mounts: Array<ReturnType<typeof embed>> = []

afterEach(() => {
  while (mounts.length) mounts.pop()?.unmount()
  document.body.innerHTML = ''
})

function mount(schema: unknown) {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const scoped = embed(host, schema)
  mounts.push(scoped)
  return { host, scoped }
}

describe('Transfer virtual list', () => {
  it('renders only a window of rows after the virtual threshold', async () => {
    const { host } = mount({
      type: 'form',
      actions: [],
      body: {
        type: 'transfer',
        name: 'transfer',
        virtualThreshold: 4,
        itemHeight: 38,
        options: Array.from({ length: 101 }, (_, index) => ({
          label: `Option ${index + 1}`,
          value: `value-${index + 1}`,
        })),
      },
    })

    await nextTick()
    const pane = host.querySelector('.vamis-transfer__list') as HTMLElement
    expect(pane.classList.contains('is-virtual')).toBe(true)
    expect(pane.querySelectorAll('.vamis-transfer__item').length).toBeLessThan(101)
    expect(pane.querySelector('.vamis-transfer__virtual-pad')).toBeTruthy()
  })

  it('resets the virtual window when search shrinks and restores the list', async () => {
    const { host } = mount({
      type: 'form',
      actions: [],
      body: {
        type: 'transfer',
        name: 'transfer',
        searchable: true,
        virtualThreshold: 4,
        itemHeight: 38,
        options: Array.from({ length: 101 }, (_, index) => ({
          label: `Option ${index + 1}`,
          value: `value-${index + 1}`,
        })),
      },
    })

    await nextTick()
    const pane = host.querySelector('.vamis-transfer__list') as HTMLElement
    pane.scrollTop = 1200
    pane.dispatchEvent(new Event('scroll'))
    await nextTick()
    expect(pane.textContent).toContain('Option 35')

    const search = host.querySelector('.vamis-transfer__search') as HTMLInputElement
    search.value = 'Option 100'
    search.dispatchEvent(new Event('input', { bubbles: true }))
    await nextTick()
    expect(pane.textContent).toContain('Option 100')

    search.value = ''
    search.dispatchEvent(new Event('input', { bubbles: true }))
    await nextTick()
    expect(pane.scrollTop).toBe(0)
    expect(pane.textContent).toContain('Option 1')
  })

  it('virtualizes the result pane and removes later rows from the full value', async () => {
    const options = Array.from({ length: 101 }, (_, index) => ({
      label: `Option ${index + 1}`,
      value: `value-${index + 1}`,
    }))
    const { host, scoped } = mount({
      type: 'form',
      name: 'transferVirtualForm',
      actions: [],
      body: {
        type: 'transfer',
        name: 'transfer',
        joinValues: false,
        value: options.map((item) => item.value),
        virtualThreshold: 4,
        itemHeight: 38,
        options,
      },
    })

    await nextTick()
    const panes = host.querySelectorAll('.vamis-transfer__list')
    const pane = panes[1] as HTMLElement
    expect(pane.classList.contains('is-virtual')).toBe(true)
    expect(pane.querySelectorAll('.vamis-transfer__item').length).toBeLessThan(101)

    pane.scrollTop = 1200
    pane.dispatchEvent(new Event('scroll'))
    await nextTick()
    const target = [...pane.querySelectorAll('.vamis-transfer__item')].find(
      (item) => item.textContent?.trim() === 'Option 35',
    )
    ;(target as HTMLButtonElement).click()

    const form = scoped.getComponentByName('transferVirtualForm') as {
      getData?: () => Record<string, unknown>
    }
    await new Promise((resolve) => setTimeout(resolve, 20))
    const value = form?.getData?.()?.transfer as unknown[]
    expect(value).toHaveLength(100)
    expect(value).not.toContain('value-35')
  })

  it('uses the measured list viewport with the default threshold', async () => {
    const clientHeight = vi
      .spyOn(HTMLElement.prototype, 'clientHeight', 'get')
      .mockReturnValue(64)
    try {
      const { host } = mount({
        type: 'form',
        actions: [],
        body: {
          type: 'transfer',
          name: 'transfer',
          options: Array.from({ length: 101 }, (_, index) => ({
            label: `Option ${index + 1}`,
            value: `value-${index + 1}`,
          })),
        },
      })

      await nextTick()
      await nextTick()
      const pane = host.querySelector('.vamis-transfer__list') as HTMLElement
      expect(pane.classList.contains('is-virtual')).toBe(true)
      expect(pane.querySelectorAll('.vamis-transfer__item').length).toBeLessThan(10)
    } finally {
      clientHeight.mockRestore()
    }
  })

  it('virtualizes Transfer table rows below a sticky header', async () => {
    const { host } = mount({
      type: 'form',
      actions: [],
      body: {
        type: 'transfer',
        name: 'transfer',
        mode: 'table',
        virtualThreshold: 4,
        itemHeight: 38,
        options: Array.from({ length: 101 }, (_, index) => ({
          label: `Option ${index + 1}`,
          value: `value-${index + 1}`,
        })),
      },
    })

    await nextTick()
    const pane = host.querySelector('.vamis-transfer__table-pane') as HTMLElement
    expect(pane.classList.contains('is-virtual')).toBe(true)
    expect(pane.querySelectorAll('tbody .vamis-transfer__row').length).toBeLessThan(101)
    expect(pane.querySelector('.vamis-transfer__virtual-pad')).toBeTruthy()
    expect(pane.querySelector('thead')).toBeTruthy()
  })

  it('virtualizes the Transfer tree pane', async () => {
    const { host } = mount({
      type: 'form',
      actions: [],
      body: {
        type: 'transfer',
        name: 'transfer',
        mode: 'tree',
        virtualThreshold: 4,
        itemHeight: 38,
        options: Array.from({ length: 101 }, (_, index) => ({
          label: `Node ${index + 1}`,
          value: `value-${index + 1}`,
        })),
      },
    })

    await nextTick()
    const pane = host.querySelector('.vamis-transfer__list') as HTMLElement
    expect(pane.classList.contains('is-virtual')).toBe(true)
    expect(pane.querySelectorAll('.vamis-transfer__item').length).toBeLessThan(101)
    expect(pane.querySelector('.vamis-transfer__virtual-pad')).toBeTruthy()
  })

  it('uses the Amis tree row height instead of Transfer itemHeight', async () => {
    const { host } = mount({
      type: 'form',
      actions: [],
      body: {
        type: 'transfer',
        name: 'transfer',
        mode: 'tree',
        virtualThreshold: 4,
        itemHeight: 38,
        options: Array.from({ length: 101 }, (_, index) => ({
          label: `Node ${index + 1}`,
          value: `value-${index + 1}`,
        })),
      },
    })

    await nextTick()
    const pane = host.querySelector('.vamis-transfer__list') as HTMLElement
    const item = pane.querySelector('.vamis-transfer__item') as HTMLElement
    const pads = pane.querySelectorAll('.vamis-transfer__virtual-pad')
    const bottomPad = pads[pads.length - 1] as HTMLElement

    expect(item.style.height).toBe('32px')
    expect(bottomPad.style.height).toBe('2848px')
  })
})
