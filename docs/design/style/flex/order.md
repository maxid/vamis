# Flex Order 样式设计

> 状态：**进行中 90%** · 对应站点：`/style/flex/order` · 源码：[flex/order.md](../../../../website/src/style/flex/order.md)
> 盘点日期：2026-11-18。本文是页面级设计，不是站点正文副本。

## 0. 设计结论

只改子项的 `order`，不改 schema / DOM 顺序。要先有父级 `display: flex`（见 [Display](/style/layout/display)）。没写时是 CSS 默认 0；`order-1`…`order-12` 越大越靠后；`order-first` 为 -9999 拉到最前；`order-last` 为 9999 推到最后。同值仍按 DOM。Amis 没有 `order-none`（那是 Tailwind 的 0，helper 留作别名）。数字 1-3 是 DOM 顺序。Vamis schema `className` 打在外层 `div.vamis-node`；本页用 HTML 岛把 order 类打在子项上。

## 1. 边界与优先级

1. 类名打在 `.vamis-node`；需要内层时用 `bodyClassName` 或 HTML 岛。
2. 档位是 Tailwind/helper 计算值，不写死 px。
3. `m:`/`pc:` 两档；不支持状态前缀。
4. 不引入 cxd-* 或 Amis SCSS。

## 2. 类名/变量契约

页面契约：只改子项的 `order`，不改 schema / DOM 顺序。要先有父级 `display: flex`（见 [Display](/style/layout/display)）。没写时是 CSS 默认 0；`order-1`…`order-12` 越大越靠后；`order-first` 为 -9999 拉到最前；`order-last` 为 9999 推到最后。同值仍按 DOM。Amis 没有 `order-none`（那是 Tailwind 的 0，helper 留作别名）。数字 1-3 是 DOM 顺序。Vamis schema `className` 打在外层 `div.vamis-node`；本页用 HTML 岛把 order 类打在子项上。
本页共 **14** 个类名/变量条目。

| 类名 | 计算值 |
|---|---|
| `order-1` | `order: 1` |
| `order-2` | `order: 2` |
| `order-3` | `order: 3` |
| `order-4` | `order: 4` |
| `order-5` | `order: 5` |
| `order-6` | `order: 6` |
| `order-7` | `order: 7` |
| `order-8` | `order: 8` |
| `order-9` | `order: 9` |
| `order-10` | `order: 10` |
| `order-11` | `order: 11` |
| `order-12` | `order: 12` |
| `order-first` | `order: -9999` |
| `order-last` | `order: 9999` |

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
