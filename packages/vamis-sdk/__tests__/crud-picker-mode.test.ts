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
})
