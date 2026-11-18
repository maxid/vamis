# Width 样式设计

> 状态：**进行中 90%** · 对应站点：`/style/sizing/width` · 源码：[sizing/width.md](../../../../website/src/style/sizing/width.md)
> 盘点日期：2026-11-18。本文是页面级设计，不是站点正文副本。

## 0. 设计结论

盒子有多宽。档位是 Tailwind spacing（`w-16` = 4rem = 64px）加上分数 / `full` / `screen` / `min` / `max`。`w-none` / `w-18` / `w-1x`（1em）是 Amis 多出来的。分数相对含块：舞台钉死 `w-80`（320px）时 `w-1/2` = 160px。**默认自适应**：page / form 已经吃满布局槽，不必先写 `w-full`。Vamis schema `className` 打在外层 `div.vamis-node`；本页用 HTML 岛把 width 类打在内层黄盒子上。

## 1. 边界与优先级

1. 类名打在 `.vamis-node`；需要内层时用 `bodyClassName` 或 HTML 岛。
2. 档位是 Tailwind/helper 计算值，不写死 px。
3. `m:`/`pc:` 两档；不支持状态前缀。
4. 不引入 cxd-* 或 Amis SCSS。

## 2. 类名/变量契约

页面契约：盒子有多宽。档位是 Tailwind spacing（`w-16` = 4rem = 64px）加上分数 / `full` / `screen` / `min` / `max`。`w-none` / `w-18` / `w-1x`（1em）是 Amis 多出来的。分数相对含块：舞台钉死 `w-80`（320px）时 `w-1/2` = 160px。**默认自适应**：page / form 已经吃满布局槽，不必先写 `w-full`。Vamis schema `className` 打在外层 `div.vamis-node`；本页用 HTML 岛把 width 类打在内层黄盒子上。
本页共 **105** 个类名/变量条目。

| 类名 | 计算值 |
|---|---|
| `w-px` | `width: 0.0625rem;` |
| `w-0` | `width: 0;` |
| `w-none` | `width: 0;` |
| `w-0.5` | `width: 0.125rem;` |
| `w-1` | `width: 0.25rem;` |
| `w-1.5` | `width: 0.375rem;` |
| `w-2` | `width: 0.5rem;` |
| `w-2.5` | `width: 0.625rem;` |
| `w-3` | `width: 0.75rem;` |
| `w-3.5` | `width: 0.875rem;` |
| `w-4` | `width: 1rem;` |
| `w-5` | `width: 1.25rem;` |
| `w-6` | `width: 1.5rem;` |
| `w-7` | `width: 1.75rem;` |

> 完整 105 个类名由 `@vamis/ui` helper 生成器维护；本设计只摘录前 14 个作契约样本。

## 3. 实现

- [styles.css](../../../../packages/vamis-ui/src/styles.css)：token/helper/默认皮肤。
- [themes.css](../../../../packages/vamis-ui/src/themes.css)：主题色阶。
- [样式规范](../../../superpowers/specs/2026-11-15-vamis-style-standard.md)：标尺与守卫。
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
