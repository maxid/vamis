# Select 下拉框 · `select` 设计

> 状态：**进行中 92%** · 复杂度：**XL 特重**
> 文档：[/components/form/select](/components/form/select) · Amis 文档：`/zh-CN/components/form/select`
> 盘点日期：2026-11-18；自动从 Amis 6.13.0 源码、Vamis 注册表与组件 TODO 提取；边界优先结构已统一，人工设计取舍待补。

## 1. 边界与优先级（先读）

> 先过边界，再谈属性/样式。以下 P0 项任一被破坏，后面的功能都不算完成。

- **契约边界**：只消费 `schema` / `data` / `env`；字段名与 Amis 对齐，扩展只加新字段，不改写作者 schema。
- **包边界**：默认皮肤与 chrome 图标归 `@vamis/ui`；渲染器不带 `<style>`、不直接 `fetch`；作者 `className` 不能替代默认皮肤。
- **表单边界**：值走 `FormItem` / `formContext` 的路径值；校验、静态态、禁用、显隐由表单壳统一，组件不要自建提交或第二套 value。
- **数据域**：用 `useData` / `useScoped` 读取/提供数据；离开数据域时不能残留旧值或旧 scope。
- **浮层**：复用 `VamisOverlay` / `PopOverHost`，层级走 `--z-*`；关闭、焦点、嵌套数据回退由浮层壳负责，不另起 Teleport。
- **子 schema**：`SchemaRenderer` 递归渲染；未知 type、空 body、错误边界不能把整棵组件树打断。
- **表单项**：路径名（`a.b[0]`）、空值、默认值、`disabled` / `static` / `readOnly`、初始化顺序都按 FormItem 契约。
- **选项/输入**：远程/变量 options、空选项、重复 value、禁用项、多选与标签折叠、输入法组合态。
- **边界用例（至少覆盖）**：空值 / null / undefined 与默认值；`name` 路径、初始化与 reset；disabled / static / readonly / 隐藏；校验失败与 error 回填；远程 options 慢返回 / 空结果 / 竞态。

**施工顺序**：主路径 → 属性/事件 → 边界用例 → 对照/深色。复杂项（XL 特重）一次只做一个切片，不把样式修补和运行时语义混刀。

## 2. 复杂度

- 等级：**XL 特重**；Amis 源码 ≥800 行，或 ≥8 个依赖，或表单/表格/CRUD/页面/编辑器等枢纽组件。
- Amis 源码：**812** 行；Vamis 实现：**832** 行；依赖：**3** 个
- 集成面：表单/FormItem、数据域、浮层、子 Schema
- 判定依据：Vamis 832 行 + Amis 812 行 + 3 依赖 + form/data/overlay/schema

## 3. Amis 契约

- 入口 type：`select`
- Amis 源文件：`packages/amis/src/renderers/Form/Select.tsx`
- 依赖：`FormItem`, `Options`, `spinner`
- 文档章节：`/zh-CN/components/form/select`

## 4. Vamis 设计与源码

- 渲染器文件：[`packages/vamis/src/renderers/form/Select.vue`](../../../packages/vamis/src/renderers/form/Select.vue)
- 注册形态：表单渲染器（`isFormItem`）
- 项目模式：
  - 表单值走 `FormItem` + `formContext`（`form.getValue` / `setValue`），校验、显隐、静态态由表单壳统一处理，渲染器不自建提交。
  - 用 `useData()` 读取当前数据域；数据变化由 `SchemaRenderer` 的响应式 data 驱动。
  - 浮层复用 `VamisOverlay` / `PopOverHost`，层级与定位走统一 overlay 工具和 `--z-*` token，不另起 Teleport。
  - 子节点交给 `SchemaRenderer` 递归渲染；自身只负责容器、循环或字段级包装。

## 5. 样式与边界

- 相关默认皮肤类：`.vamis-picker-fade`, `.vamis-popup__frame`, `.vamis-popup__picker`, `.vamis-select`, `.vamis-select-overflow`, `.vamis-select-overflow__grid`, `.vamis-select__caret`, `.vamis-select__check`, `.vamis-select__checkall`, `.vamis-select__chip`, `.vamis-select__chip-close`, `.vamis-select__chip-label`（定义在 `@vamis/ui/styles.css`）
- 渲染器不得带 `<style>`；颜色/字号/圆角/间距用 `--*` token，不写死 hex/px。
- `@vamis/ui` 不反向依赖 core；schema/env 读取留在 `packages/vamis`；不直接 `fetch`。

## 6. 当前状态与缺口

- TODO 记录：主路径已对齐：分组 Transfer 检索框 / 小复选框 / 多选 tag hover tooltip / 按宽度 `+ N ...`、溢出标签表格、`menuTpl`、`searchable` / `filterOption` / `searchApi`、`overlay`（含移动端 `height` 默认 320）、全选、`autoComplete` mock、focus/blur。移动端 `VamisPopUp` 底部滑入（普通单选才滚轮 itemHeight 40 + `menuTpl` slot 居中；普通多选右侧勾不是左侧 Checkbox，行高 37px 内层 `content-box` 1px 以免 100% 缩放丢线；`searchable` 在上方；`selectMode: group` 组头 12 / 子项 24；确认才写入；箭头朝右不翻转）。`selectMode` table/tree/chained/associated、`deferApi`、人员点选未接
- 状态：进行中，进度 92%；如进度未到 100，按上条缺口补齐。

## 7. 验收计划与完成度

- 组件页对照：`pnpm compare --page select`（桌面）；窄屏：`--mobile`。
- 改渲染器/活示例/样式后先 `pnpm sdk:build`；跑 `pnpm test` + `pnpm typecheck`（0 错误门禁）。
- 组件页 markdown 活示例须能运行；Diff 以 Amis 同路径页为准。

### 验收清单（文档核对：3 / 12）

> 只勾“本轮文档核对已具备”的项；功能、测试、对照必须由实现刀逐项勾，未勾不等于未实现。

- [x] Amis 入口源码 / 文档章节已定位
- [x] Vamis 渲染器或注册文件已定位
- [x] 复杂度、依赖、集成面已盘点
- [ ] schema 属性 / 默认值逐项核对
- [ ] 事件 / 动作逐项核对
- [ ] 边界用例逐项核对
- [ ] 组件页活示例运行、无控制台 error
- [ ] `pnpm test`（组件相关）
- [ ] `pnpm typecheck` 0
- [ ] `pnpm compare --page <type>` 桌面
- [ ] `pnpm compare --page <type> --mobile`
- [ ] 深色 / 375px 窄屏核对

> 未勾项按“当前状态与缺口”逐条处理；完成后再把本清单改成实现刀的实际结果。

## 8. 后续

- 先补第 6 节列出的缺口，再按第 7 节对照到通过；复杂项（XL 特重）按串行分批一次只做 1 个。
- 设计取舍（数据域拆分、浮层复用、性能/懒加载）需在此文档补充后再动实现。

---
返回 [组件设计索引](README.md)
