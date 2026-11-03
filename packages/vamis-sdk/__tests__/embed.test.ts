import { nextTick } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { embed, normalizeEmbedSchema } from '../src/embed'
import { IR_API_VERSION } from '@vamis/core'
import 'vamis'

const mounts: Array<ReturnType<typeof embed>> = []

afterEach(() => {
  while (mounts.length) mounts.pop()?.unmount()
  document.body.innerHTML = ''
})

function mount(schema: unknown, props?: Parameters<typeof embed>[2]) {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const scoped = embed(host, schema, props)
  mounts.push(scoped)
  return { host, scoped }
}

describe('normalizeEmbedSchema', () => {
  it('parses YAML strings', () => {
    expect(normalizeEmbedSchema('type: page\ntitle: YAML\nbody: hi')).toEqual({
      type: 'page',
      title: 'YAML',
      body: 'hi',
    })
  })

  it('parses JSON strings', () => {
    expect(normalizeEmbedSchema('{"type":"page","title":"JSON"}')).toEqual({
      type: 'page',
      title: 'JSON',
    })
  })

  it('passes objects through', () => {
    const schema = { type: 'page', title: 'Obj' }
    expect(normalizeEmbedSchema(schema)).toBe(schema)
  })
})

describe('embed', () => {
  it('throws when the container is missing', () => {
    expect(() => embed('#missing', { type: 'page', body: 'x' })).toThrow(/container not found/)
  })

  it('does not mount on document.body directly', () => {
    const scoped = embed(document.body, { type: 'page', title: 'Body wrap', body: 'ok' })
    mounts.push(scoped)
    expect(document.body.firstElementChild).not.toBeNull()
    expect(document.body.firstElementChild?.classList.contains('vamis-sdk')).toBe(false)
    expect(document.body.querySelector('.vamis-sdk')).toBeTruthy()
  })

  it('keeps two page-body buttons as inline-block siblings (Amis style 基本使用)', async () => {
    const { host } = mount({
      type: 'page',
      body: [
        { type: 'button', label: '按钮1', actionType: 'dialog', dialog: { title: '弹框', body: 'Hello World!' } },
        {
          type: 'button',
          label: '按钮2',
          className: 'm-l',
          actionType: 'dialog',
          dialog: { title: '弹框', body: 'Hello World!' },
        },
      ],
    })
    await nextTick()
    const wraps = [...host.querySelectorAll('button')]
      .filter((btn) => /^按钮[12]$/.test((btn.textContent || '').trim()))
      .map((btn) => btn.closest('.vamis-node'))
    expect(wraps).toHaveLength(2)
    expect(wraps[0]?.classList.contains('inline-block')).toBe(true)
    expect(wraps[1]?.classList.contains('inline-block')).toBe(true)
    expect(wraps[1]?.className.split(/\s+/)).toContain('m-l')
  })

  it('maps Amis button level and size onto data-variant / data-size', async () => {
    const { host } = mount({
      type: 'page',
      body: [
        { type: 'button', label: '次要', level: 'secondary' },
        { type: 'button', label: '深色', level: 'dark' },
        { type: 'button', label: '浅色', level: 'light' },
        { type: 'button', label: '信息', level: 'info' },
        { type: 'button', label: '极小', size: 'xs' },
        { type: 'button', label: '中等', size: 'md' },
      ],
    })
    await nextTick()
    const byLabel = (label: string) =>
      [...host.querySelectorAll('button')].find((btn) => (btn.textContent || '').trim() === label)
    expect(byLabel('次要')?.getAttribute('data-variant')).toBe('secondary')
    expect(byLabel('深色')?.getAttribute('data-variant')).toBe('dark')
    expect(byLabel('浅色')?.getAttribute('data-variant')).toBe('light')
    expect(byLabel('信息')?.getAttribute('data-variant')).toBe('info')
    expect(byLabel('极小')?.getAttribute('data-size')).toBe('xs')
    expect(byLabel('中等')?.getAttribute('data-size')).toBe('md')
  })

  it('maps empty-label / iconOnly buttons onto square icon sizes without touching labelled ones', async () => {
    const { host } = mount({
      type: 'page',
      body: [
        { type: 'button', icon: 'fa fa-plus', label: '' },
        { type: 'button', icon: 'fa fa-plus', label: '弹框' },
        { type: 'button', icon: 'fa fa-plus', iconOnly: true, label: '隐藏' },
        { type: 'button', icon: 'fa fa-plus', label: '', size: 'xs' },
        { type: 'button', icon: 'fa fa-plus', label: '', size: 'sm' },
        { type: 'button', icon: 'fa fa-plus', label: '', size: 'md' },
        { type: 'button', icon: 'fa fa-plus', label: '', size: 'lg' },
        { type: 'button', icon: 'fa fa-plus', label: '', level: 'link' },
      ],
    })
    await nextTick()
    const buttons = [...host.querySelectorAll('button')]
    expect(buttons.map((btn) => btn.getAttribute('data-size'))).toEqual([
      'icon',
      'default',
      'icon',
      'icon-xs',
      'icon-sm',
      'icon-md',
      'icon-lg',
      'default',
    ])
    expect(buttons[0].querySelector('i.fa.fa-plus')).toBeTruthy()
    expect((buttons[1].textContent || '').trim()).toBe('弹框')
    expect((buttons[2].textContent || '').trim()).not.toContain('隐藏')
    expect(buttons[1].className).toMatch(/px-3/)
    expect(buttons[0].className).toMatch(/p-0/)
    expect(buttons[0].className).not.toMatch(/px-3/)
  })

  it('renders page / tpl / button from a JSON schema', async () => {
    const { host } = mount({
      type: 'page',
      title: 'Hello SDK',
      body: [
        { type: 'tpl', tpl: 'from-embed' },
        { type: 'button', label: 'Go' },
      ],
    })
    await nextTick()
    expect(host.textContent).toContain('Hello SDK')
    expect(host.textContent).toContain('from-embed')
    expect(host.textContent).toContain('Go')
  })

  it('renders a YAML string schema', async () => {
    const { host } = mount('type: page\ntitle: YAML Page\nbody: yaml-body')
    await nextTick()
    expect(host.textContent).toContain('YAML Page')
    expect(host.textContent).toContain('yaml-body')
  })

  it('renders an IR envelope', async () => {
    const { host } = mount({
      apiVersion: IR_API_VERSION,
      kind: 'UiPage',
      metadata: { name: 'sdk-ir' },
      spec: { type: 'page', title: 'IR Page', body: 'ir-body' },
    })
    await nextTick()
    expect(host.textContent).toContain('IR Page')
    expect(host.textContent).toContain('ir-body')
  })

  it('updateSchema replaces the page', async () => {
    const { host, scoped } = mount({ type: 'page', title: 'One', body: 'aaa' })
    await nextTick()
    scoped.updateSchema({ type: 'page', title: 'Two', body: 'bbb' })
    await nextTick()
    expect(host.textContent).toContain('Two')
    expect(host.textContent).toContain('bbb')
    expect(host.textContent).not.toContain('aaa')
  })

  it('updateProps merges data into templates', async () => {
    const { host, scoped } = mount(
      { type: 'page', title: 'Hi', body: { type: 'tpl', tpl: 'name=${name}' } },
      { data: { name: 'Ada' } },
    )
    await nextTick()
    expect(host.textContent).toContain('name=Ada')
    scoped.updateProps({ data: { name: 'Bob' } })
    await nextTick()
    expect(host.textContent).toContain('name=Bob')
  })

  it('unmount removes the vue app', async () => {
    const { host, scoped } = mount({ type: 'page', title: 'Bye', body: 'gone' })
    await nextTick()
    scoped.unmount()
    expect(host.textContent).not.toContain('Bye')
  })

  it('getComponentByName finds a named page', async () => {
    const { scoped } = mount({ type: 'page', name: 'main', body: 'hello' })
    await nextTick()
    expect(scoped.getComponentByName('missing')).toBeUndefined()
    const page = scoped.getComponentByName('main') as { reload?: () => void; getData?: () => unknown }
    expect(page?.getData?.()).toBeTruthy()
    expect(typeof page?.reload).toBe('function')
    expect(scoped.getComponents().length).toBeGreaterThan(0)
  })

  it('doAction runs a toast through env.notify', async () => {
    const notify = vi.fn()
    const host = document.createElement('div')
    document.body.appendChild(host)
    const scoped = embed(host, { type: 'page', body: 'x' }, undefined, { notify })
    mounts.push(scoped)
    await nextTick()
    await scoped.doAction({ actionType: 'toast', msg: 'hi ${name}' }, { name: 'Ada' })
    expect(notify).toHaveBeenCalledWith('info', 'hi Ada', expect.any(Object))
  })

  it('checkbox writes trueValue/falseValue and keeps option beside the box', async () => {
    const { host, scoped } = mount({
      type: 'page',
      body: {
        type: 'form',
        name: 'boxForm',
        wrapWithPanel: false,
        body: [
          {
            type: 'checkbox',
            name: 'agree',
            label: '勾选框',
            option: '选项说明',
            trueValue: 1,
            falseValue: 0,
          },
        ],
      },
    })
    await nextTick()
    expect(host.textContent).toContain('勾选框')
    expect(host.textContent).toContain('选项说明')
    expect(host.querySelector('[data-slot="checkbox"]')).toBeTruthy()
    const form = scoped.getComponentByName('boxForm') as {
      getData?: () => Record<string, unknown>
      context?: { getComponentByName: (name: string) => { setData?: (v: Record<string, unknown>) => void } }
    }
    const field = form?.context?.getComponentByName('agree')
    expect(field).toBeTruthy()
    field?.setData?.({ value: 1 })
    await nextTick()
    expect(form?.getData?.()?.agree).toBe(1)
    field?.setData?.({ value: 0 })
    await nextTick()
    expect(form?.getData?.()?.agree).toBe(0)
  })

  it('checkbox clear / reset / setValue go through componentId', async () => {
    const { host, scoped } = mount({
      type: 'page',
      body: {
        type: 'form',
        name: 'actForm',
        wrapWithPanel: false,
        body: [
          {
            type: 'checkbox',
            name: 'type',
            id: 'setvalue_type',
            label: '选项',
            option: '选项说明',
            value: true,
          },
          {
            type: 'button',
            label: '清空',
            onEvent: { click: { actions: [{ actionType: 'clear', componentId: 'setvalue_type' }] } },
          },
          {
            type: 'button',
            label: '重置',
            onEvent: { click: { actions: [{ actionType: 'reset', componentId: 'setvalue_type' }] } },
          },
          {
            type: 'button',
            label: '赋值',
            onEvent: { click: { actions: [{ actionType: 'setValue', componentId: 'setvalue_type', args: { value: false } }] } },
          },
        ],
      },
    })
    await nextTick()
    const form = scoped.getComponentByName('actForm') as { getData?: () => Record<string, unknown> }
    expect(form?.getData?.()?.type).toBe(true)
    const buttons = [...host.querySelectorAll('button')].filter((btn) =>
      ['清空', '重置', '赋值'].includes((btn.textContent || '').trim()),
    )
    expect(buttons).toHaveLength(3)
    buttons[0].click()
    await nextTick()
    expect(form?.getData?.()?.type).toBe('')
    buttons[1].click()
    await nextTick()
    expect(form?.getData?.()?.type).toBe(true)
    buttons[2].click()
    await nextTick()
    expect(form?.getData?.()?.type).toBe(false)
  })

  it('input-date stores unix seconds and honors shortcuts / minDate', async () => {
    const { host, scoped } = mount({
      type: 'page',
      body: {
        type: 'form',
        name: 'dateForm',
        wrapWithPanel: false,
        debug: true,
        body: [
          {
            type: 'input-date',
            name: 'date',
            label: '日期',
            value: '1591862818',
            shortcuts: ['today', 'yesterday'],
            minDate: '1591862818',
          },
        ],
      },
    })
    await nextTick()
    const form = scoped.getComponentByName('dateForm') as { getData?: () => Record<string, unknown> }
    expect(String(form?.getData?.()?.date)).toBe('1591862818')
    expect(host.querySelector('[data-slot="input-date"]')).toBeTruthy()
    const input = host.querySelector('[data-slot="input-date"] input') as HTMLInputElement | null
    expect(input?.value).toMatch(/2020-06-11/)
    input?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await nextTick()
    const shortcut = [...host.querySelectorAll('.vamis-date-picker__shortcut')].find(
      (el) => (el.textContent || '').trim() === '今天',
    ) as HTMLButtonElement | undefined
    expect(shortcut).toBeTruthy()
    shortcut?.click()
    await nextTick()
    const next = String(form?.getData?.()?.date || '')
    expect(next).toMatch(/^\d{10}$/)
    expect(Number(next)).toBeGreaterThanOrEqual(1591862818)
  })

  it('input-date clear / reset / setValue go through componentId', async () => {
    const { host, scoped } = mount({
      type: 'page',
      body: {
        type: 'form',
        name: 'actDate',
        wrapWithPanel: false,
        body: [
          {
            type: 'input-date',
            name: 'date',
            id: 'setvalue_text',
            label: '日期',
            value: '1714060800',
          },
          {
            type: 'button',
            label: '清空',
            onEvent: { click: { actions: [{ actionType: 'clear', componentId: 'setvalue_text' }] } },
          },
          {
            type: 'button',
            label: '重置',
            onEvent: { click: { actions: [{ actionType: 'reset', componentId: 'setvalue_text' }] } },
          },
          {
            type: 'button',
            label: '赋值',
            onEvent: {
              click: { actions: [{ actionType: 'setValue', componentId: 'setvalue_text', args: { value: '1714233600' } }] },
            },
          },
        ],
      },
    })
    await nextTick()
    const form = scoped.getComponentByName('actDate') as { getData?: () => Record<string, unknown> }
    expect(String(form?.getData?.()?.date)).toBe('1714060800')
    const buttons = [...host.querySelectorAll('button')].filter((btn) =>
      ['清空', '重置', '赋值'].includes((btn.textContent || '').trim()),
    )
    expect(buttons).toHaveLength(3)
    buttons[0].click()
    await nextTick()
    expect(form?.getData?.()?.date).toBe('')
    buttons[1].click()
    await nextTick()
    expect(String(form?.getData?.()?.date)).toBe('1714060800')
    buttons[2].click()
    await nextTick()
    expect(String(form?.getData?.()?.date)).toBe('1714233600')
  })
})
