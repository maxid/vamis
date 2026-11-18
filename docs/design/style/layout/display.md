# Display 样式设计

> 状态：**进行中 90%** · 对应站点：`/style/layout/display` · 源码：[layout/display.md](../../../../website/src/style/layout/display.md)
> 盘点日期：2026-11-18。本文是页面级设计，不是站点正文副本。

## 0. 设计结论

改当前节点的 `display`。Vamis schema `className` 打在外层 `div.vamis-node`；要让子节点成为 flex/grid item，写容器的 `bodyClassName`，或像本页一样用 HTML 岛把 class 打在内层节点上。

## 1. 边界与优先级

1. 类名打在 `.vamis-node`；需要内层时用 `bodyClassName` 或 HTML 岛。
2. 档位是 Tailwind/helper 计算值，不写死 px。
3. `m:`/`pc:` 两档；不支持状态前缀。
4. 不引入 cxd-* 或 Amis SCSS。

## 2. 类名/变量契约

页面契约：改当前节点的 `display`。Vamis schema `className` 打在外层 `div.vamis-node`；要让子节点成为 flex/grid item，写容器的 `bodyClassName`，或像本页一样用 HTML 岛把 class 打在内层节点上。
本页共 **18** 个类名/变量条目。

| 类名 | 计算值 |
|---|---|
| `block` | `display: block` |
| `inline-block` | `display: inline-block` |
| `inline` | `display: inline` |
| `flex` | `display: flex` |
| `inline-flex` | `display: inline-flex` |
| `table` | `display: table` |
| `table-cell` | `display: table-cell` |
| `table-column` | `display: table-column` |
| `table-column-group` | `display: table-column-group` |
| `table-footer-group` | `display: table-footer-group` |
| `table-header-group` | `display: table-header-group` |
| `table-row-group` | `display: table-row-group` |
| `table-row` | `display: table-row` |
| `flow-root` | `display: flow-root` |

> 完整 18 个类名由 `@vamis/ui` helper 生成器维护；本设计只摘录前 14 个作契约样本。

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
