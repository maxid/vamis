# CSS 变量 样式设计

> 状态：**进行中 70%** · 对应站点：`/style/css-vars` · 源码：[css-vars.md](../../../website/src/style/css-vars.md)
> 盘点日期：2026-11-18。本文是页面级设计，不是站点正文副本。

## 0. 设计结论

CSS 变量页定义**token 契约**：Amis 变量名 → Vamis token、`page.cssVars`、`[data-theme]`/`.dark` 换包。设计重点是映射表与覆盖顺序，不是列全色值。

## 1. 边界与优先级

1. token 只引用；默认皮肤归 `@vamis/ui`。
2. Amis 名映射到 Vamis token，不维护两套值。
3. `page.cssVars` 写根 style；主题包换 `[data-theme]`/`.dark`。
4. 覆盖顺序：作者 cssVars > 主题 token > 默认。

## 2. 类名/变量契约

页面契约：主题切包 = 换 `[data-theme]` / `.dark` 的 `--colors-*` 色阶，不是换 class 前缀。`page.cssVars` 与 IR `metadata.style.cssVars` 都会写到根节点 style。实现见 `@vamis/core` 的 `resolveCssVars`。



## 3. 实现

- [styles.css](../../../packages/vamis-ui/src/styles.css)：token/helper/默认皮肤。
- [themes.css](../../../packages/vamis-ui/src/themes.css)：主题色阶。
- [样式规范](../../superpowers/specs/2026-11-15-vamis-style-standard.md)：标尺与守卫。
- `resolveClassName` / `resolveCssVars`：作者值落地。

## 4. 缺口

Amis 变量全表未一一对照。

## 5. 验收清单（文档核对：3 / 12）

- [x] 页面、类表/变量表与实现入口已定位
- [x] 通道/前缀/落点边界已盘点
- [ ] 类名与计算值逐项核对
- [ ] 响应式/状态前缀组合可复现
- [ ] 浅色/深色视觉一致
- [ ] 375px 下演示不溢出
- [ ] 与相关样式页互链
