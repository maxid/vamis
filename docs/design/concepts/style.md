# 概念-样式设计

> 状态：**进行中 90%** · 对应站点：`/concepts/style` · 源码：[website/src/concepts/style.md](../../../website/src/concepts/style.md)

## 0. 设计结论

概念-样式页不是 class 大全，而是**改观感的决策树**：整页换肤用 `cssVars`，局部覆盖用 `className`，主题包换 token，单块用 `style`。它要把作者从 cxd/SCSS 引到 Vamis token。

## 1. 边界与优先级

1. **四条通道**：cssVars / className / 主题包 / style；互不替代。
2. **token 优先**：不写 cxd-*、不编译 Amis SCSS；默认皮肤归 `@vamis/ui`。
3. **className 位置**：落 `.vamis-node`；需要内层时用 `bodyClassName` 或 HTML 岛。
4. **响应式/状态**：`m:`/`pc:`、hover/active/focus/disabled 由 helper 支持；不要自造断点。
5. **安全**：作者 style 是可信配置；用户输入不进 style/class。
6. **边界**：具体类目去 `/style/*`，本页只做选择。

## 2. 内容契约

- 四条通道各一个最小例，并给“何时不用”。
- cssVars 示例必须用 Vamis token 名，并给 Amis 名映射。
- className 示例说明外层/内层差异。
- 与 style 首页/CSS 变量页互链，不复制全表。

## 3. 实现

- [styles.css](../../../packages/vamis-ui/src/styles.css)：token/helper/皮肤。
- [resolveCssVars](../../../packages/vamis-core/src)：page.cssVars。
- [resolveClassName](../../../packages/vamis-core/src)：className 解析。

## 4. 缺口

- 四条通道的失败态（类名冲突/变量覆盖顺序）未写。
- 深色/移动的视觉示例不足。

## 5. 验收清单（文档核对：3 / 12）

- [x] 四通道/token 边界已盘点
- [x] styles.css/resolve 入口已定位
- [ ] 四通道示例可运行
- [ ] 内外层 className 差异可复现
- [ ] 与 /style 页面互链不重复
- [ ] 深色/移动可读
- [ ] 无 cxd/SCSS 表述
