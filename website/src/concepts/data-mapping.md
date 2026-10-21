---
title: 数据映射
---

# 数据映射

::: info 实现进度 85% · 进行中
D3 `dataMapping` 已接：`${}`、`&: $$` / `$$$$` 铺平、点路径 `convertKeyToPath`。Amis 部分边角映射（数组下标展开等）未齐。
:::

Amis 用 `data` / `responseData` / `&` 把接口结果写进数据域。Vamis 同一套字段名，走 D3 `requestApi` 管线。

- `api.data`：发送前按当前域做映射；GET 会拼进 query
- `responseData`：把接口 `data` 再映射一遍再交给组件；`{"&": "$$"}` 表示先铺平原始数据
- `replaceData: true`：用返回数据替换当前域，默认是追加
- 对象 key 带 `.` / `[]` 默认转成嵌套路径；`convertKeyToPath: false` 保持原 key

```schema
type: page
data:
  title: 静态映射
body:
  - type: tpl
    tpl: ${title}
```

接口适配也可以写在 `responseData` 或 `adaptor` 里，详见 [API](../types/api)。
