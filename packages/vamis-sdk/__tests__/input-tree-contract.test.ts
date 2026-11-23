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

function click(element: Element | null) {
  if (!(element instanceof HTMLElement)) throw new Error('element not found')
  element.click()
}

function treeItem(label: string) {
  return [...document.querySelectorAll('.vamis-tree__item')].find(
    (item) => (item.querySelector('.vamis-tree__text')?.textContent || '').trim() === label,
  ) || null
}

function buttonWithText(text: string) {
  return [...document.querySelectorAll('button')].find(
    (button) => (button.textContent || '').trim() === text,
  ) || null
}

function treeTexts() {
  return [...document.querySelectorAll('.vamis-tree__text')].map(
    (item) => (item.textContent || '').trim(),
  )
}

describe('InputTree change event', () => {
  it('emits change with value, item, selectedItems and name before writing', async () => {
    const notify = vi.fn()
    const { scoped } = mount(
      {
        type: 'form',
        name: 'inputTreeChangeForm',
        actions: [],
        body: {
          type: 'input-tree',
          name: 'tree',
          onEvent: {
            change: {
              actions: [
                {
                  actionType: 'toast',
                  args: {
                    msg: '${event.data.item.label}|${event.data.selectedItems[0].label}|${event.data.tree}',
                  },
                },
              ],
            },
          },
          options: [
            { label: 'A', value: 'a' },
            { label: 'B', value: 'b' },
          ],
        },
      },
      { notify },
    )

    await nextTick()
    click(treeItem('B')?.querySelector('.vamis-tree__content') || null)

    await vi.waitFor(() => expect(notify.mock.calls.map((call) => call[1])).toContain('B|B|b'))
    const form = scoped.getComponentByName('inputTreeChangeForm') as {
      getData?: () => Record<string, unknown>
    }
    await vi.waitFor(() => expect(form?.getData?.()?.tree).toBe('b'))
  })

  it('does not write the value when change prevents default', async () => {
    const { scoped } = mount({
      type: 'form',
      name: 'inputTreePreventForm',
      actions: [],
      body: {
        type: 'input-tree',
        name: 'tree',
        onEvent: {
          change: {
            actions: [{ actionType: 'preventDefault' }],
          },
        },
        options: [
          { label: 'A', value: 'a' },
          { label: 'B', value: 'b' },
        ],
      },
    })

    await nextTick()
    const item = treeItem('B')
    click(item?.querySelector('.vamis-tree__content') || null)
    await new Promise((resolve) => setTimeout(resolve, 20))

    const form = scoped.getComponentByName('inputTreePreventForm') as {
      getData?: () => Record<string, unknown>
    }
    expect(form?.getData?.()?.tree).toBeUndefined()
    expect(
      item?.querySelector('.vamis-tree__content')?.classList.contains('is-checked'),
    ).toBe(false)
  })
})

