# Font Weight 样式设计

> 状态：**进行中 90%** · 对应站点：`/style/typography/font-weight` · 源码：[typography/font-weight.md](../../../../website/src/style/typography/font-weight.md)
> 盘点日期：2026-11-18。本文是页面级设计，不是站点正文副本。

## 0. 设计结论

字重。Amis 九档 100～900。系统中文黑体常常没有 thin / black 对应字形，计算 `font-weight` 仍是那个数字。标题常用 `font-semibold`。Vamis schema `className` 打在外层 `div.vamis-node`；本页用 HTML 岛把类打在内层 `<p>` 上。

## 1. 边界与优先级

1. 类名打在 `.vamis-node`；需要内层时用 `bodyClassName` 或 HTML 岛。
2. 档位是 Tailwind/helper 计算值，不写死 px。
3. `m:`/`pc:` 两档；按 helper 支持状态/响应式前缀。
4. 不引入 cxd-* 或 Amis SCSS。

## 2. 类名/变量契约

页面契约：字重。Amis 九档 100～900。系统中文黑体常常没有 thin / black 对应字形，计算 `font-weight` 仍是那个数字。标题常用 `font-semibold`。Vamis schema `className` 打在外层 `div.vamis-node`；本页用 HTML 岛把类打在内层 `<p>` 上。
本页共 **9** 个类名/变量条目。

| 类名 | 计算值 |
|---|---|
| `font-thin` | `font-weight: 100;` |
| `font-extralight` | `font-weight: 200;` |
| `font-light` | `font-weight: 300;` |
| `font-normal` | `font-weight: 400;` |
| `font-medium` | `font-weight: 500;` |
| `font-semibold` | `font-weight: 600;` |
| `font-bold` | `font-weight: 700;` |
| `font-extrabold` | `font-weight: 800;` |
| `font-black` | `font-weight: 900;` |

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
