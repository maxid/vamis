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
