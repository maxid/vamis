import { nextTick } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { embed } from '../src/embed'
import 'vamis'

const mounts: Array<ReturnType<typeof embed>> = []

afterEach(() => {
  while (mounts.length) mounts.pop()?.unmount()
  document.body.innerHTML = ''
})

function mount(
  schema: unknown,
  env?: Parameters<typeof embed>[3],
) {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const scoped = embed(host, schema, undefined, env)
  mounts.push(scoped)
  return { host, scoped }
}

function inputNumberForm(value: unknown = 12) {
  return {
    type: 'page',
    body: {
      type: 'form',
      name: 'numberForm',
      actions: [],
      body: {
        type: 'input-number',
        name: 'number',
        label: '数字',
        value,
        unitOptions: ['px', '%', 'em'],
      },
    },
  }
}

describe('InputNumber UI', () => {
  it('uses an overlay unit menu on desktop', async () => {
    const { host } = mount(inputNumberForm())
    await nextTick()

    const unit = host.querySelector('.vamis-number__unit')
    expect(unit).toBeTruthy()
    unit?.dispatchEvent(new MouseEvent('click', { bubbles: true }))

    await vi.waitFor(() =>
      expect(document.querySelector('.vamis-number__unit-menu')).toBeTruthy(),
    )
    expect(document.querySelector('.vamis-popup')).toBeNull()
  })

  it('uses the mobile bottom popup and writes the selected unit', async () => {
    const { host, scoped } = mount(inputNumberForm(), { mobileUI: true })
    await nextTick()

    const unit = host.querySelector('.vamis-number__unit')
    expect(unit).toBeTruthy()
    unit?.dispatchEvent(new MouseEvent('click', { bubbles: true }))

    const popup = await vi.waitFor(() => {
      const next = document.querySelector('.vamis-number__unit-popup')
      expect(next).toBeTruthy()
      return next as HTMLElement
    })
    const percent = [...popup.querySelectorAll('button')].find(
      (button) => button.textContent?.trim() === '%',
    )
    expect(percent).toBeTruthy()
    percent?.dispatchEvent(new MouseEvent('click', { bubbles: true }))

    await vi.waitFor(() => {
      const form = scoped.getComponentByName('numberForm') as {
        getData?: () => Record<string, unknown>
      }
      expect(form?.getData?.()?.number).toBe('12%')
    })
  })
})
