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

function transferItem(label: string) {
  return [...document.querySelectorAll('.vamis-transfer__item')].find(
    (item) => (item.textContent || '').trim() === label,
  ) || null
}

function buttonWithText(text: string) {
  return [...document.querySelectorAll('button')].find(
    (button) => (button.textContent || '').trim() === text,
  ) || null
}

function formData(scoped: ReturnType<typeof embed>, name: string) {
  const form = scoped.getComponentByName(name) as {
    getData?: () => Record<string, unknown>
  }
  return form?.getData?.() || {}
}

describe('Transfer events', () => {
  it('emits change with values and selected items before writing', async () => {
    const notify = vi.fn()
    const { scoped } = mount(
      {
        type: 'form',
        name: 'transferChangeForm',
        actions: [],
        body: {
          type: 'transfer',
          name: 'transfer',
          onEvent: {
            change: {
              actions: [
                {
                  actionType: 'toast',
                  args: {
                    msg: '${event.data.value}|${event.data.transfer}|${event.data.selectedItems[0].label}',
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
    click(transferItem('B'))

    await vi.waitFor(() => expect(notify.mock.calls.map((call) => call[1])).toContain('b|b|B'))
    await vi.waitFor(() => expect(formData(scoped, 'transferChangeForm').transfer).toBe('b'))
  })

  it('keeps the previous Transfer value when change prevents default', async () => {
    const { scoped } = mount({
      type: 'form',
      name: 'transferPreventForm',
      actions: [],
      body: {
        type: 'transfer',
        name: 'transfer',
        value: 'a',
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
    click(transferItem('B'))
    await new Promise((resolve) => setTimeout(resolve, 20))

    expect(formData(scoped, 'transferPreventForm').transfer).toBe('a')
  })

  it('emits selectAll before selecting every option', async () => {
    const notify = vi.fn()
    const { scoped } = mount(
      {
        type: 'form',
        name: 'transferSelectAllForm',
        actions: [],
        body: {
          type: 'transfer',
          name: 'transfer',
          onEvent: {
            selectAll: {
              actions: [
                {
                  actionType: 'toast',
                  args: { msg: '${event.data.items[0].label}|${event.data.items[1].label}' },
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
    click(buttonWithText('全部 >'))

    await vi.waitFor(() => expect(notify.mock.calls.map((call) => call[1])).toContain('A|B'))
    await vi.waitFor(() => expect(formData(scoped, 'transferSelectAllForm').transfer).toBe('a,b'))
  })

  it('clears the Transfer UI to an array when joinValues is false', async () => {
    const { scoped } = mount({
      type: 'form',
      name: 'transferClearArrayForm',
      actions: [],
      body: {
        type: 'transfer',
        name: 'transfer',
        joinValues: false,
        value: ['a'],
        options: [
          { label: 'A', value: 'a' },
          { label: 'B', value: 'b' },
        ],
      },
    })

    await nextTick()
    click(buttonWithText('< 清空'))
    await vi.waitFor(() => expect(formData(scoped, 'transferClearArrayForm').transfer).toEqual([]))
  })

  it('uses Amis selectTitle / resultTitle with legacy leftTitle aliases', async () => {
    const { host } = mount({
      type: 'form',
      actions: [],
      body: {
        type: 'transfer',
        name: 'transferTitles',
        selectTitle: '可选人员',
        resultTitle: '已选人员',
        leftTitle: '旧左标题',
        rightTitle: '旧右标题',
        options: [
          { label: 'A', value: 'a' },
          { label: 'B', value: 'b' },
        ],
      },
    })

    await nextTick()
    expect(host.querySelectorAll('.vamis-transfer__title')[0]?.textContent).toBe('可选人员')
    expect(host.querySelectorAll('.vamis-transfer__title')[1]?.textContent).toBe('已选人员')
  })
})

describe('Transfer scoped actions', () => {
  it('runs clear, reset and setValue against the Transfer value', async () => {
    const { scoped } = mount({
      type: 'form',
      name: 'transferActionForm',
      actions: [],
      body: {
        type: 'page',
        body: [
          {
            type: 'transfer',
            id: 'transfer-actions',
            name: 'transfer',
            value: 'a',
            options: [
              { label: 'A', value: 'a' },
              { label: 'B', value: 'b' },
              { label: 'C', value: 'c' },
            ],
          },
          {
            type: 'button',
            label: '清空值',
            onEvent: {
              click: {
                actions: [{ actionType: 'clear', componentId: 'transfer-actions' }],
              },
            },
          },
          {
            type: 'button',
            label: '重置值',
            onEvent: {
              click: {
                actions: [{ actionType: 'reset', componentId: 'transfer-actions' }],
              },
            },
          },
          {
            type: 'button',
            label: '设置 C',
            onEvent: {
              click: {
                actions: [
                  { actionType: 'setValue', componentId: 'transfer-actions', value: 'c' },
                ],
              },
            },
          },
        ],
      },
    })

    await nextTick()
    click(buttonWithText('清空值'))
    await vi.waitFor(() => expect(formData(scoped, 'transferActionForm').transfer).toBe(''))

    click(buttonWithText('重置值'))
    await vi.waitFor(() => expect(formData(scoped, 'transferActionForm').transfer).toBe('a'))

    click(buttonWithText('设置 C'))
    await vi.waitFor(() => expect(formData(scoped, 'transferActionForm').transfer).toBe('c'))
  })

  it('clears left and right searches independently', async () => {
    const { host } = mount({
      type: 'form',
      name: 'transferSearchActionForm',
      actions: [],
      body: {
        type: 'page',
        body: [
          {
            type: 'transfer',
            id: 'transfer-search-actions',
            name: 'transfer',
            searchable: true,
            options: [
              { label: 'A', value: 'a' },
              { label: 'B', value: 'b' },
            ],
          },
          {
            type: 'button',
            label: '清左',
            onEvent: {
              click: {
                actions: [
                  {
                    actionType: 'clearSearch',
                    componentId: 'transfer-search-actions',
                    args: { left: true },
                  },
                ],
              },
            },
          },
          {
            type: 'button',
            label: '清右',
            onEvent: {
              click: {
                actions: [
                  {
                    actionType: 'clearSearch',
                    componentId: 'transfer-search-actions',
                    args: { right: true },
                  },
                ],
              },
            },
          },
        ],
      },
    })

    await nextTick()
    const searches = [...host.querySelectorAll('.vamis-transfer__search')] as HTMLInputElement[]
    expect(searches).toHaveLength(2)
    for (const search of searches) {
      search.value = 'A'
      search.dispatchEvent(new Event('input', { bubbles: true }))
    }
    await nextTick()

    click(buttonWithText('清左'))
    await vi.waitFor(() => expect(searches[0].value).toBe(''))
    expect(searches[1].value).toBe('A')

    click(buttonWithText('清右'))
    await vi.waitFor(() => expect(searches[1].value).toBe(''))
  })

  it('runs selectAll as a component action', async () => {
    const { scoped } = mount({
      type: 'form',
      name: 'transferSelectActionForm',
      actions: [],
      body: {
        type: 'page',
        body: [
          {
            type: 'transfer',
            id: 'transfer-select-all',
            name: 'transfer',
            options: [
              { label: 'A', value: 'a' },
              { label: 'B', value: 'b' },
            ],
          },
          {
            type: 'button',
            label: '选择全部',
            onEvent: {
              click: {
                actions: [{ actionType: 'selectAll', componentId: 'transfer-select-all' }],
              },
            },
          },
        ],
      },
    })

    await nextTick()
    click(buttonWithText('选择全部'))
    await vi.waitFor(() => expect(formData(scoped, 'transferSelectActionForm').transfer).toBe('a,b'))
  })
})
