import { beforeAll, describe, expect, it, vi } from 'vitest'
import { registerRenderer, type SchemaObject } from '@vamis/core'
import { EditorManager } from './manager'
import { BasePlugin, type BaseEventContext, type ToolbarItem } from './plugin'

beforeAll(() => {
  registerRenderer({ type: 'my-renderer', component: { render: () => null } })
  registerRenderer({ type: 'page', component: { render: () => null } })
})

class MyRendererPlugin extends BasePlugin {
  name = '自定义渲染器'
  description = '测试自定义渲染器'
  rendererName = 'my-renderer'
  tags = ['自定义']
  scaffold = { type: 'my-renderer', target: '233' }
  panelTitle = '自定义组件'
  panelBody = [
    {
      type: 'tabs',
      tabs: [{ title: '常规', body: [{ name: 'target', label: 'Target', type: 'input-text' }] }],
    },
  ]

  buildEditorToolbar(_context: BaseEventContext, toolbars: ToolbarItem[]) {
    toolbars.push({ id: 'custom', label: '自定义操作' })
  }
}

function createManager(config: ConstructorParameters<typeof EditorManager>[0] = {}, schema?: SchemaObject) {
  return new EditorManager(
    { disableBultinPlugin: true, plugins: [MyRendererPlugin], ...config },
    schema || { type: 'page', body: [{ type: 'my-renderer', target: 'world' }] },
  )
}

function child(manager: EditorManager) {
  return manager.activeNode?.children[0] || manager.getNodeByPath('body.0')!
}

describe('EditorManager', () => {
  it('assigns stable internal ids and strips them from public values', () => {
    const onChange = vi.fn()
    const manager = createManager({ onChange })
    const node = child(manager)
    expect(node.id).toMatch(/^u:/)
    expect(manager.value).toEqual({ type: 'page', body: [{ type: 'my-renderer', target: 'world' }] })

    manager.updateField(node.id, 'target', 'vamis')
    expect(node.id).toMatch(/^u:/)
    expect(manager.getSchema(node.id).target).toBe('vamis')
    expect(onChange).toHaveBeenLastCalledWith({ type: 'page', body: [{ type: 'my-renderer', target: 'vamis' }] })
    expect(JSON.stringify(manager.value)).not.toContain('$$id')
  })

  it('collects renderer info, schema panels, toolbars and palette entries from a plugin', () => {
    const manager = createManager()
    const node = child(manager)
    manager.setActiveId(node.id)
    expect(node.info?.name).toBe('自定义渲染器')
    expect(manager.state.panels[0]).toMatchObject({ key: 'config', title: '自定义组件' })
    expect(manager.state.toolbars.some((item) => item.id === 'custom')).toBe(true)
    expect(manager.state.availableRenderers[0]).toMatchObject({
      name: '自定义渲染器',
      rendererName: 'my-renderer',
      scaffold: { type: 'my-renderer', target: '233' },
    })
  })

  it('runs update hooks and supports preventing a panel update', () => {
    const afterUpdate = vi.fn()
    const manager = createManager({ afterUpdate })
    const node = child(manager)
    expect(manager.updateField(node.id, 'target', 'next')).toBe(true)
    expect(afterUpdate).toHaveBeenCalledOnce()

    const prevented = createManager({
      beforeUpdate(event) {
        event.preventDefault()
      },
    })
    const preventedNode = child(prevented)
    expect(prevented.updateField(preventedNode.id, 'target', 'blocked')).toBe(false)
    expect(prevented.getSchema(preventedNode.id).target).toBe('world')
  })

  it('runs insert hooks, accepts data changes and can reject drops', () => {
    const afterInsert = vi.fn()
    const manager = createManager({
      afterInsert,
      beforeInsert(event) {
        event.context.data.target = 'patched'
      },
    })
    const inserted = manager.addChild(String(manager.schema.$$id), 'body', { type: 'my-renderer' })
    expect(inserted?.schema.target).toBe('patched')
    expect(afterInsert).toHaveBeenCalledOnce()
    expect(manager.value.body).toHaveLength(2)

    const rejected = createManager({ onDndAccept: () => false })
    expect(rejected.addChild(String(rejected.schema.$$id), 'body', { type: 'my-renderer' })).toBeNull()
    expect(rejected.value.body).toHaveLength(1)
  })

  it('supports delete prevention, duplicate, move and replace hooks', () => {
    const manager = createManager()
    const node = child(manager)
    const duplicate = manager.duplicate(node.id)
    expect(duplicate).not.toBeNull()
    expect(duplicate?.id).not.toBe(node.id)
    expect(manager.value.body).toHaveLength(2)

    manager.setActiveId(duplicate!.id)
    expect(manager.moveUp()).toBe(true)
    expect(manager.value.body[0].target).toBe('world')

    const afterReplace = vi.fn()
    const replacing = createManager({ afterReplace })
    const replacingNode = child(replacing)
    expect(replacing.replaceChild(replacingNode.id, { type: 'my-renderer', target: 'replacement' })).toBe(true)
    expect(replacing.value.body[0].target).toBe('replacement')
    expect(afterReplace).toHaveBeenCalledOnce()

    const protectedManager = createManager({ beforeDelete: () => false })
    expect(protectedManager.del(child(protectedManager).id)).toBe(false)
    expect(protectedManager.value.body).toHaveLength(1)
  })

  it('supports copy, paste, region clearing and history', () => {
    const manager = createManager()
    const node = child(manager)
    manager.copy(node.id)
    manager.paste(String(manager.schema.$$id), 'body')
    expect(manager.value.body).toHaveLength(2)

    manager.emptyRegion(String(manager.schema.$$id), 'body')
    expect(manager.value.body).toEqual([])
    expect(manager.canUndo).toBe(true)
    manager.undo()
    expect(manager.value.body).toHaveLength(2)
    manager.redo()
    expect(manager.value.body).toEqual([])
  })

  it('opens scaffold forms and applies pipeOut on confirmation', () => {
    class ScaffoldPlugin extends MyRendererPlugin {
      scaffoldForm = {
        title: '创建组件',
        body: [{ type: 'input-text', name: 'target' }],
        pipeOut: (value: Record<string, unknown>) => ({ type: 'my-renderer', target: `custom-${value.target}` }),
      }
    }
    const manager = new EditorManager(
      { disableBultinPlugin: true, plugins: [ScaffoldPlugin] },
      { type: 'page', body: [] },
    )
    const renderer = manager.state.availableRenderers[0]
    manager.addElem(renderer)
    expect(manager.state.scaffoldRequest?.form.title).toBe('创建组件')
    manager.completeScaffold({ target: 'value' })
    expect(manager.value.body[0].target).toBe('custom-value')
  })

  it('filters private fields and supports external undo handlers through config', () => {
    const onUndo = vi.fn()
    const manager = createManager({
      onUndo,
      isHiddenProps: (key) => key === 'secret',
    })
    manager.updateField(child(manager).id, 'secret', 'hidden')
    expect(manager.value.body[0].secret).toBeUndefined()
    expect(manager.value.body[0].target).toBe('world')
    manager.undo()
    expect(onUndo).toHaveBeenCalledOnce()
  })
})
