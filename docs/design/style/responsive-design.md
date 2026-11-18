# 辅助类-响应式设计 样式设计

> 状态：**进行中 45%** · 对应站点：`/style/responsive-design` · 源码：[responsive-design.md](../../../website/src/style/responsive-design.md)
> 盘点日期：2026-11-18。本文是页面级设计，不是站点正文副本。

## 0. 设计结论

响应式页定义**两档前缀**：无前缀全宽、`m:` <768px、`pc:` ≥768px；设计边界是只承诺已生成的 helper 矩阵，不承诺任意 Tailwind 类全量。

## 1. 边界与优先级

1. 只有两档：`m:` <768px、`pc:` ≥768px。
2. helper 已生成矩阵才承诺；不承诺任意 Tailwind 类。
3. 表单项 size 只在 ≥576px 钉档。
4. 移动端 max-width:100%，不写死宽。

## 2. 类名/变量契约

页面契约：Amis helper 只分两档。什么前缀都不加，就是所有宽度都生效；`m:` 只给手机；`pc:` 只给桌面。



## 3. 实现

- [styles.css](../../../packages/vamis-ui/src/styles.css)：token/helper/默认皮肤。
- [themes.css](../../../packages/vamis-ui/src/themes.css)：主题色阶。
- [样式规范](../../superpowers/specs/2026-11-15-vamis-style-standard.md)：标尺与守卫。
- `resolveClassName` / `resolveCssVars`：作者值落地。

## 4. 缺口

`m:`/`pc:` 全矩阵未生成，不能承诺所有类。

## 5. 验收清单（文档核对：3 / 12）

- [x] 页面、类表/变量表与实现入口已定位
- [x] 通道/前缀/落点边界已盘点
- [ ] 类名与计算值逐项核对
- [ ] 响应式/状态前缀组合可复现
- [ ] 浅色/深色视觉一致
- [ ] 375px 下演示不溢出
- [ ] 与相关样式页互链
