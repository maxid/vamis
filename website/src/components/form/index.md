---
title: Form 表单
---

# Form 表单

::: info 实现进度 58% · 进行中
initApi / validate / submit 走 `requestApi`；嵌套 form 默认降为 `div`（`wrapperComponent` 可覆盖）。`lazyLoad` 默认关，打开后用内核 LazyComponent 延迟绘制（initApi 仍在 Form 挂载时发）。扁平 `name`、提交不合并、嵌套不递归校验（D6）。
:::

`type: form` 是数据输入的根。子节点是表单项（`name` 写入表单数据）。提交走 `api` + `env.fetcher`。

```schema
type: form
title: 新建设备
mode: horizontal
api: /api/mock2/form/saveForm
body:
  - type: input-text
    name: name
    label: 名称
    required: true
  - type: input-email
    name: email
    label: 邮箱
  - type: radios
    name: status
    label: 状态
    options:
      - label: 在线
        value: online
      - label: 离线
        value: offline
```

## 常用属性

| 属性 | 说明 |
|------|------|
| `title` | 面板标题 |
| `mode` | `normal` / `horizontal` / `inline` |
| `api` | 提交接口 |
| `initApi` | 初始化拉数（走 `requestApi`） |
| `body` | 表单项列表 |
| `actions` | 底栏按钮，默认带提交 |
| `wrapWithPanel` | 是否带面板 |
| `lazyLoad` | 默认 `false`。为 `true` 时用内核 `LazyComponent` 等进视口再画表单（对齐 Amis）；`initApi` 仍在 Form 挂载时发，不跟视口走 |
| `wrapperComponent` | `form` 或 `div`。套在另一个 form 里默认 `div`（非法 HTML 不能 `<form>` 套 `<form>`）；可显式覆盖 |

水平布局的标签宽度走 `--form-label-width`。校验与 `xxx.yyy` 路径值仍是缺口，见 [FormItem](/components/form/formitem)。
