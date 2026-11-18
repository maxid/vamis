# Space Between 样式设计

> 状态：**进行中 90%** · 对应站点：`/style/spacing/space-between` · 源码：[spacing/space-between.md](../../../../website/src/style/spacing/space-between.md)
> 盘点日期：2026-11-18。本文是页面级设计，不是站点正文副本。

## 0. 设计结论

子项之间的缝，写在父级上。Amis 用后续兄弟选择器 `~` 给**第二个及以后**加 `margin-left`（横）或 `margin-top`（竖），第一枚是 0。不是 Tailwind v4 那种打在 `:not(:last-child)` 上的 `margin-inline-end`。档位与 Padding 同一套 rem，`space-x-none` / `space-x-18` 是 Amis 多出来的。`space-x-reverse` 把缝翻到另一侧。Vamis schema `className` 打在外层 `div.vamis-node`；本页用 HTML 岛把 space 类打在内层 flex 上。

## 1. 边界与优先级

1. 类名打在 `.vamis-node`；需要内层时用 `bodyClassName` 或 HTML 岛。
2. 档位是 Tailwind/helper 计算值，不写死 px。
3. `m:`/`pc:` 两档；不支持状态前缀。
4. 不引入 cxd-* 或 Amis SCSS。

## 2. 类名/变量契约

页面契约：子项之间的缝，写在父级上。Amis 用后续兄弟选择器 `~` 给**第二个及以后**加 `margin-left`（横）或 `margin-top`（竖），第一枚是 0。不是 Tailwind v4 那种打在 `:not(:last-child)` 上的 `margin-inline-end`。档位与 Padding 同一套 rem，`space-x-none` / `space-x-18` 是 Amis 多出来的。`space-x-reverse` 把缝翻到另一侧。Vamis schema `className` 打在外层 `div.vamis-node`；本页用 HTML 岛把 space 类打在内层 flex 上。
本页共 **76** 个类名/变量条目。

| 类名 | 计算值 |
|---|---|
| `space-x-px` | `margin-left: 0.0625rem` |
| `space-x-0` | `margin-left: 0` |
| `space-x-none` | `margin-left: 0` |
| `space-x-0.5` | `margin-left: 0.125rem` |
| `space-x-1` | `margin-left: 0.25rem` |
| `space-x-1.5` | `margin-left: 0.375rem` |
| `space-x-2` | `margin-left: 0.5rem` |
| `space-x-2.5` | `margin-left: 0.625rem` |
| `space-x-3` | `margin-left: 0.75rem` |
| `space-x-3.5` | `margin-left: 0.875rem` |
| `space-x-4` | `margin-left: 1rem` |
| `space-x-5` | `margin-left: 1.25rem` |
| `space-x-6` | `margin-left: 1.5rem` |
| `space-x-7` | `margin-left: 1.75rem` |

> 完整 76 个类名由 `@vamis/ui` helper 生成器维护；本设计只摘录前 14 个作契约样本。

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
