import { nextTick } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { embed } from '../src/embed'
import 'vamis'

const mounts: Array<ReturnType<typeof embed>> = []

afterEach(() => {
  while (mounts.length) mounts.pop()?.unmount()
  document.body.innerHTML = ''
})

function mount(schema: unknown, env?: Parameters<typeof embed>[3]) {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const scoped = embed(host, schema, undefined, env)
  mounts.push(scoped)
  return { host, scoped }
}

function formData(scoped: ReturnType<typeof embed>, name: string) {
  const form = scoped.getComponentByName(name) as {
    getData?: () => Record<string, unknown>
  }
  return form?.getData?.() || {}
}

function buttonWithText(text: string) {
  return [...document.querySelectorAll('button')].find(
    (button) => (button.textContent || '').trim() === text,
  ) as HTMLButtonElement | undefined
}

function openPicker(host: HTMLElement) {
  ;(host.querySelector('[data-picker-open]') as HTMLElement).click()
}

describe('Picker value and pickerSchema bridge', () => {
  it('renders labelTpl in selected tags while keeping the plain remove label', async () => {
    const { host } = mount({
      type: 'form',
      actions: [],
      body: {
        type: 'picker',
        name: 'hero',
        label: '英雄',
        value: 'a',
        valueField: 'id',
        labelField: 'name',
        labelTpl: '<strong class="hero-label">${name} / ${id}</strong>',
        options: [
          { id: 'a', name: '曹操' },
          { id: 'b', name: '李白' },
        ],
      },
    })

    await nextTick()
    const tag = host.querySelector(
      '.vamis-picker__tag-label',
    ) as HTMLElement
    expect(tag.querySelector('strong.hero-label')?.textContent).toBe(
      '曹操 / a',
    )
    expect(
      host.querySelector('.vamis-picker__tag-remove')?.getAttribute('aria-label'),
    ).toBe('移除 曹操')
  })

  it('splits a multiple string value when joinValues is false', async () => {
    const { host } = mount({
      type: 'form',
      actions: [],
      body: {
        type: 'picker',
        name: 'hero',
        label: '英雄',
        multiple: true,
        joinValues: false,
        value: '2,50',
        valueField: 'id',
        labelField: 'name',
        options: [
          { id: '2', name: '曹操' },
          { id: '50', name: '李白' },
        ],
      },
    })

    await nextTick()
    expect(
      [...host.querySelectorAll('.vamis-picker__tag-label')].map((item) =>
        (item.textContent || '').trim(),
      ),
    ).toEqual(['曹操', '李白'])
  })

  it('opens with Space and removes the last tag with Backspace', async () => {
    const { host, scoped } = mount({
      type: 'form',
      name: 'pickerKeyboardForm',
      actions: [],
      body: {
        type: 'picker',
        name: 'hero',
        label: '英雄',
        multiple: true,
        value: 'a,b',
        options: [
          { label: 'A', value: 'a' },
          { label: 'B', value: 'b' },
        ],
      },
    })

    await nextTick()
    const control = host.querySelector(
      '.vamis-picker__control',
    ) as HTMLElement
    expect(control.tabIndex).toBe(0)
    const keydown = (key: string) => {
      const event = new Event('keydown', { bubbles: true })
      Object.defineProperty(event, 'key', { value: key })
      control.dispatchEvent(event)
    }
    keydown('Backspace')
    await vi.waitFor(() =>
      expect(formData(scoped, 'pickerKeyboardForm').hero).toBe('a'),
    )

    keydown(' ')
    await vi.waitFor(() =>
      expect(document.querySelector('.vamis-picker__dialog')).toBeTruthy(),
    )
  })

  it('renders the Amis picker trigger with removable tags and no external action buttons', async () => {
    const { host, scoped } = mount({
      type: 'form',
      name: 'pickerTriggerForm',
      actions: [],
      body: {
        type: 'picker',
        name: 'hero',
        label: '英雄',
        multiple: true,
        value: 'a,c',
        options: [
          { label: 'A', value: 'a' },
          { label: 'B', value: 'b' },
          { label: 'C', value: 'c' },
        ],
      },
    })

    await nextTick()
    expect(host.querySelector('.vamis-picker__control')).toBeTruthy()
    expect(
      [...host.querySelectorAll('button')].some(
        (button) => (button.textContent || '').trim() === '选择',
      ),
    ).toBe(false)
    expect(host.querySelectorAll('.vamis-picker__tag')).toHaveLength(2)
    expect(host.querySelector('.vamis-picker__tag-remove')).toBeTruthy()
    expect(host.querySelector('[data-picker-open]')).toBeTruthy()
    expect(host.querySelector('.vamis-picker__clear')).toBeNull()

    ;(host.querySelector('.vamis-picker__tag-remove') as HTMLElement).click()
    await vi.waitFor(() =>
      expect(formData(scoped, 'pickerTriggerForm').hero).toBe('c'),
    )
  })

  it('reads overflowConfig.maxTagCount and itemClearable from the Amis schema', async () => {
    const { host } = mount({
      type: 'form',
      actions: [],
      body: {
        type: 'picker',
        name: 'hero',
        label: '英雄',
        multiple: true,
        value: 'a,b,c',
        itemClearable: false,
        overflowConfig: { maxTagCount: 2 },
        options: [
          { label: 'A', value: 'a' },
          { label: 'B', value: 'b' },
          { label: 'C', value: 'c' },
        ],
      },
    })

    await nextTick()
    expect(host.querySelectorAll('.vamis-picker__tag')).toHaveLength(2)
    expect(host.querySelector('.vamis-picker__more')?.textContent).toContain(
      '+1',
    )
    expect(host.querySelector('.vamis-picker__tag-remove')).toBeNull()
  })

  it('keeps CRUD selection tags unfolded when displayPosition excludes crud', async () => {
    const { host } = mount({
      type: 'form',
      actions: [],
      body: {
        type: 'picker',
        name: 'hero',
        label: '英雄',
        multiple: true,
        value: 'a,b,c',
        overflowConfig: {
          maxTagCount: 1,
          displayPosition: ['select'],
        },
        options: [
          { label: 'A', value: 'a' },
          { label: 'B', value: 'b' },
          { label: 'C', value: 'c' },
        ],
      },
    })

    await nextTick()
    expect(host.querySelectorAll('.vamis-picker__tag')).toHaveLength(1)
    expect(host.querySelector('.vamis-picker__more')?.textContent).toContain(
      '+2',
    )
    openPicker(host)
    await vi.waitFor(() =>
      expect(document.querySelector('.vamis-crud-selection')).toBeTruthy(),
    )
    expect(
      document.querySelectorAll('.vamis-crud-selection-value'),
    ).toHaveLength(3)
    expect(document.querySelector('.vamis-crud-selection-more')).toBeNull()
  })

  it('shows hidden picker tags in overflowTagPopover', async () => {
    const { host } = mount({
      type: 'form',
      actions: [],
      body: {
        type: 'picker',
        name: 'hero',
        label: '英雄',
        multiple: true,
        value: 'a,b,c,d',
        overflowConfig: {
          maxTagCount: 2,
          overflowTagPopover: {
            tooltipClassName: 'picker-trigger-overflow',
          },
        },
        options: [
          { label: 'A', value: 'a' },
          { label: 'B', value: 'b' },
          { label: 'C', value: 'c' },
          { label: 'D', value: 'd' },
        ],
      },
    })

    await nextTick()
    expect(host.querySelectorAll('.vamis-picker__tag')).toHaveLength(2)
    const overflow = host.querySelector('.vamis-picker__more') as HTMLElement
    overflow.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
    await vi.waitFor(() =>
      expect(document.querySelector('.picker-trigger-overflow')).toBeTruthy(),
    )
    expect(document.querySelector('.vamis-picker-overflow')?.textContent).toContain(
      'C',
    )
    expect(document.querySelector('.vamis-picker-overflow')?.textContent).toContain(
      'D',
    )
  })

  it('shows hidden CRUD selection tags in overflowTagPopoverInCRUD', async () => {
    const { host } = mount({
      type: 'form',
      actions: [],
      body: {
        type: 'picker',
        name: 'hero',
        label: '英雄',
        multiple: true,
        value: 'a,b,c',
        overflowConfig: {
          maxTagCount: 1,
          overflowTagPopoverInCRUD: {
            tooltipClassName: 'picker-crud-overflow',
          },
        },
        options: [
          { label: 'A', value: 'a' },
          { label: 'B', value: 'b' },
          { label: 'C', value: 'c' },
        ],
      },
    })

    await nextTick()
    openPicker(host)
    const overflow = await vi.waitFor(() => {
      const el = document.querySelector(
        '.vamis-crud-selection-more',
      ) as HTMLElement | null
      expect(el).toBeTruthy()
      return el as HTMLElement
    })
    overflow.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
    await vi.waitFor(() =>
      expect(document.querySelector('.picker-crud-overflow')).toBeTruthy(),
    )
    expect(document.querySelector('.vamis-crud-selection-overflow')?.textContent).toContain(
      'B',
    )
    expect(document.querySelector('.vamis-crud-selection-overflow')?.textContent).toContain(
      'C',
    )
  })

  it('hydrates initial selected descriptors when a variable source arrives later', async () => {
    const { host, scoped } = mount({
      type: 'form',
      name: 'pickerAsyncSourceForm',
      data: {
        selectedValue: [{ id: 1 }],
        pickerRows: [],
      },
      actions: [],
      body: {
        type: 'picker',
        name: 'hero',
        label: '英雄',
        multiple: true,
        valueField: 'id',
        labelField: 'name',
        value: '${selectedValue}',
        source: '${pickerRows}',
      },
    })

    await nextTick()
    openPicker(host)
    await vi.waitFor(() =>
      expect(document.querySelector('.vamis-crud-selection')).toBeTruthy(),
    )
    const form = scoped.getComponentByName('pickerAsyncSourceForm') as {
      setData?: (values: Record<string, unknown>) => void
    }
    form.setData?.({
      pickerRows: [{ id: 1, name: '选项 1' }],
    })
    await vi.waitFor(() =>
      expect(
        document.querySelector('.vamis-crud-selection')?.textContent,
      ).toContain('选项 1'),
    )
  })

  it('hydrates hidden selected ids from the full Picker source option pool', async () => {
    const rows = Array.from({ length: 5 }, (_, index) => ({
      id: String(index + 1),
      name: `选项 ${index + 1}`,
    }))
    const { host } = mount(
      {
        type: 'form',
        actions: [],
        body: {
          type: 'picker',
          name: 'hero',
          label: '英雄',
          multiple: true,
          value: '1,2,3,4,5',
          valueField: 'id',
          labelField: 'name',
          source: '/api/picker-source',
        },
      },
      {
        fetcher: async (_api, data) => {
          const query = data as Record<string, unknown>
          const perPage = Number(query.perPage)
          return {
            status: 0,
            data: {
              items: perPage > 0 ? rows.slice(0, 2) : rows,
              total: rows.length,
            },
          }
        },
      },
    )

    await nextTick()
    openPicker(host)
    await vi.waitFor(() =>
      expect(
        document.querySelector('.vamis-crud-selection')?.textContent,
      ).toContain('选项 5'),
    )
  })

  it('keeps the picker trigger fluid when size is configured', async () => {
    const { host } = mount({
      type: 'form',
      actions: [],
      body: {
        type: 'picker',
        name: 'hero',
        label: '英雄',
        size: 'lg',
        options: [{ label: 'A', value: 'a' }],
      },
    })

    await nextTick()
    expect(host.querySelector('.vamis-control--lg')).toBeNull()
    expect(host.querySelector('.vamis-control--fluid')).toBeTruthy()
    expect(host.querySelector('.vamis-picker__control')).toBeTruthy()
  })

  it('renders the CRUD selected-items bar for a multiple picker', async () => {
    const { host, scoped } = mount({
      type: 'form',
      name: 'pickerSelectionBarForm',
      actions: [],
      body: {
        type: 'picker',
        name: 'hero',
        label: '英雄',
        multiple: true,
        value: 'a,b',
        options: [
          { label: 'A', value: 'a' },
          { label: 'B', value: 'b' },
        ],
      },
    })

    await nextTick()
    openPicker(host)
    await vi.waitFor(() =>
      expect(document.querySelector('.vamis-crud-selection')).toBeTruthy(),
    )
    const selection = document.querySelector(
      '.vamis-crud-selection',
    ) as HTMLElement
    expect(selection.textContent).toContain('已选2条')
    expect(selection.textContent).toContain('A')
    expect(selection.textContent).toContain('B')
    ;(selection.querySelector('.vamis-crud-selection-clear') as HTMLElement).click()
    await vi.waitFor(() =>
      expect(document.querySelector('.vamis-crud-selection')).toBeNull(),
    )
    buttonWithText('确认')?.click()
    await vi.waitFor(() =>
      expect(formData(scoped, 'pickerSelectionBarForm').hero).toBe(''),
    )
  })

  it('dispatches staticItemClick for a static picker', async () => {
    const notify = vi.fn()
    const { host } = mount(
      {
        type: 'form',
        actions: [],
        body: {
          type: 'picker',
          name: 'hero',
          label: '英雄',
          static: true,
          multiple: true,
          value: 'a,b',
          options: [
            { label: 'A', value: 'a' },
            { label: 'B', value: 'b' },
          ],
          onEvent: {
            staticItemClick: {
              actions: [
                {
                  actionType: 'toast',
                  args: { msg: '${event.data.item.value}' },
                },
              ],
            },
          },
        },
      },
      { notify },
    )

    await nextTick()
    ;(host.querySelector('.vamis-words span') as HTMLElement).click()
    await vi.waitFor(() =>
      expect(notify.mock.calls.map((call) => call[1])).toContain('a'),
    )
  })

  it('uses CRUD list and single selection in the default Picker modal', async () => {
    const { host, scoped } = mount({
      type: 'form',
      name: 'pickerDefaultCrudForm',
      actions: [],
      body: {
        type: 'picker',
        name: 'hero',
        label: '英雄',
        options: [
          { label: 'A', value: 'a' },
          { label: 'B', value: 'b' },
        ],
      },
    })

    await nextTick()
    openPicker(host)
    await vi.waitFor(() =>
      expect(document.querySelector('.vamis-crud-list')).toBeTruthy(),
    )
    expect(
      document.querySelector('[data-slot="dialog-title"]')?.textContent?.trim(),
    ).toBe('请选择')
    expect(document.querySelector('.vamis-picker__dialog-body')).toBeTruthy()
    expect(document.body.textContent).not.toContain('筛选')
    expect(
      document.querySelector(
        '.vamis-crud-list-item .vamis-crud-list-check > .vamis-radio-dot',
      ),
    ).toBeTruthy()
    expect(buttonWithText('确认')).toBeTruthy()
    expect(buttonWithText('确定')).toBeUndefined()
    const firstRow = document.querySelector(
      '.vamis-crud-list-item',
    ) as HTMLElement
    firstRow.click()
    await vi.waitFor(() =>
      expect(firstRow.classList.contains('is-checked')).toBe(true),
    )
    expect(document.body.textContent).not.toContain('已选 1')
    buttonWithText('确认')?.click()
    await vi.waitFor(() =>
      expect(formData(scoped, 'pickerDefaultCrudForm').hero).toBe('a'),
    )
  })

  it('seeds the default CRUD selection from the current Picker value', async () => {
    const { host, scoped } = mount({
      type: 'form',
      name: 'pickerInitialValueForm',
      actions: [],
      body: {
        type: 'picker',
        name: 'hero',
        label: '英雄',
        value: 'a',
        options: [
          { label: 'A', value: 'a' },
          { label: 'B', value: 'b' },
        ],
      },
    })

    await nextTick()
    openPicker(host)
    await vi.waitFor(() =>
      expect(
        document.querySelector('.vamis-crud-list-item.is-checked'),
      ).toBeTruthy(),
    )
    expect(
      document
        .querySelector('.vamis-crud-list-item .vamis-radio-dot')
        ?.getAttribute('aria-checked'),
    ).toBe('true')
    buttonWithText('确认')?.click()
    await vi.waitFor(() =>
      expect(formData(scoped, 'pickerInitialValueForm').hero).toBe('a'),
    )
  })

  it('keeps grouped option rows in the default CRUD source', async () => {
    const { host } = mount({
      type: 'form',
      name: 'pickerGroupedForm',
      actions: [],
      body: {
        type: 'picker',
        name: 'hero',
        label: '英雄',
        options: [
          {
            label: '前端',
            children: [
              { label: 'Vue', value: 'vue' },
              { label: 'React', value: 'react' },
            ],
          },
          {
            label: '后端',
            children: [{ label: 'Node', value: 'node' }],
          },
        ],
      },
    })

    await nextTick()
    openPicker(host)
    await vi.waitFor(() =>
      expect(document.querySelector('.vamis-crud-list-item')).toBeTruthy(),
    )
    const labels = [
      ...document.querySelectorAll('.vamis-crud-list-text'),
    ].map((node) => node.textContent?.trim())
    expect(labels).toEqual(['前端', '后端'])
  })

  it('commits a CRUD list selection immediately in embed mode', async () => {
    const { host, scoped } = mount({
      type: 'form',
      name: 'pickerEmbedForm',
      actions: [],
      body: {
        type: 'picker',
        name: 'hero',
        label: '英雄',
        embed: true,
        value: 'a',
        options: [
          { label: 'A', value: 'a' },
          { label: 'B', value: 'b' },
        ],
      },
    })

    await nextTick()
    await vi.waitFor(() =>
      expect(document.querySelector('.vamis-crud-list-item')).toBeTruthy(),
    )
    expect(
      document.querySelector(
        '.vamis-crud-list-item.is-checked .vamis-radio-dot',
      )?.getAttribute('aria-checked'),
    ).toBe('true')
    ;(
      document.querySelectorAll('.vamis-crud-list-item')[1] as HTMLElement
    ).click()
    await vi.waitFor(() =>
      expect(formData(scoped, 'pickerEmbedForm').hero).toBe('b'),
    )
  })

  it('expands nested embed options and commits a child selection', async () => {
    const { host, scoped } = mount({
      type: 'form',
      name: 'pickerEmbedTreeForm',
      actions: [],
      body: {
        type: 'picker',
        name: 'hero',
        label: '英雄',
        embed: true,
        multiple: true,
        pickerSchema: {
          mode: 'table',
          columns: [{ name: 'label', label: '选项' }],
        },
        options: [
          {
            label: '前端',
            value: 'frontend',
            children: [
              { label: 'Vue', value: 'vue' },
              { label: 'React', value: 'react' },
            ],
          },
          {
            label: '后端',
            value: 'backend',
            children: [{ label: 'Node', value: 'node' }],
          },
        ],
      },
    })

    await nextTick()
    await vi.waitFor(() =>
      expect(document.querySelector('.vamis-crud-body table tbody tr')).toBeTruthy(),
    )
    const rootRows = [
      ...document.querySelectorAll('.vamis-crud-body table tbody tr'),
    ]
    expect(rootRows.map((row) => row.textContent).join(' ')).not.toContain('Vue')

    const expand = rootRows[0].querySelector(
      '.vamis-table__expand-btn',
    ) as HTMLElement
    expect(expand).toBeTruthy()
    expand.click()
    const vueRow = await vi.waitFor(() => {
      const row = [...document.querySelectorAll('.vamis-crud-body table tbody tr')].find(
        (item) => (item.textContent || '').includes('Vue'),
      ) as HTMLElement | undefined
      expect(row).toBeTruthy()
      return row as HTMLElement
    })
    vueRow.click()
    await vi.waitFor(() =>
      expect(formData(scoped, 'pickerEmbedTreeForm').hero).toBe('vue'),
    )
  })

  it('loads a nested tree source through the generated CRUD table', async () => {
    const treeRows = [
      {
        id: 1,
        engine: 'Root A',
        children: [{ id: 2, engine: 'Child A1' }],
      },
      { id: 3, engine: 'Root B' },
    ]
    const { host, scoped } = mount(
      {
        type: 'form',
        name: 'pickerRemoteTreeForm',
        actions: [],
        body: {
          type: 'picker',
          name: 'hero',
          label: '英雄',
          embed: true,
          multiple: true,
          source: '/api/picker-tree',
          valueField: 'id',
          labelField: 'engine',
          joinValues: false,
          pickerSchema: {
            mode: 'table',
            columns: [{ name: 'engine', label: '名称' }],
          },
        },
      },
      {
        fetcher: async () => ({
          status: 0,
          data: { total: treeRows.length, rows: treeRows },
        }),
      },
    )

    await vi.waitFor(() =>
      expect(document.querySelectorAll('.vamis-crud-body table tbody tr')).toHaveLength(
        2,
      ),
    )
    const root = document.querySelector(
      '.vamis-crud-body table tbody tr',
    ) as HTMLElement
    expect(root.textContent).toContain('Root A')
    ;(root.querySelector('.vamis-table__expand-btn') as HTMLElement).click()
    const child = await vi.waitFor(() => {
      const row = [...document.querySelectorAll('.vamis-crud-body table tbody tr')].find(
        (item) => (item.textContent || '').includes('Child A1'),
      ) as HTMLElement | undefined
      expect(row).toBeTruthy()
      return row as HTMLElement
    })
    child.click()
    await vi.waitFor(() =>
      expect(
        (formData(scoped, 'pickerRemoteTreeForm').hero as Array<{ id: number }>).map(
          (item) => item.id,
        ).sort((a, b) => a - b),
      ).toEqual([1, 2]),
    )
  })

  it('commits a cards pickerSchema selection through the CRUD host in embed mode', async () => {
    const { host, scoped } = mount({
      type: 'form',
      name: 'pickerCardsForm',
      data: {
        pickerRows: [
          { id: 'a', name: 'Card A' },
          { id: 'b', name: 'Card B' },
        ],
      },
      actions: [],
      body: {
        type: 'picker',
        name: 'hero',
        label: '英雄',
        embed: true,
        multiple: true,
        valueField: 'id',
        labelField: 'name',
        source: '${pickerRows}',
        pickerSchema: {
          mode: 'cards',
          card: { title: '${name}' },
        },
      },
    })

    const firstCard = await vi.waitFor(() => {
      const card = host.querySelector('.vamis-card') as HTMLElement | null
      expect(card).toBeTruthy()
      return card as HTMLElement
    })
    firstCard.click()
    await vi.waitFor(() =>
      expect(formData(scoped, 'pickerCardsForm').hero).toBe('a'),
    )
  })

  it('uses the drawer host for modalMode drawer', async () => {
    const { host, scoped } = mount({
      type: 'form',
      name: 'pickerDrawerForm',
      actions: [],
      body: {
        type: 'picker',
        name: 'hero',
        label: '英雄',
        modalMode: 'drawer',
        options: [
          { label: 'A', value: 'a' },
          { label: 'B', value: 'b' },
        ],
      },
    })

    await nextTick()
    openPicker(host)
    await vi.waitFor(() =>
      expect(document.querySelector('.vamis-picker__drawer')).toBeTruthy(),
    )
    expect(document.querySelector('.vamis-picker__dialog')).toBeNull()
    ;(
      document.querySelectorAll('.vamis-crud-list-item')[1] as HTMLElement
    ).click()
    buttonWithText('确认')?.click()
    await vi.waitFor(() =>
      expect(formData(scoped, 'pickerDrawerForm').hero).toBe('b'),
    )
    await vi.waitFor(() =>
      expect(document.querySelector('.vamis-picker__drawer')).toBeNull(),
    )
  })

  it('keeps full pickerSchema selected items and labels when extractValue is false', async () => {
    const { host, scoped } = mount({
      type: 'form',
      name: 'pickerSchemaForm',
      data: {
        pickerRows: [
          { id: 'caocao', name: '曹操' },
          { id: 'libai', name: '李白' },
        ],
      },
      actions: [],
      body: {
        type: 'picker',
        name: 'hero',
        label: '英雄',
        multiple: true,
        joinValues: false,
        extractValue: false,
        valueField: 'id',
        labelField: 'name',
        options: [],
        pickerSchema: {
          mode: 'table',
          name: 'pickerHeroTable',
          selectable: true,
          source: '${pickerRows}',
          columns: [
            { name: 'name', label: '英雄' },
          ],
        },
      },
    })

    await nextTick()
    openPicker(host)
    await vi.waitFor(() =>
      expect(document.querySelector('table tbody tr')).toBeTruthy(),
    )
    const firstRow = document.querySelector('table tbody tr') as HTMLElement
    expect(firstRow.textContent).toContain('曹操')
    firstRow.click()
    await vi.waitFor(() =>
      expect(firstRow.querySelector('[data-state="checked"]')).toBeTruthy(),
    )
    buttonWithText('确认')?.click()

    await vi.waitFor(() => {
      expect(formData(scoped, 'pickerSchemaForm').hero).toEqual([
        expect.objectContaining({ id: 'caocao', name: '曹操' }),
      ])
      expect(host.textContent).toContain('曹操')
      expect(host.textContent).not.toContain('caocao')
    })
  })

  it('resolves a variable source from the current form data chain', async () => {
    const { host } = mount({
      type: 'form',
      data: {
        pickerOptions: [
          { label: '选项 A', value: 'a' },
          { label: '选项 B', value: 'b' },
        ],
      },
      actions: [],
      body: {
        type: 'picker',
        name: 'hero',
        label: '英雄',
        source: '${pickerOptions}',
        options: [],
      },
    })

    await nextTick()
    openPicker(host)
    await vi.waitFor(() => {
      expect(document.body.textContent).toContain('选项 A')
      expect(document.body.textContent).toContain('选项 B')
    })
    expect(host.textContent).not.toContain('[object Object]')
  })

  it('dispatches change before committing the confirmed value', async () => {
    const { host, scoped } = mount({
      type: 'form',
      name: 'pickerChangeForm',
      actions: [],
      body: {
        type: 'picker',
        name: 'hero',
        label: '英雄',
        options: [{ label: '曹操', value: 'caocao' }],
        onEvent: {
          change: {
            actions: [
              {
                actionType: 'toast',
                args: { msg: 'picker-changed' },
              },
            ],
          },
          itemClick: {
            actions: [
              {
                actionType: 'toast',
                args: { msg: 'picker-item-click' },
              },
            ],
          },
        },
      },
    })

    await nextTick()
    openPicker(host)
    await vi.waitFor(() =>
      expect(document.querySelector('.vamis-crud-list-item')).toBeTruthy(),
    )
    ;(document.querySelector('.vamis-crud-list-item') as HTMLElement).click()
    buttonWithText('确认')?.click()
    await vi.waitFor(() => {
      expect(formData(scoped, 'pickerChangeForm').hero).toBe('caocao')
      expect(document.body.textContent).toContain('picker-changed')
    })
    ;(document.querySelector('.vamis-picker__tag-label') as HTMLElement).click()
    await vi.waitFor(() =>
      expect(document.body.textContent).toContain('picker-item-click'),
    )
  })

  it('clears to resetValue when configured', async () => {
    const { host, scoped } = mount({
      type: 'form',
      name: 'pickerClearForm',
      actions: [],
      body: {
        type: 'picker',
        name: 'hero',
        label: '英雄',
        value: 'b',
        clearable: true,
        resetValue: 'a',
        options: [
          { label: '曹操', value: 'a' },
          { label: '李白', value: 'b' },
        ],
      },
    })

    await nextTick()
    ;(host.querySelector('.vamis-picker__clear') as HTMLElement).click()
    await vi.waitFor(() =>
      expect(formData(scoped, 'pickerClearForm').hero).toBe('a'),
    )
  })
})
