# 辅助类-状态样式 样式设计

> 状态：**进行中 90%** · 对应站点：`/style/state` · 源码：[state.md](../../../website/src/style/state.md)
> 盘点日期：2026-11-18。本文是页面级设计，不是站点正文副本。

## 0. 设计结论

状态页定义**状态前缀**：hover/active/focus/disabled/group-hover，可与 `m:`/`pc:` 组合；设计边界是状态不改默认皮肤、不引入 cxd。

## 1. 边界与优先级

1. 状态前缀只改状态样式，不改默认皮肤。
2. 支持 hover/active/focus/disabled/group-hover；可与响应式组合。
3. 不搬 cxd-Button；HTML 岛示例保持原生 UA 语义。
4. 深色状态色仍走 token。

## 2. 类名/变量契约

页面契约：除了默认态，还可以给悬停、选中、聚焦、禁用写不同的 class。前缀加在类名前面，例如 `hover:bg-pink-500`。



## 3. 实现

- [styles.css](../../../packages/vamis-ui/src/styles.css)：token/helper/默认皮肤。
- [themes.css](../../../packages/vamis-ui/src/themes.css)：主题色阶。
- [样式规范](../../superpowers/specs/2026-11-15-vamis-style-standard.md)：标尺与守卫。
- `resolveClassName` / `resolveCssVars`：作者值落地。

## 4. 缺口

主路径已对齐；深色/375px 视觉验收未成体系。

## 5. 验收清单（文档核对：3 / 12）

- [x] 页面、类表/变量表与实现入口已定位
- [x] 通道/前缀/落点边界已盘点
- [ ] 类名与计算值逐项核对
- [ ] 响应式/状态前缀组合可复现
- [ ] 浅色/深色视觉一致
- [ ] 375px 下演示不溢出
- [ ] 与相关样式页互链
