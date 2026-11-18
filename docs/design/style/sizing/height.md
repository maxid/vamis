# Height 样式设计

> 状态：**进行中 90%** · 对应站点：`/style/sizing/height` · 源码：[sizing/height.md](../../../../website/src/style/sizing/height.md)
> 盘点日期：2026-11-18。本文是页面级设计，不是站点正文副本。

## 0. 设计结论

盒子有多高。档位与 Width 同一套 rem，加上分数 / `full` / `screen`。没有 `h-1x`。百分数相对含块：舞台钉死 `h-32`（128px）时 `h-1/2` = 64px、`h-full` = 128px。Amis `max-h-none` 是 `max-height: 0`（`$spacing` 的 none 是 0），不是 CSS `none`。作者 `className: h-full` 打在 schema 上时 `.vamis-node.h-full` 还会把内层根拉满。Vamis schema `className` 打在外层 `div.vamis-node`；本页用 HTML 岛把 height 类打在内层黄盒子上。

## 1. 边界与优先级

1. 类名打在 `.vamis-node`；需要内层时用 `bodyClassName` 或 HTML 岛。
2. 档位是 Tailwind/helper 计算值，不写死 px。
3. `m:`/`pc:` 两档；不支持状态前缀。
4. 不引入 cxd-* 或 Amis SCSS。

## 2. 类名/变量契约

页面契约：盒子有多高。档位与 Width 同一套 rem，加上分数 / `full` / `screen`。没有 `h-1x`。百分数相对含块：舞台钉死 `h-32`（128px）时 `h-1/2` = 64px、`h-full` = 128px。Amis `max-h-none` 是 `max-height: 0`（`$spacing` 的 none 是 0），不是 CSS `none`。作者 `className: h-full` 打在 schema 上时 `.vamis-node.h-full` 还会把内层根拉满。Vamis schema `className` 打在外层 `div.vamis-node`；本页用 HTML 岛把 height 类打在内层黄盒子上。
本页共 **97** 个类名/变量条目。

| 类名 | 计算值 |
|---|---|
| `h-0` | `height: 0;` |
| `h-1` | `height: 0.25rem;` |
| `h-2` | `height: 0.5rem;` |
| `h-3` | `height: 0.75rem;` |
| `h-4` | `height: 1rem;` |
| `h-5` | `height: 1.25rem;` |
| `h-6` | `height: 1.5rem;` |
| `h-7` | `height: 1.75rem;` |
| `h-8` | `height: 2rem;` |
| `h-9` | `height: 2.25rem;` |
| `h-10` | `height: 2.5rem;` |
| `h-11` | `height: 2.75rem;` |
| `h-12` | `height: 3rem;` |
| `h-14` | `height: 3.5rem;` |

> 完整 97 个类名由 `@vamis/ui` helper 生成器维护；本设计只摘录前 14 个作契约样本。

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
