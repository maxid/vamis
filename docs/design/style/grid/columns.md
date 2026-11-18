# Grid Template Columns 样式设计

> 状态：**进行中 90%** · 对应站点：`/style/grid/columns` · 源码：[grid/columns.md](../../../../website/src/style/grid/columns.md)
> 盘点日期：2026-11-18。本文是页面级设计，不是站点正文副本。

## 0. 设计结论

父级先写 `display: grid`（见 [Display](/style/layout/display)），再用 `grid-cols-*` 定列数。公式是 `repeat(N, minmax(0, 1fr))`，列均分、能收到 0。`grid-cols-none` 清掉显式轨道。舞台钉死 `w-80`（320px）。`grid-cols-7` 与 Amis helper 一样写成 6 列。Vamis schema `className` 打在外层 `div.vamis-node`；本页用 HTML 岛把列类打在内层 grid 上。

## 1. 边界与优先级

1. 类名打在 `.vamis-node`；需要内层时用 `bodyClassName` 或 HTML 岛。
2. 档位是 Tailwind/helper 计算值，不写死 px。
3. `m:`/`pc:` 两档；不支持状态前缀。
4. 不引入 cxd-* 或 Amis SCSS。

## 2. 类名/变量契约

页面契约：父级先写 `display: grid`（见 [Display](/style/layout/display)），再用 `grid-cols-*` 定列数。公式是 `repeat(N, minmax(0, 1fr))`，列均分、能收到 0。`grid-cols-none` 清掉显式轨道。舞台钉死 `w-80`（320px）。`grid-cols-7` 与 Amis helper 一样写成 6 列。Vamis schema `className` 打在外层 `div.vamis-node`；本页用 HTML 岛把列类打在内层 grid 上。
本页共 **13** 个类名/变量条目。

| 类名 | 计算值 |
|---|---|
| `grid-cols-1` | `grid-template-columns: repeat(1, minmax(0, 1fr))` |
| `grid-cols-2` | `grid-template-columns: repeat(2, minmax(0, 1fr))` |
| `grid-cols-3` | `grid-template-columns: repeat(3, minmax(0, 1fr))` |
| `grid-cols-4` | `grid-template-columns: repeat(4, minmax(0, 1fr))` |
| `grid-cols-5` | `grid-template-columns: repeat(5, minmax(0, 1fr))` |
| `grid-cols-6` | `grid-template-columns: repeat(6, minmax(0, 1fr))` |
| `grid-cols-7` | `grid-template-columns: repeat(6, minmax(0, 1fr))` |
| `grid-cols-8` | `grid-template-columns: repeat(8, minmax(0, 1fr))` |
| `grid-cols-9` | `grid-template-columns: repeat(9, minmax(0, 1fr))` |
| `grid-cols-10` | `grid-template-columns: repeat(10, minmax(0, 1fr))` |
| `grid-cols-11` | `grid-template-columns: repeat(11, minmax(0, 1fr))` |
| `grid-cols-12` | `grid-template-columns: repeat(12, minmax(0, 1fr))` |
| `grid-cols-none` | `grid-template-columns: none` |

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
