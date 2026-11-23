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
  it.each([
    {
      name: 'joins selected values with a custom delimiter',
      schema: {
        multiple: true,
        valueField: 'id',
        delimiter: '|',
      },
      picks: ['A', 'B'],
      expected: 'a|b',
    },
    {
      name: 'extracts selected values when joinValues is false',
      schema: {
        multiple: true,
        valueField: 'id',
        joinValues: false,
        extractValue: true,
      },
      picks: ['A', 'B'],
      expected: ['a', 'b'],
    },
    {
      name: 'keeps full option objects when joinValues and extractValue are false',
      schema: {
        multiple: true,
        valueField: 'id',
        joinValues: false,
        extractValue: false,
      },
      picks: ['A', 'B'],
      expected: [
        { label: 'A', value: 'a', id: 'a', meta: 'alpha' },
        { label: 'B', value: 'b', id: 'b', meta: 'beta' },
      ],
    },
    {
      name: 'keeps one full option object for single select',
      schema: {
        multiple: false,
        valueField: 'id',
        joinValues: false,
        extractValue: false,
      },
      picks: ['B'],
      expected: { label: 'B', value: 'b', id: 'b', meta: 'beta' },
    },
  ])('$name', async ({ schema, picks, expected }) => {
    const { host, scoped } = mount({
      type: 'page',
      body: {
        type: 'form',
        name: 'valueShapeForm',
        actions: [],
        body: {
          type: 'select',
          name: 'choice',
          label: '选项',
          ...schema,
          options: [
            { label: 'A', value: 'a', id: 'a', meta: 'alpha' },
            { label: 'B', value: 'b', id: 'b', meta: 'beta' },
          ],
        },
      },
    })

    await nextTick()
    click(host.querySelector('.vamis-select__input'))
    await vi.waitFor(() => expect(menuLabels()).toContain('A'))
    for (const label of picks) click(optionItem(label))

    const form = scoped.getComponentByName('valueShapeForm') as {
      getData?: () => Record<string, unknown>
    }
    await vi.waitFor(() => expect(form?.getData?.()?.choice).toEqual(expected))
  })

  it.each([
    { showInvalidMatch: true, invalid: true },
    { showInvalidMatch: false, invalid: false },
  ])(
    'marks unmatched select values only when showInvalidMatch=$showInvalidMatch',
    async ({ showInvalidMatch, invalid }) => {
      const { host } = mount({
        type: 'page',
        body: {
          type: 'form',
          actions: [],
          body: {
            type: 'select',
            name: 'choice',
            label: '选项',
            value: 'missing',
            showInvalidMatch,
            options: [{ label: 'A', value: 'a' }],
          },
        },
      })

      await nextTick()
      expect(
        host
          .querySelector('.vamis-select__single')
          ?.classList.contains('is-invalid'),
      ).toBe(invalid)
    },
  )

  it('marks unmatched tags when showInvalidMatch is enabled', async () => {
    const { host } = mount({
      type: 'page',
      body: {
        type: 'form',
        actions: [],
        body: {
          type: 'select',
          name: 'choice',
          label: '选项',
          multiple: true,
          value: 'missing,a',
          showInvalidMatch: true,
          options: [{ label: 'A', value: 'a' }],
        },
      },
    })

    await nextTick()
    const chips = [...host.querySelectorAll('.vamis-select__chip')]
    expect(
      chips.find((chip) => chip.textContent?.includes('missing'))
        ?.classList.contains('is-invalid'),
    ).toBe(true)
    expect(
      chips.find((chip) => chip.textContent?.includes('A'))
        ?.classList.contains('is-invalid'),
    ).toBe(false)
  })

  it('applies mobileClassName to the mobile Select popup', async () => {
    const { host } = mount(
      {
        type: 'page',
        body: {
          type: 'form',
          actions: [],
          body: {
            type: 'select',
            name: 'choice',
            label: '选项',
            mobileClassName: 'custom-mobile-select',
            options: [{ label: 'A', value: 'a' }],
          },
        },
      },
      { mobileUI: true },
    )

    await nextTick()
    click(host.querySelector('.vamis-select__input'))
    await vi.waitFor(() =>
      expect(
        document.querySelector('.vamis-popup.custom-mobile-select'),
      ).toBeTruthy(),
    )
  })

  it('emits focus, change and blur in Select interaction order', async () => {
    const notify = vi.fn()
    const { host } = mount(
      {
        type: 'page',
        body: {
          type: 'form',
          actions: [],
          data: { choice: 'a' },
          body: {
            type: 'select',
            name: 'choice',
            label: '选项',
            onEvent: {
              focus: {
                actions: [
                  { actionType: 'toast', args: { msg: 'focus:${event.data.choice}' } },
                ],
              },
              change: {
                actions: [
                  { actionType: 'toast', args: { msg: 'change:${event.data.choice}' } },
                ],
              },
              blur: {
                actions: [
                  { actionType: 'toast', args: { msg: 'blur:${event.data.choice}' } },
                ],
              },
            },
            options: [
              { label: 'A', value: 'a' },
              { label: 'B', value: 'b' },
            ],
          },
        },
      },
      { notify },
    )

    await nextTick()
    click(host.querySelector('.vamis-select__input'))
    await vi.waitFor(() => expect(menuLabels()).toContain('B'))
    click(optionItem('B'))

    await vi.waitFor(() =>
      expect(notify.mock.calls.map((call) => call[1])).toEqual([
        'focus:a',
        'change:b',
        'blur:b',
      ]),
    )
  })

  it('runs Select clear, reset, reload and setValue actions', async () => {
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
    const { host, scoped } = mount(
      {
        type: 'page',
        body: {
          type: 'form',
          name: 'selectActionForm',
          actions: [],
          body: [
            {
              type: 'select',
              id: 'action-select',
              name: 'choice',
              label: '选项',
              value: 'a',
              source: '/api/select-options',
            },
            {
              type: 'button',
              label: '设为 B',
              onEvent: {
                click: {
                  actions: [
                    {
                      actionType: 'setValue',
                      componentId: 'action-select',
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
                  actions: [
                    { actionType: 'clear', componentId: 'action-select' },
                  ],
                },
              },
            },
            {
              type: 'button',
              label: '重置',
              onEvent: {
                click: {
                  actions: [
                    { actionType: 'reset', componentId: 'action-select' },
                  ],
                },
              },
            },
            {
              type: 'button',
              label: '刷新',
              onEvent: {
                click: {
                  actions: [
                    { actionType: 'reload', componentId: 'action-select' },
                  ],
                },
              },
            },
          ],
        },
      },
      { fetcher },
    )

    await nextTick()
    const form = scoped.getComponentByName('selectActionForm') as {
      getData?: () => Record<string, unknown>
    }
    await vi.waitFor(() => expect(sourceLoads).toBe(1))

    click(buttonWithText('设为 B'))
    await vi.waitFor(() => expect(form?.getData?.()?.choice).toBe('b'))
    click(buttonWithText('清空'))
    await vi.waitFor(() => expect(form?.getData?.()?.choice).toBe(''))
    click(buttonWithText('重置'))
    await vi.waitFor(() => expect(form?.getData?.()?.choice).toBe('a'))
    click(buttonWithText('刷新'))
    await vi.waitFor(() => expect(sourceLoads).toBe(2))
  })

  it('renders Select table mode and writes a row selection', async () => {
    const { host, scoped } = mount({
      type: 'page',
      body: {
        type: 'form',
        name: 'tableForm',
        actions: [],
        body: {
          type: 'select',
          name: 'hero',
          label: '英雄',
          searchable: true,
          selectMode: 'table',
          columns: [
            { name: 'label', label: '英雄' },
            {
              name: 'position',
              label: '位置',
              type: 'tpl',
              tpl: '${label} · ${position}',
            },
          ],
          options: [
            { label: '诸葛亮', value: 'zhugeliang', position: '中单' },
            { label: '曹操', value: 'caocao', position: '上单' },
          ],
        },
      },
    })

    await nextTick()
    click(host.querySelector('.vamis-select__input'))
    await vi.waitFor(() => expect(document.querySelector('.vamis-select__table')).toBeTruthy())

    const rows = document.querySelectorAll('.vamis-select__table tbody tr')
    expect(rows).toHaveLength(2)
    expect(rows[0]?.textContent).toContain('诸葛亮')
    expect(rows[0]?.textContent).toContain('诸葛亮 · 中单')

    click(rows[0] as HTMLElement)
    const form = scoped.getComponentByName('tableForm') as { getData?: () => Record<string, unknown> }
    await vi.waitFor(() => expect(form?.getData?.()?.hero).toBe('zhugeliang'))
    expect(host.querySelector('.vamis-select__single')?.textContent).toBe('诸葛亮')
  })

  it('checks all available rows in multiple Select table mode', async () => {
    const { host, scoped } = mount({
      type: 'page',
      body: {
        type: 'form',
        name: 'tableMultiForm',
        actions: [],
        body: {
          type: 'select',
          name: 'heroes',
          label: '英雄',
          multiple: true,
          selectMode: 'table',
          columns: [{ name: 'label', label: '英雄' }],
          options: [
            { label: '诸葛亮', value: 'zhugeliang' },
            { label: '曹操', value: 'caocao' },
            { label: '禁用', value: 'disabled', disabled: true },
          ],
        },
      },
    })

    await nextTick()
    click(host.querySelector('.vamis-select__input'))
    await vi.waitFor(() => expect(document.querySelector('.vamis-select__table')).toBeTruthy())

    click(
      document.querySelector(
        '.vamis-select__table thead [data-slot="checkbox"]',
      ) as HTMLElement,
    )
    const form = scoped.getComponentByName('tableMultiForm') as {
      getData?: () => Record<string, unknown>
    }
    await vi.waitFor(() =>
      expect(form?.getData?.()?.heroes).toBe('zhugeliang,caocao'),
    )
  })

  it('keeps mobile table selection in the draft until confirm', async () => {
    const { host, scoped } = mount(
      {
        type: 'page',
        body: {
          type: 'form',
          name: 'mobileTableForm',
          actions: [],
          body: {
            type: 'select',
            name: 'heroes',
            label: '英雄',
            multiple: true,
            selectMode: 'table',
            columns: [{ name: 'label', label: '英雄' }],
            options: [
              { label: '诸葛亮', value: 'zhugeliang' },
              { label: '曹操', value: 'caocao' },
            ],
          },
        },
      },
      { mobileUI: true },
    )

    await nextTick()
    click(host.querySelector('.vamis-select__input'))
    await vi.waitFor(() =>
      expect(document.querySelector('.vamis-popup .vamis-select__table')).toBeTruthy(),
    )
    click(document.querySelector('.vamis-select__table tbody tr') as HTMLElement)

    const form = scoped.getComponentByName('mobileTableForm') as {
      getData?: () => Record<string, unknown>
    }
    expect(form?.getData?.()?.heroes).toBeUndefined()

    click(document.querySelector('.vamis-popup__ok') as HTMLElement)
    await vi.waitFor(() =>
      expect(form?.getData?.()?.heroes).toBe('zhugeliang'),
    )
  })

  it('keeps the selected row visible in table mode when hideSelected is true', async () => {
    const { host } = mount({
      type: 'page',
      body: {
        type: 'form',
        actions: [],
        body: {
          type: 'select',
          name: 'hero',
          label: '英雄',
          selectMode: 'table',
          hideSelected: true,
          value: 'zhugeliang',
          columns: [{ name: 'label', label: '英雄' }],
          options: [
            { label: '诸葛亮', value: 'zhugeliang' },
            { label: '曹操', value: 'caocao' },
          ],
        },
      },
    })

    await nextTick()
    click(host.querySelector('.vamis-select__input'))
    await vi.waitFor(() => expect(document.querySelector('.vamis-select__table')).toBeTruthy())

    expect(
      document.querySelectorAll('.vamis-select__table tbody [data-slot="table-row"]'),
    ).toHaveLength(2)
    expect(
      document
        .querySelector('.vamis-select__table tbody [data-slot="table-row"].is-active')
        ?.textContent,
    ).toContain('诸葛亮')
  })

  it('virtualizes long Select table rows and keeps later rows selectable', async () => {
    const { host, scoped } = mount({
      type: 'page',
      body: {
        type: 'form',
        name: 'virtualTableForm',
        actions: [],
        body: {
          type: 'select',
          name: 'hero',
          label: '英雄',
          selectMode: 'table',
          virtualThreshold: 4,
          itemHeight: 20,
          columns: [{ name: 'label', label: '英雄' }],
          options: Array.from({ length: 80 }, (_, index) => ({
            label: `英雄 ${index + 1}`,
            value: `hero-${index + 1}`,
          })),
        },
      },
    })

    await nextTick()
    click(host.querySelector('.vamis-select__input'))
    await vi.waitFor(() =>
      expect(document.querySelector('.vamis-select__table-pane.is-virtual')).toBeTruthy(),
    )
    expect(
      document.querySelector('.vamis-select__popover')?.classList.contains('is-transfer'),
    ).toBe(true)

    const pane = document.querySelector('.vamis-select__table-pane') as HTMLElement
    expect(
      pane.querySelectorAll(
        'tbody [data-slot="table-row"]:not(.vamis-select__table-virtual-pad)',
      ).length,
    ).toBeLessThan(80)
    expect(pane.querySelector('.vamis-select__table-virtual-pad')).toBeTruthy()

    pane.scrollTop = 1200
    pane.dispatchEvent(new Event('scroll'))
    await vi.waitFor(() => expect(pane.textContent).toContain('英雄 60'))
    click(
      [...pane.querySelectorAll('[data-slot="table-row"]')].find((row) =>
        row.textContent?.includes('英雄 60'),
      ) as HTMLElement,
    )

    const form = scoped.getComponentByName('virtualTableForm') as {
      getData?: () => Record<string, unknown>
    }
    await vi.waitFor(() => expect(form?.getData?.()?.hero).toBe('hero-60'))
  })

  it('renders associated mode and writes only a right-side selection', async () => {
    const { host, scoped } = mount({
      type: 'page',
      body: {
        type: 'form',
        name: 'associatedForm',
        actions: [],
        body: {
          type: 'select',
          name: 'hero',
          label: '英雄',
          searchable: true,
          selectMode: 'associated',
          leftMode: 'list',
          leftDefaultValue: 'mage',
          leftOptions: [
            { label: '法师', value: 'mage' },
            { label: '战士', value: 'warrior' },
          ],
          options: [
            {
              ref: 'mage',
              children: [{ label: 'A', value: 'a' }],
            },
            {
              ref: 'warrior',
              children: [{ label: 'B', value: 'b' }],
            },
          ],
        },
      },
    })

    await nextTick()
    click(host.querySelector('.vamis-select__input'))
    await vi.waitFor(() =>
      expect(document.querySelector('.vamis-select__associated')).toBeTruthy(),
    )
    expect(document.querySelector('.vamis-select__associated-right')?.textContent).toContain('A')

    const form = scoped.getComponentByName('associatedForm') as {
      getData?: () => Record<string, unknown>
    }
    expect(form?.getData?.()?.hero).toBeUndefined()

    click(
      [...document.querySelectorAll('.vamis-select__associated-right-item')][0] as HTMLElement,
    )
    await vi.waitFor(() => expect(form?.getData?.()?.hero).toBe('a'))
    click(host.querySelector('.vamis-select__input'))
    await vi.waitFor(() =>
      expect(document.querySelector('.vamis-select__associated')).toBeTruthy(),
    )

    click(
      [...document.querySelectorAll('.vamis-select__associated-left-item')].find(
        (item) => item.textContent?.trim() === '战士',
      ) as HTMLElement,
    )
    await nextTick()
    expect(document.querySelector('.vamis-select__associated-right')?.textContent).toContain('B')
    expect(
      [...document.querySelectorAll('.vamis-select__associated-left-item.is-active')].map(
        (item) => item.textContent?.trim(),
      ),
    ).toEqual(['战士'])
    expect(form?.getData?.()?.hero).toBe('a')
  })

  it('renders and toggles multiple associated right-list selections', async () => {
    const { host, scoped } = mount({
      type: 'page',
      body: {
        type: 'form',
        name: 'associatedMultipleForm',
        actions: [],
        body: {
          type: 'select',
          name: 'heroes',
          label: '英雄',
          multiple: true,
          selectMode: 'associated',
          leftMode: 'list',
          leftDefaultValue: 'mage',
          leftOptions: [{ label: '法师', value: 'mage' }],
          options: [
            {
              ref: 'mage',
              children: [
                { label: 'A', value: 'a' },
                { label: 'B', value: 'b' },
              ],
            },
          ],
        },
      },
    })

    await nextTick()
    click(host.querySelector('.vamis-select__input'))
    await vi.waitFor(() =>
      expect(document.querySelectorAll('.vamis-select__associated-right-item')).toHaveLength(2),
    )
    expect(
      document.querySelectorAll(
        '.vamis-select__associated-right-item [data-slot="checkbox"]',
      ),
    ).toHaveLength(2)

    const items = document.querySelectorAll('.vamis-select__associated-right-item')
    click(items[0] as HTMLElement)
    const form = scoped.getComponentByName('associatedMultipleForm') as {
      getData?: () => Record<string, unknown>
    }
    await vi.waitFor(() => expect(form.getData?.().heroes).toBe('a'))
    click(items[1] as HTMLElement)
    await vi.waitFor(() => expect(form.getData?.().heroes).toBe('a,b'))
    expect(
      document.querySelectorAll(
        '.vamis-select__associated-right-item [data-slot="checkbox"][data-state="checked"]',
      ),
    ).toHaveLength(2)
  })

  it('shows associated guidance before a left option is selected', async () => {
    const { host } = mount({
      type: 'page',
      body: {
        type: 'form',
        actions: [],
        body: {
          type: 'select',
          name: 'hero',
          label: '英雄',
          selectMode: 'associated',
          leftOptions: [{ label: '法师', value: 'mage' }],
          options: [
            {
              ref: 'mage',
              children: [{ label: 'A', value: 'a' }],
            },
          ],
        },
      },
    })

    await nextTick()
    click(host.querySelector('.vamis-select__input'))
    await vi.waitFor(() =>
      expect(document.querySelector('.vamis-select__associated-right')?.textContent).toContain(
        '请选择左侧数据',
      ),
    )
  })

  it('shows an associated config error when the selected ref has no option', async () => {
    const { host } = mount({
      type: 'page',
      body: {
        type: 'form',
        actions: [],
        body: {
          type: 'select',
          name: 'hero',
          label: '英雄',
          selectMode: 'associated',
          leftDefaultValue: 'missing',
          leftOptions: [{ label: '法师', value: 'missing' }],
          options: [],
        },
      },
    })

    await nextTick()
    click(host.querySelector('.vamis-select__input'))
    await vi.waitFor(() =>
      expect(document.querySelector('.vamis-select__associated-right')?.textContent).toContain(
        '配置错误，选项无法与左侧选项对应',
      ),
    )
  })

  it('resets the associated left branch to its default after reopening', async () => {
    const { host } = mount({
      type: 'page',
      body: {
        type: 'form',
        actions: [],
        body: {
          type: 'select',
          name: 'hero',
          label: '英雄',
          selectMode: 'associated',
          leftMode: 'list',
          leftDefaultValue: 'mage',
          leftOptions: [
            { label: '法师', value: 'mage' },
            { label: '战士', value: 'warrior' },
          ],
          options: [
            {
              ref: 'mage',
              children: [{ label: 'A', value: 'a' }],
            },
            {
              ref: 'warrior',
              children: [{ label: 'B', value: 'b' }],
            },
          ],
        },
      },
    })

    await nextTick()
    click(host.querySelector('.vamis-select__input'))
    await vi.waitFor(() =>
      expect(document.querySelector('.vamis-select__associated')).toBeTruthy(),
    )
    click(
      [...document.querySelectorAll('.vamis-select__associated-left-item')].find(
        (item) => item.textContent?.trim() === '战士',
      ) as HTMLElement,
    )
    await vi.waitFor(() =>
      expect(document.querySelector('.vamis-select__associated-right-item')).toBeTruthy(),
    )
    click(document.querySelector('.vamis-select__associated-right-item') as HTMLElement)
    await vi.waitFor(() =>
      expect(document.querySelector('.vamis-select__associated')).toBeFalsy(),
    )

    click(host.querySelector('.vamis-select__input'))
    await vi.waitFor(() =>
      expect(document.querySelector('.vamis-select__associated-right')?.textContent).toContain('A'),
    )
    expect(
      [...document.querySelectorAll('.vamis-select__associated-left-item.is-active')].map(
        (item) => item.textContent?.trim(),
      ),
    ).toEqual(['法师'])
  })

  it('clears the associated left branch on reopening without a default', async () => {
    const { host } = mount({
      type: 'page',
      body: {
        type: 'form',
        actions: [],
        body: {
          type: 'select',
          name: 'hero',
          label: '英雄',
          selectMode: 'associated',
          leftMode: 'tree',
          leftOptions: [
            {
              label: '总公司',
              children: [
                { label: '法师', value: 'mage' },
                { label: '战士', value: 'warrior' },
              ],
            },
          ],
          options: [
            {
              ref: 'mage',
              children: [{ label: 'A', value: 'a' }],
            },
            {
              ref: 'warrior',
              children: [{ label: 'B', value: 'b' }],
            },
          ],
        },
      },
    })

    await nextTick()
    click(host.querySelector('.vamis-select__input'))
    await vi.waitFor(() =>
      expect(document.querySelector('.vamis-select__associated')).toBeTruthy(),
    )
    let warrior: HTMLElement | undefined
    await vi.waitFor(() => {
      warrior = [
        ...document.querySelectorAll<HTMLElement>(
          '.vamis-select__associated-left .vamis-tree__text',
        ),
      ].find((item) => item.textContent?.trim() === '战士')
      expect(warrior).toBeTruthy()
    })
    click(warrior || null)
    await vi.waitFor(() =>
      expect(document.querySelector('.vamis-select__associated-right-item')).toBeTruthy(),
    )
    click(document.querySelector('.vamis-select__associated-left .vamis-tree__arrow'))
    await nextTick()
    await vi.waitFor(() =>
      expect(
        [...document.querySelectorAll('.vamis-select__associated-left .vamis-tree__text')]
          .some((item) => item.textContent?.trim() === '战士'),
      ).toBe(false),
    )
    click(document.querySelector('.vamis-select__associated-right-item') as HTMLElement)
    await vi.waitFor(() =>
      expect(document.querySelector('.vamis-select__associated')).toBeFalsy(),
    )

    click(host.querySelector('.vamis-select__input'))
    await vi.waitFor(() =>
      expect(document.querySelector('.vamis-select__associated-right')?.textContent).toContain(
        '请选择左侧数据',
      ),
    )
    expect(
      [...document.querySelectorAll('.vamis-select__associated-left .vamis-tree__text')].map(
        (item) => item.textContent?.trim(),
      ),
    ).toEqual(['总公司', '法师', '战士'])
  })

  it('renders an associated left tree without writing the outer value', async () => {
    const { host, scoped } = mount({
      type: 'page',
      body: {
        type: 'form',
        name: 'associatedTreeForm',
        actions: [],
        body: {
          type: 'select',
          name: 'hero',
          label: '英雄',
          selectMode: 'associated',
          leftMode: 'tree',
          leftOptions: [
            {
              label: '阵营',
              children: [
                { label: '法师', value: 'mage' },
                { label: '战士', value: 'warrior' },
              ],
            },
          ],
          options: [
            {
              ref: 'mage',
              children: [{ label: 'A', value: 'a' }],
            },
            {
              ref: 'warrior',
              children: [{ label: 'B', value: 'b' }],
            },
          ],
        },
      },
    })

    await nextTick()
    click(host.querySelector('.vamis-select__input'))
    await vi.waitFor(() =>
      expect(document.querySelector('.vamis-select__associated-left .vamis-tree')).toBeTruthy(),
    )
    expect(
      document.querySelectorAll('.vamis-select__associated-left .vamis-tree__node-icon').length,
    ).toBeGreaterThan(0)

    const form = scoped.getComponentByName('associatedTreeForm') as {
      getData?: () => Record<string, unknown>
    }
    expect(form?.getData?.()?.hero).toBeUndefined()

    click(
      [...document.querySelectorAll('.vamis-select__associated-left .vamis-tree__content')].find(
        (item) => item.textContent?.trim() === '法师',
      ) as HTMLElement,
    )
    await vi.waitFor(() =>
      expect(document.querySelector('.vamis-select__associated-right')?.textContent).toContain('A'),
    )
    expect(form?.getData?.()?.hero).toBeUndefined()
  })

  it('does not mark associated left groups active before selection', async () => {
    const { host } = mount({
      type: 'page',
      body: {
        type: 'form',
        actions: [],
        body: {
          type: 'select',
          name: 'hero',
          label: '英雄',
          selectMode: 'associated',
          leftMode: 'tree',
          leftOptions: [
            {
              label: '阵营',
              children: [{ label: '法师', value: 'mage' }],
            },
          ],
          options: [
            {
              ref: 'mage',
              children: [{ label: 'A', value: 'a' }],
            },
          ],
        },
      },
    })

    await nextTick()
    click(host.querySelector('.vamis-select__input'))
    await vi.waitFor(() =>
      expect(document.querySelector('.vamis-select__associated-left .vamis-tree')).toBeTruthy(),
    )
    expect(
      document.querySelectorAll('.vamis-select__associated-left .vamis-tree__label.is-checked'),
    ).toHaveLength(0)
  })

  it('keeps sibling expansion state when collapsing associated tree groups', async () => {
    const { host } = mount({
      type: 'page',
      body: {
        type: 'form',
        actions: [],
        body: {
          type: 'select',
          name: 'hero',
          label: '英雄',
          selectMode: 'associated',
          leftMode: 'tree',
          leftOptions: [
            {
              label: '法师',
              children: [{ label: '诸葛亮', value: 'zhugeliang' }],
            },
            {
              label: '战士',
              children: [{ label: '曹操', value: 'caocao' }],
            },
          ],
          options: [
            { ref: 'zhugeliang', children: [] },
            { ref: 'caocao', children: [] },
          ],
        },
      },
    })

    await nextTick()
    click(host.querySelector('.vamis-select__input'))
    await vi.waitFor(() =>
      expect(document.querySelector('.vamis-select__associated-left .vamis-tree')).toBeTruthy(),
    )

    const arrows = () => [
      ...document.querySelectorAll(
        '.vamis-select__associated-left .vamis-tree__item:not(.is-child) .vamis-tree__arrow-icon',
      ),
    ]
    click(arrows()[0]?.parentElement as HTMLElement)
    await nextTick()
    expect(arrows()[0]?.classList.contains('is-folded')).toBe(true)
    expect(arrows()[1]?.classList.contains('is-folded')).toBe(false)

    click(arrows()[1]?.parentElement as HTMLElement)
    await nextTick()
    expect(arrows()[0]?.classList.contains('is-folded')).toBe(true)
    expect(arrows()[1]?.classList.contains('is-folded')).toBe(true)
  })

  it('keeps deferred associated left-tree children after loading', async () => {
    const fetcher = vi.fn(async () => ({
      status: 0,
      msg: '',
      data: { options: [{ label: '子部门', value: 'child' }] },
    }))
    const { host } = mount(
      {
        type: 'page',
        body: {
          type: 'form',
          actions: [],
          body: {
            type: 'select',
            name: 'dept',
            label: '部门',
            selectMode: 'associated',
            leftMode: 'tree',
            deferApi: '/api/defer',
            leftOptions: [
              {
                label: '部门',
                children: [{ label: '待加载', value: 'dept', defer: true }],
              },
            ],
            options: [{ ref: 'dept', children: [] }],
          },
        },
      },
      { fetcher },
    )

    await nextTick()
    click(host.querySelector('.vamis-select__input'))
    await vi.waitFor(() =>
      expect(document.querySelector('.vamis-select__associated-left .vamis-tree')).toBeTruthy(),
    )
    click(treeItem('待加载')?.querySelector('.vamis-tree__arrow') || null)
    await vi.waitFor(() =>
      expect(
        [...document.querySelectorAll('.vamis-select__associated-left .vamis-tree__text')].some(
          (item) => item.textContent?.trim() === '子部门',
        ),
      ).toBe(true),
    )
  })

  it('keeps deferred associated right-tree children after loading', async () => {
    const fetcher = vi.fn(async () => ({
      status: 0,
      msg: '',
      data: { options: [{ label: '子项', value: 'child' }] },
    }))
    const { host } = mount(
      {
        type: 'page',
        body: {
          type: 'form',
          actions: [],
          body: {
            type: 'select',
            name: 'dept',
            label: '部门',
            selectMode: 'associated',
            leftMode: 'list',
            rightMode: 'tree',
            deferApi: '/api/defer',
            leftDefaultValue: 'dept',
            leftOptions: [{ label: '部门', value: 'dept' }],
            options: [
              {
                ref: 'dept',
                children: [{ label: '待加载', value: 'parent', defer: true }],
              },
            ],
          },
        },
      },
      { fetcher },
    )

    await nextTick()
    click(host.querySelector('.vamis-select__input'))
    await vi.waitFor(() =>
      expect(document.querySelector('.vamis-select__associated-right .vamis-tree')).toBeTruthy(),
    )
    click(document.querySelector('.vamis-select__associated-right .vamis-tree__arrow') as HTMLElement)
    await vi.waitFor(() =>
      expect(
        [...document.querySelectorAll('.vamis-select__associated-right .vamis-tree__text')].some(
          (item) => item.textContent?.trim() === '子项',
        ),
      ).toBe(true),
    )
  })

  it('loads a deferred associated right list from the selected left ref', async () => {
    const fetcher = vi.fn(async (api: { url?: string }) => {
      expect(api.url).toContain('/api/defer')
      return {
        status: 0,
        msg: '',
        data: { options: [{ label: '用户 A', value: 'user-a' }] },
      }
    })
    const { host } = mount(
      {
        type: 'page',
        body: {
          type: 'form',
          actions: [],
          body: {
            type: 'select',
            name: 'users',
            label: '人员',
            selectMode: 'associated',
            leftMode: 'list',
            deferApi: '/api/defer',
            leftOptions: [{ label: '部门 A', value: 'dep-a' }],
            options: [{ ref: 'dep-a', defer: true }],
          },
        },
      },
      { fetcher },
    )

    await nextTick()
    click(host.querySelector('.vamis-select__input'))
    await vi.waitFor(() =>
      expect(document.querySelector('.vamis-select__associated')).toBeTruthy(),
    )
    click(document.querySelector('.vamis-select__associated-left-item') as HTMLElement)

    await vi.waitFor(() =>
      expect(
        [...document.querySelectorAll('.vamis-select__associated-right-item')].some(
          (item) => item.textContent?.trim() === '用户 A',
        ),
      ).toBe(true),
    )
    expect(fetcher).toHaveBeenCalledTimes(1)
  })

  it('loads personnel from associated source and deferred right list', async () => {
    const fetcher = vi.fn(async (api: { url?: string }) => {
      if (api.url?.includes('departUser')) {
        return {
          status: 0,
          msg: '',
          data: {
            options: [
              {
                leftOptions: [
                  {
                    label: '总公司',
                    value: 1,
                    defer: true,
                  },
                ],
                children: [{ ref: 1, defer: true }],
              },
            ],
          },
        }
      }
      return {
        status: 0,
        msg: '',
        data: { options: [{ label: '用户 1', value: 'user1' }] },
      }
    })
    const { host } = mount(
      {
        type: 'page',
        body: {
          type: 'form',
          actions: [],
          body: {
            type: 'select',
            name: 'users',
            label: '人员',
            multiple: true,
            searchable: true,
            selectMode: 'associated',
            leftMode: 'tree',
            source: '/api/mock2/form/departUser',
            deferApi: '/api/mock2/form/defer?ref=${ref}&dep=${value}',
          },
        },
      },
      { fetcher },
    )

    await nextTick()
    click(host.querySelector('.vamis-select__input'))
    await vi.waitFor(() =>
      expect(document.querySelector('.vamis-select__associated-left')?.textContent).toContain(
        '总公司',
      ),
    )
    click(
      [...document.querySelectorAll('.vamis-select__associated-left .vamis-tree__content')].find(
        (item) => item.textContent?.trim() === '总公司',
      ) as HTMLElement,
    )
    await vi.waitFor(() =>
      expect(
        [...document.querySelectorAll('.vamis-select__associated-right-item')].some(
          (item) => item.textContent?.trim() === '用户 1',
        ),
      ).toBe(true),
    )
    expect(fetcher).toHaveBeenCalled()
  })

  it('loads personnel for every department branch in the associated tree', async () => {
    const calls: string[] = []
    const usersByRef: Record<string, Array<{ label: string; value: string }>> = {
      '1': [
        { label: '用户 1', value: 'user1' },
        { label: '用户 2', value: 'user2' },
      ],
      '2': [
        { label: '用户 a', value: 'usera' },
        { label: '用户 b', value: 'userb' },
      ],
      '3': [
        { label: '用户 x', value: 'userx' },
        { label: '用户 y', value: 'usery' },
      ],
      '4': [
        { label: '用户 I', value: 'useri' },
        { label: '用户 II', value: 'userii' },
      ],
      '5': [
        { label: '用户一', value: 'useryi' },
        { label: '用户二', value: 'userer' },
      ],
      '6': [
        { label: '用户k', value: 'userk' },
        { label: '用户j', value: 'userj' },
      ],
    }
    const departmentsByValue: Record<string, Array<{
      label: string
      value: number
      defer?: boolean
    }>> = {
      '1': [
        { label: '部门 A', value: 2 },
        { label: '部门 B', value: 3, defer: true },
        { label: '部门 C', value: 4 },
      ],
      '3': [
        { label: '子部门1', value: 5 },
        { label: '子部门2', value: 6 },
      ],
    }
    const fetcher = vi.fn(async (api: { url?: string }) => {
      const raw = api.url || ''
      calls.push(raw)
      const url = new URL(raw, 'http://localhost')
      const ref = url.searchParams.get('ref')
      const dep = url.searchParams.get('dep')
      if (ref) {
        return {
          status: 0,
          msg: '',
          data: { options: usersByRef[ref] || [] },
        }
      }
      if (dep) {
        return {
          status: 0,
          msg: '',
          data: { options: departmentsByValue[dep] || [] },
        }
      }
      return {
        status: 0,
        msg: '',
        data: {
          options: [
            {
              leftOptions: [{ label: '总公司', value: 1, defer: true }],
              children: Object.keys(usersByRef).map((value) => ({
                ref: Number(value),
                defer: true,
              })),
            },
          ],
        },
      }
    })
    const { host, scoped } = mount(
      {
        type: 'page',
        body: {
          type: 'form',
          name: 'associated-branch-form',
          actions: [],
          body: {
            type: 'select',
            name: 'users',
            label: '人员',
            multiple: true,
            searchable: true,
            selectMode: 'associated',
            leftMode: 'tree',
            source: '/api/departUser',
            deferApi: '/api/departUser?ref=${ref}&dep=${value}',
          },
        },
      },
      { fetcher },
    )

    await nextTick()
    click(host.querySelector('.vamis-select__input'))
    const leftTree = await vi.waitFor(() => {
      const tree = document.querySelector('.vamis-select__associated-left .vamis-tree')
      expect(tree).toBeTruthy()
      return tree as HTMLElement
    })

    const clickLeft = async (label: string) => {
      const item = await vi.waitFor(() => {
        const found = [...leftTree.querySelectorAll('.vamis-tree__content')].find(
          (node) => node.textContent?.trim() === label,
        )
        expect(found, `missing left node: ${label}`).toBeTruthy()
        return found as HTMLElement
      })
      click(item)
      await nextTick()
    }
    const expectUsers = async (labels: string[]) => {
      await vi.waitFor(() => {
        const actual = [...document.querySelectorAll('.vamis-select__associated-right-item')].map(
          (node) => node.textContent?.trim(),
        )
        expect(actual).toEqual(labels)
      })
    }
    const expectRef = async (ref: number) => {
      await vi.waitFor(() =>
        expect(calls.some((url) => url.includes(`ref=${ref}`))).toBe(true),
      )
    }
    const clickArrow = async (label: string) => {
      const row = await vi.waitFor(() => {
        const found = [...leftTree.querySelectorAll('.vamis-tree__item')].find(
          (node) => node.querySelector('.vamis-tree__text')?.textContent?.trim() === label,
        )
        expect(found).toBeTruthy()
        return found as HTMLElement
      })
      click(row.querySelector('.vamis-tree__arrow') as HTMLElement)
    }

    await clickLeft('总公司')
    await expectRef(1)
    await expectUsers(['用户 1', '用户 2'])

    await clickArrow('总公司')
    await vi.waitFor(() =>
      expect(leftTree.textContent).toContain('部门 A'),
    )
    await clickLeft('部门 A')
    await expectRef(2)
    await expectUsers(['用户 a', '用户 b'])

    await clickLeft('部门 B')
    await expectRef(3)
    await expectUsers(['用户 x', '用户 y'])
    await clickArrow('部门 B')
    await vi.waitFor(() =>
      expect(leftTree.textContent).toContain('子部门1'),
    )
    await clickLeft('部门 C')
    await expectRef(4)
    await expectUsers(['用户 I', '用户 II'])

    await clickLeft('子部门1')
    await expectRef(5)
    await expectUsers(['用户一', '用户二'])
    await clickLeft('子部门2')
    await expectRef(6)
    await expectUsers(['用户k', '用户j'])

    const users = document.querySelectorAll('.vamis-select__associated-right-item')
    click(users[0] as HTMLElement)
    const form = scoped.getComponentByName(
      'associated-branch-form',
    ) as { getData?: () => Record<string, unknown> }
    await vi.waitFor(() => expect(form.getData?.().users).toBe('userk'))
    click(users[1] as HTMLElement)
    await vi.waitFor(() => expect(form.getData?.().users).toBe('userk,userj'))
    await vi.waitFor(() =>
      expect(
        [...document.querySelectorAll('.vamis-select__chip-label')].map(
          (node) => node.textContent?.trim(),
        ),
      ).toEqual(expect.arrayContaining(['用户k', '用户j'])),
    )

    expect(calls.some((url) => url.includes('dep=1'))).toBe(true)
    expect(calls.some((url) => url.includes('dep=3'))).toBe(true)

    click(host.querySelector('.vamis-select__input'))
    await nextTick()
    click(host.querySelector('.vamis-select__input'))
    await vi.waitFor(() =>
      expect(document.querySelector('.vamis-select__associated-right')?.textContent).toContain(
        '请选择左侧数据',
      ),
    )
    expect(
      [...document.querySelectorAll('.vamis-select__associated-left .vamis-tree__text')].map(
        (item) => item.textContent?.trim(),
      ),
    ).toEqual(['总公司'])
  })

  it.each([
    ['table', '.vamis-select__associated-right .vamis-select__table tbody tr'],
    ['tree', '.vamis-select__associated-right .vamis-tree__content'],
    ['chained', '.vamis-select__associated-right .vamis-select__chained-item'],
  ])('writes a right value in associated %s mode', async (rightMode, selector) => {
    const { host, scoped } = mount({
      type: 'page',
      body: {
        type: 'form',
        name: `associated-${rightMode}-form`,
        actions: [],
        body: {
          type: 'select',
          name: 'hero',
          label: '英雄',
          selectMode: 'associated',
          leftMode: 'list',
          rightMode,
          leftDefaultValue: 'mage',
          leftOptions: [{ label: '法师', value: 'mage' }],
          options: [
            {
              ref: 'mage',
              children: [{ label: 'A', value: 'a' }],
            },
          ],
        },
      },
    })

    await nextTick()
    click(host.querySelector('.vamis-select__input'))
    await vi.waitFor(() =>
      expect(document.querySelector(selector)).toBeTruthy(),
    )
    click(document.querySelector(selector) as HTMLElement)

    const form = scoped.getComponentByName(`associated-${rightMode}-form`) as {
      getData?: () => Record<string, unknown>
    }
    await vi.waitFor(() => expect(form?.getData?.()?.hero).toBe('a'))
  })

  it('loads a deferred associated chained parent into the right pane', async () => {
    let resolveFetch!: (value: unknown) => void
    const fetcher = vi.fn(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve
        }),
    )
    const { host } = mount(
      {
        type: 'page',
        body: {
          type: 'form',
          actions: [],
          body: {
            type: 'select',
            name: 'hero',
            label: '英雄',
            selectMode: 'associated',
            leftMode: 'list',
            rightMode: 'chained',
            deferApi: '/api/defer',
            leftDefaultValue: 'mage',
            leftOptions: [{ label: '法师', value: 'mage' }],
            options: [
              {
                ref: 'mage',
                children: [{ label: '战士', value: 'war', defer: true }],
              },
            ],
          },
        },
      },
      { fetcher },
    )

    await nextTick()
    click(host.querySelector('.vamis-select__input'))
    await vi.waitFor(() =>
      expect(
        document.querySelector('.vamis-select__associated-right .vamis-select__chained-item'),
      ).toBeTruthy(),
    )
    const warrior = document.querySelector(
      '.vamis-select__associated-right .vamis-select__chained-item',
    ) as HTMLElement
    click(warrior)

    await vi.waitFor(() => expect(fetcher).toHaveBeenCalledTimes(1))
    expect(warrior.querySelector('.vamis-spinner')).toBeTruthy()
    resolveFetch({
      status: 0,
      msg: '',
      data: { options: [{ label: '曹操', value: 'caocao' }] },
    })
    await vi.waitFor(() =>
      expect(
        [...document.querySelectorAll(
          '.vamis-select__associated-right .vamis-select__chained-col',
        )][1]?.textContent,
      ).toContain('曹操'),
    )
  })

  it.each([
    [
      'table',
      '.vamis-select__associated-right .vamis-select__table thead [data-slot="checkbox"]',
    ],
    [
      'chained',
      '.vamis-select__associated-right .vamis-select__chained-checkall',
    ],
  ])('checks only the active associated branch in %s mode', async (rightMode, selector) => {
    const { host, scoped } = mount({
      type: 'page',
      body: {
        type: 'form',
        name: `associated-${rightMode}-checkall`,
        actions: [],
        body: {
          type: 'select',
          name: 'heroes',
          label: '英雄',
          multiple: true,
          checkAll: true,
          selectMode: 'associated',
          leftMode: 'list',
          rightMode,
          leftDefaultValue: 'mage',
          leftOptions: [
            { label: '法师', value: 'mage' },
            { label: '战士', value: 'warrior' },
          ],
          options: [
            {
              ref: 'mage',
              children: [
                { label: 'A', value: 'a' },
                { label: 'B', value: 'b' },
              ],
            },
            {
              ref: 'warrior',
              children: [{ label: 'C', value: 'c' }],
            },
          ],
        },
      },
    })

    await nextTick()
    click(host.querySelector('.vamis-select__input'))
    await vi.waitFor(() =>
      expect(document.querySelector(selector)).toBeTruthy(),
    )
    click(document.querySelector(selector) as HTMLElement)

    const form = scoped.getComponentByName(`associated-${rightMode}-checkall`) as {
      getData?: () => Record<string, unknown>
    }
    await vi.waitFor(() => expect(form?.getData?.()?.heroes).toBe('a,b'))
  })

  it('reads associated left options from source-shaped options', async () => {
    const { host, scoped } = mount({
      type: 'page',
      body: {
        type: 'form',
        name: 'associatedSourceForm',
        actions: [],
        body: {
          type: 'select',
          name: 'hero',
          label: '英雄',
          selectMode: 'associated',
          options: [
            {
              leftDefaultValue: 'mage',
              leftOptions: [
                { label: '法师', value: 'mage' },
                { label: '战士', value: 'warrior' },
              ],
              children: [
                {
                  ref: 'mage',
                  children: [{ label: 'A', value: 'a' }],
                },
                {
                  ref: 'warrior',
                  children: [{ label: 'B', value: 'b' }],
                },
              ],
            },
          ],
        },
      },
    })

    await nextTick()
    click(host.querySelector('.vamis-select__input'))
    await vi.waitFor(() =>
      expect(document.querySelector('.vamis-select__associated-right')?.textContent).toContain('A'),
    )
    click(
      [...document.querySelectorAll('.vamis-select__associated-right-item')][0] as HTMLElement,
    )

    const form = scoped.getComponentByName('associatedSourceForm') as {
      getData?: () => Record<string, unknown>
    }
    await vi.waitFor(() => expect(form?.getData?.()?.hero).toBe('a'))
  })

  it('refreshes associated source metadata and defaults on dependency change', async () => {
    let sourceLoads = 0
    const fetcher = vi.fn(async (api: { url?: string }) => {
      sourceLoads += 1
      const dep = new URL(api.url || '', 'http://localhost').searchParams.get('dep')
      return {
        status: 0,
        msg: '',
        data: {
          options: [
            dep === 'two'
              ? {
                  leftDefaultValue: 'two-left',
                  leftOptions: [{ label: '第二组', value: 'two-left' }],
                  children: [
                    {
                      ref: 'two-left',
                      children: [{ label: 'B', value: 'b' }],
                    },
                  ],
                }
              : {
                  leftDefaultValue: 'one-left',
                  leftOptions: [{ label: '第一组', value: 'one-left' }],
                  children: [
                    {
                      ref: 'one-left',
                      children: [{ label: 'A', value: 'a' }],
                    },
                  ],
                },
          ],
        },
      }
    })
    const { host, scoped } = mount(
      {
        type: 'page',
        body: {
          type: 'form',
          name: 'associatedLifecycleForm',
          data: { dep: 'one' },
          actions: [],
          body: {
            type: 'select',
            name: 'hero',
            label: '英雄',
            selectMode: 'associated',
            leftMode: 'list',
            source: '/api/associated?dep=${dep}',
          },
        },
      },
      { fetcher },
    )

    await nextTick()
    await vi.waitFor(() => expect(sourceLoads).toBe(1))
    const trigger = host.querySelector('.vamis-select__input') as HTMLElement
    click(trigger)
    await vi.waitFor(() =>
      expect(document.querySelector('.vamis-select__associated-right')?.textContent).toContain('A'),
    )
    expect(
      document.querySelector('.vamis-select__associated-left-item.is-active')?.textContent,
    ).toContain('第一组')
    click(trigger)
    await nextTick()

    const form = scoped.getComponentByName('associatedLifecycleForm') as {
      setValue?: (name: string, value: unknown) => void
    }
    form?.setValue?.('dep', 'two')
    await vi.waitFor(() => expect(sourceLoads).toBe(2))

    click(trigger)
    await vi.waitFor(() =>
      expect(document.querySelector('.vamis-select__associated-right')?.textContent).toContain('B'),
    )
    expect(
      [...document.querySelectorAll('.vamis-select__associated-left-item.is-active')].map(
        (item) => item.textContent?.trim(),
      ),
    ).toEqual(['第二组'])
    expect(document.body.textContent).not.toContain('第一组')
  })

  it('renders grouped children in associated list mode', async () => {
    const { host, scoped } = mount({
      type: 'page',
      body: {
        type: 'form',
        name: 'associatedGroupForm',
        actions: [],
        body: {
          type: 'select',
          name: 'hero',
          label: '英雄',
          selectMode: 'associated',
          leftMode: 'list',
          rightMode: 'list',
          leftDefaultValue: 'mage',
          leftOptions: [{ label: '法师', value: 'mage' }],
          options: [
            {
              ref: 'mage',
              children: [
                {
                  label: '分组',
                  children: [
                    { label: 'A', value: 'a' },
                    { label: 'B', value: 'b' },
                  ],
                },
              ],
            },
          ],
        },
      },
    })

    await nextTick()
    click(host.querySelector('.vamis-select__input'))
    await vi.waitFor(() =>
      expect(document.querySelector('.vamis-select__associated-right-group')?.textContent).toContain(
        '分组',
      ),
    )
    click(
      [...document.querySelectorAll('.vamis-select__associated-right-item')].find(
        (item) => item.textContent?.trim() === 'A',
      ) as HTMLElement,
    )

    const form = scoped.getComponentByName('associatedGroupForm') as {
      getData?: () => Record<string, unknown>
    }
    await vi.waitFor(() => expect(form?.getData?.()?.hero).toBe('a'))
  })

  it.each([
    {
      type: 'input-tree',
      extra: {},
      trigger: '',
      treeSelector: '.vamis-tree',
    },
    {
      type: 'tree-select',
      extra: {},
      trigger: '.vamis-tree-select .vamis-select__input',
      treeSelector: '.vamis-tree-select__popover .vamis-tree',
    },
    {
      type: 'select',
      extra: { selectMode: 'tree' },
      trigger: '.vamis-select__input',
      treeSelector: '.vamis-select__popover.is-tree .vamis-tree',
    },
  ])(
    'passes node data to $type itemActions and keeps row selection stopped',
    async ({ type, extra, trigger, treeSelector }) => {
      const notify = vi.fn()
      const { host, scoped } = mount(
        {
          type: 'page',
          body: {
            type: 'form',
            name: 'treeActionsForm',
            actions: [],
            body: {
              type,
              name: 'tree',
              label: '节点',
              ...extra,
              options: [
                {
                  label: '采购单',
                  value: 'order',
                  tag: '数据模型',
                },
              ],
              itemActions: [
                {
                  type: 'button',
                  label: '详情',
                  level: 'link',
                  size: 'xs',
                  onEvent: {
                    click: {
                      actions: [
                        {
                          actionType: 'toast',
                          args: { msg: '${label}:${tag}' },
                        },
                      ],
                    },
                  },
                },
              ],
            },
          },
        },
        { notify },
      )

      await nextTick()
      if (trigger) click(host.querySelector(trigger))
      const tree = await vi.waitFor(() => {
        const element = document.querySelector(treeSelector)
        expect(element).toBeTruthy()
        return element as HTMLElement
      })
      click(buttonWithText('详情', tree))
      await vi.waitFor(() =>
        expect(notify.mock.calls.map((call) => call[1])).toContain(
          '采购单:数据模型',
        ),
      )

      const form = scoped.getComponentByName('treeActionsForm') as {
        getData?: () => Record<string, unknown>
      }
      expect(form?.getData?.()?.tree).toBeUndefined()
    },
  )

  it('keeps associated right selections in the mobile draft until confirm', async () => {
    const { host, scoped } = mount(
      {
        type: 'page',
        body: {
          type: 'form',
          name: 'associatedMobileForm',
          actions: [],
          body: {
            type: 'select',
            name: 'hero',
            label: '英雄',
            selectMode: 'associated',
            leftMode: 'list',
            leftDefaultValue: 'mage',
            leftOptions: [{ label: '法师', value: 'mage' }],
            options: [
              {
                ref: 'mage',
                children: [{ label: 'A', value: 'a' }],
              },
            ],
          },
        },
      },
      { mobileUI: true },
    )

    await nextTick()
    click(host.querySelector('.vamis-select__input'))
    await vi.waitFor(() =>
      expect(document.querySelector('.vamis-popup .vamis-select__associated')).toBeTruthy(),
    )
    click(document.querySelector('.vamis-select__associated-left-item') as HTMLElement)
    expect(
      (scoped.getComponentByName('associatedMobileForm') as { getData?: () => Record<string, unknown> })
        ?.getData?.()?.hero,
    ).toBeUndefined()
    click(
      [...document.querySelectorAll('.vamis-select__associated-right-item')][0] as HTMLElement,
    )

    const form = scoped.getComponentByName('associatedMobileForm') as {
      getData?: () => Record<string, unknown>
    }
    expect(form?.getData?.()?.hero).toBeUndefined()

    click(document.querySelector('.vamis-popup__ok') as HTMLElement)
    await vi.waitFor(() => expect(form?.getData?.()?.hero).toBe('a'))
  })

  it('focuses the search input in searchable associated mode', async () => {
    const { host } = mount({
      type: 'page',
      body: {
        type: 'form',
        actions: [],
        body: {
          type: 'select',
          name: 'hero',
          label: '英雄',
          searchable: true,
          selectMode: 'associated',
          leftDefaultValue: 'mage',
          leftOptions: [{ label: '法师', value: 'mage' }],
          options: [
            {
              ref: 'mage',
              children: [{ label: 'A', value: 'a' }],
            },
          ],
        },
      },
    })

    await nextTick()
    click(host.querySelector('.vamis-select__input'))
    const search = await vi.waitFor(() => {
      const input = document.querySelector('.vamis-select__search-input')
      expect(input).toBeTruthy()
      return input as HTMLInputElement
    })
    await vi.waitFor(() => expect(document.activeElement).toBe(search), { timeout: 1000 })
  })

  it('renders Select chained mode and writes only a leaf selection', async () => {
    const { host, scoped } = mount({
      type: 'page',
      body: {
        type: 'form',
        name: 'chainedForm',
        actions: [],
        body: {
          type: 'select',
          name: 'hero',
          label: '英雄',
          searchable: true,
          selectMode: 'chained',
          options: [
            {
              label: '法师',
              children: [{ label: '诸葛亮', value: 'zhugeliang' }],
            },
            {
              label: '战士',
              children: [
                { label: '曹操', value: 'caocao' },
                { label: '钟无艳', value: 'zhongwuyan' },
              ],
            },
            {
              label: '打野',
              children: [{ label: '李白', value: 'libai' }],
            },
          ],
        },
      },
    })

    await nextTick()
    click(host.querySelector('.vamis-select__input'))
    await vi.waitFor(() =>
      expect(document.querySelector('.vamis-select__chained')).toBeTruthy(),
    )
    const initialBranches = [...document.querySelectorAll(
      '.vamis-select__chained-col:first-child .vamis-select__chained-item.is-active',
    )]
    expect(initialBranches).toHaveLength(1)
    expect(initialBranches[0]?.textContent).toContain('法师')
    expect(
      [...document.querySelectorAll('.vamis-select__chained-col')][1]?.textContent,
    ).toContain('诸葛亮')

    const form = scoped.getComponentByName('chainedForm') as {
      getData?: () => Record<string, unknown>
    }
    expect(form?.getData?.()?.hero).toBeUndefined()

    click(
      [...document.querySelectorAll('.vamis-select__chained-col')][0]?.querySelectorAll(
        '.vamis-select__chained-item',
      )[1] as HTMLElement,
    )
    await nextTick()
    const warriorBranches = [...document.querySelectorAll(
      '.vamis-select__chained-col:first-child .vamis-select__chained-item.is-active',
    )]
    expect(warriorBranches).toHaveLength(1)
    expect(warriorBranches[0]?.textContent).toContain('战士')
    expect(
      [...document.querySelectorAll('.vamis-select__chained-col')][1]?.textContent,
    ).toContain('曹操')
    expect(
      [...document.querySelectorAll('.vamis-select__chained-col')][1]?.textContent,
    ).toContain('钟无艳')

    click(
      [...document.querySelectorAll('.vamis-select__chained-col')][1]?.querySelector(
        '.vamis-select__chained-item',
      ) as HTMLElement,
    )

    await vi.waitFor(() => expect(form?.getData?.()?.hero).toBe('caocao'))
    expect(host.querySelector('.vamis-select__single')?.textContent).toBe('曹操')
  })

  it('renders chained subTitle, placeholder and option classes', async () => {
    const { host, scoped } = mount({
      type: 'page',
      body: {
        type: 'form',
        name: 'chainedPresentationForm',
        actions: [],
        body: {
          type: 'select',
          name: 'hero',
          label: '英雄',
          multiple: true,
          checkAll: true,
          selectMode: 'chained',
          optionClassName: 'chained-option',
          options: [
            {
              label: '战士',
              value: 'warrior',
              className: 'chained-warrior',
              subTitle: '战士英雄',
              placeholder: '暂无战士英雄',
              children: [],
            },
            {
              label: '法师',
              value: 'mage',
              children: [{ label: '诸葛亮', value: 'zhugeliang' }],
            },
          ],
        },
      },
    })

    await nextTick()
    click(host.querySelector('.vamis-select__input'))
    await vi.waitFor(() =>
      expect(document.querySelectorAll('.vamis-select__chained-col')).toHaveLength(2),
    )

    const columns = document.querySelectorAll('.vamis-select__chained-col')
    const warrior = columns[0]?.querySelector('.vamis-select__chained-item')
    expect(warrior?.classList.contains('chained-option')).toBe(true)
    expect(warrior?.classList.contains('chained-warrior')).toBe(true)
    expect(
      columns[1]?.querySelector('.vamis-select__chained-sub-title')?.textContent,
    ).toBe('战士英雄')
    expect(
      columns[1]?.querySelector('.vamis-select__chained-placeholder')?.textContent,
    ).toBe('暂无战士英雄')

    click(warrior as HTMLElement)
    await nextTick()
    const form = scoped.getComponentByName('chainedPresentationForm') as {
      getData?: () => Record<string, unknown>
    }
    expect(form?.getData?.()?.hero).toBeUndefined()

    click(document.querySelector('.vamis-select__chained-checkall') as HTMLElement)
    await vi.waitFor(() =>
      expect(form?.getData?.()?.hero).toBe('zhugeliang'),
    )
  })

  it('defers only the clicked Select chained parent', async () => {
    let resolveFetch!: (value: unknown) => void
    const fetcher = vi.fn(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve
        }),
    )
    const { host } = mount(
      {
        type: 'page',
        body: {
          type: 'form',
          actions: [],
          body: {
            type: 'select',
            name: 'hero',
            label: '英雄',
            selectMode: 'chained',
            deferApi: '/api/defer',
            options: [
              { label: '战士', value: 'war', defer: true },
              { label: '法师', value: 'mage', defer: true },
            ],
          },
        },
      },
      { fetcher },
    )

    await nextTick()
    click(host.querySelector('.vamis-select__input'))
    await vi.waitFor(() =>
      expect(document.querySelectorAll('.vamis-select__chained-col')).toHaveLength(2),
    )

    const firstColumn = [...document.querySelectorAll('.vamis-select__chained-col')][0]
    const warrior = [...(firstColumn?.querySelectorAll('.vamis-select__chained-item') || [])]
      .find((item) => item.textContent?.includes('战士')) as HTMLElement
    const mage = [...(firstColumn?.querySelectorAll('.vamis-select__chained-item') || [])]
      .find((item) => item.textContent?.includes('法师')) as HTMLElement

    click(warrior)
    await vi.waitFor(() => expect(fetcher).toHaveBeenCalledTimes(1))
    expect(fetcher.mock.calls[0]?.[1]).toMatchObject({ label: '战士', value: 'war' })
    expect(warrior.querySelector('.vamis-spinner')).toBeTruthy()
    expect(mage.querySelector('.vamis-spinner')).toBeNull()

    resolveFetch({
      status: 0,
      msg: '',
      data: { options: [{ label: '曹操', value: 'caocao' }] },
    })
    await vi.waitFor(() =>
      expect(
        [...document.querySelectorAll('.vamis-select__chained-col')][1]?.textContent,
      ).toContain('曹操'),
    )

    click(warrior)
    await nextTick()
    expect(fetcher).toHaveBeenCalledTimes(1)
  })

  it('virtualizes each long Select chained column and keeps later branches selectable', async () => {
    const { host } = mount({
      type: 'page',
      body: {
        type: 'form',
        actions: [],
        body: {
          type: 'select',
          name: 'hero',
          label: '英雄',
          selectMode: 'chained',
          virtualThreshold: 4,
          itemHeight: 20,
          options: Array.from({ length: 60 }, (_, index) => ({
            label: `分组 ${index + 1}`,
            children: [
              {
                label: `成员 ${index + 1}`,
                value: `member-${index + 1}`,
              },
            ],
          })),
        },
      },
    })

    await nextTick()
    click(host.querySelector('.vamis-select__input'))
    await vi.waitFor(() =>
      expect(document.querySelector('.vamis-select__chained-col.is-virtual')).toBeTruthy(),
    )

    const firstColumn = document.querySelector(
      '.vamis-select__chained-col',
    ) as HTMLElement
    expect(
      firstColumn.querySelectorAll('.vamis-select__chained-item').length,
    ).toBeLessThan(60)
    expect(firstColumn.querySelector('.vamis-select__chained-virtual-pad')).toBeTruthy()

    firstColumn.scrollTop = 700
    firstColumn.dispatchEvent(new Event('scroll'))
    await vi.waitFor(() => expect(firstColumn.textContent).toContain('分组 40'))
    click(
      [...firstColumn.querySelectorAll('.vamis-select__chained-item')].find((item) =>
        item.textContent?.includes('分组 40'),
      ) as HTMLElement,
    )
    await vi.waitFor(() =>
      expect(
        [...document.querySelectorAll('.vamis-select__chained-col')][1]?.textContent,
      ).toContain('成员 40'),
    )
  })

  it('checks leaf values in multiple Select chained mode', async () => {
    const { host, scoped } = mount({
      type: 'page',
      body: {
        type: 'form',
        name: 'chainedMultiForm',
        actions: [],
        body: {
          type: 'select',
          name: 'heroes',
          label: '英雄',
          multiple: true,
          checkAll: true,
          selectMode: 'chained',
          options: [
            {
              label: '法师',
              value: 'mage',
              children: [{ label: '诸葛亮', value: 'zhugeliang' }],
            },
            {
              label: '战士',
              value: 'warrior',
              children: [{ label: '曹操', value: 'caocao' }],
            },
          ],
        },
      },
    })

    await nextTick()
    click(host.querySelector('.vamis-select__input'))
    await vi.waitFor(() =>
      expect(document.querySelector('.vamis-select__chained')).toBeTruthy(),
    )
    click(document.querySelector('.vamis-select__chained-checkall') as HTMLElement)

    const form = scoped.getComponentByName('chainedMultiForm') as {
      getData?: () => Record<string, unknown>
    }
    await vi.waitFor(() =>
      expect(form?.getData?.()?.heroes).toBe('zhugeliang,caocao'),
    )
  })

  it('focuses the search input after opening a searchable Select', async () => {
    const { host } = mount({
      type: 'page',
      body: {
        type: 'form',
        actions: [],
        body: {
          type: 'select',
          name: 'hero',
          label: '英雄',
          searchable: true,
          options: [
            { label: '诸葛亮', value: 'zhugeliang' },
            { label: '曹操', value: 'caocao' },
          ],
        },
      },
    })

    await nextTick()
    click(host.querySelector('.vamis-select__input'))
    const search = await vi.waitFor(() => {
      const input = document.querySelector('.vamis-select__search-input')
      expect(input).toBeTruthy()
      return input as HTMLInputElement
    })

    await vi.waitFor(() => expect(document.activeElement).toBe(search), { timeout: 1000 })
  })

  it('updates popover min width after the trigger resizes', async () => {
    const { host } = mount({
      type: 'page',
      body: {
        type: 'form',
        actions: [],
        body: {
          type: 'select',
          name: 'hero',
          label: '英雄',
          options: [{ label: '诸葛亮', value: 'zhugeliang' }],
        },
      },
    })

    let width = 240
    const root = host.querySelector('.vamis-select') as HTMLElement
    Object.defineProperty(root, 'offsetWidth', {
      configurable: true,
      get: () => width,
    })

    await nextTick()
    click(host.querySelector('.vamis-select__input'))
    await vi.waitFor(() => expect(document.querySelector('.vamis-select__popover')).toBeTruthy())
    expect((document.querySelector('.vamis-select__popover') as HTMLElement).style.minWidth).toBe(
      '240px',
    )

    width = 360
    window.dispatchEvent(new Event('resize'))
    await nextTick()
    expect((document.querySelector('.vamis-select__popover') as HTMLElement).style.minWidth).toBe(
      '360px',
    )
  })

  it('focuses the search input after opening a searchable chained Select', async () => {
    const { host } = mount({
      type: 'page',
      body: {
        type: 'form',
        actions: [],
        body: {
          type: 'select',
          name: 'hero',
          label: '英雄',
          searchable: true,
          selectMode: 'chained',
          options: [
            {
              label: '法师',
              children: [{ label: '诸葛亮', value: 'zhugeliang' }],
            },
          ],
        },
      },
    })

    await nextTick()
    click(host.querySelector('.vamis-select__input'))
    const search = await vi.waitFor(() => {
      const input = document.querySelector('.vamis-select__search-input')
      expect(input).toBeTruthy()
      return input as HTMLInputElement
    })

    await vi.waitFor(() => expect(document.activeElement).toBe(search), { timeout: 1000 })
  })

  it('focuses the search input in a searchable mobile chained Select', async () => {
    const { host } = mount(
      {
        type: 'page',
        body: {
          type: 'form',
          actions: [],
          body: {
            type: 'select',
            name: 'hero',
            label: '英雄',
            searchable: true,
            selectMode: 'chained',
            options: [
              {
                label: '法师',
                children: [{ label: '诸葛亮', value: 'zhugeliang' }],
              },
            ],
          },
        },
      },
      { mobileUI: true },
    )

    await nextTick()
    click(host.querySelector('.vamis-select__input'))
    const search = await vi.waitFor(() => {
      const input = document.querySelector('.vamis-popup .vamis-select__search-input')
      expect(input).toBeTruthy()
      return input as HTMLInputElement
    })

    await vi.waitFor(() => expect(document.activeElement).toBe(search), { timeout: 1000 })
  })

  it('restores focus after a searchable chained search input blurs', async () => {
    const { host } = mount({
      type: 'page',
      body: {
        type: 'form',
        actions: [],
        body: {
          type: 'select',
          name: 'hero',
          label: '英雄',
          searchable: true,
          selectMode: 'chained',
          options: [
            {
              label: '法师',
              children: [{ label: '诸葛亮', value: 'zhugeliang' }],
            },
          ],
        },
      },
    })

    await nextTick()
    click(host.querySelector('.vamis-select__input'))
    const search = await vi.waitFor(() => {
      const input = document.querySelector('.vamis-select__search-input')
      expect(input).toBeTruthy()
      return input as HTMLInputElement
    })
    await vi.waitFor(() => expect(document.activeElement).toBe(search), { timeout: 1000 })

    search.blur()
    await vi.waitFor(() => expect(document.activeElement).toBe(search), { timeout: 1000 })
  })

  it('focuses the search input in autoComplete mode', async () => {
    const { host } = mount({
      type: 'page',
      body: {
        type: 'form',
        actions: [],
        body: {
          type: 'select',
          name: 'hero',
          label: '英雄',
          autoComplete: true,
          options: [{ label: '诸葛亮', value: 'zhugeliang' }],
        },
      },
    })

    await nextTick()
    click(host.querySelector('.vamis-select__input'))
    const search = await vi.waitFor(() => {
      const input = document.querySelector('.vamis-select__search-input')
      expect(input).toBeTruthy()
      return input as HTMLInputElement
    })

    await vi.waitFor(() => expect(document.activeElement).toBe(search), { timeout: 1000 })
    search.blur()
    await vi.waitFor(() => expect(document.activeElement).toBe(search), { timeout: 1000 })
  })

  it('does not focus a searchApi-only Select search input', async () => {
    const { host } = mount(
      {
        type: 'page',
        body: {
          type: 'form',
          actions: [],
          body: {
            type: 'select',
            name: 'hero',
            label: '英雄',
            searchApi: '/api/search',
            options: [{ label: '诸葛亮', value: 'zhugeliang' }],
          },
        },
      },
      {
        fetcher: async () => ({
          status: 0,
          msg: '',
          data: { options: [{ label: '诸葛亮', value: 'zhugeliang' }] },
        }),
      },
    )

    await nextTick()
    click(host.querySelector('.vamis-select__input'))
    const search = await vi.waitFor(() => {
      const input = document.querySelector('.vamis-select__search-input')
      expect(input).toBeTruthy()
      return input as HTMLInputElement
    })

    await new Promise((resolve) => setTimeout(resolve, 650))
    expect(document.activeElement).not.toBe(search)
  })

  it('uses the Select placeholder for grouped search', async () => {
    const { host } = mount({
      type: 'page',
      body: {
        type: 'form',
        actions: [],
        body: {
          type: 'select',
          name: 'hero',
          label: '英雄',
          searchable: true,
          selectMode: 'group',
          options: [
            { label: '法师', children: [{ label: '诸葛亮', value: 'zhugeliang' }] },
            { label: '战士', children: [{ label: '曹操', value: 'caocao' }] },
          ],
        },
      },
    })

    await nextTick()
    click(host.querySelector('.vamis-select__input'))
    await vi.waitFor(() => expect(document.querySelector('.vamis-select__group')).toBeTruthy())

    expect(
      document.querySelector('.vamis-select__group-label')?.classList.contains(
        'vamis-select__item-label',
      ),
    ).toBe(true)
    expect(
      document.querySelector('.vamis-select__item--child .vamis-select__item-label'),
    ).toBeTruthy()
    expect(
      (document.querySelector('.vamis-select__search-input') as HTMLInputElement | null)?.placeholder,
    ).toBe('请选择')
  })

  it('renders Select tree mode and writes a leaf selection', async () => {
    const { host, scoped } = mount({
      type: 'page',
      body: {
        type: 'form',
        name: 'treeForm',
        actions: [],
        body: {
          type: 'select',
          name: 'hero',
          label: '英雄',
          searchable: true,
          selectMode: 'tree',
          options: [
            { label: '法师', children: [{ label: '诸葛亮', value: 'zhugeliang' }] },
            {
              label: '战士',
              children: [
                { label: '曹操', value: 'caocao' },
                { label: '钟无艳', value: 'zhongwuyan' },
              ],
            },
          ],
        },
      },
    })

    await nextTick()
    click(host.querySelector('.vamis-select__input'))
    await vi.waitFor(() => expect(document.querySelector('.vamis-tree')).toBeTruthy())

    expect(document.querySelector('.vamis-select__group')).toBeNull()
    expect(document.querySelector('.vamis-select__popover')?.classList.contains('is-tree')).toBe(
      true,
    )
    expect(document.querySelector('.vamis-select__search--box')).toBeTruthy()
    expect(
      (document.querySelector('.vamis-select__search-input') as HTMLInputElement | null)?.placeholder,
    ).toBe('请选择')
    const form = scoped.getComponentByName('treeForm') as { getData?: () => Record<string, unknown> }
    click(treeItem('法师')?.querySelector('.vamis-tree__content') || null)
    await nextTick()
    expect(form?.getData?.()?.hero).toBeUndefined()

    click(treeItem('曹操')?.querySelector('.vamis-tree__content') || null)
    await nextTick()

    expect(form).toBeTruthy()
    await vi.waitFor(() => expect(form?.getData?.()?.hero).toBe('caocao'))
    expect(host.querySelector('.vamis-select__single')?.textContent).toBe('曹操')
  })

  it('selects only tree leaves by default in multiple mode', async () => {
    const { host, scoped } = mount({
      type: 'page',
      body: {
        type: 'form',
        name: 'leafTreeForm',
        actions: [],
        body: {
          type: 'select',
          name: 'heroes',
          label: '英雄',
          multiple: true,
          selectMode: 'tree',
          options: [
            {
              label: '战士',
              value: 'war',
              children: [
                { label: '曹操', value: 'caocao' },
                { label: '钟无艳', value: 'zhongwuyan' },
              ],
            },
          ],
        },
      },
    })

    await nextTick()
    click(host.querySelector('.vamis-select__input'))
    await vi.waitFor(() => expect(document.querySelector('.vamis-tree')).toBeTruthy())
    click(treeItem('战士')?.querySelector('.vamis-tree__content') || null)

    const form = scoped.getComponentByName('leafTreeForm') as { getData?: () => Record<string, unknown> }
    await vi.waitFor(() =>
      expect(form?.getData?.()?.heroes).toBe('caocao,zhongwuyan'),
    )
  })

  it('keeps parent and child values when onlyChildren is disabled', async () => {
    const { host, scoped } = mount({
      type: 'page',
      body: {
        type: 'form',
        name: 'cascadeTreeForm',
        actions: [],
        body: {
          type: 'select',
          name: 'heroes',
          label: '英雄',
          multiple: true,
          onlyChildren: false,
          selectMode: 'tree',
          options: [
            {
              label: '战士',
              value: 'war',
              children: [
                { label: '曹操', value: 'caocao' },
                { label: '钟无艳', value: 'zhongwuyan' },
              ],
            },
          ],
        },
      },
    })

    await nextTick()
    click(host.querySelector('.vamis-select__input'))
    await vi.waitFor(() => expect(document.querySelector('.vamis-tree')).toBeTruthy())
    click(treeItem('战士')?.querySelector('.vamis-tree__content') || null)

    const form = scoped.getComponentByName('cascadeTreeForm') as { getData?: () => Record<string, unknown> }
    await vi.waitFor(() =>
      expect(form?.getData?.()?.heroes).toBe('war,caocao,zhongwuyan'),
    )
  })

  it('derives onlyChildren from the full tree while searching', async () => {
    const { host, scoped } = mount({
      type: 'page',
      body: {
        type: 'form',
        name: 'filteredTreeForm',
        actions: [],
        body: {
          type: 'select',
          name: 'heroes',
          label: '英雄',
          multiple: true,
          searchable: true,
          selectMode: 'tree',
          options: [
            {
              label: '法师',
              value: 'mage',
              children: [{ label: '诸葛亮', value: 'zhugeliang' }],
            },
            { label: '战士', value: 'war', defer: true },
          ],
        },
      },
    })

    await nextTick()
    click(host.querySelector('.vamis-select__input'))
    await vi.waitFor(() => expect(treeItem('法师')).toBeTruthy())
    const search = document.querySelector('.vamis-select__search-input') as HTMLInputElement
    search.value = '法师'
    search.dispatchEvent(new Event('input', { bubbles: true }))
    await vi.waitFor(() => expect(treeTexts()).not.toContain('战士'))
    click(treeItem('法师')?.querySelector('.vamis-tree__content') || null)

    const form = scoped.getComponentByName('filteredTreeForm') as { getData?: () => Record<string, unknown> }
    await vi.waitFor(() =>
      expect(form?.getData?.()?.heroes).toBe('mage,zhugeliang'),
    )
  })

  it('honors initiallyOpen false in Select tree mode', async () => {
    const { host } = mount({
      type: 'page',
      body: {
        type: 'form',
        actions: [],
        body: {
          type: 'select',
          name: 'hero',
          label: '英雄',
          selectMode: 'tree',
          initiallyOpen: false,
          options: [
            {
              label: '战士',
              children: [{ label: '曹操', value: 'caocao' }],
            },
          ],
        },
      },
    })

    await nextTick()
    click(host.querySelector('.vamis-select__input'))
    await vi.waitFor(() => expect(treeTexts()).toContain('战士'))
    expect(treeTexts()).not.toContain('曹操')
  })

  it('checks all leaf nodes in multiple tree mode', async () => {
    const { host, scoped } = mount({
      type: 'page',
      body: {
        type: 'form',
        name: 'checkAllTreeForm',
        actions: [],
        body: {
          type: 'select',
          name: 'heroes',
          label: '英雄',
          multiple: true,
          checkAll: true,
          selectMode: 'tree',
          options: [
            {
              label: '战士',
              value: 'war',
              children: [
                { label: '曹操', value: 'caocao' },
                { label: '钟无艳', value: 'zhongwuyan' },
              ],
            },
            {
              label: '法师',
              value: 'mage',
              children: [{ label: '诸葛亮', value: 'zhugeliang' }],
            },
          ],
        },
      },
    })

    await nextTick()
    click(host.querySelector('.vamis-select__input'))
    await vi.waitFor(() => expect(document.querySelector('.vamis-select__tree-checkall')).toBeTruthy())
    click(treeItem('曹操')?.querySelector('.vamis-tree__content') || null)
    await vi.waitFor(() =>
      expect(document.querySelector('.vamis-select__tree-checkall .vamis-select__check.is-partial')).toBeTruthy(),
    )
    click(document.querySelector('.vamis-select__tree-checkall'))

    const form = scoped.getComponentByName('checkAllTreeForm') as { getData?: () => Record<string, unknown> }
    await vi.waitFor(() =>
      expect(form?.getData?.()?.heroes).toBe('caocao,zhongwuyan,zhugeliang'),
    )
  })

  it('shows the Amis partial state on ordinary multiple check-all', async () => {
    const { host } = mount({
      type: 'page',
      body: {
        type: 'form',
        actions: [],
        body: {
          type: 'select',
          name: 'heroes',
          label: '英雄',
          multiple: true,
          checkAll: true,
          options: [
            { label: '曹操', value: 'caocao' },
            { label: '诸葛亮', value: 'zhugeliang' },
          ],
        },
      },
    })

    await nextTick()
    click(host.querySelector('.vamis-select__input'))
    await vi.waitFor(() =>
      expect(document.querySelector('.vamis-select__checkall')).toBeTruthy(),
    )
    click(
      [...document.querySelectorAll('.vamis-select__list .vamis-select__item')]
        .find((item) => item.textContent?.includes('曹操')) as HTMLElement,
    )
    await vi.waitFor(() =>
      expect(
        document.querySelector(
          '.vamis-select__checkall .vamis-select__check.is-partial',
        ),
      ).toBeTruthy(),
    )
  })

  it('keeps mobile tree selection in the draft until confirm', async () => {
    const { host, scoped } = mount(
      {
        type: 'page',
        body: {
          type: 'form',
          name: 'mobileTreeForm',
          actions: [],
          body: {
            type: 'select',
            name: 'hero',
            label: '英雄',
            selectMode: 'tree',
            options: [
              {
                label: '战士',
                value: 'war',
                children: [{ label: '曹操', value: 'caocao' }],
              },
            ],
          },
        },
      },
      { mobileUI: true },
    )

    await nextTick()
    click(host.querySelector('.vamis-select__input'))
    await vi.waitFor(() => expect(document.querySelector('.vamis-popup .vamis-tree')).toBeTruthy())
    click(treeItem('曹操')?.querySelector('.vamis-tree__content') || null)
    await nextTick()
    expect(treeItem('曹操')?.querySelector('.vamis-tree__content')?.classList.contains('is-checked')).toBe(true)
    expect(treeItem('战士')?.querySelector('.vamis-tree__content')?.classList.contains('is-checked')).toBe(false)

    const form = scoped.getComponentByName('mobileTreeForm') as { getData?: () => Record<string, unknown> }
    expect(form?.getData?.()?.hero).toBeUndefined()
    click(document.querySelector('.vamis-popup__ok'))
    await vi.waitFor(() => expect(form?.getData?.()?.hero).toBe('caocao'))
  })

  it('keeps custom valueField and joinValues false in tree mode', async () => {
    const { host, scoped } = mount({
      type: 'page',
      body: {
        type: 'form',
        name: 'objectTreeForm',
        actions: [],
        body: {
          type: 'select',
          name: 'hero',
          label: '英雄',
          selectMode: 'tree',
          joinValues: false,
          valueField: 'id',
          options: [
            {
              label: '战士',
              id: 'war',
              children: [{ label: '曹操', id: 'caocao' }],
            },
          ],
        },
      },
    })

    await nextTick()
    click(host.querySelector('.vamis-select__input'))
    await vi.waitFor(() => expect(document.querySelector('.vamis-tree')).toBeTruthy())
    click(treeItem('曹操')?.querySelector('.vamis-tree__content') || null)

    const form = scoped.getComponentByName('objectTreeForm') as { getData?: () => Record<string, unknown> }
    await vi.waitFor(() =>
      expect(form?.getData?.()?.hero).toMatchObject({ label: '曹操', id: 'caocao' }),
    )
  })

  it('keeps searchApi result metadata in tree mode', async () => {
    const fetcher = vi.fn(async () => ({
      status: 0,
      msg: '',
      data: {
        options: [{ label: '搜索曹操', id: 'search-caocao' }],
      },
    }))
    const { host, scoped } = mount(
      {
        type: 'page',
        body: {
          type: 'form',
          name: 'searchTreeForm',
          actions: [],
          body: {
            type: 'select',
            name: 'hero',
            label: '英雄',
            selectMode: 'tree',
            searchable: true,
            searchApi: '/api/search',
            joinValues: false,
            valueField: 'id',
            options: [],
          },
        },
      },
      { fetcher },
    )

    await nextTick()
    click(host.querySelector('.vamis-select__input'))
    await vi.waitFor(() => expect(document.querySelector('.vamis-select__search-input')).toBeTruthy())
    const search = document.querySelector('.vamis-select__search-input') as HTMLInputElement
    search.value = '曹操'
    search.dispatchEvent(new Event('input', { bubbles: true }))
    await vi.waitFor(() => expect(treeItem('搜索曹操')).toBeTruthy())
    click(treeItem('搜索曹操')?.querySelector('.vamis-tree__content') || null)

    const form = scoped.getComponentByName('searchTreeForm') as { getData?: () => Record<string, unknown> }
    await vi.waitFor(() =>
      expect(form?.getData?.()?.hero).toMatchObject({
        label: '搜索曹操',
        id: 'search-caocao',
      }),
    )
  })

  it('uses searchResultMode to switch the search result pane', async () => {
    const fetcher = vi.fn(async () => ({
      status: 0,
      msg: '',
      data: {
        options: [{ label: '搜索结果', value: 'search-result' }],
      },
    }))
    const { host, scoped } = mount(
      {
        type: 'page',
        body: {
          type: 'form',
          name: 'searchResultForm',
          actions: [],
          body: {
            type: 'select',
            name: 'hero',
            label: '英雄',
            selectMode: 'group',
            searchResultMode: 'table',
            searchable: true,
            searchApi: '/api/search',
            columns: [{ name: 'label', label: '英雄' }],
            searchResultColumns: [{ name: 'label', label: '搜索结果列' }],
            options: [],
          },
        },
      },
      { fetcher },
    )

    await nextTick()
    click(host.querySelector('.vamis-select__input'))
    const search = await vi.waitFor(() => {
      const input = document.querySelector('.vamis-select__search-input')
      expect(input).toBeTruthy()
      return input as HTMLInputElement
    })
    search.value = '搜索'
    search.dispatchEvent(new Event('input', { bubbles: true }))

    await vi.waitFor(() => expect(document.querySelector('.vamis-select__table')).toBeTruthy())
    expect(document.querySelector('.vamis-select__table thead')?.textContent).toContain('搜索结果列')
    click(document.querySelector('.vamis-select__table tbody tr') as HTMLElement)

    const form = scoped.getComponentByName('searchResultForm') as {
      getData?: () => Record<string, unknown>
    }
    await vi.waitFor(() => expect(form?.getData?.()?.hero).toBe('search-result'))
  })

  it('restores the base pane when a search result mode is cleared', async () => {
    const fetcher = vi.fn(async () => ({
      status: 0,
      msg: '',
      data: {
        options: [{ label: '搜索结果', value: 'search-result' }],
      },
    }))
    const { host } = mount(
      {
        type: 'page',
        body: {
          type: 'form',
          actions: [],
          body: {
            type: 'select',
            name: 'hero',
            label: '英雄',
            multiple: true,
            selectMode: 'group',
            searchResultMode: 'table',
            searchable: true,
            searchApi: '/api/search',
            columns: [{ name: 'label', label: '英雄' }],
            options: [
              { label: '分组', children: [{ label: '项', value: 'item' }] },
            ],
          },
        },
      },
      { fetcher },
    )

    await nextTick()
    click(host.querySelector('.vamis-select__input'))
    const search = await vi.waitFor(() => {
      const input = document.querySelector('.vamis-select__search-input')
      expect(input).toBeTruthy()
      return input as HTMLInputElement
    })
    search.value = '搜索'
    search.dispatchEvent(new Event('input', { bubbles: true }))
    await vi.waitFor(() => expect(document.querySelector('.vamis-select__table')).toBeTruthy())

    search.value = ''
    search.dispatchEvent(new Event('input', { bubbles: true }))
    await vi.waitFor(() => expect(document.querySelector('.vamis-select__table')).toBeFalsy())
    await vi.waitFor(() => expect(document.querySelector('.vamis-select__group')).toBeTruthy())
  })

  it.each([
    ['tree', '.vamis-tree__content'],
    ['chained', '.vamis-select__chained-item'],
  ])('switches search results to %s pane', async (searchResultMode, selector) => {
    const fetcher = vi.fn(async () => ({
      status: 0,
      msg: '',
      data: {
        options: [
          {
            label: '搜索结果组',
            children: [{ label: '搜索结果', value: 'search-result' }],
          },
        ],
      },
    }))
    const { host, scoped } = mount(
      {
        type: 'page',
        body: {
          type: 'form',
          name: `search-result-${searchResultMode}-form`,
          actions: [],
          body: {
            type: 'select',
            name: 'hero',
            label: '英雄',
            selectMode: 'group',
            searchResultMode,
            searchable: true,
            searchApi: '/api/search',
            options: [],
          },
        },
      },
      { fetcher },
    )

    await nextTick()
    click(host.querySelector('.vamis-select__input'))
    const search = await vi.waitFor(() => {
      const input = document.querySelector('.vamis-select__search-input')
      expect(input).toBeTruthy()
      return input as HTMLInputElement
    })
    search.value = '搜索'
    search.dispatchEvent(new Event('input', { bubbles: true }))
    await vi.waitFor(() =>
      expect(
        [...document.querySelectorAll(selector)].find(
          (item) => item.textContent?.trim() === '搜索结果',
        ),
      ).toBeTruthy(),
    )
    click(
      [...document.querySelectorAll(selector)].find(
        (item) => item.textContent?.trim() === '搜索结果',
      ) as HTMLElement,
    )

    const form = scoped.getComponentByName(`search-result-${searchResultMode}-form`) as {
      getData?: () => Record<string, unknown>
    }
    await vi.waitFor(() => expect(form?.getData?.()?.hero).toBe('search-result'))
  })

  it('defers only the expanded tree node', async () => {
    let resolveFetch!: (value: unknown) => void
    const fetcher = vi.fn(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve
        }),
    )
    const { host } = mount(
      {
        type: 'page',
        body: {
          type: 'form',
          actions: [],
          body: {
            type: 'select',
            name: 'hero',
            label: '英雄',
            multiple: true,
            selectMode: 'tree',
            deferApi: '/api/defer',
            options: [
              { label: '战士', defer: true },
              { label: '法师', defer: true },
            ],
          },
        },
      },
      { fetcher },
    )

    await nextTick()
    click(host.querySelector('.vamis-select__input'))
    await vi.waitFor(() => expect(treeItem('战士')).toBeTruthy())
    click(treeItem('战士')?.querySelector('.vamis-tree__arrow') || null)

    await vi.waitFor(() => expect(fetcher).toHaveBeenCalledTimes(1))
    expect(treeItem('战士')?.querySelector('.vamis-spinner')).toBeTruthy()
    expect(treeItem('法师')?.querySelector('.vamis-spinner')).toBeNull()
    resolveFetch({ status: 0, msg: '', data: { options: [] } })
  })

  it('defers Select tree nodes and emits deferLoadFinished once', async () => {
    let resolveFetch!: (value: unknown) => void
    const fetcher = vi.fn(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve
        }),
    )
    const notify = vi.fn()
    const { host } = mount(
      {
        type: 'page',
        body: {
          type: 'form',
          actions: [],
          data: { hero: 'caocao' },
          body: {
            type: 'select',
            name: 'hero',
            label: '英雄',
            multiple: true,
            searchable: true,
            selectMode: 'tree',
            deferApi: '/api/defer',
            onEvent: {
              deferLoadFinished: {
                actions: [{ actionType: 'toast', args: { msg: '${event.data.value}' } }],
              },
            },
            options: [
              { label: '法师', children: [{ label: '诸葛亮', value: 'zhugeliang' }] },
              { label: '战士', value: 'war', defer: true },
            ],
          },
        },
      },
      { fetcher, notify },
    )

    await nextTick()
    click(host.querySelector('.vamis-select__input'))
    await vi.waitFor(() => expect(treeItem('战士')).toBeTruthy())
    const search = document.querySelector('.vamis-select__search-input') as HTMLInputElement
    search.value = '战士'
    search.dispatchEvent(new Event('input', { bubbles: true }))
    await nextTick()
    click(treeItem('战士')?.querySelector('.vamis-tree__arrow') || null)

    await vi.waitFor(() => expect(fetcher).toHaveBeenCalledTimes(1))
    expect(fetcher.mock.calls[0]?.[1]).toMatchObject({ label: '战士', value: 'war' })
    expect(document.querySelector('.vamis-select__tree-pane .vamis-spinner')).toBeTruthy()

    resolveFetch({
      status: 0,
      msg: '',
      data: { options: [{ label: '曹操', value: 'caocao' }] },
    })
    await vi.waitFor(() => expect(treeTexts()).toContain('曹操'))
    expect(notify.mock.calls[0]?.slice(0, 2)).toEqual(['info', 'caocao'])
    search.value = ''
    search.dispatchEvent(new Event('input', { bubbles: true }))
    await vi.waitFor(() => expect(treeTexts()).toContain('法师'))

    click(treeItem('战士')?.querySelector('.vamis-tree__arrow') || null)
    click(treeItem('战士')?.querySelector('.vamis-tree__arrow') || null)
    expect(fetcher).toHaveBeenCalledTimes(1)
  })

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

  it('keeps the creatable action outside the scrolling option list', async () => {
    const { host } = mount({
      type: 'form',
      actions: [],
      body: {
        type: 'select',
        name: 'choice',
        label: '选项',
        searchable: true,
        creatable: true,
        options: [
          { label: 'A', value: 'a' },
          { label: 'B', value: 'b' },
        ],
      },
    })

    await nextTick()
    click(host.querySelector('.vamis-select__input'))
    await vi.waitFor(() =>
      expect(document.querySelector('.vamis-select__popover.is-creatable')).toBeTruthy(),
    )

    const popover = document.querySelector('.vamis-select__popover') as HTMLElement
    const search = popover.querySelector(':scope > .vamis-select__search')
    const create = popover.querySelector(':scope > .vamis-select__create')
    const list = popover.querySelector(':scope > .vamis-select__list')
    expect(search).toBeTruthy()
    expect(create).toBeTruthy()
    expect(list).toBeTruthy()
    expect(list?.contains(create as Node)).toBe(false)
    expect(
      search?.compareDocumentPosition(create as Node) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
    expect(
      create?.compareDocumentPosition(list as Node) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  })

  it('keeps the creatable action in the mobile fixed header', async () => {
    const { host } = mount(
      {
        type: 'form',
        actions: [],
        body: {
          type: 'select',
          name: 'choice',
          label: '选项',
          searchable: true,
          creatable: true,
          options: [
            { label: 'A', value: 'a' },
            { label: 'B', value: 'b' },
          ],
        },
      },
      { mobileUI: true },
    )

    await nextTick()
    click(host.querySelector('.vamis-select__input'))
    await vi.waitFor(() =>
      expect(
        document.querySelector('.vamis-popup .vamis-select__popover.is-creatable'),
      ).toBeTruthy(),
    )

    const popover = document.querySelector(
      '.vamis-popup .vamis-select__popover',
    ) as HTMLElement
    const create = popover.querySelector(':scope > .vamis-select__create')
    const list = popover.querySelector(':scope > .vamis-select__list')
    expect(create).toBeTruthy()
    expect(list).toBeTruthy()
    expect(list?.contains(create as Node)).toBe(false)
    expect(
      create?.compareDocumentPosition(list as Node) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
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

describe('Tree expansion state', () => {
  const arrowItems = (rootSelector: string) => [
    ...document.querySelectorAll(
      `${rootSelector} .vamis-tree__item:not(.is-child) .vamis-tree__arrow`,
    ),
  ]

  it('keeps InputTree sibling expansion state', async () => {
    mount({
      type: 'page',
      body: {
        type: 'input-tree',
        name: 'tree',
        options: [
          {
            label: '法师',
            children: [{ label: '诸葛亮', value: 'zhugeliang' }],
          },
          {
            label: '战士',
            children: [{ label: '曹操', value: 'caocao' }],
          },
        ],
      },
    })

    await nextTick()
    click(arrowItems('.vamis-input-tree__control')[0] as HTMLElement)
    await nextTick()
    expect(arrowItems('.vamis-input-tree__control')[0]?.querySelector('.is-folded')).toBeTruthy()
    expect(arrowItems('.vamis-input-tree__control')[1]?.querySelector('.is-folded')).toBeNull()

    click(arrowItems('.vamis-input-tree__control')[1] as HTMLElement)
    await nextTick()
    expect(arrowItems('.vamis-input-tree__control')[0]?.querySelector('.is-folded')).toBeTruthy()
    expect(arrowItems('.vamis-input-tree__control')[1]?.querySelector('.is-folded')).toBeTruthy()
  })

  it('keeps TreeSelect sibling expansion state', async () => {
    const { host } = mount({
      type: 'form',
      actions: [],
      body: {
        type: 'tree-select',
        name: 'tree',
        options: [
          {
            label: '法师',
            children: [{ label: '诸葛亮', value: 'zhugeliang' }],
          },
          {
            label: '战士',
            children: [{ label: '曹操', value: 'caocao' }],
          },
        ],
      },
    })

    await nextTick()
    click(host.querySelector('.vamis-tree-select .vamis-select__input'))
    await vi.waitFor(() =>
      expect(document.querySelector('.vamis-tree-select__popover .vamis-tree')).toBeTruthy(),
    )

    click(arrowItems('.vamis-tree-select__popover')[0] as HTMLElement)
    await nextTick()
    expect(arrowItems('.vamis-tree-select__popover')[0]?.querySelector('.is-folded')).toBeTruthy()
    expect(arrowItems('.vamis-tree-select__popover')[1]?.querySelector('.is-folded')).toBeNull()

    click(arrowItems('.vamis-tree-select__popover')[1] as HTMLElement)
    await nextTick()
    expect(arrowItems('.vamis-tree-select__popover')[0]?.querySelector('.is-folded')).toBeTruthy()
    expect(arrowItems('.vamis-tree-select__popover')[1]?.querySelector('.is-folded')).toBeTruthy()
  })
})

describe('Tree node path mode', () => {
  const pathOptions = [
    {
      label: 'Root',
      value: 'root',
      id: 'root',
      children: [
        {
          label: 'Branch',
          value: 'branch',
          id: 'branch',
          children: [
            { label: 'Leaf A', value: 'leaf-a', id: 'leaf-a', meta: 'alpha' },
            { label: 'Leaf B', value: 'leaf-b', id: 'leaf-b', meta: 'beta' },
          ],
        },
      ],
    },
  ]

  it('writes the full node path and keeps the selected leaf fields', async () => {
    const { host, scoped } = mount({
      type: 'page',
      body: {
        type: 'form',
        name: 'treePathForm',
        actions: [],
        data: { tree: 'root/branch/leaf-a' },
        body: {
          type: 'input-tree',
          name: 'tree',
          valueField: 'id',
          enableNodePath: true,
          pathSeparator: '/',
          joinValues: false,
          extractValue: false,
          options: pathOptions,
        },
      },
    })

    await nextTick()
    expect(
      treeItem('Leaf A')
        ?.querySelector('.vamis-tree__content')
        ?.classList.contains('is-checked'),
    ).toBe(true)

    click(treeItem('Leaf B')?.querySelector('.vamis-tree__content') || null)
    const form = scoped.getComponentByName('treePathForm') as {
      getData?: () => Record<string, unknown>
    }
    await vi.waitFor(() =>
      expect(form?.getData?.()?.tree).toEqual({
        label: 'Root/Branch/Leaf B',
        value: 'leaf-b',
        id: 'root/branch/leaf-b',
        meta: 'beta',
      }),
    )
    expect(host.querySelector('.vamis-tree')).toBeTruthy()
  })

  it('loads and expands only the deferred parents named by a node path', async () => {
    const loadedValues: string[] = []
    const fetcher = vi.fn(async (api: { url?: string }) => {
      const value = new URL(String(api.url), 'http://localhost').searchParams.get('node') || ''
      loadedValues.push(value)
      return {
        status: 0,
        msg: '',
        data: {
          options:
            value === 'root'
              ? [
                  { label: 'Branch', value: 'branch', defer: true },
                  { label: 'Other', value: 'other', defer: true },
                ]
              : [
                  { label: 'Leaf A', value: 'leaf-a' },
                  { label: 'Leaf B', value: 'leaf-b' },
                ],
        },
      }
    })
    mount({
      type: 'page',
      body: {
        type: 'form',
        name: 'deferredTreePathForm',
        actions: [],
        data: { tree: 'root/branch/leaf-a,root/branch/leaf-b' },
        body: {
          type: 'input-tree',
          name: 'tree',
          enableNodePath: true,
          pathSeparator: '/',
          deferApi: '/api/tree-path?node=${value}',
          options: [
            { label: 'Root', value: 'root', defer: true },
            { label: 'Sibling', value: 'sibling', defer: true },
          ],
        },
      },
    }, { fetcher })

    await vi.waitFor(() => expect(loadedValues).toEqual(['root', 'branch']))
    await vi.waitFor(() => {
      expect(treeTexts()).toContain('Leaf A')
      expect(treeTexts()).toContain('Leaf B')
    })
    expect(
      treeItem('Other')
        ?.querySelector('.vamis-tree__arrow-icon')
        ?.classList.contains('is-folded'),
    ).toBe(true)
  })

  it('shows the complete TreeSelect ancestor label for a path value', async () => {
    const { host } = mount({
      type: 'form',
      actions: [],
      data: { tree: 'root/branch/leaf-a' },
      body: {
        type: 'tree-select',
        name: 'tree',
        enableNodePath: true,
        pathSeparator: '/',
        options: pathOptions,
      },
    })

    await nextTick()
    expect(
      host.querySelector('.vamis-tree-select .vamis-select__single')?.textContent?.trim(),
    ).toBe('Root / Branch / Leaf A')

    click(host.querySelector('.vamis-tree-select .vamis-select__input'))
    await vi.waitFor(() =>
      expect(document.querySelector('.vamis-tree-select__popover .vamis-tree')).toBeTruthy(),
    )
    expect(
      treeItem('Leaf A')
        ?.querySelector('.vamis-tree__content')
        ?.classList.contains('is-checked'),
    ).toBe(true)
  })
})

describe('TreeSelect search and popover alignment', () => {
  it('renders optionsPlaceholder when the tree has no nodes', async () => {
    const { host } = mount({
      type: 'form',
      actions: [],
      body: {
        type: 'tree-select',
        name: 'tree',
        optionsPlaceholder: '没有可选节点',
        options: [],
      },
    })

    await nextTick()
    click(host.querySelector('.vamis-tree-select .vamis-select__input'))
    await vi.waitFor(() =>
      expect(
        document.querySelector('.vamis-tree-select__popover .vamis-tree__placeholder')
          ?.textContent,
      ).toBe('没有可选节点'),
    )
  })

  it('filters from an inline trigger input instead of a popover SearchBox', async () => {
    const { host } = mount({
      type: 'form',
      actions: [],
      body: {
        type: 'tree-select',
        name: 'tree',
        searchable: true,
        options: [
          {
            label: 'Folder A',
            value: 'folder-a',
            children: [
              { label: 'file A', value: 'file-a' },
              { label: 'file B', value: 'file-b' },
            ],
          },
          { label: 'file C', value: 'file-c' },
        ],
      },
    })

    await nextTick()
    const input = host.querySelector(
      '.vamis-tree-select .vamis-select__input input',
    ) as HTMLInputElement | null
    expect(input).toBeTruthy()
    expect(input?.placeholder).toBe('请选择')

    click(input)
    await vi.waitFor(() =>
      expect(document.querySelector('.vamis-tree-select__popover .vamis-tree')).toBeTruthy(),
    )
    expect(
      document.querySelector('.vamis-tree-select__popover .vamis-search-box'),
    ).toBeNull()

    input!.value = 'file A'
    input!.dispatchEvent(new Event('input', { bubbles: true }))
    await vi.waitFor(() => {
      expect(treeTexts()).toContain('Folder A')
      expect(treeTexts()).toContain('file A')
      expect(treeTexts()).not.toContain('file B')
      expect(treeTexts()).not.toContain('file C')
    })
  })

  it('keeps the TreeSelect popover width synced to its root on resize', async () => {
    const { host } = mount({
      type: 'form',
      actions: [],
      body: {
        type: 'tree-select',
        name: 'tree',
        options: [{ label: 'A', value: 'a' }],
      },
    })

    let width = 240
    const root = host.querySelector('.vamis-tree-select') as HTMLElement
    Object.defineProperty(root, 'offsetWidth', {
      configurable: true,
      get: () => width,
    })

    await nextTick()
    click(host.querySelector('.vamis-tree-select .vamis-select__input'))
    await vi.waitFor(() => expect(document.querySelector('.vamis-tree-select__popover')).toBeTruthy())
    expect(
      (document.querySelector('.vamis-tree-select__popover') as HTMLElement).style.minWidth,
    ).toBe('240px')

    width = 360
    window.dispatchEvent(new Event('resize'))
    await nextTick()
    expect(
      (document.querySelector('.vamis-tree-select__popover') as HTMLElement).style.minWidth,
    ).toBe('360px')
  })
})

describe('TreeSelect remote source and menuTpl', () => {
  it('loads source options and replaces them from autoComplete', async () => {
    const fetcher = vi.fn(async (api: { url?: string }) => {
      const url = String(api.url)
      const term = new URL(url, 'http://localhost').searchParams.get('term') || ''
      return {
        status: 0,
        msg: '',
        data: {
          options: term
            ? [{ label: 'node-1', value: 'node-1' }]
            : [
                { label: 'node-0', value: 'node-0' },
                { label: 'node-1', value: 'node-1' },
              ],
        },
      }
    })
    const { host } = mount({
      type: 'form',
      actions: [],
      body: {
        type: 'tree-select',
        name: 'tree',
        autoComplete: '/api/mock2/tree/search?term=$term',
        source: '/api/mock2/tree/search',
      },
    }, { fetcher })

    await vi.waitFor(() => expect(fetcher).toHaveBeenCalledTimes(1))
    const trigger = host.querySelector('.vamis-tree-select .vamis-select__input')
    click(trigger)
    await vi.waitFor(() => expect(treeTexts()).toEqual(['node-0', 'node-1']))

    const input = host.querySelector(
      '.vamis-tree-select .vamis-select__input input',
    ) as HTMLInputElement
    input.value = 'node-1'
    input.dispatchEvent(new Event('input', { bubbles: true }))

    await vi.waitFor(() => expect(fetcher).toHaveBeenCalledTimes(2))
    expect(String(fetcher.mock.calls[1]?.[0]?.url)).toContain('term=node-1')
    await vi.waitFor(() => expect(treeTexts()).toEqual(['node-1']))
  })

  it('renders menuTpl inside TreeSelect nodes while keeping row selection', async () => {
    const { host, scoped } = mount({
      type: 'form',
      name: 'treeMenuForm',
      actions: [],
      body: {
        type: 'tree-select',
        name: 'tree',
        menuTpl: '<div class="custom-tree-node"><span>${label}</span><b>${tag}</b></div>',
        iconField: 'icon',
        options: [
          { label: '采购单', value: 'order', tag: '数据模型', icon: 'fa fa-database' },
          { label: '采购人', value: 'name', tag: '字符串', icon: 'fa fa-check' },
        ],
      },
    })

    await nextTick()
    click(host.querySelector('.vamis-tree-select .vamis-select__input'))
    await vi.waitFor(() =>
      expect(document.querySelector('.vamis-tree-select__popover .custom-tree-node')).toBeTruthy(),
    )
    expect(
      document.querySelector('.vamis-tree-select__popover .custom-tree-node')?.textContent,
    ).toContain('数据模型')
    expect(document.querySelector('.vamis-tree-select__popover .fa-database')).toBeTruthy()

    click(document.querySelector('.vamis-tree-select__popover .custom-tree-node'))
    const form = scoped.getComponentByName('treeMenuForm') as {
      getData?: () => Record<string, unknown>
    }
    await vi.waitFor(() => expect(form?.getData?.()?.tree).toBe('order'))
  })
})

describe('TreeSelect events and actions', () => {
  it('emits itemClick before applying node behavior', async () => {
    const notify = vi.fn()
    const { host, scoped } = mount(
      {
        type: 'form',
        name: 'treeItemClickForm',
        actions: [],
        body: {
          type: 'tree-select',
          name: 'tree',
          nodeBehavior: [],
          onEvent: {
            itemClick: {
              actions: [
                { actionType: 'toast', args: { msg: '${event.data.item.label}' } },
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
    click(host.querySelector('.vamis-tree-select .vamis-select__input'))
    await vi.waitFor(() =>
      expect(document.querySelector('.vamis-tree-select__popover .vamis-tree')).toBeTruthy(),
    )
    click(treeItem('A')?.querySelector('.vamis-tree__content') || null)

    await vi.waitFor(() => expect(notify.mock.calls.map((call) => call[1])).toContain('A'))
    const form = scoped.getComponentByName('treeItemClickForm') as {
      getData?: () => Record<string, unknown>
    }
    expect(form?.getData?.()?.tree).toBeUndefined()
  })

  it('emits staticItemClick with the original option in static mode', async () => {
    const notify = vi.fn()
    const { host } = mount(
      {
        type: 'form',
        actions: [],
        body: {
          type: 'tree-select',
          name: 'tree',
          static: true,
          multiple: true,
          value: 'a,b',
          onEvent: {
            staticItemClick: {
              actions: [
                { actionType: 'toast', args: { msg: '${event.data.item.value}' } },
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
    const item = host.querySelector('.vamis-words span')
    click(item || null)

    await vi.waitFor(() => expect(notify.mock.calls.map((call) => call[1])).toContain('a'))
  })

  it('emits deferLoadFinished after loading a deferred TreeSelect node', async () => {
    const notify = vi.fn()
    const fetcher = vi.fn(async () => ({
      status: 0,
      msg: '',
      data: { options: [{ label: 'Child', value: 'child' }] },
    }))
    const { host } = mount(
      {
        type: 'form',
        actions: [],
        body: {
          type: 'tree-select',
          name: 'tree',
          deferApi: '/api/tree-defer',
          onEvent: {
            deferLoadFinished: {
              actions: [
                { actionType: 'toast', args: { msg: '${event.data.result|json}' } },
              ],
            },
          },
          options: [{ label: 'Lazy', value: 'lazy', defer: true }],
        },
      },
      { fetcher, notify },
    )

    await nextTick()
    click(host.querySelector('.vamis-tree-select .vamis-select__input'))
    await vi.waitFor(() =>
      expect(document.querySelector('.vamis-tree-select__popover .vamis-tree')).toBeTruthy(),
    )
    click(treeItem('Lazy')?.querySelector('.vamis-tree__arrow') || null)

    await vi.waitFor(() => expect(notify).toHaveBeenCalled())
    expect(JSON.parse(notify.mock.calls.at(-1)?.[1] as string).data.options[0].label).toBe(
      'Child',
    )
  })

  it('emits focus, change and blur in TreeSelect interaction order', async () => {
    const notify = vi.fn()
    const { host } = mount(
      {
        type: 'page',
        body: {
          type: 'form',
          actions: [],
          data: { tree: 'a' },
          body: {
            type: 'tree-select',
            name: 'tree',
            label: 'Tree',
            onEvent: {
              focus: {
                actions: [
                  { actionType: 'toast', args: { msg: 'focus:${event.data.tree}' } },
                ],
              },
              change: {
                actions: [
                  { actionType: 'toast', args: { msg: 'change:${event.data.tree}' } },
                ],
              },
              blur: {
                actions: [
                  { actionType: 'toast', args: { msg: 'blur:${event.data.tree}' } },
                ],
              },
            },
            options: [
              { label: 'A', value: 'a' },
              { label: 'B', value: 'b' },
            ],
          },
        },
      },
      { notify },
    )

    await nextTick()
    click(host.querySelector('.vamis-tree-select .vamis-select__input'))
    await vi.waitFor(() =>
      expect(document.querySelector('.vamis-tree-select__popover .vamis-tree')).toBeTruthy(),
    )
    click(treeItem('B')?.querySelector('.vamis-tree__content') || null)

    await vi.waitFor(() =>
      expect(notify.mock.calls.map((call) => call[1])).toEqual([
        'focus:a',
        'change:b',
        'blur:b',
      ]),
    )
  })

  it('runs TreeSelect clear, reset, reload and setValue actions', async () => {
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
    const { host, scoped } = mount(
      {
        type: 'page',
        body: {
          type: 'form',
          name: 'treeActionForm',
          actions: [],
          body: [
            {
              type: 'tree-select',
              id: 'action-tree',
              name: 'tree',
              label: 'Tree',
              value: 'a',
              source: '/api/tree-options',
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
            {
              type: 'button',
              label: '刷新',
              onEvent: {
                click: {
                  actions: [{ actionType: 'reload', componentId: 'action-tree' }],
                },
              },
            },
          ],
        },
      },
      { fetcher },
    )

    await nextTick()
    const form = scoped.getComponentByName('treeActionForm') as {
      getData?: () => Record<string, unknown>
    }
    await vi.waitFor(() => expect(sourceLoads).toBe(1))

    click(buttonWithText('设为 B'))
    await vi.waitFor(() => expect(form?.getData?.()?.tree).toBe('b'))
    click(buttonWithText('清空'))
    await vi.waitFor(() => expect(form?.getData?.()?.tree).toBe(''))
    click(buttonWithText('重置'))
    await vi.waitFor(() => expect(form?.getData?.()?.tree).toBe('a'))
    click(buttonWithText('刷新'))
    await vi.waitFor(() => expect(sourceLoads).toBe(2))
  })

  it('keeps pristine for reset and uses resetValue for clear', async () => {
    const { host, scoped } = mount({
      type: 'page',
      body: {
        type: 'form',
        name: 'treeResetValueForm',
        actions: [],
        body: [
          {
            type: 'tree-select',
            id: 'reset-value-tree',
            name: 'tree',
            value: 'a',
            resetValue: 'c',
            options: [
              { label: 'A', value: 'a' },
              { label: 'B', value: 'b' },
              { label: 'C', value: 'c' },
            ],
          },
          {
            type: 'button',
            label: '重置',
            onEvent: {
              click: {
                actions: [{ actionType: 'reset', componentId: 'reset-value-tree' }],
              },
            },
          },
          {
            type: 'button',
            label: '清空',
            onEvent: {
              click: {
                actions: [{ actionType: 'clear', componentId: 'reset-value-tree' }],
              },
            },
          },
        ],
      },
    })

    await nextTick()
    const form = scoped.getComponentByName('treeResetValueForm') as {
      getData?: () => Record<string, unknown>
    }
    await vi.waitFor(() => expect(form?.getData?.()?.tree).toBe('a'))
    click(buttonWithText('重置'))
    await vi.waitFor(() => expect(form?.getData?.()?.tree).toBe('a'))
    click(buttonWithText('清空'))
    await vi.waitFor(() => expect(form?.getData?.()?.tree).toBe('c'))
  })

  it('runs TreeSelect add, edit and delete component actions', async () => {
    const { host } = mount({
      type: 'page',
      body: {
        type: 'form',
        actions: [],
        body: [
          {
            type: 'tree-select',
            id: 'cud-tree',
            name: 'tree',
            label: 'Tree',
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
                    componentId: 'cud-tree',
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
                    componentId: 'cud-tree',
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
                    componentId: 'cud-tree',
                    args: { value: 'c' },
                  },
                ],
              },
            },
          },
        ],
      },
    })

    await nextTick()
    const trigger = host.querySelector('.vamis-tree-select .vamis-select__input')
    click(buttonWithText('新增 C'))
    click(trigger)
    await vi.waitFor(() =>
      expect(document.querySelector('.vamis-tree-select__popover .vamis-tree')).toBeTruthy(),
    )
    await vi.waitFor(() => expect(treeTexts()).toContain('C'))
    click(trigger)

    click(buttonWithText('编辑 CC'))
    click(trigger)
    await vi.waitFor(() =>
      expect(document.querySelector('.vamis-tree-select__popover .vamis-tree')).toBeTruthy(),
    )
    await vi.waitFor(() => expect(treeTexts()).toContain('CC'))
    click(trigger)

    click(buttonWithText('删除 CC'))
    click(trigger)
    await vi.waitFor(() =>
      expect(document.querySelector('.vamis-tree-select__popover .vamis-tree')).toBeTruthy(),
    )
    await vi.waitFor(() => expect(treeTexts()).not.toContain('CC'))
  })
})

describe('TreeSelect node behavior', () => {
  it('expands without selecting when nodeBehavior is unfold', async () => {
    const { host, scoped } = mount({
      type: 'form',
      name: 'unfoldTreeForm',
      actions: [],
      body: {
        type: 'tree-select',
        name: 'tree',
        nodeBehavior: ['unfold'],
        options: [
          {
            label: 'A',
            value: 'a',
            children: [{ label: 'B', value: 'b' }],
          },
        ],
      },
    })

    await nextTick()
    click(host.querySelector('.vamis-tree-select .vamis-select__input'))
    await vi.waitFor(() =>
      expect(document.querySelector('.vamis-tree-select__popover .vamis-tree')).toBeTruthy(),
    )
    click(treeItem('A')?.querySelector('.vamis-tree__content') || null)
    await nextTick()
    expect(treeItem('A')?.querySelector('.vamis-tree__arrow-icon')?.classList.contains('is-folded')).toBe(
      true,
    )
    const form = scoped.getComponentByName('unfoldTreeForm') as {
      getData?: () => Record<string, unknown>
    }
    expect(form?.getData?.()?.tree).toBeUndefined()
  })

  it('does not select when nodeBehavior is an empty list', async () => {
    const { host, scoped } = mount({
      type: 'form',
      name: 'readonlyTreeBehaviorForm',
      actions: [],
      body: {
        type: 'tree-select',
        name: 'tree',
        nodeBehavior: [],
        options: [{ label: 'A', value: 'a' }],
      },
    })

    await nextTick()
    click(host.querySelector('.vamis-tree-select .vamis-select__input'))
    await vi.waitFor(() =>
      expect(document.querySelector('.vamis-tree-select__popover .vamis-tree')).toBeTruthy(),
    )
    click(treeItem('A')?.querySelector('.vamis-tree__content') || null)
    const form = scoped.getComponentByName('readonlyTreeBehaviorForm') as {
      getData?: () => Record<string, unknown>
    }
    await settle()
    expect(form?.getData?.()?.tree).toBeUndefined()
  })
})

describe('TreeSelect selection limits', () => {
  it('disables unchecked nodes after maxLength is reached', async () => {
    const { host, scoped } = mount({
      type: 'form',
      name: 'limitedTreeForm',
      actions: [],
      body: {
        type: 'tree-select',
        name: 'tree',
        multiple: true,
        maxLength: 1,
        options: [
          { label: 'A', value: 'a' },
          { label: 'B', value: 'b' },
        ],
      },
    })

    await nextTick()
    click(host.querySelector('.vamis-tree-select .vamis-select__input'))
    await vi.waitFor(() =>
      expect(document.querySelector('.vamis-tree-select__popover .vamis-tree')).toBeTruthy(),
    )
    click(treeItem('A')?.querySelector('.vamis-tree__content') || null)

    const form = scoped.getComponentByName('limitedTreeForm') as {
      getData?: () => Record<string, unknown>
    }
    await vi.waitFor(() => expect(form?.getData?.()?.tree).toBe('a'))
    expect(treeItem('B')?.querySelector('.vamis-tree__label')?.classList.contains('is-disabled')).toBe(
      true,
    )
    click(treeItem('B')?.querySelector('.vamis-tree__content') || null)
    await settle()
    expect(form?.getData?.()?.tree).toBe('a')
  })

  it('validates minLength by selected node count with the Amis tree message', async () => {
    const { host } = mount({
      type: 'form',
      actions: [{ type: 'button', label: '提交', actionType: 'submit' }],
      body: {
        type: 'tree-select',
        name: 'tree',
        multiple: true,
        value: 'a',
        minLength: 2,
        options: [
          { label: 'A', value: 'a' },
          { label: 'B', value: 'b' },
        ],
      },
    })

    await nextTick()
    click(buttonWithText('提交'))
    await vi.waitFor(() =>
      expect(host.querySelector('.vamis-form__error')?.textContent?.trim()).toBe(
        '已选择数量低于设定的最小个数2，请选择更多的选项。',
      ),
    )
  })

  it('validates maxLength by selected node count with the Amis tree message', async () => {
    const { host } = mount({
      type: 'form',
      actions: [{ type: 'button', label: '提交', actionType: 'submit' }],
      body: {
        type: 'tree-select',
        name: 'tree',
        multiple: true,
        value: '10,20,30',
        maxLength: 2,
        options: [
          { label: 'A', value: 10 },
          { label: 'B', value: 20 },
          { label: 'C', value: 30 },
        ],
      },
    })

    await nextTick()
    click(buttonWithText('提交'))
    await vi.waitFor(() =>
      expect(host.querySelector('.vamis-form__error')?.textContent?.trim()).toBe(
        '已选择数量超出设定的最大个数2，请取消选择超出的选项。',
      ),
    )
  })

  it('disables selected nodes when minLength is reached', async () => {
    const { host, scoped } = mount({
      type: 'form',
      name: 'minimumTreeForm',
      actions: [],
      body: {
        type: 'tree-select',
        name: 'tree',
        multiple: true,
        value: 'a',
        minLength: 1,
        options: [
          { label: 'A', value: 'a' },
          { label: 'B', value: 'b' },
        ],
      },
    })

    await nextTick()
    click(host.querySelector('.vamis-tree-select .vamis-select__input'))
    await vi.waitFor(() =>
      expect(document.querySelector('.vamis-tree-select__popover .vamis-tree')).toBeTruthy(),
    )
    expect(treeItem('A')?.querySelector('.vamis-tree__label')?.classList.contains('is-disabled')).toBe(
      true,
    )
    click(treeItem('A')?.querySelector('.vamis-tree__content') || null)

    const form = scoped.getComponentByName('minimumTreeForm') as {
      getData?: () => Record<string, unknown>
    }
    await settle()
    expect(form?.getData?.()?.tree).toBe('a')
  })
})

describe('TreeSelect root selection', () => {
  it('renders hideRoot=false and writes rootValue from the root row', async () => {
    const { host, scoped } = mount({
      type: 'form',
      name: 'rootTreeForm',
      actions: [],
      body: {
        type: 'tree-select',
        name: 'tree',
        hideRoot: false,
        rootLabel: '全部',
        rootValue: 'root',
        options: [
          {
            label: 'Folder A',
            value: 'folder',
            children: [{ label: 'B', value: 'b' }],
          },
        ],
      },
    })

    await nextTick()
    click(host.querySelector('.vamis-tree-select .vamis-select__input'))
    await vi.waitFor(() =>
      expect(document.querySelector('.vamis-tree-select__popover .vamis-tree__root-item')).toBeTruthy(),
    )
    expect(
      document.querySelector('.vamis-tree-select__popover .vamis-tree__root-item')?.textContent,
    ).toContain('全部')

    click(treeItem('B')?.querySelector('.vamis-tree__content') || null)
    const form = scoped.getComponentByName('rootTreeForm') as {
      getData?: () => Record<string, unknown>
    }
    await vi.waitFor(() => expect(form?.getData?.()?.tree).toBe('b'))

    click(host.querySelector('.vamis-tree-select .vamis-select__input'))
    await vi.waitFor(() =>
      expect(document.querySelector('.vamis-tree-select__popover .vamis-tree__root-item')).toBeTruthy(),
    )
    click(
      document.querySelector(
        '.vamis-tree-select__popover .vamis-tree__root-item .vamis-tree__content',
      ),
    )
    await vi.waitFor(() => expect(form?.getData?.()?.tree).toBe('root'))
  })
})

describe('TreeSelect tag overflow', () => {
  it('folds tags by maxTagCount and shows the rest in overflowTagPopover', async () => {
    const { host } = mount({
      type: 'form',
      actions: [],
      body: {
        type: 'tree-select',
        name: 'tree',
        multiple: true,
        value: '1,2,3,4',
        maxTagCount: 2,
        overflowTagPopover: {
          tooltipClassName: 'tree-overflow-popover',
        },
        options: [
          { label: 'A', value: 1 },
          { label: 'B', value: 2 },
          { label: 'C', value: 3 },
          { label: 'D', value: 4 },
        ],
      },
    })

    await nextTick()
    const chips = [
      ...host.querySelectorAll(
        '.vamis-tree-select .vamis-select__chip:not(.vamis-select__overflow)',
      ),
    ]
    expect(chips.map((chip) => chip.textContent?.trim())).toEqual(['A', 'B'])
    const overflow = host.querySelector('.vamis-tree-select .vamis-select__overflow')
    expect(overflow?.textContent?.trim()).toBe('+ 2 ...')

    overflow?.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
    await vi.waitFor(() =>
      expect(document.querySelector('.vamis-select-overflow__grid')).toBeTruthy(),
    )
    expect(document.querySelector('.tree-overflow-popover')).toBeTruthy()
    expect(document.querySelector('.vamis-select-overflow__grid')?.textContent).toContain('C')
    expect(document.querySelector('.vamis-select-overflow__grid')?.textContent).toContain('D')
  })
})

describe('TreeSelect virtualization', () => {
  it('renders only a window of rows after the virtual threshold', async () => {
    const offsetHeight = vi
      .spyOn(HTMLElement.prototype, 'offsetHeight', 'get')
      .mockReturnValue(32)
    try {
      const { host } = mount({
        type: 'form',
        actions: [],
        body: {
          type: 'tree-select',
          name: 'tree',
          virtualThreshold: 5,
          options: Array.from({ length: 80 }, (_, index) => ({
            label: `Node ${index + 1}`,
            value: `node-${index + 1}`,
          })),
        },
      })

      await nextTick()
      click(host.querySelector('.vamis-tree-select .vamis-select__input'))
      await vi.waitFor(() => {
        expect(document.querySelector('.vamis-tree-select__popover .vamis-tree')).toBeTruthy()
      })

      const tree = document.querySelector(
        '.vamis-tree-select__popover .vamis-tree',
      ) as HTMLElement
      await vi.waitFor(() => expect(tree.classList.contains('is-virtual')).toBe(true))
      expect(tree.querySelectorAll('.vamis-tree__text').length).toBeLessThan(80)
    } finally {
      offsetHeight.mockRestore()
    }
  })

  it('resets the virtual window when search shrinks and restores the list', async () => {
    const offsetHeight = vi
      .spyOn(HTMLElement.prototype, 'offsetHeight', 'get')
      .mockReturnValue(32)
    try {
      const { host } = mount({
        type: 'form',
        actions: [],
        body: {
          type: 'tree-select',
          name: 'tree',
          searchable: true,
          virtualThreshold: 5,
          options: Array.from({ length: 80 }, (_, index) => ({
            label: `Node ${index + 1}`,
            value: `node-${index + 1}`,
          })),
        },
      })

      await nextTick()
      const input = host.querySelector(
        '.vamis-tree-select .vamis-select__input input',
      ) as HTMLInputElement
      click(input)
      await vi.waitFor(() =>
        expect(
          document.querySelector('.vamis-tree-select__popover .vamis-tree.is-virtual'),
        ).toBeTruthy(),
      )

      const tree = document.querySelector(
        '.vamis-tree-select__popover .vamis-tree',
      ) as HTMLElement
      tree.scrollTop = 2400
      tree.dispatchEvent(new Event('scroll'))
      await vi.waitFor(() => expect(tree.textContent).toContain('Node 80'))

      input.value = 'Node 80'
      input.dispatchEvent(new Event('input', { bubbles: true }))
      await vi.waitFor(() => expect(treeTexts()).toEqual(['Node 80']))

      input.value = ''
      input.dispatchEvent(new Event('input', { bubbles: true }))
      await vi.waitFor(() => {
        expect(tree.scrollTop).toBe(0)
        expect(tree.textContent).toContain('Node 1')
      })
    } finally {
      offsetHeight.mockRestore()
    }
  })

  it('uses the measured scroll viewport instead of rendering the full threshold', async () => {
    const offsetHeight = vi
      .spyOn(HTMLElement.prototype, 'offsetHeight', 'get')
      .mockReturnValue(32)
    const clientHeight = vi
      .spyOn(HTMLElement.prototype, 'clientHeight', 'get')
      .mockReturnValue(64)
    try {
      const { host } = mount({
        type: 'form',
        actions: [],
        body: {
          type: 'tree-select',
          name: 'tree',
          virtualThreshold: 100,
          options: Array.from({ length: 200 }, (_, index) => ({
            label: `Node ${index + 1}`,
            value: `node-${index + 1}`,
          })),
        },
      })

      await nextTick()
      click(host.querySelector('.vamis-tree-select .vamis-select__input'))
      await vi.waitFor(() =>
        expect(
          document.querySelector('.vamis-tree-select__popover .vamis-tree.is-virtual'),
        ).toBeTruthy(),
      )

      const tree = document.querySelector(
        '.vamis-tree-select__popover .vamis-tree',
      ) as HTMLElement
      await vi.waitFor(() =>
        expect(tree.querySelectorAll('.vamis-tree__text').length).toBeLessThan(20),
      )
    } finally {
      clientHeight.mockRestore()
      offsetHeight.mockRestore()
    }
  })

  it('keeps later virtual rows selectable after scrolling', async () => {
    const offsetHeight = vi
      .spyOn(HTMLElement.prototype, 'offsetHeight', 'get')
      .mockReturnValue(32)
    try {
      const { host, scoped } = mount({
        type: 'form',
        name: 'virtualTreeForm',
        actions: [],
        body: {
          type: 'tree-select',
          name: 'tree',
          virtualThreshold: 5,
          options: Array.from({ length: 80 }, (_, index) => ({
            label: `Node ${index + 1}`,
            value: `node-${index + 1}`,
          })),
        },
      })

      await nextTick()
      click(host.querySelector('.vamis-tree-select .vamis-select__input'))
      await vi.waitFor(() =>
        expect(
          document.querySelector('.vamis-tree-select__popover .vamis-tree.is-virtual'),
        ).toBeTruthy(),
      )

      const tree = document.querySelector(
        '.vamis-tree-select__popover .vamis-tree',
      ) as HTMLElement
      tree.scrollTop = 1500
      tree.dispatchEvent(new Event('scroll'))
      await vi.waitFor(() => expect(tree.textContent).toContain('Node 50'))
      click(treeItem('Node 50')?.querySelector('.vamis-tree__content') || null)

      const form = scoped.getComponentByName('virtualTreeForm') as {
        getData?: () => Record<string, unknown>
      }
      await vi.waitFor(() => expect(form?.getData?.()?.tree).toBe('node-50'))
    } finally {
      offsetHeight.mockRestore()
    }
  })

  it('remeasures the probe row after the initial layout callback', async () => {
    let laidOut = false
    setTimeout(() => {
      laidOut = true
    }, 0)
    const offsetHeight = vi
      .spyOn(HTMLElement.prototype, 'offsetHeight', 'get')
      .mockImplementation(function (this: HTMLElement) {
        if (!this.classList.contains('vamis-tree__item')) return 0
        return laidOut ? 32 : 0
      })
    try {
      const { host } = mount({
        type: 'form',
        actions: [],
        body: {
          type: 'tree-select',
          name: 'tree',
          virtualThreshold: 5,
          options: Array.from({ length: 80 }, (_, index) => ({
            label: `Node ${index + 1}`,
            value: `node-${index + 1}`,
          })),
        },
      })

      await nextTick()
      click(host.querySelector('.vamis-tree-select .vamis-select__input'))
      await vi.waitFor(() =>
        expect(
          document.querySelector('.vamis-tree-select__popover .vamis-tree.is-virtual'),
        ).toBeTruthy(),
      )
    } finally {
      offsetHeight.mockRestore()
    }
  })
})
