# Border Width 样式设计

> 状态：**进行中 90%** · 对应站点：`/style/border/border-width` · 源码：[border/border-width.md](../../../../website/src/style/border/border-width.md)
> 盘点日期：2026-11-18。本文是页面级设计，不是站点正文副本。

## 0. 设计结论

边框宽度。Amis 这些类**不设** `border-style`。要看见线还得叠 `border-solid`（`.vamis-html` 里 Preflight 的 solid 被关掉了）。单边类只改那一条边。Vamis schema `className` 打在外层 `div.vamis-node`；本页用 HTML 岛把类打在内层盒子上。

## 1. 边界与优先级

1. 类名打在 `.vamis-node`；需要内层时用 `bodyClassName` 或 HTML 岛。
2. 档位是 Tailwind/helper 计算值，不写死 px。
3. `m:`/`pc:` 两档；按 helper 支持状态/响应式前缀。
4. 不引入 cxd-* 或 Amis SCSS。

## 2. 类名/变量契约

页面契约：边框宽度。Amis 这些类**不设** `border-style`。要看见线还得叠 `border-solid`（`.vamis-html` 里 Preflight 的 solid 被关掉了）。单边类只改那一条边。Vamis schema `className` 打在外层 `div.vamis-node`；本页用 HTML 岛把类打在内层盒子上。
本页共 **25** 个类名/变量条目。

| 类名 | 计算值 |
|---|---|
| `border` | `border-width: 1px;` |
| `border-t` | `border-top-width: 1px;` |
| `border-r` | `border-right-width: 1px;` |
| `border-b` | `border-bottom-width: 1px;` |
| `border-l` | `border-left-width: 1px;` |
| `border-0` | `border-width: 0px;` |
| `border-t-0` | `border-top-width: 0px;` |
| `border-r-0` | `border-right-width: 0px;` |
| `border-b-0` | `border-bottom-width: 0px;` |
| `border-l-0` | `border-left-width: 0px;` |
| `border-2` | `border-width: 2px;` |
| `border-t-2` | `border-top-width: 2px;` |
| `border-r-2` | `border-right-width: 2px;` |
| `border-b-2` | `border-bottom-width: 2px;` |

> 完整 25 个类名由 `@vamis/ui` helper 生成器维护；本设计只摘录前 14 个作契约样本。

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
