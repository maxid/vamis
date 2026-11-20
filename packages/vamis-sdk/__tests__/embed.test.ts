import { defineComponent, h, nextTick } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { embed, normalizeEmbedSchema } from '../src/embed'
import { IR_API_VERSION, registerRenderer, registerTheme, useEnv } from '@vamis/core'
import 'vamis'

const mounts: Array<ReturnType<typeof embed>> = []

afterEach(() => {
  while (mounts.length) mounts.pop()?.unmount()
  document.body.innerHTML = ''
})

function mount(schema: unknown, props?: Parameters<typeof embed>[2], env?: Parameters<typeof embed>[3]) {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const scoped = embed(host, schema, props, env)
  mounts.push(scoped)
  return { host, scoped }
}

function dialogFeedbackSchema() {
  return {
    type: 'page',
    body: {
      type: 'button',
      label: '弹一个框',
      actionType: 'dialog',
      dialog: {
        title: '提示',
        body: {
          type: 'form',
          api: '/api/mock2/form/saveForm?waitSeconds=2',
          body: [
            {
              type: 'input-text',
              name: 'text',
              required: true,
              label: '用户名',
              placeholder: '请输入用户名',
            },
            {
              type: 'input-password',
              name: 'password',
              required: true,
              label: '密码',
              placeholder: '请输入密码',
            },
            { type: 'checkbox', name: 'rememberMe', label: '记住登录' },
          ],
        },
        actions: [
          {
            type: 'button',
            label: '提交表单 Feedback',
            actionType: 'confirm',
            feedback: {
              body: 'feedback弹框中，不请求接口了，直接点击按钮关闭',
              actions: [{ type: 'button', actionType: 'close', label: '关闭' }],
            },
          },
          {
            type: 'button',
            label: 'ajax请求 Feedback',
            actionType: 'ajax',
            close: true,
            api: '/api/mock2/form/initData?waitSeconds=1',
            feedback: {
              body: 'feedback弹框中，不请求接口了，直接点击按钮关闭',
              actions: [{ type: 'button', actionType: 'close', label: '关闭' }],
            },
          },
        ],
      },
    },
  }
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

  it('applies the gold theme and accent to the embed host', () => {
    const { host } = mount({ type: 'page', body: 'ok' }, undefined, { theme: 'gold' })
    expect(host.dataset.theme).toBe('gold')
    expect(host.dataset.accent).toBe('gold')
    expect(host.classList.contains('dark')).toBe(false)
  })

  it('applies registered theme tokens to the runtime root', async () => {
    registerTheme('embed-test', { '--primary': '#123456', '--primary-onHover': '#654321' })
    const { host } = mount({ type: 'page', body: 'ok' }, undefined, { theme: 'embed-test' })
    await nextTick()
    const root = host.querySelector('.vamis-root') as HTMLElement
    expect(host.dataset.theme).toBe('embed-test')
    expect(root.style.getPropertyValue('--primary')).toBe('#123456')
    expect(root.style.getPropertyValue('--primary-hover')).toBe('#654321')
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

  it('uses the Amis Dialog.title default when title is omitted', async () => {
    const { host } = mount({
      type: 'page',
      body: {
        type: 'button',
        label: '打开',
        actionType: 'dialog',
        dialog: { body: '内容' },
      },
    })

    await nextTick()
    const open = [...host.querySelectorAll('button')].find(
      (item) => (item.textContent || '').trim() === '打开',
    )
    open?.click()
    await vi.waitFor(() => {
      expect(document.querySelector('[data-slot="dialog-title"]')?.textContent?.trim()).toBe('弹框')
    })
  })

  it('opens ajax feedback only when visibleOn sees the numeric Unix second', async () => {
    let date = 1646323200
    const notify = vi.fn()
    const fetcher = vi.fn(async () => ({
      status: 0,
      msg: '',
      data: { date },
    }))
    const { host } = mount(
      {
        type: 'page',
        body: {
          type: 'button',
          label: '条件feedback',
          actionType: 'ajax',
          api: '/api/mock2/form/initData?waitSeconds=1',
          feedback: {
            visibleOn: '!(this.date % 2)',
            title: '操作成功',
            body: '当前时间戳: <code>${date}</code>',
          },
        },
      },
      undefined,
      { fetcher, notify },
    )

    await nextTick()
    const button = [...host.querySelectorAll('button')].find(
      (item) => (item.textContent || '').trim() === '条件feedback',
    )
    button?.click()
    await vi.waitFor(() => {
      expect(document.querySelector('[data-slot="dialog-content"]')).not.toBeNull()
    })
    ;(document.querySelector('[data-slot="dialog-close"]') as HTMLButtonElement | null)?.click()
    await vi.waitFor(() => {
      expect(document.querySelector('[data-slot="dialog-content"]')).toBeNull()
    })

    date = 1646323201
    button?.click()
    await vi.waitFor(() => expect(fetcher).toHaveBeenCalledTimes(2))
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(document.querySelector('[data-slot="dialog-content"]')).toBeNull()
    expect(notify).not.toHaveBeenCalledWith('success', expect.anything())
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

  it('routes CRUD operation buttons through SchemaRenderer visibility', async () => {
    const notify = vi.fn()
    const { host } = mount(
      {
        type: 'page',
        body: {
          type: 'crud',
          source: '$items',
          columns: [
            { name: 'name', label: '名称' },
            {
              type: 'operation',
              label: '操作',
              buttons: [
                {
                  type: 'button',
                  label: '隐藏操作',
                  visibleOn: '${false}',
                  actionType: 'toast',
                  toast: { items: [{ body: '不应出现' }] },
                },
                {
                  type: 'button',
                  label: '可见操作',
                  actionType: 'toast',
                  toast: { items: [{ body: '正常操作' }] },
                },
              ],
            },
          ],
        },
      },
      { data: { items: [{ id: 1, name: '记录 A' }] } },
      { notify },
    )

    await nextTick()
    await vi.waitFor(() => {
      expect([...host.querySelectorAll('button')].some((btn) => btn.textContent?.trim() === '可见操作')).toBe(true)
    })
    expect([...host.querySelectorAll('button')].some((btn) => btn.textContent?.trim() === '隐藏操作')).toBe(false)

    const visible = [...host.querySelectorAll('button')].find(
      (btn) => btn.textContent?.trim() === '可见操作',
    )
    visible?.click()
    await vi.waitFor(() => {
      expect(notify).toHaveBeenCalledWith('info', '正常操作', expect.anything())
    })
  })

  it('does not invent a Form save toast when response msg is empty', async () => {
    const notify = vi.fn()
    const fetcher = vi.fn(async () => ({ status: 0, msg: '', data: { id: 1 } }))
    const { host } = mount(
      {
        type: 'page',
        body: {
          type: 'form',
          api: '/api/mock2/form/initData?waitSeconds=1',
          body: [{ type: 'input-text', name: 'name', label: '名称' }],
          actions: [{ type: 'button', label: '提交', actionType: 'submit' }],
        },
      },
      undefined,
      { fetcher, notify },
    )

    await nextTick()
    const submit = [...host.querySelectorAll('button')].find(
      (btn) => btn.textContent?.trim() === '提交',
    )
    submit?.click()
    await vi.waitFor(() => expect(fetcher).toHaveBeenCalled())
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(notify).not.toHaveBeenCalledWith('success', expect.anything())
  })

  it('keeps Dialog confirm feedback silent when the outer Form response msg is empty', async () => {
    const notify = vi.fn()
    const fetcher = vi.fn(async () => ({ status: 0, msg: '', data: { id: 1 } }))
    const { host } = mount(
      {
        type: 'page',
        body: {
          type: 'button',
          label: '打开',
          actionType: 'dialog',
          dialog: {
            title: '提示',
            body: {
              type: 'form',
              api: '/api/mock2/form/initData?waitSeconds=1',
              body: [{ type: 'input-text', name: 'name', label: '名称' }],
            },
            actions: [
              {
                type: 'button',
                label: 'Feedback',
                actionType: 'confirm',
                feedback: {
                  body: '这是一个feedback弹框',
                  skipRestOnCancel: true,
                },
              },
            ],
          },
        },
      },
      undefined,
      { fetcher, notify },
    )

    await nextTick()
    ;[...host.querySelectorAll('button')]
      .find((btn) => btn.textContent?.trim() === '打开')
      ?.click()
    const feedback = await vi.waitFor(() => {
      const button = [...document.querySelectorAll('button')].find(
        (item) => item.textContent?.trim() === 'Feedback',
      )
      expect(button).toBeTruthy()
      return button as HTMLButtonElement
    })
    feedback.click()
    await vi.waitFor(() => expect(fetcher).toHaveBeenCalled())
    await vi.waitFor(() => {
      expect(document.querySelectorAll('[data-slot="dialog-content"]')).toHaveLength(2)
    })
    expect(notify).not.toHaveBeenCalledWith('success', expect.anything())
  })

  it('uses an explicit Form messages.saveSuccess when the response has no msg', async () => {
    const notify = vi.fn()
    const fetcher = vi.fn(async () => ({ status: 0, msg: '', data: { id: 1 } }))
    const { host } = mount(
      {
        type: 'page',
        body: {
          type: 'form',
          api: '/api/mock2/form/initData?waitSeconds=1',
          messages: { saveSuccess: '自定义成功' },
          body: [{ type: 'input-text', name: 'name', label: '名称' }],
          actions: [{ type: 'button', label: '提交', actionType: 'submit' }],
        },
      },
      undefined,
      { fetcher, notify },
    )

    await nextTick()
    const submit = [...host.querySelectorAll('button')].find(
      (btn) => btn.textContent?.trim() === '提交',
    )
    submit?.click()
    await vi.waitFor(() => {
      expect(notify).toHaveBeenCalledWith('success', '自定义成功')
    })
  })

  it('renders Form debug at the top as a highlighted JSON tree', async () => {
    const longText = 'debug-value-'.repeat(12)
    const { host } = mount({
      type: 'form',
      debug: true,
      debugConfig: {
        displayDataTypes: true,
        levelExpand: 2,
      },
      data: {
        name: 'Ada',
        age: 18,
        active: true,
        nothing: null,
        long: longText,
      },
      body: [{ type: 'input-text', name: 'name', label: '名称' }],
    })

    await nextTick()
    await vi.waitFor(() => {
      expect(host.querySelector('.vamis-form-debug [data-slot="json"]')).toBeTruthy()
    })
    const debug = host.querySelector('.vamis-form-debug')
    const item = host.querySelector('.vamis-form-item')
    expect(debug).toBeTruthy()
    expect(item).toBeTruthy()
    expect(
      !!debug &&
        !!item &&
        (debug.compareDocumentPosition(item) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0,
    ).toBe(true)
    expect(host.querySelector('.vamis-form-debug pre')).toBeNull()
    expect(host.querySelector('.vamis-json-node__value.is-string')).toBeTruthy()
    expect(host.querySelector('.vamis-json-node__value.is-number')).toBeTruthy()
    expect(host.querySelector('.vamis-json-node__value.is-boolean')).toBeTruthy()
    expect(host.querySelector('.vamis-json-node__value.is-null')).toBeTruthy()
    expect(host.querySelector('.vamis-json-node__key')?.textContent).toContain('"name" :')
    expect(host.querySelector('.vamis-json-node__toggle-box')).toBeTruthy()
    expect(host.querySelector('.vamis-form-debug')?.textContent).toContain('5 items')
    expect(host.querySelector('.vamis-form-debug')?.textContent).toContain('...')
    expect(host.querySelector('.vamis-form-debug [data-slot="badge"]')).toBeTruthy()
    ;(host.querySelector('.vamis-json-node__toggle') as HTMLButtonElement | null)?.click()
    await nextTick()
    expect(host.querySelector('.vamis-json-node__ellipsis')?.textContent).toBe('...')
  })

  it('shows the Page spinner overlay while a root ajax action is pending', async () => {
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
          type: 'button',
          label: 'Feedback',
          actionType: 'ajax',
          api: '/api/mock2/form/initData?waitSeconds=2',
          feedback: {
            title: '操作成功',
            body: '服务器已返回结果。',
          },
        },
      },
      undefined,
      { fetcher, notify: vi.fn() },
    )

    await nextTick()
    const button = [...host.querySelectorAll('button')].find(
      (item) => (item.textContent || '').trim() === 'Feedback',
    )
    button?.click()

    await vi.waitFor(() => expect(fetcher).toHaveBeenCalled())
    await vi.waitFor(() => {
      expect(host.querySelector('.vamis-page__body .vamis-spinner--overlay')).not.toBeNull()
    })

    resolveFetch({ status: 0, msg: '', data: {} })
    await vi.waitFor(() => {
      expect(host.querySelector('.vamis-page__body .vamis-spinner--overlay')).toBeNull()
    })
    await vi.waitFor(() => {
      expect(document.querySelector('[data-slot="dialog-content"]')).not.toBeNull()
    })
  })

  it('shows Form body and Dialog-info while the exact dialog ajax action is pending', async () => {
    let resolveFetch!: (value: unknown) => void
    const fetcher = vi.fn(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve
        }),
    )
    const { host } = mount(dialogFeedbackSchema(), undefined, { fetcher, notify: vi.fn() })

    await nextTick()
    const open = [...host.querySelectorAll('button')].find(
      (item) => (item.textContent || '').trim() === '弹一个框',
    )
    open?.click()
    await vi.waitFor(() => {
      expect(document.querySelector('[data-slot="dialog-content"]')).not.toBeNull()
    })

    const ajax = [...document.querySelectorAll('button')].find(
      (item) => (item.textContent || '').trim() === 'ajax请求 Feedback',
    )
    ajax?.click()
    await vi.waitFor(() => expect(fetcher).toHaveBeenCalled())
    await vi.waitFor(() => {
      expect(document.querySelectorAll('.vamis-form .vamis-spinner--overlay')).toHaveLength(1)
      expect(document.querySelectorAll('.vamis-dialog-info .vamis-spinner')).toHaveLength(1)
    })
    expect(document.querySelector('.vamis-dialog-body-loading')).toBeNull()

    resolveFetch({ status: 0, msg: '', data: {} })
    await vi.waitFor(() => {
      expect(document.querySelectorAll('[data-slot="dialog-content"]')).toHaveLength(2)
    })
  })

  it('keeps a Form body Action on the Form host when a footer Action also exists', async () => {
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
          type: 'button',
          label: '弹一个框',
          actionType: 'dialog',
          dialog: {
            title: '提示',
            body: {
              type: 'form',
              body: [
                {
                  type: 'button',
                  label: 'body action',
                  actionType: 'ajax',
                  api: '/api/mock2/form/initData?waitSeconds=1',
                },
              ],
            },
            actions: [
              {
                type: 'button',
                label: 'footer action',
                actionType: 'ajax',
                api: '/api/mock2/form/initData?waitSeconds=1',
              },
            ],
          },
        },
      },
      undefined,
      { fetcher, notify: vi.fn() },
    )

    await nextTick()
    const open = [...host.querySelectorAll('button')].find(
      (item) => (item.textContent || '').trim() === '弹一个框',
    )
    open?.click()
    await vi.waitFor(() => {
      expect(document.querySelector('[data-slot="dialog-content"]')).not.toBeNull()
    })
    expect(document.querySelectorAll('.vamis-dialog-info .vamis-spinner')).toHaveLength(0)

    const bodyAction = [...document.querySelectorAll('button')].find(
      (item) => (item.textContent || '').trim() === 'body action',
    )
    bodyAction?.click()
    await vi.waitFor(() => expect(fetcher).toHaveBeenCalled())
    await vi.waitFor(() => {
      expect(document.querySelectorAll('.vamis-form .vamis-spinner--overlay')).toHaveLength(1)
      expect(document.querySelectorAll('.vamis-dialog-info .vamis-spinner')).toHaveLength(0)
    })

    resolveFetch({ status: 0, msg: '', data: {} })
    await vi.waitFor(() => {
      expect(document.querySelectorAll('.vamis-form .vamis-spinner--overlay')).toHaveLength(0)
      expect(document.querySelectorAll('.vamis-dialog-info .vamis-spinner')).toHaveLength(0)
    })
  })

  it('renders one Form overlay plus one Dialog-info Spinner for the exact dialog form submit', async () => {
    let resolveFetch!: (value: unknown) => void
    const fetcher = vi.fn(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve
        }),
    )
    mount(dialogFeedbackSchema(), undefined, { fetcher, notify: vi.fn() })

    await nextTick()
    const open = [...document.querySelectorAll('button')].find(
      (item) => (item.textContent || '').trim() === '弹一个框',
    )
    open?.click()
    await vi.waitFor(() => {
      expect(document.querySelector('.vamis-form')).not.toBeNull()
    })

    for (const [selector, value] of [
      ['input[placeholder="请输入用户名"]', 'vamis'],
      ['input[placeholder="请输入密码"]', 'secret'],
    ]) {
      const input = document.querySelector(selector) as HTMLInputElement
      input.value = value
      input.dispatchEvent(new Event('input', { bubbles: true }))
    }
    await nextTick()

    const submit = [...document.querySelectorAll('button')].find(
      (item) => (item.textContent || '').trim() === '提交表单 Feedback',
    )
    submit?.click()
    await vi.waitFor(() => expect(fetcher).toHaveBeenCalled())
    await vi.waitFor(() => {
      expect(document.querySelectorAll('.vamis-form .vamis-spinner--overlay')).toHaveLength(1)
      expect(document.querySelectorAll('.vamis-dialog-info .vamis-spinner')).toHaveLength(1)
      expect(document.querySelectorAll('.vamis-spinner--overlay')).toHaveLength(1)
    })

    resolveFetch({ status: 0, msg: '', data: {} })
    await vi.waitFor(() => {
      expect(document.querySelectorAll('.vamis-form .vamis-spinner--overlay')).toHaveLength(0)
      expect(document.querySelectorAll('.vamis-dialog-info .vamis-spinner')).toHaveLength(1)
      expect(document.querySelectorAll('[data-slot="dialog-content"]')).toHaveLength(2)
    })
    const closeFeedback = [...document.querySelectorAll('button')]
      .reverse()
      .find((item) => (item.textContent || '').trim() === '关闭')
    closeFeedback?.click()
    await vi.waitFor(() => {
      expect(document.querySelectorAll('.vamis-dialog-info .vamis-spinner')).toHaveLength(0)
    })
  })

  it('marks dialog form items and Dialog-error with the Amis validation level', async () => {
    const notify = vi.fn()
    const fetcher = vi.fn()
    mount(dialogFeedbackSchema(), undefined, { fetcher, notify })

    await nextTick()
    const open = [...document.querySelectorAll('button')].find(
      (item) => (item.textContent || '').trim() === '弹一个框',
    )
    open?.click()
    await vi.waitFor(() => {
      expect(document.querySelector('.vamis-form')).not.toBeNull()
    })

    const submit = [...document.querySelectorAll('button')].find(
      (item) => (item.textContent || '').trim() === '提交表单 Feedback',
    )
    submit?.click()

    await vi.waitFor(() => {
      expect(fetcher).not.toHaveBeenCalled()
      expect(document.querySelectorAll('.vamis-form-item.is-error')).toHaveLength(2)
      expect(document.querySelectorAll('.vamis-form-item.is-error .vamis-text-control__input')).toHaveLength(2)
      expect(document.querySelector('.vamis-dialog-error')?.textContent?.trim()).toBe(
        '依赖的部分字段没有通过验证',
      )
    })
    expect(notify).toHaveBeenCalledWith('error', '依赖的部分字段没有通过验证')
    await new Promise((resolve) => setTimeout(resolve, 3100))
    await nextTick()
    expect(document.querySelector('.vamis-dialog-error')).toBeNull()
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

  it('parseLocation false keeps compare query keys out of form data', async () => {
    const url = new URL(window.location.href)
    url.searchParams.set('engine', 'vamis')
    url.searchParams.set('case', 'components-form-input-date-0')
    window.history.replaceState({}, '', url)
    const host = document.createElement('div')
    document.body.appendChild(host)
    const scoped = embed(
      host,
      {
        type: 'page',
        body: { type: 'tpl', tpl: 'E=${engine}&C=${case}' },
      },
      undefined,
      { parseLocation: false },
    )
    mounts.push(scoped)
    await nextTick()
    expect(host.textContent).toContain('E=&C=')
    expect(host.textContent).not.toContain('vamis')
    expect(host.textContent).not.toContain('components-form-input-date-0')
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
    await nextTick()
    const shortcut = [...document.querySelectorAll('.vamis-date-picker__shortcut')].find(
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

  it('resolves top-level definitions with local fields overriding the reference', async () => {
    const { host } = mount({
      type: 'page',
      definitions: {
        nameField: { type: 'input-text', name: 'name', value: 'ref value', label: '定义标签' },
      },
      body: {
        type: 'form',
        actions: [],
        body: { $ref: 'nameField', label: '本地标签' },
      },
    })
    await nextTick()
    const input = host.querySelector('input[name="name"]') as HTMLInputElement
    expect(input?.value).toBe('ref value')
    expect(host.textContent).toContain('本地标签')
    expect(host.textContent).not.toContain('定义标签')
  })

  it('reports unknown definition references without rendering a placeholder component', async () => {
    const onDiagnostic = vi.fn()
    const { host } = mount({
      type: 'page',
      definitions: {},
      body: { $ref: 'missing' },
    }, undefined, { onDiagnostic })
    await nextTick()
    expect(host.querySelector('.vamis-page__body .vamis-node')).toBeNull()
    expect(onDiagnostic).toHaveBeenCalledWith(expect.objectContaining({
      type: 'renderer',
      message: '未知 definitions 引用 missing',
      detail: { $ref: 'missing' },
    }))
  })

  it('expands recursive definitions only when the current combo row enables children', async () => {
    const { host } = mount({
      type: 'page',
      definitions: {
        options: {
          type: 'combo',
          multiple: true,
          name: 'options',
          items: [
            { type: 'switch', name: 'hasChildren', value: false, label: '包含子选项' },
            { $ref: 'options', name: 'children', label: '子选项', visibleOn: '${hasChildren === true}' },
          ],
        },
      },
      body: { type: 'form', actions: [], body: { $ref: 'options', label: '选项' } },
    })
    await nextTick()
    const toggle = host.querySelector('input[type="checkbox"]') as HTMLInputElement
    toggle.click()
    await vi.waitFor(() => expect(host.textContent).toContain('子选项'))
    expect(host.querySelector('.vamis-renderer-error')).toBeNull()
    expect(host.textContent).toContain('新增一项')
  })

  it('syncs same-named form fields when trackExpression changes', async () => {
    const { host, scoped } = mount({
      type: 'page',
      data: { name: 'before' },
      body: [
        { type: 'input-text', name: 'name', label: '上层' },
        {
          type: 'form',
          id: 'trackedForm',
          trackExpression: '${name}',
          body: [{ type: 'input-text', name: 'name', label: '表单内' }],
        },
      ],
    })
    await nextTick()
    const input = host.querySelector('input[name="name"]') as HTMLInputElement
    input.value = 'after'
    input.dispatchEvent(new Event('input', { bubbles: true }))
    await vi.waitFor(() => {
      const form = scoped.getComponentByName('trackedForm') as { getData?: () => Record<string, unknown> }
      expect(form?.getData?.()?.name).toBe('after')
    })
  })

  it('keeps service field writes in the child scope instead of leaking them to page', async () => {
    const { host, scoped } = mount({
      type: 'page',
      id: 'scopePage',
      data: { shared: 'page' },
      body: [
        {
          type: 'service',
          data: { shared: 'service' },
          body: [
            { type: 'input-text', name: 'localOnly', label: '私有值' },
            { type: 'tpl', tpl: 'Service=${localOnly}' },
          ],
        },
        { type: 'tpl', tpl: 'Page=[${localOnly}]' },
      ],
    })
    await nextTick()
    const input = host.querySelector('input[name="localOnly"]') as HTMLInputElement
    input.value = 'private'
    input.dispatchEvent(new Event('input', { bubbles: true }))
    await vi.waitFor(() => expect(host.textContent).toContain('Service=private'))
    expect(host.textContent).toContain('Page=[]')
    const page = scoped.getComponentByName('scopePage') as { getData?: () => Record<string, unknown> }
    expect(page?.getData?.()?.localOnly).toBeUndefined()
    expect(page?.getData?.()?.shared).toBe('page')
  })

  it('still forwards card child-scope writes to the current cards row', async () => {
    const { host, scoped } = mount({
      type: 'cards',
      id: 'rowCards',
      data: { items: [{ version: '4' }] },
      card: {
        body: { type: 'input-text', name: 'version', label: 'Version' },
      },
    })
    await nextTick()
    const input = host.querySelector('input[name="version"]') as HTMLInputElement
    input.value = '5'
    input.dispatchEvent(new Event('input', { bubbles: true }))
    await vi.waitFor(() => {
      const cards = scoped.getComponentByName('rowCards') as {
        getData?: () => { items?: Array<Record<string, unknown>> }
      }
      expect(cards?.getData?.()?.items?.[0]?.version).toBe('5')
    })
  })

  it('records formula writes as formula changes', async () => {
    const { host } = mount({
      type: 'form',
      data: { price: 2, count: 3 },
      body: [
        { type: 'input-number', name: 'price', label: '单价' },
        { type: 'input-number', name: 'count', label: '数量' },
        { type: 'formula', name: 'total', formula: '${price * count}' },
        { type: 'tpl', tpl: '${total}:${__changeReason.type}' },
      ],
    })
    await vi.waitFor(() => expect(host.textContent).toContain('6:formula'))
  })

  it('clears hidden values from both form data and scope with hide reason', async () => {
    const { host, scoped } = mount({
      type: 'form',
      id: 'hiddenReasonForm',
      debug: true,
      data: { hide: false, secret: 'keep' },
      body: [
        { type: 'switch', name: 'hide', label: '隐藏' },
        { type: 'input-text', name: 'secret', visibleOn: '${!hide}', clearValueOnHidden: true },
        { type: 'tpl', tpl: 'secret=[${secret}]；${__changeReason.type}' },
      ],
    })
    await nextTick()
    const toggle = host.querySelector('input[type="checkbox"]') as HTMLInputElement
    toggle.click()
    await vi.waitFor(() => {
      expect(host.textContent).toContain('secret=[]；hide')
      const form = scoped.getComponentByName('hiddenReasonForm') as { getData?: () => Record<string, unknown> }
      expect(form?.getData?.()).not.toHaveProperty('secret')
    })
  })

  it('keeps parent and scope internals out of __rendererData in field events', async () => {
    const notify = vi.fn()
    const { host } = mount({
      type: 'page',
      data: { parentSecret: 'do-not-leak' },
      body: {
        type: 'form',
        data: { name: 'Ada' },
        body: {
          type: 'input-text',
          name: 'age',
          label: '年龄',
          onEvent: {
            change: { actions: [{ actionType: 'toast', args: { msg: '${__rendererData|json}' } }] },
          },
        },
      },
    }, undefined, { notify })
    await nextTick()
    const input = host.querySelector('input[name="age"]') as HTMLInputElement
    input.value = '2000'
    input.dispatchEvent(new Event('input', { bubbles: true }))
    await vi.waitFor(() => expect(notify).toHaveBeenCalled())
    const message = notify.mock.calls.at(-1)?.[1] as string
    const data = JSON.parse(message)
    expect(data).toEqual({ name: 'Ada', age: '2000' })
    expect(message).not.toContain('parentSecret')
    expect(message).not.toContain('__super')
    expect(message).not.toContain('__prev')
    expect(message).not.toContain('__changeReason')
  })

  it('supports validate output and component status actions', async () => {
    const notify = vi.fn()
    const { host } = mount({
      type: 'page',
      body: [
        {
          type: 'form',
          id: 'statusForm',
          body: [{ type: 'input-text', id: 'requiredName', name: 'name', label: '姓名', required: true }],
        },
        {
          type: 'button',
          label: '校验并提示',
          onEvent: {
            click: {
              actions: [
                { actionType: 'validate', componentId: 'statusForm', outputVar: 'result' },
                { actionType: 'toast', args: { msg: '${event.data.result.error|json}' } },
                { actionType: 'disabled', componentId: 'requiredName' },
                { actionType: 'hidden', componentId: 'requiredName' },
              ],
            },
          },
        },
      ],
    }, undefined, { notify })
    await nextTick()
    const button = [...host.querySelectorAll('button')].find((item) => item.textContent?.includes('校验并提示'))
    button?.click()
    await vi.waitFor(() => expect(notify).toHaveBeenCalledWith('info', 'true', expect.any(Object)))
    const field = host.querySelector('#requiredName')
    expect(field).toBeNull()
  })

  it('reads renderer data and schema properties from formulas', async () => {
    const notify = vi.fn()
    const { host } = mount({
      type: 'page',
      body: [
        {
          type: 'form',
          id: 'formulaForm',
          data: { name: 'Vamis' },
          body: [{ type: 'input-text', name: 'name', label: '名称' }],
        },
        {
          type: 'button',
          label: '读取组件',
          onEvent: {
            click: {
              actions: [{
                actionType: 'toast',
                args: { msg: '${GETRENDERERDATA("formulaForm", "name")}:${GETRENDERERPROP("formulaForm", "type")}' },
              }],
            },
          },
        },
      ],
    }, undefined, { notify })
    await nextTick()
    const button = [...host.querySelectorAll('button')].find((item) => item.textContent?.includes('读取组件'))
    button?.click()
    await vi.waitFor(() => expect(notify).toHaveBeenCalledWith('info', 'Vamis:form', expect.any(Object)))
  })

  it('tracks listener events and debounces their actions', async () => {
    const notify = vi.fn()
    const tracker = vi.fn()
    const { host } = mount({
      type: 'page',
      body: {
        type: 'input-text',
        name: 'keyword',
        onEvent: {
          change: {
            debounce: { wait: 80 },
            track: { id: 'search', name: '搜索输入' },
            actions: [{ actionType: 'toast', args: { msg: '${keyword}' } }],
          },
        },
      },
    }, undefined, { notify, tracker })
    await nextTick()
    const input = host.querySelector('input[name="keyword"]') as HTMLInputElement
    input.value = 'a'
    input.dispatchEvent(new Event('input', { bubbles: true }))
    input.value = 'ab'
    input.dispatchEvent(new Event('input', { bubbles: true }))
    expect(tracker).toHaveBeenCalledTimes(2)
    expect(tracker).toHaveBeenCalledWith({ eventType: 'change', eventData: { trackId: 'search', trackName: '搜索输入' } })
    await vi.waitFor(() => expect(notify).toHaveBeenCalledTimes(1))
    expect(notify).toHaveBeenCalledWith('info', 'ab', expect.any(Object))
  })

  it('gives custom renderers schema/data props and injected env', async () => {
    const notify = vi.fn()
    registerRenderer({
      type: 'docs-hello',
      component: defineComponent({
        props: { schema: { type: Object, required: true }, data: { type: Object, required: true } },
        setup(props) {
          const env = useEnv()
          return () => h('button', {
            onClick: () => env.notify('info', `你好 ${props.data.name}`),
          }, String(props.schema.text))
        },
      }),
    })
    const { host } = mount({
      type: 'page',
      data: { name: 'Vamis' },
      body: { type: 'docs-hello', text: '自定义节点' },
    }, undefined, { notify })
    await nextTick()
    const button = host.querySelector('button') as HTMLButtonElement
    expect(button.textContent).toBe('自定义节点')
    button.click()
    expect(notify).toHaveBeenCalledWith('info', '你好 Vamis')
  })

  it('captures renderer errors and reports the schema path', async () => {
    const onDiagnostic = vi.fn()
    registerRenderer({
      type: 'broken-diagnostic',
      component: defineComponent({
        setup() {
          throw new Error('boom')
        },
      }),
    })
    const { host } = mount({ type: 'page', body: { type: 'broken-diagnostic' } }, undefined, { onDiagnostic })
    await nextTick()
    expect(host.textContent).toContain('渲染失败：broken-diagnostic')
    expect(host.textContent).toContain('boom')
    expect(onDiagnostic).toHaveBeenCalledWith(expect.objectContaining({
      type: 'renderer',
      path: 'broken-diagnostic',
      message: '渲染器执行错误',
    }))
  })

  it('preserves explicit json:2 formatting in toast bodies', async () => {
    const { host } = mount({
      type: 'page',
      data: { payload: { name: 'Vamis' } },
      body: {
        type: 'button',
        label: '格式化 JSON',
        onEvent: {
          click: { actions: [{ actionType: 'toast', args: { msg: '${payload|json:2}' } }] },
        },
      },
    })
    await nextTick()
    const button = [...host.querySelectorAll('button')].find((item) => item.textContent?.includes('格式化 JSON'))
    button?.click()
    let body: HTMLElement | null = null
    await vi.waitFor(() => {
      body = document.querySelector('.vamis-toast__body')
      expect(body).not.toBeNull()
    })
    expect(body!.textContent).toContain('{\n  "name": "Vamis"\n}')
  })

  it('prints a target component and cleans up temporary classes', async () => {
    const print = vi.fn()
    vi.stubGlobal('print', print)
    const { host } = mount({
      type: 'page',
      body: [
        { type: 'button', label: '打印', onEvent: { click: { actions: [{ actionType: 'print', args: { id: 'printTarget' } }] } } },
        { type: 'container', id: 'printTarget', body: '打印内容' },
      ],
    })
    await nextTick()
    const button = [...host.querySelectorAll('button')].find((item) => item.textContent?.includes('打印'))
    button?.click()
    await vi.waitFor(() => expect(print).toHaveBeenCalledOnce())
    expect(document.querySelector('.pe-no-print')).toBeNull()
    vi.unstubAllGlobals()
  })

  it('waits for button confirmText before onEvent ajax', async () => {
    const fetcher = vi.fn(async () => ({ status: 0, msg: 'ok', data: { id: 1 } }))
    const confirm = vi.fn(async () => false)
    const { host } = mount(
      {
        type: 'page',
        data: { name: 'lll' },
        body: {
          type: 'button',
          label: '发送 Ajax 请求',
          confirmText: '确认要发出这个请求？',
          onEvent: {
            click: {
              actions: [{ actionType: 'ajax', api: '/api/mock2/form/saveForm' }],
            },
          },
        },
      },
      undefined,
      { fetcher, confirm },
    )
    await nextTick()
    const button = [...host.querySelectorAll('button')].find((item) => item.textContent?.includes('发送 Ajax 请求'))
    button?.click()
    await vi.waitFor(() => expect(confirm).toHaveBeenCalledWith('确认要发出这个请求？', undefined))
    expect(fetcher).not.toHaveBeenCalled()
    confirm.mockResolvedValue(true)
    button?.click()
    await vi.waitFor(() => expect(fetcher).toHaveBeenCalled())
  })

  it('dispatches broadcast actions to onEvent listeners in the same root', async () => {
    const notify = vi.fn()
    const { host } = mount({
      type: 'page',
      onEvent: {
        customReady: {
          actions: [{ actionType: 'toast', args: { msg: '收到 ${name}' } }],
        },
      },
      body: {
        type: 'button',
        label: '广播',
        onEvent: {
          click: {
            actions: [{ actionType: 'broadcast', args: { eventName: 'customReady' }, data: { name: '${name}' } }],
          },
        },
      },
    }, { data: { name: 'Vamis' } }, { notify })
    await nextTick()
    const button = [...host.querySelectorAll('button')].find((item) => item.textContent?.includes('广播'))
    button?.click()
    await vi.waitFor(() => expect(notify).toHaveBeenCalledWith('info', '收到 Vamis', expect.any(Object)))
  })
})