describe('InputTree scoped actions', () => {
  it('runs setValue, clear and reset actions', async () => {
    const { scoped } = mount({
      type: 'form',
      name: 'inputTreeActionForm',
      actions: [],
      body: [
        {
          type: 'input-tree',
          id: 'action-tree',
          name: 'tree',
          value: 'a',
          options: [
            { label: 'A', value: 'a' },
            { label: 'B', value: 'b' },
          ],
        },
        {
          type: 'button',
          label: '设为 B',
          onEvent: {
            click: {
              actions: [
                {
                  actionType: 'setValue',
                  componentId: 'action-tree',
                  args: { value: 'b' },
                },
              ],
            },
          },
        },
        {
          type: 'button',
          label: '清空',
          onEvent: {
            click: {
              actions: [{ actionType: 'clear', componentId: 'action-tree' }],
            },
          },
        },
        {
          type: 'button',
          label: '重置',
          onEvent: {
            click: {
              actions: [{ actionType: 'reset', componentId: 'action-tree' }],
            },
          },
        },
      ],
    })

    await nextTick()
    const form = scoped.getComponentByName('inputTreeActionForm') as {
      getData?: () => Record<string, unknown>
    }
    click(buttonWithText('设为 B'))
    await vi.waitFor(() => expect(form?.getData?.()?.tree).toBe('b'))
    click(buttonWithText('清空'))
    await vi.waitFor(() => expect(form?.getData?.()?.tree).toBe(''))
    click(buttonWithText('重置'))
    await vi.waitFor(() => expect(form?.getData?.()?.tree).toBe('a'))
  })

  it('expands to a level and collapses through scoped actions', async () => {
    mount({
      type: 'form',
      actions: [],
      body: [
        {
          type: 'input-tree',
          id: 'level-tree',
          name: 'tree',
          initiallyOpen: false,
          unfoldedLevel: 1,
          options: [
            {
              label: 'Root',
              value: 'root',
              children: [{ label: 'Child', value: 'child' }],
            },
          ],
        },
        {
          type: 'button',
          label: '展开',
          onEvent: {
            click: {
              actions: [
                {
                  actionType: 'expand',
                  componentId: 'level-tree',
                  args: { openLevel: 2 },
                },
              ],
            },
          },
        },
        {
          type: 'button',
          label: '收起',
          onEvent: {
            click: {
              actions: [{ actionType: 'collapse', componentId: 'level-tree' }],
            },
          },
        },
      ],
    })

    await nextTick()
    const rootArrow = () =>
      treeItem('Root')?.querySelector('.vamis-tree__arrow-icon')
    expect(rootArrow()?.classList.contains('is-folded')).toBe(true)
    click(buttonWithText('展开'))
    await vi.waitFor(() => expect(rootArrow()?.classList.contains('is-folded')).toBe(false))
    click(buttonWithText('收起'))
    await vi.waitFor(() => expect(rootArrow()?.classList.contains('is-folded')).toBe(true))
  })

  it('runs search and reload scoped actions', async () => {
    let sourceLoads = 0
    const fetcher = vi.fn(async () => {
      sourceLoads += 1
      return {
        status: 0,
        msg: '',
        data: {
          options: [
            { label: 'A', value: 'a' },
            { label: 'B', value: 'b' },
          ],
        },
      }
    })
    mount(
      {
        type: 'form',
        actions: [],
        body: [
          {
            type: 'input-tree',
            id: 'search-tree',
            name: 'tree',
            source: '/api/tree-options',
          },
          {
            type: 'button',
            label: '检索 B',
            onEvent: {
              click: {
                actions: [
                  {
                    actionType: 'search',
                    componentId: 'search-tree',
                    args: { keyword: 'B' },
                  },
                ],
              },
            },
          },
          {
            type: 'button',
            label: '刷新',
            onEvent: {
              click: {
                actions: [{ actionType: 'reload', componentId: 'search-tree' }],
              },
            },
          },
        ],
      },
      { fetcher },
    )

    await vi.waitFor(() => expect(sourceLoads).toBe(1))
    click(buttonWithText('检索 B'))
    await vi.waitFor(() => expect(treeTexts()).toEqual(['B']))
    click(buttonWithText('刷新'))
    await vi.waitFor(() => expect(sourceLoads).toBe(2))
  })

  it('runs add, edit and delete component actions', async () => {
    const confirm = vi.fn(async () => true)
    mount(
      {
        type: 'page',
        body: {
          type: 'form',
          actions: [],
          body: [
            {
              type: 'input-tree',
              id: 'cud-input-tree',
              name: 'tree',
              options: [
                {
                  label: 'A',
                  value: 'a',
                  children: [{ label: 'B', value: 'b' }],
                },
              ],
            },
            {
              type: 'button',
              label: '新增 C',
              onEvent: {
                click: {
                  actions: [
                    {
                      actionType: 'add',
                      componentId: 'cud-input-tree',
                      args: {
                        parentValue: 'a',
                        item: { label: 'C', value: 'c' },
                      },
                    },
                  ],
                },
              },
            },
            {
              type: 'button',
              label: '编辑 CC',
              onEvent: {
                click: {
                  actions: [
                    {
                      actionType: 'edit',
                      componentId: 'cud-input-tree',
                      args: {
                        originValue: 'c',
                        item: { label: 'CC', value: 'c' },
                      },
                    },
                  ],
                },
              },
            },
            {
              type: 'button',
              label: '删除 CC',
              onEvent: {
                click: {
                  actions: [
                    {
                      actionType: 'delete',
                      componentId: 'cud-input-tree',
                      args: { value: 'c' },
                    },
                  ],
                },
              },
            },
          ],
        },
      },
      { confirm },
    )

    await nextTick()
    click(buttonWithText('新增 C'))
    await vi.waitFor(() => expect(treeTexts()).toContain('C'))
    click(buttonWithText('编辑 CC'))
    await vi.waitFor(() => expect(treeTexts()).toContain('CC'))
    click(buttonWithText('删除 CC'))
    await vi.waitFor(() => expect(treeTexts()).not.toContain('CC'))
  })
})

