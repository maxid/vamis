import { nextTick } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { embed } from '../src/embed'
import { registerLocale } from '../src/index'

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

describe('SDK i18n', () => {
  it('translates built-in form, select and date copy and updates locale without remounting', async () => {
    const { host, scoped } = mount({
      type: 'form',
      reset: true,
      body: [
        { type: 'input-date', name: 'date', label: 'Date' },
        { type: 'select', name: 'choice', label: 'Choice', options: [] },
      ],
    }, { locale: 'en-US' })
    await nextTick()
    expect(host.textContent).toContain('Form')
    expect(host.textContent).toContain('Submit')
    expect(host.textContent).toContain('Reset')
    expect(host.querySelector('input[placeholder="Select Date"]')).toBeTruthy()
    expect(host.textContent).toContain('Select')

    scoped.updateProps({ locale: 'zh-CN' })
    await nextTick()
    expect(host.textContent).toContain('表单')
    expect(host.textContent).toContain('提交')
    expect(host.textContent).toContain('重置')
    expect(host.querySelector('input[placeholder="请选择日期"]')).toBeTruthy()
  })

  it('applies locale schema overrides before replaceText', async () => {
    const { host, scoped } = mount({
      type: 'page',
      body: [
        {
          type: 'input-text',
          name: 'name',
          label: '姓名：',
          'en-US': { label: 'username: ' },
        },
        { type: 'tpl', tpl: 'VAMIS_HOST', 'en-US': { tpl: 'Docs: VAMIS_HOST' } },
      ],
    }, { locale: 'en' }, {
      replaceText: { VAMIS_HOST: 'https://maxid.github.io/vamis/' },
    })
    await nextTick()
    expect(host.textContent).toContain('username:')
    expect(host.textContent).toContain('Docs: https://maxid.github.io/vamis/')
    expect(host.textContent).not.toContain('VAMIS_HOST')

    scoped.updateProps({ locale: 'zh-CN' })
    await nextTick()
    expect(host.textContent).toContain('姓名：')
    expect(host.textContent).not.toContain('username:')
  })

  it('localizes schemaApi responses with the same replaceText pipeline', async () => {
    const { host } = mount({
      type: 'service',
      schemaApi: '/api/schema',
    }, { locale: 'en-US' }, {
      fetcher: async () => ({
        status: 0,
        data: {
          type: 'tpl',
          tpl: 'VAMIS_HOST',
          'en-US': { tpl: 'Remote VAMIS_HOST' },
        },
      }),
      replaceText: { VAMIS_HOST: 'https://maxid.github.io/vamis/' },
    })
    await new Promise((resolve) => setTimeout(resolve, 0))
    await nextTick()
    expect(host.textContent).toContain('Remote https://maxid.github.io/vamis/')
  })

  it('exposes registerLocale and falls back untranslated built-in copy to Chinese', async () => {
    registerLocale('ja-JP', { 'Form.submit': '送信' })
    const { host } = mount({ type: 'form', body: [] }, { locale: 'ja-JP' })
    await nextTick()
    expect(host.textContent).toContain('送信')
    expect(host.textContent).toContain('表单')
  })
})
