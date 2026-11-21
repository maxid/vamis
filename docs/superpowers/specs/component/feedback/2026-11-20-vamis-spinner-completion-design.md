# Vamis Spinner 完成设计

> 状态：已落地 · 日期：2026-11-21

## 目标

把 `spinner` 从 95% 收口到可交付的 100%，以 Amis 6.13.0 运行时源码为契约，同时保留 Vamis 有意设计的中心对称菱形默认指示器。

## 范围

- Spinner 渲染器：根节点 class、disabled、深色背景识别、现有 show/overlay/delay/body/loadingConfig 行为回归。
- Select 宿主：控件内 `reload + sm` 图标、控件级 Spinner overlay、`loadingConfig` 透传。
- 现有共享宿主回归：Page、Service、CRUD、Form、Dialog、Drawer info、Select、InputText、InputTree/TreeSelect。
- 文档、测试计数和组件进度同步。

## 非目标

- 不改成 Amis 六边形默认指示器；Vamis 菱形是产品化有意设计。
- 不把所有 Amis 中出现过 Spinner 的组件都扩进本轮；List、Cards、Grid、Nav、App、Wizard 的 loading 宿主仍归各自组件完成。
- 不复制 Amis 产品版本号。

## 契约

- `overlay` 默认值跟 Amis `Spinner.defaultProps`：`false`，不跟 Amis 文档属性表冲突值。
- `className` 同时落到实际 `.vamis-spinner` 根，保证作者样式和 Amis 一致；SchemaRenderer 外层 class 继续保留。
- `spinnerClassName` 只落 icon 容器，`spinnerWrapClassName` 只落容器外壳。
- `disabled` 只改变简单图标颜色；默认菱形保持品牌正常色，避免改写既定设计。
- 父容器背景亮度符合 Amis `brightness < 200 && alpha > 0.4` 时，简单图标切换深色背景 token。
- `loadingConfig.root` 继续强制 overlay、禁用自定义 icon。
- Select overlay 覆盖控件区域；Select trigger Spinner 为 `reload + sm`，使用 `Select-spinner` 等价 class。

## 验证

- 先写失败测试，再做最小实现。
- SDK 集成测试覆盖 Spinner 根语义、Select 双挂点、Page/Form/Dialog/Service/InputText/InputTree 现有宿主。
- 全量 `pnpm test`、`pnpm typecheck`。
- `pnpm compare --page spinner|select|page|service|crud|form|dialog|input-text|input-tree|tree-select` 桌面与必要移动端。
- 浏览器核深色遮罩、375px、父子 loading 互斥和 Select trigger/overlay。

## 完成口径

上述测试和页面检查通过后，Spinner 更新为 `已完成 100%`；默认菱形在文档中明确为 Vamis 有意差异，不再写作缺口。
