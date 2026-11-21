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

  it('does not focus a non-searchable autoComplete Select search input', async () => {
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
