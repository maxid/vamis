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

describe('InputTable radio', () => {
  it('keeps one radio selected per column across rows', async () => {
    const { host, scoped } = mount({
      type: 'page',
      body: {
        type: 'form',
        name: 'radioTableForm',
        actions: [],
        body: {
          type: 'input-table',
          name: 'rows',
          value: [
            { answer: true },
            { answer: false },
          ],
          columns: [
            {
              type: 'radio',
              name: 'answer',
              option: '标记',
            },
          ],
        },
      },
    })

    await nextTick()
    const radios = host.querySelectorAll<HTMLElement>('.vamis-radio-option')
    expect(radios).toHaveLength(2)
    radios[1].dispatchEvent(new MouseEvent('click', { bubbles: true }))

    const form = scoped.getComponentByName('radioTableForm') as {
      getData?: () => Record<string, unknown>
    }
    await vi.waitFor(() =>
      expect(form?.getData?.()?.rows).toEqual([
        { answer: false },
        { answer: true },
      ]),
    )
  })
})
