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

function formData(scoped: ReturnType<typeof embed>, name: string) {
  const form = scoped.getComponentByName(name) as {
    getData?: () => Record<string, unknown>
  }
  return form?.getData?.() || {}
}

function click(element: Element | null) {
  if (!(element instanceof HTMLElement)) throw new Error('element not found')
  element.click()
}

function forceOverflow(element: Element | null) {
  if (!(element instanceof HTMLElement)) throw new Error('scroll host not found')
  Object.defineProperties(element, {
    clientHeight: { configurable: true, value: 120 },
    scrollHeight: { configurable: true, value: 480 },
    scrollTop: { configurable: true, writable: true, value: 0 },
  })
  element.dispatchEvent(new Event('scroll'))
  return element
}

describe('Transfer list UI', () => {
  it('renders Amis-style available and selected headers with option checkboxes', async () => {
    const { host } = mount({
      type: 'form',
      actions: [],
      body: {
        type: 'transfer',
        name: 'transferListUi',
        options: [
          { label: 'A', value: 'a' },
          { label: 'B', value: 'b' },
        ],
      },
    })

    await nextTick()
    const titles = [...host.querySelectorAll('.vamis-transfer__title-main')].map(
      (item) => (item.textContent || '').replace(/\s+/g, ''),
    )
    expect(titles).toContain('可选项（2/2）')
    expect(titles).toContain('已选项（0）')
    expect(
      host.querySelector('.vamis-transfer__title [data-slot="checkbox"]'),
    ).toBeTruthy()
    expect(
      host.querySelectorAll('.vamis-transfer__item [data-slot="checkbox"]'),
    ).toHaveLength(2)
    expect(
      [...host.querySelectorAll('button')].some(
        (button) => (button.textContent || '').trim() === '全部 >',
      ),
    ).toBe(false)
  })

  it('keeps group labels and moves a leaf into the removable result list', async () => {
    const { host, scoped } = mount({
      type: 'form',
      name: 'transferGroupedUiForm',
      actions: [],
      body: {
        type: 'transfer',
        name: 'transferGroupedUi',
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
    expect(
      [...host.querySelectorAll('.vamis-transfer__group')].map((item) =>
        (item.textContent || '').trim(),
      ),
    ).toEqual(['前端', '后端'])

    click(
      [...host.querySelectorAll('.vamis-transfer__item')].find(
        (item) => (item.textContent || '').trim() === 'Vue',
      ) || null,
    )
    await vi.waitFor(() =>
      expect(host.querySelectorAll('.vamis-transfer__result-item')).toHaveLength(1),
    )
    expect(formData(scoped, 'transferGroupedUiForm').transferGroupedUi).toBe('vue')
    expect(host.querySelector('.vamis-transfer__result-item')?.textContent).toContain('Vue')

    click(host.querySelector('[aria-label="移除 Vue"]'))
    await vi.waitFor(() =>
      expect(formData(scoped, 'transferGroupedUiForm').transferGroupedUi).toBe(''),
    )
  })

  it('keeps selected leaves in the left list with a checked state', async () => {
    const { host, scoped } = mount({
      type: 'form',
      name: 'transferCheckedListForm',
      actions: [],
      body: {
        type: 'transfer',
        name: 'transferCheckedList',
        options: [
          { label: 'A', value: 'a' },
          { label: 'B', value: 'b' },
        ],
      },
    })

    await nextTick()
    const leftItem = () =>
      [...host.querySelectorAll('.vamis-transfer__item')].find(
        (item) => (item.textContent || '').trim() === 'A',
      ) || null

    click(leftItem())
    await vi.waitFor(() =>
      expect(leftItem()?.querySelector('[data-state="checked"]')).toBeTruthy(),
    )
    expect(formData(scoped, 'transferCheckedListForm').transferCheckedList).toBe('a')

    click(leftItem())
    await vi.waitFor(() =>
      expect(formData(scoped, 'transferCheckedListForm').transferCheckedList).toBe(''),
    )
  })

  it('renders table mode columns and keeps selected rows checked', async () => {
    const { host, scoped } = mount({
      type: 'form',
      name: 'transferTableUiForm',
      actions: [],
      body: {
        type: 'transfer',
        name: 'transferTableUi',
        selectMode: 'table',
        columns: [
          { name: 'label', label: '英雄' },
          { name: 'position', label: '位置' },
        ],
        options: [
          { label: '诸葛亮', value: 'zhugeliang', position: '中单' },
          { label: '曹操', value: 'caocao', position: '上单' },
        ],
      },
    })

    await nextTick()
    const headerText = host.querySelector('.vamis-select__table thead')?.textContent || ''
    expect(headerText).toContain('英雄')
    expect(headerText).toContain('位置')
    expect(headerText).not.toContain('值')
    expect(host.querySelector('.vamis-transfer__result thead')).toBeNull()

    const firstRow = host.querySelector(
      '.vamis-select__table tbody tr',
    ) as HTMLElement | null
    expect(firstRow?.textContent).toContain('中单')
    click(firstRow)
    await vi.waitFor(() =>
      expect(formData(scoped, 'transferTableUiForm').transferTableUi).toBe('zhugeliang'),
    )
    expect(firstRow?.querySelector('[data-state="checked"]')).toBeTruthy()
  })

  it('renders tree mode with node checkboxes and keeps the selected leaf visible', async () => {
    const { host, scoped } = mount({
      type: 'form',
      name: 'transferTreeUiForm',
      actions: [],
      body: {
        type: 'transfer',
        name: 'transferTreeUi',
        selectMode: 'tree',
        searchable: true,
        initiallyOpen: true,
        options: [
          {
            label: '前端',
            children: [
              { label: 'Vue', value: 'vue' },
              { label: 'React', value: 'react' },
            ],
          },
        ],
      },
    })

    await nextTick()
    expect(host.querySelector('.vamis-select__tree-pane')).toBeTruthy()
    expect(
      host.querySelector('.vamis-transfer__search')?.getAttribute('placeholder'),
    ).toBe('请输入关键字')
    expect(host.querySelectorAll('.vamis-transfer__search')).toHaveLength(1)
    expect(host.querySelectorAll('.vamis-transfer__search-icon')).toHaveLength(1)
    expect(host.querySelectorAll('.vamis-tree__check').length).toBeGreaterThanOrEqual(3)
    const vue = [...host.querySelectorAll('.vamis-tree__item')].find(
      (item) => (item.querySelector('.vamis-tree__text')?.textContent || '').trim() === 'Vue',
    ) as HTMLElement | undefined
    expect(vue).toBeTruthy()

    click(vue?.querySelector('.vamis-tree__content') || null)
    await vi.waitFor(() =>
      expect(formData(scoped, 'transferTreeUiForm').transferTreeUi).toBe('vue'),
    )
    expect(
      vue?.querySelector('.vamis-tree__check')?.classList.contains('is-checked'),
    ).toBe(true)
    expect(host.querySelector('.vamis-transfer__result-item')?.textContent).toContain('Vue')

    const parent = [...host.querySelectorAll('.vamis-tree__item')].find(
      (item) => (item.querySelector('.vamis-tree__text')?.textContent || '').trim() === '前端',
    ) as HTMLElement | undefined
    expect(
      parent?.querySelector('.vamis-tree__check')?.classList.contains('is-partial'),
    ).toBe(true)

    const react = [...host.querySelectorAll('.vamis-tree__item')].find(
      (item) => (item.querySelector('.vamis-tree__text')?.textContent || '').trim() === 'React',
    ) as HTMLElement | undefined
    click(react?.querySelector('.vamis-tree__content') || null)
    await vi.waitFor(() =>
      expect(formData(scoped, 'transferTreeUiForm').transferTreeUi).toBe('vue,react'),
    )
    expect(
      parent?.querySelector('.vamis-tree__check')?.classList.contains('is-checked'),
    ).toBe(true)
    expect(
      parent?.querySelector('.vamis-tree__check')?.classList.contains('is-partial'),
    ).toBe(false)
  })

  it('renders an explicit scrollbar for overflowing list, table and tree hosts', async () => {
    const options = Array.from({ length: 30 }, (_, index) => ({
      label: `选项 ${index + 1}`,
      value: `value-${index + 1}`,
    }))

    const list = mount({
      type: 'form',
      actions: [],
      body: {
        type: 'transfer',
        name: 'transferListScrollbar',
        options,
      },
    })
    await nextTick()
    const listHost = forceOverflow(list.host.querySelector('.vamis-transfer__list'))
    await nextTick()
    expect(
      listHost
        .closest('.vamis-transfer__scroll-shell')
        ?.querySelector('[data-vamis-scrollbar].is-visible'),
    ).toBeTruthy()
    list.scoped.unmount()
    mounts.splice(mounts.indexOf(list.scoped), 1)

    const table = mount({
      type: 'form',
      actions: [],
      body: {
        type: 'transfer',
        name: 'transferTableScrollbar',
        selectMode: 'table',
        options,
      },
    })
    await nextTick()
    const tableHost = forceOverflow(table.host.querySelector('.vamis-select__table-pane'))
    await nextTick()
    expect(
      tableHost
        .closest('.vamis-transfer__table-selection')
        ?.querySelector('[data-vamis-scrollbar].is-visible'),
    ).toBeTruthy()
    table.scoped.unmount()
    mounts.splice(mounts.indexOf(table.scoped), 1)

    const tree = mount({
      type: 'form',
      actions: [],
      body: {
        type: 'transfer',
        name: 'transferTreeScrollbar',
        selectMode: 'tree',
        initiallyOpen: true,
        options: [{ label: '分组', children: options }],
      },
    })
    await nextTick()
    const treeHost = forceOverflow(tree.host.querySelector('.vamis-select__tree-pane'))
    await nextTick()
    expect(
      treeHost
        .closest('.vamis-transfer__tree-selection')
        ?.querySelector('[data-vamis-scrollbar].is-visible'),
    ).toBeTruthy()
  })

  it('renders showArrow and custom menu/value templates', async () => {
    const { host } = mount({
      type: 'form',
      actions: [],
      body: {
        type: 'transfer',
        name: 'transferTemplates',
        showArrow: true,
        menuTpl: {
          type: 'tpl',
          tpl: '${label} · ${tag}',
        },
        valueTpl: {
          type: 'tpl',
          tpl: '${label} (${value})',
        },
        options: [
          {
            label: '选项 A',
            value: 'a',
            tag: '热门',
          },
        ],
      },
    })

    await nextTick()
    expect(host.querySelector('.vamis-transfer__arrow')).toBeTruthy()
    expect(host.querySelector('.vamis-transfer__item')?.textContent).toContain(
      '选项 A · 热门',
    )

    click(host.querySelector('.vamis-transfer__item'))
    await vi.waitFor(() =>
      expect(host.querySelector('.vamis-transfer__result-item')?.textContent).toContain(
        '选项 A (a)',
      ),
    )
  })

  it('keeps unmatched values and only marks them invalid when showInvalidMatch is enabled', async () => {
    const marked = mount({
      type: 'form',
      actions: [],
      body: {
        type: 'transfer',
        name: 'transferInvalidMarked',
        showInvalidMatch: true,
        value: 'missing,a',
        options: [{ label: '选项 A', value: 'a' }],
      },
    })

    await nextTick()
    const markedItems = [...marked.host.querySelectorAll('.vamis-transfer__result-item')]
    expect(markedItems.map((item) => (item.textContent || '').trim())).toContain('missing')
    expect(
      markedItems.find((item) => (item.textContent || '').trim() === 'missing')
        ?.classList.contains('is-invalid'),
    ).toBe(true)

    const plain = mount({
      type: 'form',
      actions: [],
      body: {
        type: 'transfer',
        name: 'transferInvalidPlain',
        value: 'missing,a',
        options: [{ label: '选项 A', value: 'a' }],
      },
    })

    await nextTick()
    const plainItems = [...plain.host.querySelectorAll('.vamis-transfer__result-item')]
    expect(plainItems.map((item) => (item.textContent || '').trim())).toContain('missing')
    expect(
      plainItems.find((item) => (item.textContent || '').trim() === 'missing')
        ?.classList.contains('is-invalid'),
    ).toBe(false)
  })
})
