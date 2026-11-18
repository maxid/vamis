# Style 样式文档设计

> 状态：**进行中** · 覆盖 [website/src/style](../../../website/src/style) · 63 篇
> 盘点日期：2026-11-18。本文是样式文档域的设计，不替代 [样式规范](../../superpowers/specs/2026-11-15-vamis-style-standard.md)。

## 0. 一页结论

Style 是作者改观感的**四条通道**：`cssVars`、`className` helper、主题包、局部 `style`。文档共 63 篇：开始 4 篇（快速开始、CSS 变量、响应式、状态）+ Layout 9 / Flex 6 / Grid 8 / Box Alignment 9 / Spacing 3 / Sizing 2 / Typography 15 / Background 1 / Border 4 / Effect 2。主路径整体 90%，低分集中在快速开始 50%、响应式 45%、三类颜色 55%、CSS 变量 70%。

## 1. 边界与优先级（先读）

### 1.1 P0 不可破坏边界

1. **不搬 cxd**：不写 `.cxd-*`、不编译 Amis SCSS；文档示例用 Vamis token / Tailwind / helper。
2. **token 只引用**：默认皮肤只在 `styles.css` 引用 `--*`；页面示例通过 `className` / `cssVars`，不要内联 hex。
3. **四条通道各司其职**：整页换肤用 `cssVars`；局部覆盖用 `className` / `style`；主题包换 `[data-theme]` / `.dark` 色阶。
4. **响应式只有两档**：无前缀全宽生效；`m:` <768px；`pc:` ≥768px。不要教任意断点。
5. **状态前缀**：`hover:` / `active:` / `.is-active` / `focus:` / `disabled:` / `group-hover:`；可组合 `pc:hover:` / `m:hover:`。
6. **颜色别名**：Amis 名映射到 token（`--body-bg` → `--background`、`--Form-input-height` → `--control-h`）；文档要写映射，不写两套值。
7. **作者类不表示默认皮肤**：默认样子归 UI token；`className` 打在 `.vamis-node` 上，不能拿默认盒模型当作者类效果。

### 1.2 分组清单

| 组 | 篇数 | 页面 | 状态 |
|---|---:|---|---|
| 开始 | 4 | 快速开始、CSS 变量、响应式、状态 | 50 / 70 / 45 / 90 |
| Layout | 9 | box-sizing、display、float、clear、overflow、position、inset、visibility、z-index | 90 |
| Flexbox | 6 | direction、wrap、flex、grow、shrink、order | 90 |
| Grid | 8 | columns、column-start-end、rows、row-start-end、auto-flow、auto-columns、auto-rows、gap | 90 |
| Box Alignment | 9 | justify/align/place × content/items/self | 90 |
| Spacing | 3 | padding、margin、space-between | 90 |
| Sizing | 2 | width、height | 90 |
| Typography | 15 | family/size/style/weight/letter/line/list/align/color/decoration/transform/vertical/whitespace/break/overflow | 90（颜色 55） |
| Background | 1 | background-color | 55 |
| Border | 4 | radius、width、color、style | 90（颜色 55） |
| Effect | 2 | box-shadow、opacity | 90 |

## 2. 文档契约

- 每页统一「演示 → 类名/变量表 → 组合与边界 → 相关」；颜色页必须给 token 与 Amis 别名映射。
- 活示例用 ` ```schema `；HTML 岛示例用普通 `html` 代码块 + 说明。
- 类名写完整可复制（`m-t-xs`、`pc:w-1/2`），不要只写 Tailwind 文档链接。
- 表单项 `size` 只在 ≥576px 钉档；窄屏 `max-width:100%`，文档不要教写死宽。
- 深色示例必须同时给浅色/深色截图或可切换活示例。

## 3. 实现与数据流

- [styles.css](../../../packages/vamis-ui/src/styles.css)：`:root` token、helper 类、默认皮肤；[themes.css](../../../packages/vamis-ui/src/themes.css)：主题色阶。
- [helpers](../../../packages/vamis-ui/src)：间距/宽高/布局/状态前缀生成。
- [style 文档源](../../../website/src/style)：63 篇；`website/nav.mjs` 的 `styleNav` 决定侧栏。
- [样式规范](../../superpowers/specs/2026-11-15-vamis-style-standard.md)：字号/色号/圆角标尺、图标通道、`:style`、守卫上限。

```text
作者 className/cssVars
  → resolveClassName / resolveCssVars
  → .vamis-node class + 根 style
  → styles.css token / Tailwind / helper
```

## 4. 当前缺口

- 快速开始只 50%：四条通道的边界和完整 demo 未收口。
- 响应式 45%：`m:`/`pc:` 全色盘矩阵未生成，文档不能承诺“所有类都支持”。
- 背景/边框/文字三类颜色 55%：色盘表未逐项对齐。
- CSS 变量 70%：完整 Amis 变量表未一一对照；`registerTheme` 只接了入口。
- 深色/375px 下 helper/边框/阴影的视觉验收未成体系。

## 5. 验收清单（文档核对：3 / 12）

- [x] website/src/style 63 篇与 styleNav 已定位
- [x] styles.css / themes.css / 样式规范已定位
- [x] 四条通道与分组缺口已盘点
- [ ] 每页类名/变量表与实现逐项核对
- [ ] CSS 变量页 Amis 名 → token 映射补全
- [ ] 响应式页 `m:`/`pc:` 覆盖矩阵核对
- [ ] 三类颜色页色盘表对齐
- [ ] 每页活示例运行、无 console error
- [ ] 浅色/深色截图或可切换示例
- [ ] 375px 下代码块与演示不溢出
- [ ] `pnpm test`（package-boundary / helper 相关）
- [ ] `pnpm typecheck` 0（只改文档时说明未跑）

## 6. 后续

1. 先补快速开始四条通道与响应式矩阵。
2. 颜色三页接色盘表；CSS 变量页补 Amis 别名全表。
3. 统一每页「相关组件 / 相关 token」尾部链接。
