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

function buttonWithText(text: string, root: ParentNode = document) {
  return [...root.querySelectorAll('button')].find(
    (button) => (button.textContent || '').trim() === text,
  ) || null
}

function menuLabels() {
  return [...document.querySelectorAll('.vamis-select__item-label')].map(
    (element) => (element.textContent || '').trim(),
  )
}

function optionItem(label: string) {
  return [...document.querySelectorAll('.vamis-select__item')].find(
    (item) => (item.querySelector('.vamis-select__item-label')?.textContent || '').trim() === label,
  ) || null
}

function settle() {
  return new Promise((resolve) => setTimeout(resolve, 20))
}

function treeTexts() {
  return [...document.querySelectorAll('.vamis-tree__text')].map(
    (element) => (element.textContent || '').trim(),
  )
}

function treeItem(label: string) {
  return [...document.querySelectorAll('.vamis-tree__item')].find(
    (item) => (item.querySelector('.vamis-tree__text')?.textContent || '').trim() === label,
  ) || null
}

describe('Select option mutation events', () => {
  it('shows Select trigger and control Spinner while source loads', async () => {
    let resolveFetch!: (value: unknown) => void
    const fetcher = vi.fn(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve
        }),
    )
    const { host } = mount(
      {
        type: 'form',
        actions: [],
        body: {
          type: 'select',
          name: 'choice',
          label: '选项',
          source: '/api/options',
        },
      },
      { fetcher },
    )

    await vi.waitFor(() => expect(fetcher).toHaveBeenCalled())
    await vi.waitFor(() => {
      const trigger = host.querySelector('.vamis-select__input .vamis-spinner')
      expect(trigger).toBeTruthy()
      expect(trigger?.querySelector('.vamis-spinner__icon--sm')).toBeTruthy()
      expect(trigger?.querySelector('svg')).toBeTruthy()
      expect(host.querySelector('.vamis-select > .vamis-spinner--overlay')).toBeNull()
    })

    resolveFetch({
      status: 0,
      msg: '',
      data: { options: [{ label: 'A', value: 'a' }] },
    })
    await vi.waitFor(() => {
      expect(host.querySelector('.vamis-select__input .vamis-spinner')).toBeNull()
      expect(host.querySelector('.vamis-select > .vamis-spinner--overlay')).toBeNull()
    })
  })

  it('shows Select control Spinner only for explicit loading', async () => {
    const { host } = mount({
      type: 'form',
      actions: [],
      body: {
        type: 'select',
        name: 'choice',
        label: '选项',
        loading: true,
        options: [
          { label: 'A', value: 'a' },
          { label: 'B', value: 'b' },
        ],
      },
    })

    await nextTick()
    await nextTick()
    expect(host.querySelector('.vamis-select__input .vamis-spinner--overlay')).toBeNull()
    expect(host.querySelector('.vamis-select > .vamis-spinner--overlay')).toBeTruthy()
  })

  it('opens an add dialog and emits addConfirm payload', async () => {
    const notify = vi.fn()
    const { host } = mount({
      type: 'form',
      actions: [],
      body: {
        type: 'select',
        name: 'choice',
        label: '选项',
        creatable: true,
        onEvent: {
          addConfirm: {
            actions: [{ actionType: 'toast', args: { msg: '${event.data.item|json}' } }],
          },
        },
        options: [
          { label: 'A', value: 'a' },
          { label: 'B', value: 'b' },
        ],
      },
    }, { notify })

    await nextTick()
    click(host.querySelector('.vamis-select__input'))
    await nextTick()
    click(buttonWithText('新增选项'))

    await vi.waitFor(() => {
      expect(document.querySelector('[data-slot="dialog-content"]')).toBeTruthy()
    })
    expect(document.querySelector('[data-slot="dialog-content"]')?.textContent).toContain('新增选项')
    const input = document.querySelector('[data-slot="dialog-content"] input') as HTMLInputElement
    input.value = 'Demo'
    input.dispatchEvent(new Event('input', { bubbles: true }))
    await nextTick()
    click(buttonWithText('确认', document.querySelector('[data-slot="dialog-content"]') || document))

    await vi.waitFor(() => expect(notify).toHaveBeenCalled())
    expect(JSON.parse(notify.mock.calls.at(-1)?.[1] as string)).toEqual({
      label: 'Demo',
      value: 'Demo',
    })
  })

  it('does not add or call addApi when addConfirm prevents default', async () => {
    const fetcher = vi.fn(async () => ({
      status: 0,
      msg: '',
      data: {},
    }))
    const { host } = mount({
      type: 'form',
      actions: [],
      body: {
        type: 'select',
        name: 'choice',
        label: '选项',
        value: 'a',
        creatable: true,
        addApi: '/api/add',
        onEvent: {
          addConfirm: {
            actions: [{ actionType: 'preventDefault' }],
          },
        },
        options: [
          { label: 'A', value: 'a' },
          { label: 'B', value: 'b' },
        ],
      },
    }, { fetcher })

    await nextTick()
    click(host.querySelector('.vamis-select__input'))
    await nextTick()
    click(buttonWithText('新增选项'))

    await vi.waitFor(() => {
      expect(document.querySelector('[data-slot="dialog-content"]')).toBeTruthy()
    })
    const input = document.querySelector('[data-slot="dialog-content"] input') as HTMLInputElement
    input.value = 'C'
    input.dispatchEvent(new Event('input', { bubbles: true }))
    await nextTick()
    click(buttonWithText('确认', document.querySelector('[data-slot="dialog-content"]') || document))

    await vi.waitFor(() => {
      expect(fetcher).not.toHaveBeenCalled()
      expect(menuLabels()).not.toContain('C')
      expect((host.querySelector('.vamis-select__single') as HTMLElement | null)?.textContent?.trim()).toBe('A')
    })
  })

  it('does not edit or call editApi when editConfirm prevents default', async () => {
    const fetcher = vi.fn(async () => ({
      status: 0,
      msg: '',
      data: {},
    }))
    const { host } = mount({
      type: 'form',
      actions: [],
      body: {
        type: 'select',
        name: 'choice',
        label: '选项',
        value: 'a',
        editable: true,
        editApi: '/api/edit',
        onEvent: {
          editConfirm: {
            actions: [{ actionType: 'preventDefault' }],
          },
        },
        options: [
          { label: 'A', value: 'a' },
          { label: 'B', value: 'b' },
        ],
      },
    }, { fetcher })

    await nextTick()
    click(host.querySelector('.vamis-select__input'))
    await nextTick()
    const item = optionItem('A')
    click(item?.querySelector('[aria-label="编辑"]') || null)

    await vi.waitFor(() => {
      expect(document.querySelector('[data-slot="dialog-content"]')).toBeTruthy()
    })
    const input = document.querySelector('[data-slot="dialog-content"] input') as HTMLInputElement
    input.value = 'AA'
    input.dispatchEvent(new Event('input', { bubbles: true }))
    await nextTick()
    const dialog = document.querySelector('[data-slot="dialog-content"]')
    click(buttonWithText('确认', dialog || document))

    await vi.waitFor(() => {
      expect(document.querySelector('[data-slot="dialog-content"]')).toBeNull()
    })
    await settle()
    expect(fetcher).not.toHaveBeenCalled()
    click(host.querySelector('.vamis-select__input'))
    await nextTick()
    expect(menuLabels()).toContain('A')
    expect(menuLabels()).not.toContain('AA')
  })

  it('does not delete or call deleteApi when deleteConfirm prevents default', async () => {
    const fetcher = vi.fn(async () => ({
      status: 0,
      msg: '',
      data: {},
    }))
    const confirm = vi.fn(async () => true)
    const { host } = mount({
      type: 'form',
      actions: [],
      body: {
        type: 'select',
        name: 'choice',
        label: '选项',
        value: 'a',
        removable: true,
        deleteApi: '/api/delete',
        deleteConfirmText: '确认删除？',
        onEvent: {
          deleteConfirm: {
            actions: [{ actionType: 'preventDefault' }],
          },
        },
        options: [
          { label: 'A', value: 'a' },
          { label: 'B', value: 'b' },
        ],
      },
    }, { fetcher, confirm })

    await nextTick()
    click(host.querySelector('.vamis-select__input'))
    await nextTick()
    const item = optionItem('A')
    click(item?.querySelector('[aria-label="删除"]') || null)

    await vi.waitFor(() => {
      expect(confirm).toHaveBeenCalledWith('确认删除？')
      expect(document.querySelector('.vamis-select__popover')).toBeNull()
    })
    await settle()
    expect(fetcher).not.toHaveBeenCalled()
    click(host.querySelector('.vamis-select__input'))
    await nextTick()
    expect(menuLabels()).toContain('A')
  })

  it('passes only the edited label and value to editConfirm', async () => {
    const notify = vi.fn()
    const { host } = mount({
      type: 'form',
      actions: [],
      body: {
        type: 'select',
        name: 'choice',
        label: '选项',
        value: 'a',
        editable: true,
        onEvent: {
          editConfirm: {
            actions: [{ actionType: 'toast', args: { msg: '${event.data.item|json}' } }],
          },
        },
        options: [
          { label: 'A', value: 'a', meta: 'origin-only' },
          { label: 'B', value: 'b' },
        ],
      },
    }, { notify })

    await nextTick()
    click(host.querySelector('.vamis-select__input'))
    await nextTick()
    click(optionItem('A')?.querySelector('[aria-label="编辑"]') || null)

    await vi.waitFor(() => {
      expect(document.querySelector('[data-slot="dialog-content"]')).toBeTruthy()
    })
    const input = document.querySelector('[data-slot="dialog-content"] input') as HTMLInputElement
    input.value = 'AA'
    input.dispatchEvent(new Event('input', { bubbles: true }))
    await nextTick()
    click(buttonWithText('确认', document.querySelector('[data-slot="dialog-content"]') || document))

    await vi.waitFor(() => expect(notify).toHaveBeenCalled())
    expect(JSON.parse(notify.mock.calls.at(-1)?.[1] as string)).toEqual({
      label: 'AA',
      value: 'a',
    })
  })

  it('keeps a temporary option when source is configured without addApi', async () => {
    const fetcher = vi.fn(async () => ({
      status: 0,
      msg: '',
      data: {
        items: [
          { label: 'A', value: 'a' },
          { label: 'B', value: 'b' },
        ],
      },
    }))
    const { host } = mount({
      type: 'form',
      actions: [],
      body: {
        type: 'select',
        name: 'choice',
        label: '选项',
        source: '/api/options',
        creatable: true,
      },
    }, { fetcher })

    await nextTick()
    click(host.querySelector('.vamis-select__input'))
    await vi.waitFor(() => expect(menuLabels()).toContain('A'))
    click(buttonWithText('新增选项'))

    await vi.waitFor(() => {
      expect(document.querySelector('[data-slot="dialog-content"]')).toBeTruthy()
    })
    const input = document.querySelector('[data-slot="dialog-content"] input') as HTMLInputElement
    input.value = 'C'
    input.dispatchEvent(new Event('input', { bubbles: true }))
    await nextTick()
    click(buttonWithText('确认', document.querySelector('[data-slot="dialog-content"]') || document))

    await vi.waitFor(() => {
      expect((host.querySelector('.vamis-select__single') as HTMLElement | null)?.textContent?.trim()).toBe('C')
    })
    click(host.querySelector('.vamis-select__input'))
    await vi.waitFor(() => expect(menuLabels()).toContain('C'))
    expect(fetcher).toHaveBeenCalledTimes(1)
  })

  it('selects the reloaded source item after a successful add', async () => {
    let sourceLoads = 0
    const notify = vi.fn()
    const fetcher = vi.fn(async (api: { url?: string }) => {
      if (api.url === '/api/add') {
        return {
          status: 0,
          msg: '',
          data: { label: 'C', value: 'c-api', meta: 'api-only' },
        }
      }
      sourceLoads += 1
      return {
        status: 0,
        msg: '',
        data: {
          items: sourceLoads === 1
            ? [
                { label: 'A', value: 'a' },
                { label: 'B', value: 'b' },
              ]
            : [
                { label: 'A', value: 'a' },
                { label: 'B', value: 'b' },
                { label: 'C', value: 'c-api', meta: 'from-source' },
              ],
        },
      }
    })
    const { host } = mount({
      type: 'form',
      data: { scopeSecret: 'do-not-copy' },
      actions: [],
      body: {
        type: 'select',
        name: 'choice',
        label: '选项',
        source: '/api/options',
        addApi: '/api/add',
        creatable: true,
        joinValues: false,
        onEvent: {
          change: {
            actions: [{ actionType: 'toast', args: { msg: '${event.data.value|json}' } }],
          },
        },
      },
    }, { fetcher, notify })

    await nextTick()
    click(host.querySelector('.vamis-select__input'))
    await vi.waitFor(() => expect(menuLabels()).toContain('A'))
    click(buttonWithText('新增选项'))

    await vi.waitFor(() => {
      expect(document.querySelector('[data-slot="dialog-content"]')).toBeTruthy()
    })
    const input = document.querySelector('[data-slot="dialog-content"] input') as HTMLInputElement
    input.value = 'C'
    input.dispatchEvent(new Event('input', { bubbles: true }))
    await nextTick()
    click(buttonWithText('确认', document.querySelector('[data-slot="dialog-content"]') || document))

    await vi.waitFor(() => expect(notify).toHaveBeenCalled())
    expect(JSON.parse(notify.mock.calls.at(-1)?.[1] as string)).toEqual({
      label: 'C',
      value: 'c-api',
      meta: 'from-source',
    })
    expect(sourceLoads).toBe(2)
  })

  it('syncs a selected value after a source-backed edit', async () => {
    let sourceLoads = 0
    const notify = vi.fn()
    const fetcher = vi.fn(async (api: { url?: string }) => {
      if (api.url === '/api/edit') return { status: 0, msg: '', data: {} }
      sourceLoads += 1
      return {
        status: 0,
        msg: '',
        data: {
          items: sourceLoads === 1
            ? [
                { label: 'A', value: 'a' },
                { label: 'B', value: 'b' },
              ]
            : [
                { label: 'AA', value: 'a2', meta: 'from-source' },
                { label: 'B', value: 'b' },
              ],
        },
      }
    })
    const { host } = mount({
      type: 'form',
      actions: [],
      body: {
        type: 'select',
        name: 'choice',
        label: '选项',
        value: 'a',
        source: '/api/options',
        editable: true,
        editApi: '/api/edit',
        editControls: [
          { type: 'input-text', name: 'label', label: false },
          { type: 'input-text', name: 'value', label: false },
        ],
        joinValues: false,
        onEvent: {
          change: {
            actions: [{ actionType: 'toast', args: { msg: '${event.data.value|json}' } }],
          },
        },
      },
    }, { fetcher, notify })

    await nextTick()
    click(host.querySelector('.vamis-select__input'))
    await vi.waitFor(() => expect(menuLabels()).toContain('A'))
    click(optionItem('A')?.querySelector('[aria-label="编辑"]') || null)

    await vi.waitFor(() => {
      expect(document.querySelector('[data-slot="dialog-content"]')).toBeTruthy()
    })
    const inputs = document.querySelectorAll('[data-slot="dialog-content"] input')
    ;(inputs[0] as HTMLInputElement).value = 'AA'
    inputs[0].dispatchEvent(new Event('input', { bubbles: true }))
    ;(inputs[1] as HTMLInputElement).value = 'a2'
    inputs[1].dispatchEvent(new Event('input', { bubbles: true }))
    await nextTick()
    click(buttonWithText('确认', document.querySelector('[data-slot="dialog-content"]') || document))

    await vi.waitFor(() => expect(notify).toHaveBeenCalled())
    expect(JSON.parse(notify.mock.calls.at(-1)?.[1] as string)).toEqual({
      label: 'AA',
      value: 'a2',
      meta: 'from-source',
    })
    expect(sourceLoads).toBe(2)
  })

  it('reloads source after a successful delete', async () => {
    let sourceLoads = 0
    const fetcher = vi.fn(async (api: { url?: string }) => {
      if (api.url === '/api/delete') return { status: 0, msg: '', data: {} }
      sourceLoads += 1
      return {
        status: 0,
        msg: '',
        data: {
          items: sourceLoads === 1
            ? [
                { label: 'A', value: 'a' },
                { label: 'B', value: 'b' },
              ]
            : [{ label: 'B', value: 'b' }],
        },
      }
    })
    const { host } = mount({
      type: 'form',
      actions: [],
      body: {
        type: 'select',
        name: 'choice',
        label: '选项',
        value: 'b',
        source: '/api/options',
        removable: true,
        deleteApi: '/api/delete',
      },
    }, { fetcher })

    await nextTick()
    click(host.querySelector('.vamis-select__input'))
    await vi.waitFor(() => expect(menuLabels()).toContain('A'))
    click(optionItem('A')?.querySelector('[aria-label="删除"]') || null)

    await vi.waitFor(() => expect(sourceLoads).toBe(2))
    click(host.querySelector('.vamis-select__input'))
    await vi.waitFor(() => expect(menuLabels()).toEqual(['B']))
  })
})

