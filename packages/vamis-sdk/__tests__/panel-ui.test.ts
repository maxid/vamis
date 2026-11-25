import { nextTick } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
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
  return host
}

describe('Panel region control className', () => {
  it('applies Amis control class names to the internal regions', async () => {
    const host = mount({
      type: 'panel',
      title: '面板标题',
      body: '面板内容',
      footer: '面板脚注',
      actions: [{ type: 'button', label: '提交' }],
      headerControlClassName: 'heading-control',
      headerTitleControlClassName: 'title-control',
      bodyControlClassName: 'body-control',
      actionsControlClassName: 'actions-control',
    })

    await nextTick()

    expect(
      host.querySelector('[data-vamis-panel-heading]')?.classList.contains(
        'heading-control',
      ),
    ).toBe(true)
    expect(
      host.querySelector('[data-vamis-panel-title]')?.classList.contains(
        'title-control',
      ),
    ).toBe(true)
    expect(
      host.querySelector('[data-vamis-panel-body]')?.classList.contains(
        'body-control',
      ),
    ).toBe(true)
    expect(
      host.querySelector('[data-vamis-panel-actions]')?.classList.contains(
        'actions-control',
      ),
    ).toBe(true)
    expect(
      host.querySelector('[data-vamis-panel-footer]')?.classList.contains(
        'actions-control',
      ),
    ).toBe(true)
  })

  it('applies subFormMode and subFormHorizontal to panel children', async () => {
    const host = mount({
      type: 'form',
      actions: [],
      body: {
        type: 'panel',
        title: '横向面板',
        subFormMode: 'horizontal',
        subFormHorizontal: { left: 4, right: 8 },
        body: {
          type: 'input-text',
          name: 'name',
          label: '名称',
        },
      },
    })

    await nextTick()

    const item = host.querySelector('.vamis-form-item')
    expect(item?.classList.contains('vamis-form-item--horizontal')).toBe(true)
    expect(
      host.querySelector('.vamis-form-item__label')?.classList.contains(
        'vamis-form-col--4',
      ),
    ).toBe(true)
  })
})
