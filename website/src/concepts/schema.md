---
title: 配置与 Schema
---

# 配置与 Schema

一份 Vamis 页面是一棵 **widget 树**。每个节点至少有 `type`，其余字段跟 Amis 同名。

```schema
type: page
title: Schema
body:
  - type: tpl
    tpl: 节点用 type 决定渲染器
  - type: divider
  - type: button
    label: 按钮也是节点
    level: primary
```

## 两种外形

1. **裸 widget**：`{ type: page, body: [...] }`，和 Amis 页面 JSON 同构。
2. **IR 信封**：`apiVersion` + `kind: UiPage` + `metadata` + `spec`。`spec` 就是那棵 widget 树。

`VamisRoot` 和 JS SDK `vamis.embed` 两种都收。未知 `type` 显示占位，不崩。

## 书写规则

- 作者态同时支持 YAML 与 JSON，不强制某一种。YAML 字面量用 1.2 Core。
- 扩展只加新字段或新 IR `kind`，不把 `type: form` 改成别的名字。
- 子节点可以是字符串（当成 `tpl`）、对象或数组，见 [SchemaNode](/types/schemanode)。

## 渲染管线

`parseSchemaText` → `jsonToIr` → `compileIrToWidget` → `SchemaRenderer` 按 `type` 查注册表。playground 的 Vite 根在 `playground/`，渲染器要在 `packages/vamis/src/register.ts` **显式 import**，不能靠 glob。
