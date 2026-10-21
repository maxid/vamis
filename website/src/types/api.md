---
title: API
---

# API

接口配置与 Amis 同形，可以是字符串或对象：

```yaml
api: /api/mock2/form/saveForm
# 或
api:
  method: post
  url: /api/mock2/form/saveForm
  data:
    foo: bar
```

约定响应：

```json
{ "status": 0, "msg": "保存成功", "data": {} }
```

`status === 0` 为成功。请求由 `env.fetcher` 发出。

**未齐（D3）**：`sendOn`、adaptor、`responseData`、`replaceData`、`qsOptions`、缓存。form / crud 会先接这套管线。
