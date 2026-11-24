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

describe('CRUD picker mode', () => {
  it('exposes single row selection through getData().selectedItems', async () => {
    const { host, scoped } = mount({
      type: 'page',
      data: {
        pickerRows: [
          { id: 'a', name: 'A' },
          { id: 'b', name: 'B' },
        ],
      },
      body: {
        type: 'crud',
        name: 'crudPicker',
        pickerMode: true,
        multiple: false,
        keepItemSelectionOnPageChange: true,
        source: '${pickerRows}',
        columns: [{ name: 'name', label: '名称' }],
      },
    })

    await nextTick()
    expect(host.querySelector('.vamis-radio-dot')).toBeTruthy()
    expect(
      host.querySelector('table tbody tr')?.querySelector('input[type="checkbox"]'),
    ).toBeNull()

    ;(host.querySelector('table tbody tr') as HTMLElement).click()
    const crud = scoped.getComponentByName('crudPicker') as {
      getData?: () => Record<string, unknown>
    }
    await vi.waitFor(() =>
      expect(crud.getData?.().selectedItems).toEqual([
        expect.objectContaining({ id: 'a', name: 'A' }),
      ]),
    )

    ;(host.querySelectorAll('table tbody tr')[1] as HTMLElement).click()
    await vi.waitFor(() =>
      expect(crud.getData?.().selectedItems).toEqual([
        expect.objectContaining({ id: 'b', name: 'B' }),
      ]),
    )
  })

  it('uses strictMode for initial picker selection identity', async () => {
    const loose = mount({
      type: 'page',
      body: {
        type: 'crud',
        name: 'crudPickerLooseIdentity',
        pickerMode: true,
        multiple: false,
        keepItemSelectionOnPageChange: true,
        value: '1',
        primaryField: 'id',
        source: '$items',
        data: {
          items: [{ id: 1, name: '数字 1' }],
        },
        columns: [{ name: 'name', label: '名称' }],
      },
    })

    await nextTick()
    expect(loose.host.querySelector('.vamis-radio-dot')?.getAttribute('aria-checked')).toBe(
      'true',
    )
    loose.scoped.unmount()

    const strict = mount({
      type: 'page',
      body: {
        type: 'crud',
        name: 'crudPickerStrictIdentity',
        pickerMode: true,
        multiple: false,
        keepItemSelectionOnPageChange: true,
        strictMode: true,
        value: '1',
        primaryField: 'id',
        source: '$items',
        data: {
          items: [{ id: 1, name: '数字 1' }],
        },
        columns: [{ name: 'name', label: '名称' }],
      },
    })

    await nextTick()
    expect(
      strict.host.querySelector('.vamis-radio-dot')?.getAttribute('aria-checked'),
    ).toBe('false')
  })

  it('paginates local picker rows and preserves selection across pages', async () => {
    const rows = Array.from({ length: 11 }, (_, index) => ({
      id: String(index + 1),
      name: `选项 ${index + 1}`,
    }))
    const { host, scoped } = mount({
      type: 'page',
      data: { pickerRows: rows },
      body: {
        type: 'crud',
        name: 'crudPickerPaged',
        pickerMode: true,
        perPage: 10,
        keepItemSelectionOnPageChange: true,
        source: '${pickerRows}',
        columns: [{ name: 'name', label: '名称' }],
      },
    })

    await nextTick()
    expect(host.querySelectorAll('table tbody tr')).toHaveLength(10)
    ;(host.querySelector('table tbody tr') as HTMLElement).click()
    ;(host.querySelector('[data-pager="next"]') as HTMLElement).click()
    await vi.waitFor(() =>
      expect(host.querySelectorAll('table tbody tr')).toHaveLength(1),
    )
    expect(host.querySelector('table tbody tr')?.textContent).toContain('选项 11')

    const crud = scoped.getComponentByName('crudPickerPaged') as {
      getData?: () => Record<string, unknown>
    }
    expect(crud.getData?.().selectedItems).toEqual([
      expect.objectContaining({ id: '1' }),
    ])
  })

  it('keeps initial selected option objects when pagination changes the current rows', async () => {
    const rows = Array.from({ length: 11 }, (_, index) => ({
      id: String(index + 1),
      name: `选项 ${index + 1}`,
    }))
    const { host, scoped } = mount({
      type: 'page',
      data: { pickerRows: rows },
      body: {
        type: 'crud',
        name: 'crudPickerInitialSelection',
        pickerMode: true,
        perPage: 10,
        keepItemSelectionOnPageChange: true,
        value: '1',
        valueField: 'id',
        labelField: 'name',
        source: '${pickerRows}',
        columns: [{ name: 'name', label: '名称' }],
      },
    })

    await nextTick()
    expect(host.querySelector('.vamis-crud-selection')?.textContent).toContain(
      '选项 1',
    )
    ;(host.querySelector('[data-pager="next"]') as HTMLElement).click()
    await vi.waitFor(() =>
      expect(host.querySelector('table tbody tr')?.textContent).toContain(
        '选项 11',
      ),
    )
    expect(host.querySelector('.vamis-crud-selection')?.textContent).toContain(
      '选项 1',
    )

    const crud = scoped.getComponentByName('crudPickerInitialSelection') as {
      getData?: () => Record<string, unknown>
    }
    expect(crud.getData?.().selectedItems).toEqual([
      expect.objectContaining({ id: '1', name: '选项 1' }),
    ])
  })

  it('keeps initial option labels when a remote page no longer contains the selected rows', async () => {
    const rows = Array.from({ length: 11 }, (_, index) => ({
      id: String(index + 1),
      name: `远程选项 ${index + 1}`,
    }))
    const { host, scoped } = mount(
      {
        type: 'page',
        body: {
          type: 'crud',
          name: 'crudPickerRemoteInitialSelection',
          pickerMode: true,
          perPage: 10,
          keepItemSelectionOnPageChange: true,
          value: '1',
          valueField: 'id',
          labelField: 'name',
          api: '/api/picker-rows',
          columns: [{ name: 'name', label: '名称' }],
        },
      },
      {
        fetcher: async (_api, data) => {
          const page = Number((data as Record<string, unknown>).page || 1)
          return {
            status: 0,
            data: {
              items: page === 1 ? rows.slice(0, 10) : rows.slice(10),
              total: rows.length,
            },
          }
        },
      },
    )

    await vi.waitFor(() =>
      expect(host.querySelector('.vamis-crud-selection')?.textContent).toContain(
        '远程选项 1',
      ),
    )
    ;(host.querySelector('[data-pager="next"]') as HTMLElement).click()
    await vi.waitFor(() =>
      expect(host.querySelector('table tbody tr')?.textContent).toContain(
        '远程选项 11',
      ),
    )
    expect(host.querySelector('.vamis-crud-selection')?.textContent).toContain(
      '远程选项 1',
    )

    const crud = scoped.getComponentByName(
      'crudPickerRemoteInitialSelection',
    ) as {
      getData?: () => Record<string, unknown>
    }
    expect(crud.getData?.().selectedItems).toEqual([
      expect.objectContaining({ id: '1', name: '远程选项 1' }),
    ])
  })

  it('renders custom footerToolbar statistics and pagination widgets', async () => {
    const rows = Array.from({ length: 11 }, (_, index) => ({
      id: String(index + 1),
      name: `选项 ${index + 1}`,
    }))
    const { host } = mount({
      type: 'page',
      data: { pickerRows: rows },
      body: {
        type: 'crud',
        name: 'crudCustomFooter',
        pickerMode: true,
        perPage: 10,
        source: '${pickerRows}',
        footerToolbar: [
          'statistics',
          {
            type: 'pagination',
            layout: 'perPage,pager,go',
            showPageInput: true,
          },
        ],
        columns: [{ name: 'name', label: '名称' }],
      },
    })

    await nextTick()
    expect(host.querySelector('.vamis-crud-statistics')?.textContent).toContain(
      '共：11 项',
    )
    expect(host.querySelector('[data-pagination="perpage"]')).toBeTruthy()
    expect(host.querySelector('[data-pagination="pager"]')).toBeTruthy()
    expect(host.querySelector('[data-pagination="go"]')).toBeTruthy()
  })

  it('expands nested CRUD rows one branch at a time and cascades picker selection', async () => {
    const { host, scoped } = mount({
      type: 'page',
      data: {
        pickerRows: [
          {
            id: 'root-a',
            name: 'Root A',
            children: [
              { id: 'a-1', name: 'Child A1' },
              { id: 'a-2', name: 'Child A2' },
            ],
          },
          {
            id: 'root-b',
            name: 'Root B',
            children: [{ id: 'b-1', name: 'Child B1' }],
          },
        ],
      },
      body: {
        type: 'crud',
        name: 'crudPickerTree',
        pickerMode: true,
        multiple: true,
        source: '${pickerRows}',
        columns: [{ name: 'name', label: '名称' }],
      },
    })

    await nextTick()
    const rowTexts = () =>
      [...host.querySelectorAll('.vamis-crud-body table tbody tr')].map((row) =>
        (row.textContent || '').replace(/\s+/g, ' ').trim(),
      )
    expect(rowTexts()).toHaveLength(2)
    expect(rowTexts().join(' ')).not.toContain('Child A1')

    const expandRootA = host.querySelector(
      '.vamis-crud-body table tbody tr .vamis-table__expand-btn',
    ) as HTMLElement
    expect(expandRootA).toBeTruthy()
    expandRootA.click()
    await vi.waitFor(() => expect(rowTexts()).toHaveLength(4))
    expect(rowTexts().join(' ')).toContain('Child A1')
    expect(rowTexts().join(' ')).not.toContain('Child B1')

    const childA1 = [...host.querySelectorAll('.vamis-crud-body table tbody tr')].find(
      (row) => (row.textContent || '').includes('Child A1'),
    ) as HTMLElement
    childA1.click()
    const crud = scoped.getComponentByName('crudPickerTree') as {
      getData?: () => Record<string, unknown>
    }
    await vi.waitFor(() =>
      expect(
        (crud.getData?.().selectedItems as Array<{ id: string }>).map(
          (item) => item.id,
        ),
      ).toEqual(['a-1']),
    )

    const childA2 = [...host.querySelectorAll('.vamis-crud-body table tbody tr')].find(
      (row) => (row.textContent || '').includes('Child A2'),
    ) as HTMLElement
    childA2.click()
    await vi.waitFor(() =>
      expect(
        (crud.getData?.().selectedItems as Array<{ id: string }>).map(
          (item) => item.id,
        ).sort(),
      ).toEqual(['a-1', 'a-2', 'root-a']),
    )
  })

  it('renders columns-toggler in the CRUD header and updates visible columns', async () => {
    const { host } = mount({
      type: 'page',
      data: {
        rows: [{ id: '1', name: 'A', status: 'ok' }],
      },
      body: {
        type: 'crud',
        name: 'crudColumnToggler',
        source: '${rows}',
        headerToolbar: [
          {
            type: 'columns-toggler',
            label: '列显示',
          },
        ],
        columns: [
          { name: 'name', label: '名称' },
          { name: 'status', label: '状态' },
        ],
      },
    })

    await nextTick()
    expect(host.querySelector('[data-column-toggler]')).toBeTruthy()
    const button = host.querySelector(
      '.vamis-column-toggler__btn',
    ) as HTMLElement
    button.click()
    await vi.waitFor(() =>
      expect(document.querySelector('.vamis-column-toggler__menu')).toBeTruthy(),
    )
    const statusItem = [...document.querySelectorAll('.vamis-column-toggler__item')].find(
      (item) => (item.textContent || '').trim() === '状态',
    ) as HTMLElement
    expect(statusItem).toBeTruthy()
    ;(statusItem.querySelector('label') as HTMLElement).click()
    await vi.waitFor(() =>
      expect(
        [...host.querySelectorAll('table thead th')].map((th) =>
          (th.textContent || '').trim(),
        ),
      ).toEqual(['名称']),
    )
  })

  it('auto injects columns-toggler for more than five table columns', async () => {
    const { host } = mount({
      type: 'page',
      data: { rows: [{ id: '1', a: 'A' }] },
      body: {
        type: 'crud',
        name: 'crudAutoColumnToggler',
        source: '${rows}',
        columns: [
          { name: 'a', label: 'A' },
          { name: 'b', label: 'B' },
          { name: 'c', label: 'C' },
          { name: 'd', label: 'D' },
          { name: 'e', label: 'E' },
          { name: 'f', label: 'F' },
        ],
      },
    })

    await nextTick()
    expect(host.querySelector('[data-column-toggler]')).toBeTruthy()
  })
})
