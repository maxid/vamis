import { describe, expect, it, vi } from 'vitest'
import { resolveTargets, ScopedContext } from '../src/scoped'

describe('D5 resolveTargets', () => {
  it('interpolates a dynamic component name', () => {
    expect(resolveTargets('${who}', { who: 'list' })).toEqual([{ name: 'list' }])
  })

  it('splits comma-separated targets', () => {
    expect(resolveTargets('form1, form2', {})).toEqual([{ name: 'form1' }, { name: 'form2' }])
  })

  it('does not split commas inside ${}', () => {
    expect(resolveTargets('form1,${who},form3', { who: 'form2' })).toEqual([
      { name: 'form1' },
      { name: 'form2' },
      { name: 'form3' },
    ])
  })

  it('carries query data without stringifying values', () => {
    expect(resolveTargets('list?a=${a}&keep=1', { a: 9 })).toEqual([
      { name: 'list', extra: { a: 9, keep: '1' } },
    ])
  })
})

describe('D5 scoped.reload', () => {
  it('reloads multiple named components', async () => {
    const scoped = new ScopedContext()
    const a = vi.fn()
    const b = vi.fn()
    scoped.register({ name: 'form1', reload: a })
    scoped.register({ name: 'form2', reload: b })
    await scoped.reload('form1,form2', { q: 1 })
    expect(a).toHaveBeenCalledWith({ q: 1 }, false)
    expect(b).toHaveBeenCalledWith({ q: 1 }, false)
  })

  it('resolves dotted names through a child scoped context', async () => {
    const page = new ScopedContext()
    const form = new ScopedContext(page)
    const reload = vi.fn()
    const formApi = { name: 'my_form', context: form }
    page.register(formApi)
    form.register({ name: 'select', reload })
    expect(page.getComponentByName('my_form.select')).toMatchObject({ name: 'select' })
    await page.reload('my_form.select')
    expect(reload).toHaveBeenCalled()
  })
})
