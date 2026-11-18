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

## 页面设计

与 `website/src/style` 一一对应；设计内容在本目录，站点只作内容真源。

### 开始

- [快速开始 样式设计](index.md)
- [CSS 变量 样式设计](css-vars.md)
- [辅助类-响应式设计 样式设计](responsive-design.md)
- [辅助类-状态样式 样式设计](state.md)

### layout

- [Box Sizing 样式设计](layout/box-sizing.md)
- [Clear 样式设计](layout/clear.md)
- [Display 样式设计](layout/display.md)
- [Floats 样式设计](layout/float.md)
- [Overflow 样式设计](layout/overflow.md)
- [Position 样式设计](layout/position.md)
- [Top / Right / Bottom / Left 样式设计](layout/top-right-bottom-left.md)
- [Visibility 样式设计](layout/visibility.md)
- [Z-Index 样式设计](layout/z-index.md)

### flex

- [Flex Direction 样式设计](flex/direction.md)
- [Flex 样式设计](flex/flex.md)
- [Flex Grow 样式设计](flex/grow.md)
- [Flex Order 样式设计](flex/order.md)
- [Flex Shrink 样式设计](flex/shrink.md)
- [Flex Wrap 样式设计](flex/wrap.md)

### grid

- [Grid Auto Columns 样式设计](grid/auto-columns.md)
- [Grid Auto Flow 样式设计](grid/auto-flow.md)
- [Grid Auto Rows 样式设计](grid/auto-rows.md)
- [Grid Column Start / End 样式设计](grid/column-start-end.md)
- [Grid Template Columns 样式设计](grid/columns.md)
- [Gap 样式设计](grid/gap.md)
- [Grid Row Start / End 样式设计](grid/row-start-end.md)
- [Grid Template Rows 样式设计](grid/rows.md)

### box-alignment

- [Align Content 样式设计](box-alignment/align-content.md)
- [Align Items 样式设计](box-alignment/align-items.md)
- [Align Self 样式设计](box-alignment/align-self.md)
- [Justify Content 样式设计](box-alignment/justify-content.md)
- [Justify Items 样式设计](box-alignment/justify-items.md)
- [Justify Self 样式设计](box-alignment/justify-self.md)
- [Place Content 样式设计](box-alignment/place-content.md)
- [Place Items 样式设计](box-alignment/place-items.md)
- [Place Self 样式设计](box-alignment/place-self.md)

### spacing

- [Margin 样式设计](spacing/margin.md)
- [Padding 样式设计](spacing/padding.md)
- [Space Between 样式设计](spacing/space-between.md)

### sizing

- [Height 样式设计](sizing/height.md)
- [Width 样式设计](sizing/width.md)

### typography

- [Font Family 样式设计](typography/font-family.md)
- [Font Size 样式设计](typography/font-size.md)
- [Font style 样式设计](typography/font-style.md)
- [Font Weight 样式设计](typography/font-weight.md)
- [Letter Spacing 样式设计](typography/letter-spacing.md)
- [Line Height 样式设计](typography/line-height.md)
- [List Style Type 样式设计](typography/list-style-type.md)
- [Text Alignment 样式设计](typography/text-align.md)
- [Text Color 样式设计](typography/text-color.md)
- [Text Decoration 样式设计](typography/text-decoration.md)
- [Text Overflow 样式设计](typography/text-overflow.md)
- [Text Transform 样式设计](typography/text-transform.md)
- [Vertical Alignment 样式设计](typography/vertical-align.md)
- [Whitespace 样式设计](typography/whitespace.md)
- [Word Break 样式设计](typography/word-break.md)

### background

- [Background Color 样式设计](background/background-color.md)

### border

- [Border Color 样式设计](border/border-color.md)
- [Border Radius 样式设计](border/border-radius.md)
- [Border Style 样式设计](border/border-style.md)
- [Border Width 样式设计](border/border-width.md)

### effect

- [Box Shadow 样式设计](effect/box-shadow.md)
- [Opacity 样式设计](effect/opacity.md)

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
