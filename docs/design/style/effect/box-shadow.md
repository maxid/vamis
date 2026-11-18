# Box Shadow 样式设计

> 状态：**进行中 90%** · 对应站点：`/style/effect/box-shadow` · 源码：[effect/box-shadow.md](../../../../website/src/style/effect/box-shadow.md)
> 盘点日期：2026-11-18。本文是页面级设计，不是站点正文副本。

## 0. 设计结论

投影。卡片不要默认加很重的阴影。Amis `shadow-lg` 第二层是 `-2px` / `0.05`，不是 Tailwind v4 的 `-4px` / `0.1`。Vamis schema `className` 打在外层 `div.vamis-node`；本页用 HTML 岛把类打在内层盒子上。

## 1. 边界与优先级

1. 类名打在 `.vamis-node`；需要内层时用 `bodyClassName` 或 HTML 岛。
2. 档位是 Tailwind/helper 计算值，不写死 px。
3. `m:`/`pc:` 两档；按 helper 支持状态/响应式前缀。
4. 不引入 cxd-* 或 Amis SCSS。

## 2. 类名/变量契约

页面契约：投影。卡片不要默认加很重的阴影。Amis `shadow-lg` 第二层是 `-2px` / `0.05`，不是 Tailwind v4 的 `-4px` / `0.1`。Vamis schema `className` 打在外层 `div.vamis-node`；本页用 HTML 岛把类打在内层盒子上。
本页共 **8** 个类名/变量条目。

| 类名 | 计算值 |
|---|---|
| `shadow-sm` | `box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);` |
| `shadow` | `box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);` |
| `shadow-md` | `box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);` |
| `shadow-lg` | `box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);` |
| `shadow-xl` | `box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);` |
| `shadow-2xl` | `box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);` |
| `shadow-inner` | `box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);` |
| `shadow-none` | `box-shadow: none;` |

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
