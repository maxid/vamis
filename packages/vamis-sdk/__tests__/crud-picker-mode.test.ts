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
})
