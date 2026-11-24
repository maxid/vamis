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
          type: 'table',
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
      expect((firstRow.querySelector('input') as HTMLInputElement)?.checked).toBe(
        true,
      ),
    )
    buttonWithText('确定')?.click()

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
      expect(document.querySelector('.vamis-picker__item')).toBeTruthy(),
    )
    ;(document.querySelector('.vamis-picker__item') as HTMLElement).click()
    buttonWithText('确定')?.click()
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
