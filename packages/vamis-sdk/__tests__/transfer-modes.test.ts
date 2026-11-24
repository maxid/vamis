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

function buttonWithText(text: string) {
  return [...document.querySelectorAll('button')].find(
    (button) => (button.textContent || '').trim() === text,
  ) || null
}

describe('Transfer selectMode', () => {
  it('renders chained mode and writes only the selected leaf', async () => {
    const { host, scoped } = mount({
      type: 'form',
      name: 'transferChainedForm',
      actions: [],
      body: {
        type: 'transfer',
        name: 'transfer',
        selectMode: 'chained',
        options: [
          {
            label: 'A',
            children: [
              { label: 'A1', value: 'a1' },
              { label: 'A2', value: 'a2' },
            ],
          },
          {
            label: 'B',
            children: [{ label: 'B1', value: 'b1' }],
          },
        ],
      },
    })

    await nextTick()
    expect(host.querySelector('.vamis-select__chained')).toBeTruthy()
    expect(host.querySelector('.vamis-select__chained-checkall')).toBeNull()
    expect(buttonWithText('全选')).toBeTruthy()
    const columns = host.querySelectorAll('.vamis-select__chained-col')
    const secondColumn = [...columns][1] as HTMLElement
    expect(secondColumn?.textContent).toContain('A1')

    click(
      [...columns[0].querySelectorAll('.vamis-select__chained-item')].find(
        (item) => (item.textContent || '').trim() === 'B',
      ) || null,
    )
    await vi.waitFor(() => expect(secondColumn.textContent).toContain('B1'))
    click(
      [...secondColumn.querySelectorAll('.vamis-select__chained-item')].find(
        (item) => (item.textContent || '').trim() === 'B1',
      ) || null,
    )

    await vi.waitFor(() => expect(formData(scoped, 'transferChainedForm').transfer).toBe('b1'))
  })

  it('renders associated mode and writes only the selected right-side leaf', async () => {
    const { host, scoped } = mount({
      type: 'form',
      name: 'transferAssociatedForm',
      actions: [],
      body: {
        type: 'transfer',
        name: 'transfer',
        selectMode: 'associated',
        leftOptions: [
          { label: 'Dept A', value: 'dept-a' },
          { label: 'Dept B', value: 'dept-b' },
        ],
        options: [
          {
            ref: 'dept-a',
            children: [
              { label: 'A1', value: 'a1' },
              { label: 'A2', value: 'a2' },
            ],
          },
          {
            ref: 'dept-b',
            children: [{ label: 'B1', value: 'b1' }],
          },
        ],
      },
    })

    await nextTick()
    expect(host.querySelector('.vamis-select__associated')).toBeTruthy()
    click(
      [...host.querySelectorAll('.vamis-select__associated-left-item')].find(
        (item) => (item.textContent || '').trim() === 'Dept B',
      ) || null,
    )
    await vi.waitFor(() =>
      expect(host.querySelector('.vamis-select__associated-right')?.textContent).toContain('B1'),
    )
    click(
      [...host.querySelectorAll('.vamis-select__associated-right-item')].find(
        (item) => (item.textContent || '').trim() === 'B1',
      ) || null,
    )

    await vi.waitFor(() =>
      expect(formData(scoped, 'transferAssociatedForm').transfer).toBe('b1'),
    )
  })

  it('extracts source-shaped associated left options and default value', async () => {
    const { host, scoped } = mount({
      type: 'form',
      name: 'transferAssociatedSourceForm',
      actions: [],
      body: {
        type: 'transfer',
        name: 'transfer',
        selectMode: 'associated',
        options: [
          {
            leftOptions: [
              { label: 'Dept A', value: 'dept-a' },
              { label: 'Dept B', value: 'dept-b' },
            ],
            leftDefaultValue: 'dept-a',
            children: [
              {
                ref: 'dept-a',
                children: [{ label: 'A1', value: 'a1' }],
              },
              {
                ref: 'dept-b',
                children: [{ label: 'B1', value: 'b1' }],
              },
            ],
          },
        ],
      },
    })

    await nextTick()
    expect(host.querySelector('.vamis-select__associated-left')?.textContent).toContain('Dept A')
    await vi.waitFor(() =>
      expect(host.querySelector('.vamis-select__associated-right')?.textContent).toContain('A1'),
    )
    click(
      [...host.querySelectorAll('.vamis-select__associated-left-item')].find(
        (item) => (item.textContent || '').trim() === 'Dept B',
      ) || null,
    )
    await vi.waitFor(() =>
      expect(host.querySelector('.vamis-select__associated-right')?.textContent).toContain('B1'),
    )
    click(
      [...host.querySelectorAll('.vamis-select__associated-right-item')][0] as HTMLElement,
    )

    await vi.waitFor(() =>
      expect(formData(scoped, 'transferAssociatedSourceForm').transfer).toBe('b1'),
    )
  })

  it('gives associated mode the Amis paired-pane layout', async () => {
    const { host, scoped } = mount({
      type: 'form',
      name: 'transferAssociatedLayoutForm',
      actions: [],
      body: {
        type: 'transfer',
        name: 'transferAssociatedLayout',
        selectMode: 'associated',
        leftOptions: [
          { label: 'Dept A', value: 'dept-a' },
          { label: 'Dept B', value: 'dept-b' },
        ],
        options: [
          {
            ref: 'dept-a',
            children: [{ label: 'A1', value: 'a1' }],
          },
          {
            ref: 'dept-b',
            children: [{ label: 'B1', value: 'b1' }],
          },
        ],
      },
    })

    await nextTick()
    expect(host.querySelector('.vamis-transfer')?.className).toContain(
      'sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]',
    )
    expect(
      [...host.querySelectorAll('button')].some(
        (button) => (button.textContent || '').trim() === '全部 >',
      ),
    ).toBe(false)
    click(
      [...host.querySelectorAll('button')].find(
        (button) => (button.textContent || '').trim() === '全选',
      ) || null,
    )
    await vi.waitFor(() =>
      expect(
        formData(scoped, 'transferAssociatedLayoutForm').transferAssociatedLayout,
      ).toBe('a1,b1'),
    )
  })

  it('excludes valueless associated descriptors from counts and select-all', async () => {
    const { host, scoped } = mount({
      type: 'form',
      name: 'transferAssociatedValuelessForm',
      actions: [],
      body: {
        type: 'transfer',
        name: 'transferAssociatedValueless',
        selectMode: 'associated',
        leftMode: 'tree',
        leftOptions: [
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
            children: [
              { label: '李白', value: 'libai' },
              { label: '韩信', value: 'hanxin' },
              { label: '云中君', value: 'yunzhongjun' },
            ],
          },
        ],
        options: [
          {
            ref: 'zhugeliang',
            children: [{ label: 'A', value: 'a' }],
          },
          {
            ref: 'caocao',
            children: [
              { label: 'B', value: 'b' },
              { label: 'C', value: 'c' },
            ],
          },
          {
            ref: 'zhongwuyan',
            children: [
              { label: 'D', value: 'd' },
              { label: 'E', value: 'e' },
            ],
          },
          { ref: 'libai', defer: true, label: 'lazy-option-libai' },
          { ref: 'hanxin', defer: true, label: 'lazy-option-hanxin' },
          {
            ref: 'yunzhongjun',
            defer: true,
            label: 'lazy-option-yunzhongjun',
          },
        ],
      },
    })

    await nextTick()
    expect(host.querySelector('.vamis-transfer__title')?.textContent).toContain(
      '（5/5）',
    )
    click(buttonWithText('全选'))

    await vi.waitFor(() =>
      expect(
        formData(scoped, 'transferAssociatedValuelessForm')
          .transferAssociatedValueless,
      ).toBe('a,b,c,d,e'),
    )
    expect(
      host.querySelectorAll('.vamis-transfer__result-item'),
    ).toHaveLength(5)
    expect(
      host.querySelector('.vamis-transfer__result')?.textContent,
    ).not.toContain('undefined')
    expect(host.querySelector('.vamis-transfer__title')?.textContent).toContain(
      '（0/5）',
    )
  })

  it('hides the paired select-all action when checkAll is false', async () => {
    const { host } = mount({
      type: 'form',
      actions: [],
      body: {
        type: 'transfer',
        name: 'transferAssociatedNoCheckAll',
        selectMode: 'associated',
        checkAll: false,
        leftOptions: [{ label: 'Dept A', value: 'dept-a' }],
        options: [
          {
            ref: 'dept-a',
            children: [{ label: 'A1', value: 'a1' }],
          },
        ],
      },
    })

    await nextTick()
    expect(
      [...host.querySelectorAll('button')].some(
        (button) => (button.textContent || '').trim() === '全选',
      ),
    ).toBe(false)
  })

  it('follows table columns in the result pane only when enabled', async () => {
    const { host, scoped } = mount({
      type: 'form',
      name: 'transferResultTableForm',
      actions: [],
      body: {
        type: 'transfer',
        name: 'transferResultTable',
        selectMode: 'table',
        resultListModeFollowSelect: true,
        value: 'zhugeliang,caocao',
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
    const result = host.querySelector(
      '[data-vamis-transfer-result-mode="table"]',
    )
    expect(result?.textContent).toContain('英雄')
    expect(result?.textContent).toContain('位置')
    expect(result?.textContent).toContain('中单')
    expect(result?.textContent).not.toContain('值')
    expect(result?.querySelector('.vamis-select__table')).toBeTruthy()
    expect(
      result?.querySelector('.vamis-select__table-result-remove'),
    ).toBeTruthy()

    const row = [...(result?.querySelectorAll('tbody tr') || [])].find(
      (item) => item.textContent?.includes('曹操'),
    )
    click(row?.querySelector('button') || null)
    await vi.waitFor(() =>
      expect(formData(scoped, 'transferResultTableForm').transferResultTable).toBe(
        'zhugeliang',
      ),
    )
  })

  it('renders a removable result tree for tree mode without defer', async () => {
    const { host, scoped } = mount({
      type: 'form',
      name: 'transferResultTreeForm',
      actions: [],
      body: {
        type: 'transfer',
        name: 'transferResultTree',
        selectMode: 'tree',
        resultListModeFollowSelect: true,
        value: 'caocao,zhongwuyan,libai',
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
    })

    await nextTick()
    const result = host.querySelector(
      '[data-vamis-transfer-result-mode="tree"]',
    )
    expect(result?.textContent).toContain('战士')
    expect(result?.textContent).toContain('曹操')
    expect(result?.textContent).toContain('钟无艳')
    expect(result?.textContent).toContain('打野')
    expect(result?.textContent).toContain('李白')
    expect(result?.textContent).not.toContain('法师')
    expect(result?.textContent).not.toContain('诸葛亮')
    expect(result?.querySelector('.vamis-checkbox__mark')).toBeNull()
    expect(result?.querySelector('.vamis-tree__content.is-checked')).toBeNull()

    const row = [...(result?.querySelectorAll('.vamis-tree__item') || [])].find(
      (item) => item.textContent?.includes('钟无艳'),
    )
    click(
      row?.querySelector('[aria-label="移除该节点"]') ||
        row?.querySelector('a.vamis-tree__icon-btn') ||
        null,
    )
    await vi.waitFor(() =>
      expect(formData(scoped, 'transferResultTreeForm').transferResultTree).toBe(
        'caocao,libai',
      ),
    )
  })

  it('searches only selected result leaves, keeps ancestors and clears back to the full tree', async () => {
    const { host } = mount({
      type: 'form',
      actions: [],
      body: {
        type: 'transfer',
        name: 'transferResultSearch',
        selectMode: 'tree',
        resultListModeFollowSelect: true,
        resultSearchable: true,
        value: 'zhugeliang,caocao,zhongwuyan,libai',
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
    })

    await nextTick()
    const result = host.querySelector(
      '[data-vamis-transfer-result-mode="tree"]',
    ) as HTMLElement
    const resultPane = host.querySelector('.vamis-transfer__result') as HTMLElement
    const input = resultPane.querySelector('input') as HTMLInputElement
    expect(input).toBeTruthy()
    input.value = '李白'
    input.dispatchEvent(new Event('input', { bubbles: true }))
    await vi.waitFor(() => {
      expect(result.textContent).toContain('打野')
      expect(result.textContent).toContain('李白')
      expect(result.textContent).not.toContain('战士')
      expect(result.textContent).not.toContain('法师')
    })

    input.value = '战士'
    input.dispatchEvent(new Event('input', { bubbles: true }))
    await vi.waitFor(() => {
      expect(result.textContent).not.toContain('战士')
      expect(result.textContent).not.toContain('曹操')
      expect(result.textContent).not.toContain('钟无艳')
    })

    click(resultPane.querySelector('[data-vamis-transfer-result-search-clear]'))
    await vi.waitFor(() => {
      expect(result.textContent).toContain('法师')
      expect(result.textContent).toContain('战士')
      expect(result.textContent).toContain('打野')
    })
  })
})
