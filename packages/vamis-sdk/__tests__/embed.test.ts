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
  })

  it('doAction runs a toast through env.notify', async () => {
    const notify = vi.fn()
    const host = document.createElement('div')
    document.body.appendChild(host)
    const scoped = embed(host, { type: 'page', body: 'x' }, undefined, { notify })
    mounts.push(scoped)
    await nextTick()
    await scoped.doAction({ actionType: 'toast', msg: 'hi ${name}' }, { name: 'Ada' })
    expect(notify).toHaveBeenCalledWith('info', 'hi Ada')
  })
})
