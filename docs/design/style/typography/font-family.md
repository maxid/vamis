# Font Family 样式设计

> 状态：**进行中 90%** · 对应站点：`/style/typography/font-family` · 源码：[typography/font-family.md](../../../../website/src/style/typography/font-family.md)
> 盘点日期：2026-11-18。本文是页面级设计，不是站点正文副本。

## 0. 设计结论

用哪套字。三条类都是 Amis helper 硬编码栈，不是 `--font-sans` token。page / `.vamis-root` 默认走 `--fonts-base-family`（与 Amis 组件栈相同）；写了 `font-sans` 才换成 `ui-sans-serif, system-ui, …`。Vamis schema `className` 打在外层 `div.vamis-node`；本页用 HTML 岛把类打在内层 `<p>` 上。

## 1. 边界与优先级

1. 类名打在 `.vamis-node`；需要内层时用 `bodyClassName` 或 HTML 岛。
2. 档位是 Tailwind/helper 计算值，不写死 px。
3. `m:`/`pc:` 两档；不支持状态前缀。
4. 不引入 cxd-* 或 Amis SCSS。

## 2. 类名/变量契约

页面契约：用哪套字。三条类都是 Amis helper 硬编码栈，不是 `--font-sans` token。page / `.vamis-root` 默认走 `--fonts-base-family`（与 Amis 组件栈相同）；写了 `font-sans` 才换成 `ui-sans-serif, system-ui, …`。Vamis schema `className` 打在外层 `div.vamis-node`；本页用 HTML 岛把类打在内层 `<p>` 上。
本页共 **3** 个类名/变量条目。

| 类名 | 计算值 |
|---|---|
| `font-sans` | `font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";` |
| `font-serif` | `font-family: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;` |
| `font-mono` | `font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;` |

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
