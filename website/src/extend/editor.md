---
title: 编辑器
---

# 编辑器

::: danger 实现进度 35% · 进行中
可视化骨架：树 / 画布点选拖拽 / 属性 / YAML Schema。JSON 双 Tab、插件市场、协作和完整撤销栈未接。
:::

`@vamis/editor` 是可视化骨架：组件色板、组件树、画布预览、属性面板和 Schema 源码。它不是 amis-editor，也没有插件市场。

本地执行 `pnpm dev`，打开 `/editor`。

## 当前能做什么

- 从色板点击或拖入组件，向 schema 插入对应 `type` 的节点。
- 在组件树或画布中点选节点，属性面板同步显示当前节点。
- 修改 `type`、常见属性与事件动作，直接回写原 schema 字段，不发明 `editorProps` 之类的平行配置。
- 通过上移 / 下移、删除、树与画布拖拽调整结构。
- 把裸 widget 规范化为 `apiVersion: lcdp.ir/v1`、`kind: UiPage` 的 IR 信封。

Schema 是唯一真源。编辑器只修改字段和结构，不另造一套渲染器。

## 源码与失败态

当前 `@vamis/editor` 的源码面板是 **YAML**。运行时和文档「编辑 Schema」同时支持 YAML / JSON，但不能据此认为可视化编辑器已经有 JSON 双 Tab。

YAML 解析失败时显示「无法解析」和具体错误，画布保留上一份有效 IR；不会把半棵错误树继续交给渲染器。未知 type 仍需到 [调试](/extend/debug) 查看诊断。拖拽目标非法或节点身份变化时，应先检查树路径；当前没有完整的冲突恢复界面。

```yaml
type: page
title: 编辑示例
body:
  - type: input-text
    name: name
    label: 名称
```

## 明确未接

- 插件市场与远程扩展加载
- 多人协作、完整撤销 / 重做栈
- 代码生成与可视化逻辑编排
- 编辑器内的 YAML / JSON 双 Tab
- amis-editor 的完整插件协议

需要直接编辑 YAML / JSON 时，使用文档示例的「编辑 Schema」；需要嵌入运行时而不是编辑器时，使用 [快速开始](/start/getting-started) 或 [JS SDK](/start/sdk)。
