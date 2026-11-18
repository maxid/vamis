# Padding 样式设计

> 状态：**进行中 90%** · 对应站点：`/style/spacing/padding` · 源码：[spacing/padding.md](../../../../website/src/style/spacing/padding.md)
> 盘点日期：2026-11-18。本文是页面级设计，不是站点正文副本。

## 0. 设计结论

盒子内边距。档位是 Tailwind spacing（`p-4` = 1rem = 16px），不是 cxd `--gap-xs…xl`。`p-none` / `p-18` 是 Amis 多出来的档。`p` 四边、`px` / `py` 轴、`pt` / `pr` / `pb` / `pl` 单边。黄盒子套蓝芯，用计算 `padding-*` 对。Vamis schema `className` 打在外层 `div.vamis-node`；本页用 HTML 岛把 padding 类打在内层黄盒子上。

## 1. 边界与优先级

1. 类名打在 `.vamis-node`；需要内层时用 `bodyClassName` 或 HTML 岛。
2. 档位是 Tailwind/helper 计算值，不写死 px。
3. `m:`/`pc:` 两档；不支持状态前缀。
4. 不引入 cxd-* 或 Amis SCSS。

## 2. 类名/变量契约

页面契约：盒子内边距。档位是 Tailwind spacing（`p-4` = 1rem = 16px），不是 cxd `--gap-xs…xl`。`p-none` / `p-18` 是 Amis 多出来的档。`p` 四边、`px` / `py` 轴、`pt` / `pr` / `pb` / `pl` 单边。黄盒子套蓝芯，用计算 `padding-*` 对。Vamis schema `className` 打在外层 `div.vamis-node`；本页用 HTML 岛把 padding 类打在内层黄盒子上。
本页共 **259** 个类名/变量条目。

| 类名 | 计算值 |
|---|---|
| `p-px` | `padding: 0.0625rem;` |
| `px-px` | `padding-left: 0.0625rem; padding-right: 0.0625rem;` |
| `py-px` | `padding-top: 0.0625rem; padding-bottom: 0.0625rem;` |
| `pt-px` | `padding-top: 0.0625rem;` |
| `pr-px` | `padding-right: 0.0625rem;` |
| `pb-px` | `padding-bottom: 0.0625rem;` |
| `pl-px` | `padding-left: 0.0625rem;` |
| `p-0` | `padding: 0;` |
| `px-0` | `padding-left: 0; padding-right: 0;` |
| `py-0` | `padding-top: 0; padding-bottom: 0;` |
| `pt-0` | `padding-top: 0;` |
| `pr-0` | `padding-right: 0;` |
| `pb-0` | `padding-bottom: 0;` |
| `pl-0` | `padding-left: 0;` |

> 完整 259 个类名由 `@vamis/ui` helper 生成器维护；本设计只摘录前 14 个作契约样本。

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
