---
title: 数据映射
---

# 数据映射

Amis 用 `data` / `responseData` / `&` 合并规则把接口结果写进域。vamis 设计对齐这些字段名，**API 管线（D3）未落地**，所以：

- `form.initApi` / `crud.api` 的 `responseData` 映射不完整
- `replaceData`、`sendOn`、adaptor 尚未按文档执行
- 静态 `data:` 可以写在 `page` 上，预览够用

```schema
type: page
data:
  title: 静态映射
body:
  - type: tpl
    tpl: ${title}
```

接口适配请走 `env.fetcher` 的返回 `{ status, data, msg }`，不要在渲染器里改响应。