describe('InputTree option mutation events', () => {
  it('forwards loadingConfig to deferred node Spinner', async () => {
    const target = document.createElement('div')
    target.id = 'tree-spinner-root'
    document.body.appendChild(target)
    let resolveFetch!: (value: unknown) => void
    const fetcher = vi.fn(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve
        }),
    )
    mount({
      type: 'page',
      body: {
        type: 'input-tree',
        name: 'tree',
        deferApi: '/api/tree-defer',
        loadingConfig: { root: '#tree-spinner-root' },
        options: [{ label: 'A', value: 'a', defer: true }],
      },
    }, { fetcher })

    await nextTick()
    click(document.querySelector('.vamis-tree__arrow'))

    await vi.waitFor(() => expect(fetcher).toHaveBeenCalled())
    await vi.waitFor(() => {
      expect(target.querySelector('.vamis-spinner--overlay')).toBeTruthy()
    })

    resolveFetch({ status: 0, msg: '', data: { options: [] } })
    await vi.waitFor(() => {
      expect(target.querySelector('.vamis-spinner--overlay')).toBeNull()
    })
  })

  it('does not add or call addApi when addConfirm prevents default', async () => {
    const fetcher = vi.fn(async () => ({
      status: 0,
      msg: '',
      data: {},
    }))
    mount({
      type: 'page',
      body: {
        type: 'input-tree',
        name: 'tree',
        creatable: true,
        addApi: '/api/tree-add',
        onEvent: {
          addConfirm: {
            actions: [{ actionType: 'preventDefault' }],
          },
        },
        options: [
          { label: 'A', value: 'a' },
          { label: 'B', value: 'b' },
        ],
      },
    }, { fetcher })

    await nextTick()
    click(document.querySelector('.vamis-tree__add-top'))
    await nextTick()
    const input = document.querySelector('.vamis-tree__native') as HTMLInputElement
    input.value = 'C'
    input.dispatchEvent(new Event('input', { bubbles: true }))
    await nextTick()
    click(document.querySelector('.vamis-tree__input-action[aria-label="确认"]'))
    await nextTick()
    await settle()

    await vi.waitFor(() => {
      expect(fetcher).not.toHaveBeenCalled()
      expect(treeTexts()).not.toContain('C')
    })
  })

  it('does not edit or call editApi when editConfirm prevents default', async () => {
    const fetcher = vi.fn(async () => ({
      status: 0,
      msg: '',
      data: {},
    }))
    mount({
      type: 'page',
      body: {
        type: 'input-tree',
        name: 'tree',
        editable: true,
        editApi: '/api/tree-edit',
        onEvent: {
          editConfirm: {
            actions: [{ actionType: 'preventDefault' }],
          },
        },
        options: [
          { label: 'A', value: 'a' },
          { label: 'B', value: 'b' },
        ],
      },
    }, { fetcher })

    await nextTick()
    click(treeItem('A')?.querySelector('[aria-label="编辑该节点"]') || null)
    await nextTick()
    const input = document.querySelector('.vamis-tree__native') as HTMLInputElement
    input.value = 'AA'
    input.dispatchEvent(new Event('input', { bubbles: true }))
    await nextTick()
    click(document.querySelector('.vamis-tree__input-action[aria-label="确认"]'))

    await vi.waitFor(() => expect(fetcher).not.toHaveBeenCalled())
    click(document.querySelector('.vamis-tree__input-action[aria-label="取消"]'))
    await nextTick()
    expect(treeTexts()).toContain('A')
    expect(treeTexts()).not.toContain('AA')
  })

  it('does not delete or call deleteApi when deleteConfirm prevents default', async () => {
    const fetcher = vi.fn(async () => ({
      status: 0,
      msg: '',
      data: {},
    }))
    const confirm = vi.fn(async () => true)
    mount({
      type: 'page',
      body: {
        type: 'input-tree',
        name: 'tree',
        removable: true,
        deleteApi: '/api/tree-delete',
        deleteConfirmText: '确认删除？',
        onEvent: {
          deleteConfirm: {
            actions: [{ actionType: 'preventDefault' }],
          },
        },
        options: [
          { label: 'A', value: 'a' },
          { label: 'B', value: 'b' },
        ],
      },
    }, { fetcher, confirm })

    await nextTick()
    click(treeItem('A')?.querySelector('[aria-label="移除该节点"]') || null)

    await vi.waitFor(() => expect(confirm).toHaveBeenCalledWith('确认删除？'))
    await settle()
    expect(fetcher).not.toHaveBeenCalled()
    expect(treeTexts()).toContain('A')
  })

  it('does not ask for confirmation when deleteConfirmText is absent', async () => {
    const confirm = vi.fn(async () => true)
    const fetcher = vi.fn(async () => ({ status: 0, msg: '', data: {} }))
    mount({
      type: 'page',
      body: {
        type: 'input-tree',
        name: 'tree',
        removable: true,
        deleteApi: '/api/tree-delete',
        options: [
          { label: 'A', value: 'a' },
          { label: 'B', value: 'b' },
        ],
      },
    }, { confirm, fetcher })

    await nextTick()
    click(treeItem('A')?.querySelector('[aria-label="移除该节点"]') || null)

    await vi.waitFor(() => expect(fetcher).toHaveBeenCalled())
    expect(confirm).not.toHaveBeenCalled()
  })

  it('filters deleteConfirmText with the current option data', async () => {
    const confirm = vi.fn(async () => false)
    const fetcher = vi.fn(async () => ({ status: 0, msg: '', data: {} }))
    const notify = vi.fn()
    mount({
      type: 'page',
      body: {
        type: 'input-tree',
        name: 'tree',
        removable: true,
        deleteApi: '/api/tree-delete',
        deleteConfirmText: '删除 ${label}？',
        onEvent: {
          deleteConfirm: {
            actions: [{ actionType: 'toast', args: { msg: 'delete-fired' } }],
          },
        },
        options: [{ label: 'A', value: 'a' }],
      },
    }, { confirm, fetcher, notify })

    await nextTick()
    click(treeItem('A')?.querySelector('[aria-label="移除该节点"]') || null)

    await vi.waitFor(() => expect(confirm).toHaveBeenCalledWith('删除 A？'))
    expect(notify).not.toHaveBeenCalled()
    expect(fetcher).not.toHaveBeenCalled()
  })

  it('passes only the edited label and value to editConfirm from a custom dialog', async () => {
    const notify = vi.fn()
    mount({
      type: 'page',
      body: {
        type: 'input-tree',
        name: 'tree',
        editable: true,
        editControls: [{ type: 'input-text', name: 'label', label: false }],
        onEvent: {
          editConfirm: {
            actions: [{ actionType: 'toast', args: { msg: '${event.data.item|json}' } }],
          },
        },
        options: [
          { label: 'A', value: 'a', meta: 'origin-only' },
          { label: 'B', value: 'b' },
        ],
      },
    }, { notify })

    await nextTick()
    click(treeItem('A')?.querySelector('[aria-label="编辑该节点"]') || null)

    await vi.waitFor(() => {
      expect(document.querySelector('[data-slot="dialog-content"]')).toBeTruthy()
    })
    const input = document.querySelector('[data-slot="dialog-content"] input') as HTMLInputElement
    input.value = 'AA'
    input.dispatchEvent(new Event('input', { bubbles: true }))
    await nextTick()
    click(buttonWithText('确认', document.querySelector('[data-slot="dialog-content"]') || document))

    await vi.waitFor(() => expect(notify).toHaveBeenCalled())
    expect(JSON.parse(notify.mock.calls.at(-1)?.[1] as string)).toEqual({
      label: 'AA',
      value: 'a',
    })
  })
})
