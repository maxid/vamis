# Border Radius 样式设计

> 状态：**进行中 90%** · 对应站点：`/style/border/border-radius` · 源码：[border/border-radius.md](../../../../website/src/style/border/border-radius.md)
> 盘点日期：2026-11-18。本文是页面级设计，不是站点正文副本。

## 0. 设计结论

圆角档位是 Amis helper rem。`rounded`（无后缀）是 **4px**，和 `--radius` 水标同一档；`rounded-md` 是 **6px**，不是 token。组件默认圆角仍走 `--radius`；写了 helper 类才换成这一档。Vamis schema `className` 打在外层 `div.vamis-node`；本页用 HTML 岛把类打在内层盒子上。

## 1. 边界与优先级

1. 类名打在 `.vamis-node`；需要内层时用 `bodyClassName` 或 HTML 岛。
2. 档位是 Tailwind/helper 计算值，不写死 px。
3. `m:`/`pc:` 两档；不支持状态前缀。
4. 不引入 cxd-* 或 Amis SCSS。

## 2. 类名/变量契约

页面契约：圆角档位是 Amis helper rem。`rounded`（无后缀）是 **4px**，和 `--radius` 水标同一档；`rounded-md` 是 **6px**，不是 token。组件默认圆角仍走 `--radius`；写了 helper 类才换成这一档。Vamis schema `className` 打在外层 `div.vamis-node`；本页用 HTML 岛把类打在内层盒子上。
本页共 **81** 个类名/变量条目。

| 类名 | 计算值 |
|---|---|
| `rounded-none` | `border-radius: 0px;` |
| `rounded-t-none` | `border-top-left-radius: 0px; border-top-right-radius: 0px;` |
| `rounded-r-none` | `border-top-right-radius: 0px; border-bottom-right-radius: 0px;` |
| `rounded-b-none` | `border-bottom-right-radius: 0px; border-bottom-left-radius: 0px;` |
| `rounded-l-none` | `border-top-left-radius: 0px; border-bottom-left-radius: 0px;` |
| `rounded-tl-none` | `border-top-left-radius: 0px;` |
| `rounded-tr-none` | `border-top-right-radius: 0px;` |
| `rounded-br-none` | `border-bottom-right-radius: 0px;` |
| `rounded-bl-none` | `border-bottom-left-radius: 0px;` |
| `rounded-sm` | `border-radius: 0.125rem;` |
| `rounded-t-sm` | `border-top-left-radius: 0.125rem; border-top-right-radius: 0.125rem;` |
| `rounded-r-sm` | `border-top-right-radius: 0.125rem; border-bottom-right-radius: 0.125rem;` |
| `rounded-b-sm` | `border-bottom-right-radius: 0.125rem; border-bottom-left-radius: 0.125rem;` |
| `rounded-l-sm` | `border-top-left-radius: 0.125rem; border-bottom-left-radius: 0.125rem;` |

> 完整 81 个类名由 `@vamis/ui` helper 生成器维护；本设计只摘录前 14 个作契约样本。

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
