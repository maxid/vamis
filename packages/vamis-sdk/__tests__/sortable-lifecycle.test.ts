import { createApp, defineComponent, h, ref } from 'vue'
import Sortable from 'sortablejs'
import { afterEach, describe, expect, it, vi } from 'vitest'
import cardsSource from '../../vamis/src/renderers/Cards.vue?raw'
import tabsSource from '../../vamis/src/renderers/Tabs.vue?raw'
import transferSource from '../../vamis/src/renderers/form/Transfer.vue?raw'
import {
  consumeSortableDrag,
  useSortableDrag,
} from '../../vamis/src/renderers/useSortable'

const roots: HTMLElement[] = []

afterEach(() => {
  for (const root of roots.splice(0)) root.remove()
})

describe('shared Sortable lifecycle', () => {
  it('restores the DOM mutation before the reactive list reorders it', () => {
    const list = document.createElement('ul')
    list.innerHTML = '<li id="a">A</li><li id="b">B</li><li id="c">C</li>'
    const item = list.children[2] as HTMLElement
    list.insertBefore(item, list.children[0])

    const moved = consumeSortableDrag({
      item,
      to: list,
      oldIndex: 2,
      newIndex: 0,
    })

    expect(moved).toEqual({ from: 2, to: 0 })
    expect([...list.children].map((node) => node.id)).toEqual(['a', 'b', 'c'])
  })

  it('keeps virtual-list padding outside the reordered result rows', () => {
    const list = document.createElement('ul')
    list.innerHTML =
      '<li id="lead" aria-hidden="true"></li><li id="a">A</li><li id="b">B</li><li id="c">C</li><li id="trail" aria-hidden="true"></li>'
    const item = list.children[3] as HTMLElement
    list.insertBefore(item, list.children[1])

    expect(
      consumeSortableDrag({
        item,
        to: list,
        oldIndex: 3,
        newIndex: 1,
      }),
    ).toEqual({ from: 3, to: 1 })
    expect([...list.children].map((node) => node.id)).toEqual([
      'lead',
      'a',
      'b',
      'c',
      'trail',
    ])
  })

  it('destroys its Sortable instance with the component scope', async () => {
    const root = document.createElement('div')
    roots.push(root)
    let list: HTMLElement | null = null

    const Host = defineComponent({
      setup() {
        const target = ref<HTMLElement | null>(null)
        useSortableDrag({
          target: () => target.value,
          enabled: () => true,
          deps: () => [],
          options: () => ({
            animation: 150,
            draggable: 'li',
          }),
        })
        return () =>
          h(
            'ul',
            {
              ref: (value: unknown) => {
                target.value = value as HTMLElement | null
                list = target.value
              },
            },
            [h('li', { id: 'a' }, 'A'), h('li', { id: 'b' }, 'B')],
          )
      },
    })

    const app = createApp(Host)
    app.mount(root)
    await vi.waitFor(() => expect(Sortable.get(list as HTMLElement)).toBeTruthy())
    const sortable = Sortable.get(list as HTMLElement)
    const destroy = vi.spyOn(sortable, 'destroy')

    app.unmount()
    expect(destroy).toHaveBeenCalledTimes(1)
  })

  it('keeps renderer components on the shared Sortable contract', () => {
    const contracts = [
      {
        source: cardsSource,
        expected: [
          'animation: 150',
          "handle: '.vamis-card-drag'",
          "ghostClass: 'is-dragging'",
        ],
      },
      {
        source: tabsSource,
        expected: [
          'animation: 250',
          "ghostClass: 'vamis-tabs__link--dragging'",
        ],
      },
      {
        source: transferSource,
        expected: [
          'animation: 150',
          "handle: '.vamis-transfer__dragbar'",
          "ghostClass: 'vamis-transfer__result-row--dragging'",
        ],
      },
    ]
    for (const { source, expected } of contracts) {
      expect(source).not.toMatch(/from ['"]sortablejs['"]/)
      expect(source).toContain('useSortableDrag')
      expect(source).toContain('consumeSortableDrag')
      for (const token of expected) expect(source).toContain(token)
    }
  })
})
