---
title: 可视化编辑器
---

# 可视化编辑器

::: warning 实现进度 55% · 进行中
已接插件协议与组件/大纲/画布/属性工作区，Page 区域和通用外观/事件面板可用；源码为按需弹窗。完整内置面板库、iframe 移动预览与拖拽改宽高未接。
:::

`@vamis/editor` 基于 Vamis 运行时提供可视化编辑器。它沿用 Amis Editor 的插件协议主路径，但实现使用 Vue 响应式状态，不依赖 React、MST 或 `amis-editor-core`。编辑器外壳使用可独立的 `@vamis/ui`，属性面板直接通过 Vamis `SchemaRenderer` 渲染表单项，与业务页面共用组件、数据宿主和校验行为。

本地执行 `pnpm dev`，打开 `/editor`。

## 使用

```bash
pnpm add @vamis/editor
```

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Editor, type SchemaObject } from '@vamis/editor'

const value = ref<SchemaObject>({
  type: 'page',
  title: '编辑示例',
  body: [{ type: 'input-text', name: 'name', label: '名称' }],
})
</script>

<template>
  <Editor :value="value" @change="value = $event" />
</template>
```

也可以使用对象 `v-model`：

```vue
<Editor v-model="value" />
```

为兼容早期 Vamis 骨架，`modelValue` 仍接受 YAML / JSON 字符串。字符串模式保留 IR 信封；对象模式的 `change` 始终返回不带编辑器内部字段的 Schema。

## 属性与事件

| 属性 | 类型 | 说明 |
|------|------|------|
| `value` | `SchemaObject` | 当前 Schema，配合 `@change` 使用 |
| `modelValue` | `SchemaObject \| string` | 对象或 YAML / JSON 字符串，支持 `v-model` |
| `preview` | `boolean` | 预览模式，隐藏编辑面板并关闭点选拖拽，支持 `v-model:preview` |
| `autoFocus` | `boolean` | 默认选中根节点 |
| `isMobile` | `boolean` | 使用 375px 移动画布，支持 `v-model:isMobile` |
| `className` | `string` | 编辑器根节点附加类名 |
| `theme` | `string` | 传给画布的 Vamis 主题 |
| `schemaFilter` | `(schema, isPreview) => schema` | 画布渲染前过滤 Schema，可用于 API 代理 |
| `vamisEnv` | `Partial<RendererEnv>` | 传给 Vamis 画布的 env |
| `plugins` | `PluginRegistration[]` | 当前实例额外启用的插件，可附构造参数 |
| `disableBuiltinPlugin` | `boolean` | 禁用内置插件；保留 Amis 拼写 `disableBultinPlugin` |
| `disablePluginList` | `string[] \| (id, plugin) => boolean` | 按插件 ID 或回调禁用插件 |
| `isHiddenProps` | `(key) => boolean` | 输出和代码面板需要隐藏的属性 |
| `readonly` | `boolean` | 禁止结构、面板和源码修改 |
| `mini` | `boolean` | 只保留编辑画布；也可直接使用 `MiniEditor` |

编辑器操作会触发以下插件事件。`before*` 事件中调用 `event.preventDefault()` 或返回 `false` 可取消操作。

- 生命周期与选择：`onInit`、`onActive`、`onSelectionChange`、`onPreventClick`。
- 插入：`beforeInsert`、`afterInsert`。
- 面板更新：`beforeUpdate`、`afterUpdate`。
- 替换：`beforeReplace`、`afterReplace`。
- 移动：`beforeMove`、`afterMove`。
- 删除：`beforeDelete`、`afterDelete`。
- 节点信息：`beforeResolveEditorInfo`、`afterResolveEditorInfo`。
- 拖拽：`onDndAccept`。
- 构建扩展：`onBuildPanels`、`onBuildToolbars`、`onBuildContextMenus`。
- 快捷键：`onUndo`、`onRedo`、`onSave`、`onPreview` 可由宿主接管。

## 自定义插件

先注册 Vamis 渲染器，再用 `rendererName` 将编辑器插件关联到同一个 `type`。

```ts
import { registerRenderer } from '@vamis/core'
import MyRenderer from './MyRenderer.vue'

registerRenderer({
  type: 'my-renderer',
  name: 'my-renderer',
  component: MyRenderer,
})
```

```ts
import { BasePlugin } from '@vamis/editor'

export class MyRendererPlugin extends BasePlugin {
  rendererName = 'my-renderer'
  name = '自定义渲染器'
  description = '这是一个自定义渲染器'
  tags = ['自定义']
  icon = 'fa fa-user'

  previewSchema = {
    type: 'my-renderer',
    target: 'demo',
  }

  scaffold = {
    type: 'my-renderer',
    target: '233',
  }

  panelTitle = '自定义组件'
  panelBody = [
    {
      type: 'tabs',
      tabs: [
        {
          title: '常规',
          body: [
            {
              name: 'target',
              label: 'Target',
              type: 'input-text',
            },
          ],
        },
        {
          title: '事件',
          body: [{ type: 'event-editor', name: 'onEvent' }],
        },
      ],
    },
  ]
}
```

启用方式与 Amis 相同：全局注册会影响后续创建的所有编辑器，实例 `plugins` 只影响当前编辑器。

```ts
import { registerEditorPlugin } from '@vamis/editor'

