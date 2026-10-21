---
title: 样式
---

# 样式

vamis 的视觉目标是 **Amis 后台的信息密度**，不是云舍像素。实现上：

- 一套 CSS 变量（`--background`、`--primary`、`--control-h`、状态色）
- 组件用 `variant`，禁止第二套 `cxd-` 前缀
- 密度 `data-density="compact|comfortable"`，默认 compact（32px 控件）

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

`className` 目前当普通 class 用。Amis 的 `m:` / `pc:` 响应式前缀是 P1（D12），见 [样式系统](/style/)。