describe('InputTree layout classes', () => {
  it('applies tree container and tree classes plus heightAuto', async () => {
    const { host } = mount({
      type: 'form',
      actions: [],
      body: {
        type: 'input-tree',
        name: 'tree',
        treeContainerClassName: 'custom-tree-container',
        treeClassName: 'custom-tree',
        heightAuto: true,
        options: [{ label: 'A', value: 'a' }],
      },
    })

    await nextTick()
    const control = host.querySelector('.vamis-input-tree__control') as HTMLElement
    const tree = control.querySelector('.vamis-tree') as HTMLElement
    expect(control.classList.contains('custom-tree-container')).toBe(true)
    expect(control.classList.contains('is-height-auto')).toBe(true)
    expect(tree.classList.contains('custom-tree')).toBe(true)
  })

  it('highlights highlightTxt even when search is not active', async () => {
    const { host } = mount({
      type: 'form',
      data: { keyword: 'B' },
      actions: [],
      body: {
        type: 'input-tree',
        name: 'tree',
        highlightTxt: '${keyword}',
        options: [
          { label: 'A', value: 'a' },
          { label: 'B', value: 'b' },
        ],
      },
    })

    await nextTick()
    const matched = host.querySelector('.vamis-tree__text .is-matched')
    expect(matched?.textContent).toBe('B')
  })
})

describe('InputTree option expansion fields', () => {
  it('honors collapsed and unfolded fields before default expansion', async () => {
    mount({
      type: 'form',
      actions: [],
      body: {
        type: 'input-tree',
        name: 'tree',
        options: [
          {
            label: 'Collapsed',
            value: 'collapsed',
            collapsed: true,
            children: [{ label: 'Hidden child', value: 'hidden' }],
          },
          {
            label: 'Unfolded false',
            value: 'unfolded-false',
            unfolded: false,
            children: [{ label: 'Hidden child 2', value: 'hidden-2' }],
          },
        ],
      },
    })

    await nextTick()
    expect(treeTexts()).toContain('Collapsed')
    expect(treeTexts()).toContain('Unfolded false')
    expect(treeTexts()).not.toContain('Hidden child')
    expect(treeTexts()).not.toContain('Hidden child 2')
  })
})

describe('InputTree delete value sync', () => {
  it('emits change when deleting a selected node', async () => {
    const notify = vi.fn()
    const confirm = vi.fn(async () => true)
    const { scoped } = mount(
      {
        type: 'form',
        name: 'inputTreeDeleteForm',
        actions: [],
        body: {
          type: 'input-tree',
          name: 'tree',
          multiple: true,
          value: 'a',
          removable: true,
          deleteConfirmText: false,
          onEvent: {
            change: {
              actions: [
                { actionType: 'toast', args: { msg: 'value:${event.data.tree}' } },
              ],
            },
          },
          options: [
            { label: 'A', value: 'a' },
            { label: 'B', value: 'b' },
          ],
        },
      },
      { confirm, notify },
    )

    await nextTick()
    click(treeItem('A')?.querySelector('[aria-label="移除该节点"]') || null)

    await vi.waitFor(() => expect(notify.mock.calls.map((call) => call[1])).toContain('value:'))
    const form = scoped.getComponentByName('inputTreeDeleteForm') as {
      getData?: () => Record<string, unknown>
    }
    await vi.waitFor(() => expect(form?.getData?.()?.tree).toBe(''))
  })
})
