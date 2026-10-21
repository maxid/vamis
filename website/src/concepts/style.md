---
title: 样式
---

# 样式

Vamis 的视觉目标是 **Amis 后台的信息密度**，不是云舍像素。实现上：

- 一套 CSS 变量（`--background`、`--primary`、`--control-h`、`--gap-*`、状态色）
- 组件用 `variant`，禁止第二套 `cxd-` 前缀
- 密度 `data-density="compact|comfortable"`，默认跟页面 html；IR `metadata.style.density` 可覆盖这一棵树
- **默认自适应**：page / form / 未写 `size` 的表单控件吃满容器，不必先配 `w-full` / `size: full`
- `className` 由内核解析（字符串 / 对象 / 模板 / `m-t-xs` / `w-full` / `m:` `pc:`），只在需要覆盖时写
- 表单项 `size: xs|sm|md|lg` 才钉 `--form-control-width-*`（≥576px）；`size: full` 与默认铺满同效果，留给 inline / 多列剩余

页面覆盖：

```yaml
type: page
cssVars:
  --primary: "#1d4ed8"
body:
  - type: button
    label: 被 cssVars 染色
    level: primary
```

IR 信封也可以带样式，不改 `spec` 里的 widget 树：

```yaml
apiVersion: lcdp.ir/v1
kind: UiPage
metadata:
  name: themed
  style:
    cssVars:
      --primary: "#1d4ed8"
    density: compact
spec:
  type: page
  body:
    - type: tpl
      tpl: metadata.style 会合并进 page
```
