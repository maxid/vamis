---
title: 介绍
---

# 介绍

Vamis 用 Vue 3 复刻 Amis 的低代码运行时。作者态同时支持 **YAML** 与 **JSON**，组件 type 对齐 Amis schema 语义，UI 走 shadcn-vue。

下面这份 CRUD 打 `/api/mock2/sample`，可以筛选、排序、勾选批量、删行、重置数据。

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

尚未对齐：列冻结、拖拽排序、导出 Excel、`autoGenerateFilter`、数据域 D1。

## 下一步

- [快速开始](/start/getting-started)
- [JS SDK](/start/sdk)
- [组件文档](/components/)
- [配置与 Schema](/concepts/schema)
