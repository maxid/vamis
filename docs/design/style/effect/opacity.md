# Opacity 样式设计

> 状态：**进行中 90%** · 对应站点：`/style/effect/opacity` · 源码：[effect/opacity.md](../../../../website/src/style/effect/opacity.md)
> 盘点日期：2026-11-18。本文是页面级设计，不是站点正文副本。

## 0. 设计结论

透明度。禁用态优先 schema `disabled`，不要只靠 `opacity-50`。Amis 档位是 0/5/10/20/25… 不是每 5 一档全开。Vamis schema `className` 打在外层 `div.vamis-node`；本页用 HTML 岛把类打在内层盒子上。

## 1. 边界与优先级

1. 类名打在 `.vamis-node`；需要内层时用 `bodyClassName` 或 HTML 岛。
2. 档位是 Tailwind/helper 计算值，不写死 px。
3. `m:`/`pc:` 两档；不支持状态前缀。
4. 不引入 cxd-* 或 Amis SCSS。

## 2. 类名/变量契约

页面契约：透明度。禁用态优先 schema `disabled`，不要只靠 `opacity-50`。Amis 档位是 0/5/10/20/25… 不是每 5 一档全开。Vamis schema `className` 打在外层 `div.vamis-node`；本页用 HTML 岛把类打在内层盒子上。
本页共 **15** 个类名/变量条目。

| 类名 | 计算值 |
|---|---|
| `opacity-0` | `opacity: 0;` |
| `opacity-5` | `opacity: 0.05;` |
| `opacity-10` | `opacity: 0.1;` |
| `opacity-20` | `opacity: 0.2;` |
| `opacity-25` | `opacity: 0.25;` |
| `opacity-30` | `opacity: 0.3;` |
| `opacity-40` | `opacity: 0.4;` |
| `opacity-50` | `opacity: 0.5;` |
| `opacity-60` | `opacity: 0.6;` |
| `opacity-70` | `opacity: 0.7;` |
| `opacity-75` | `opacity: 0.75;` |
| `opacity-80` | `opacity: 0.8;` |
| `opacity-90` | `opacity: 0.9;` |
| `opacity-95` | `opacity: 0.95;` |

> 完整 15 个类名由 `@vamis/ui` helper 生成器维护；本设计只摘录前 14 个作契约样本。

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