registerEditorPlugin(MyRendererPlugin)
```

```vue
<Editor :value="value" :plugins="[MyRendererPlugin]" @change="value = $event" />
```

`registerEditorPlugin` 支持以静态 `id` 覆盖同 ID 插件，静态 `priority` 更大的定义生效；`unRegisterEditorPlugin(id)` 可注销全局插件。

## 节点与 Schema 的关联

编辑器内部为对象节点分配稳定的 `$$id`，画布 DOM 同时带有 `data-editor-id` 和 `data-editor-path`。点选、拖拽、面板更新都通过 `EditorManager` 定位并修改同一棵 Schema。

`$$id` 和 `__editorPath` 只存在于编辑态。`change`、对象 `v-model` 和 YAML / JSON 输出会移除这些内部字段，不会把它们写入业务 Schema。

与 Amis 的 React 实现不同，Vamis 不篡改组件原型或包裹 React VNode。容器区域由插件的 `regions` 声明和 Schema 路径共同定位。

## 容器区域

```ts
import { BasePlugin, type RegionConfig } from '@vamis/editor'

export class ContainerPlugin extends BasePlugin {
  rendererName = 'my-container'
  name = '自定义容器'
  description = '带内容区的容器'
  regions: RegionConfig[] = [
    {
      key: 'body',
      label: '内容区',
      accept: (json) => json.type !== 'my-container',
    },
  ]
}
```

- `key` 对应容器中的 Schema 集合字段，如 `body`、`columns`、`tabs`。
- `label` 用于区域操作名称。
- `accept` 可拒绝指定节点；全局 `onDndAccept` 还能统一拦截。
- 右侧右键菜单支持清空已声明区域。

## 配置面板

`panelBody` 是静态 Schema，`panelBodyCreator` 可根据当前节点和上下文动态生成面板。

```ts
panelBodyCreator = (context) => [
  {
    type: 'tabs',
    tabs: [
      {
        title: '常规',
        body: [
          { name: 'target', label: 'Target', type: 'input-text' },
          {
            name: 'disabled',
            label: '禁用',
            type: 'switch',
            visibleOn: `type === 'my-renderer'`,
          },
        ],
      },
    ],
  },
]
```

`context` 包含 `node`、`schema`、`info`、`path` / `schemaPath` 和当前 `selections`。面板支持文本、数字、多行、选择、开关、Tabs、分组和 `event-editor`；字段 `name` 可使用 `style.color` 这类路径。

插件还可以实现 `buildEditorPanel(context, panels)`，或通过编辑器的 `onBuildPanels` 统一增改面板。

## 脚手架

拖入组件时如需先收集配置，定义 `scaffoldForm`：

```ts
scaffoldForm = {
  title: '创建自定义组件',
  canRebuild: true,
  body: [
    { name: 'target', label: 'Target', type: 'input-text' },
  ],
  pipeOut: (value) => ({
    type: 'my-renderer',
    target: String(value.target || 'world'),
  }),
}
```

确认后才会插入节点。`canRebuild: true` 同时启用选中节点的“快速构建”；`pipeIn` 可在重新构建时把现有 Schema 转成表单值。

## 工具栏与右键菜单

```ts
buildEditorToolbar(context, toolbars) {
  toolbars.push({
    id: 'custom-action',
    label: '自定义操作',
    tooltip: '执行自定义操作',
    onClick: () => console.log(context.schema),
  })
}

buildEditorContextMenu(context, menus) {
  menus.push({
    id: 'duplicate-custom',
    label: '重复一份',
    onSelect: () => context.node.info?.plugin.manager.duplicate(context.id),
  })
}
```

内置操作已覆盖上移、下移、复制、剪切、粘贴、删除、清空区域、撤销和重做。快捷键包括 `Cmd/Ctrl+Z`、`Cmd/Ctrl+Shift+Z`、`Cmd/Ctrl+S`、`Cmd/Ctrl+P` 和方向移动。

## 快速配置

定义 `popOverBody` 或 `popOverBodyCreator` 后，点选框工具栏会出现“编辑”，用于只保留高频字段的配置弹窗。

```ts
popOverBody = [
  { name: 'target', label: 'Target', type: 'input-text' },
]
```

## MiniEditor

`MiniEditor` 只保留画布，不显示左右面板，属性与事件和 `Editor` 相同。

```vue
<script setup lang="ts">
import { MiniEditor } from '@vamis/editor'
</script>

<template>
  <MiniEditor v-model="value" />
</template>
```

## 源码与失败态

顶部「源码」或左侧源码入口打开按需加载的 Monaco 弹窗，提供 **YAML / JSON 两个 Tab** 并实时同步，不与右侧属性面板争夺常驻空间。YAML 使用 1.2 Core Schema。

解析失败时显示具体错误，画布和另一格式保留上一份有效内容，不会把半棵错误树交给运行时。对象输出会经过 `isHiddenProps` 和内部字段清理。

## 明确未接

- Amis 全量内置组件面板、样式控件和事件动作设计器的逐项复刻。
- `renderMethod` / VNode `RegionWrapper` 等 React 专用扩展点。
- iframe 隔离的移动预览、画布拖拽调整宽高。
- `beforeResolveJsonSchema` / `afterResolveJsonSchema` 与外部 `$schemaUrl` 提示源。
- 插件市场、多人协作和可视化逻辑编排。

需要嵌入运行时而不是编辑器时，使用 [快速开始](/start/getting-started) 或 [JS SDK](/start/sdk)。
