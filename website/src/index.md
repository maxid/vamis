---
title: 介绍
---

# 介绍

Vamis 用 Vue 3 复刻 Amis 的低代码运行时。作者态是 **YAML 1.2 Core**，组件 type 对齐 Amis schema 语义，UI 走 shadcn-vue。

和 Amis 官网一样：文档里的 schema 围栏不是截图，会交给同一个 VamisRoot 跑。下面这张表打的是 `/api/mock2/sample`，可以筛选、排序、勾选批量、删行、重置数据。右上角 **编辑 YAML** 改完立刻重渲染。

```schema: height=520
type: page
title: 浏览器内核对 CSS 的支持情况
remark: 嘿，不保证数据准确性
body:
  type: crud
  name: sample
  syncLocation: false
  api: /api/mock2/sample
  perPage: 10
  keepItemSelectionOnPageChange: true
  bulkActions:
    - type: button
      label: 批量删除
      actionType: ajax
      confirmText: 确定要批量删除?
      api: "delete:/api/mock2/sample/${ids}"
      reload: sample
    - type: button
      label: 批量修改
      actionType: dialog
      dialog:
        title: 批量编辑
        body:
          type: form
          api: /api/mock2/sample/bulkUpdate2
          reload: sample
          body:
            - type: hidden
              name: ids
            - type: input-text
              name: engine
              label: Engine
  headerToolbar:
    - type: button
      label: 重置测试数据
      actionType: ajax
      size: sm
      api: /api/mock2/sample/reset
      reload: sample
  filter:
    title: 条件搜索
    body:
      - type: input-text
        name: id
        label: 主键
        placeholder: 输入 id
      - type: select
        name: browser
        label: 浏览器
        placeholder: 选择浏览器
        clearable: true
        options:
          - label: Internet Explorer
            value: ie
          - label: AOL browser
            value: aol
          - label: Firefox
            value: firefox
  columns:
    - name: id
      label: ID
      sortable: true
    - name: engine
      label: 渲染引擎
      sortable: true
    - name: browser
      label: Browser
    - name: platform
      label: 平台
    - name: grade
      label: CSS 等级
    - type: operation
      label: 操作
      buttons:
        - type: button
          actionType: ajax
          label: 删除
          confirmText: 您确认要删除?
          api: "delete:/api/mock2/sample/${id}"
```

能力还没对齐 Amis 的部分（列冻结、拖拽排序、导出 Excel、`autoGenerateFilter`、数据域 D1）会缺，但请求、表格、筛选、弹窗走的是真运行时，不是假数据贴图。

## 文档怎么读

`pnpm dev` 打开后，文档 / 组件 / 示例在同一个应用：

| 顶栏 | 路由 |
|------|------|
| 文档 | `/docs` |
| 组件 | `/components` |
| 示例 | `/` |
| 编辑器 | `/editor` |

- [快速开始](/start/getting-started)
- [JS SDK](/start/sdk)
- [组件文档](/components/)
- [配置与 Schema](/concepts/schema)

正文是 Vamis 自己的说明。每篇组件页会标明 **实现进度**——已注册不等于语义完成。
