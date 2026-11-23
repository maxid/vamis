# Vamis × amis 同步状态

- 同步时间：2026-11-21
- Vamis 基线：`a173e53`（`main`；另有 Select 树模式增量待提交）
- amis 基线：`43a33ee06`（`master`，2026-03-18）
- amis 版本：6.13.0（`packages/amis/package.json`）
- amis 本地路径：`../amis`（相对本仓库根；仓不在旁时用 `--amis <相对路径>`）
- 覆盖数字可复现：`pnpm status -- --amis ../amis`（详见文末）

## 结论

1. **上游没有新东西要搬**：amis 本地 master 仍停在 `43a33ee06`（2026-03-18）；type 集合与上次同步相同。
2. **type 名称覆盖 185 / 189（97.9%）**：还剩 3 个真实 type 和 `navigation` 1 个别名。
3. **语义进度（2026-11-22）**：侧栏 155 项已完成 **6**（`container`、`hidden`、`toast`、`dialog`、`spinner`、`select`）/ 进行中 149 / 未开始 0，平均 **62%**（≥80% **49**）；`page` 因 `pullRefresh` 未接按新实现标准降为进行中。2026-11-16 打回虚高 80%+（「主路径 + 缺 themeCss」不得进 80）。D1–D5 P0 已落地；D6 P0 已接（余 combo 独立域）；D7 注册信息已接，余 RendererApi 注入；D8 诊断与渲染错误边界已接，可视化 Debug 面板仍缺。
4. **主要缺口仍是深度不是数量**：CRUD/表单高级行为、API 高级项、真实预览、编辑器插件未对齐。按文档侧栏拆开的语义进度见 [组件 P0 TODO](./2026-10-20-vamis-component-todo.md)（已注册 ≠ 语义完成）。任务级进度与下一步见仓库根 [CONTEXT.md](../../../CONTEXT.md)。

## 1. 上游对齐

| 项 | 值 |
|----|----|
| amis 本地 master | `43a33ee06`，2026-03-18 |
| amis 包版本 | 6.13.0 |
| Vamis HEAD | `a173e53`，2026-11-21，`main`；Select 树模式增量在 working tree |
| Vamis 公式引擎 | 仓内 `@vamis/formula`，从 amis-formula 6.13.0 源码搬运；P0 与 Amis 扩展过滤器已接 |

结论：Vamis 以 amis master 源码为参考基线，版本语义仍是 6.13.0。**本轮同步没有新增待搬运组件。**

## 2. 仓库健康

| 检查 | 命令 | 结果 |
|------|------|------|
| 单元测试 | `pnpm test` | 源码用例：formula 185 + core 902 + editor 8 + sdk 226 = **1321**，全绿（2026-11-23 复核） |
| 构建 | `pnpm build` | SDK + playground 生产构建通过，242 个静态路由（2026-11-19）；VitePress `docs:build` 的 Combo 页既有阻断不在本轮范围 |
| 类型检查 | `pnpm typecheck` | **0 错误**（2026-11-19 复核；CI 门禁） |
| 工作区 | `git status` | Table 模式已提交为 `f278409`；Select 级联模式增量在 working tree |
| 对照 | 报告 + 本机目录 | 目录 **2237**（文档 158 / 组件 1604 / 样式 471）。InputTree 桌面 / 移动 **26/31**、TreeSelect **14/16**、Options **38/39**、Select **26/31**、Spinner **7/7**、Dialog **22/23**，P0 0。本轮未重跑全量对照 |

结论：本轮 `test` / `typecheck`、TreeSelect 事件、基础组件动作与 `add/edit/delete` CUD 动作专项复核通过，生成目录为 **2237**；InputTree 桌面 / 移动 **26/31**、TreeSelect **14/16**（均 P0 0），未重跑 Playwright 全量对照。`pnpm typecheck` 必须保持 0，PR / Pages 工作流按此门禁。

## 3. amis type 覆盖

统计口径（`scripts/amis-parity.mjs`）：

- amis：扫描 `packages/amis/src` 与 `packages/amis-core/src`，取 `@Renderer` / `@FormItem` / `@OptionsControl` / `@Control` 装饰器或函数调用里的 `type` 与 `alias`；`test` 正则注册（`static`、`diff-editor`）折算为 type。
- Vamis：扫描 `packages/vamis/src/register.ts` 与 `extras/*.ts` 的 `registerRenderer({ type, alias })`。
- 只比较 type **字符串**，不衡量属性、事件、数据行为等实现深度。

| 指标 | 数值 |
|------|------|
| amis type 名 | 176 |
| amis 独有别名 | 13（另有 2 个别名与 type 同名） |
| amis 去重合计 | **189** |
| Vamis 注册 type | 161（`register.ts` + `extras/*`） |
| Vamis 别名 | 73 |
| Vamis 合计 | **234** |
| 交集 | **185** |
| 覆盖率 | **185 / 189 = 97.9%** |
| 遗漏 | 4（3 个 type + `navigation` 别名） |
| Vamis 扩展 | 49 |

### 3.1 遗漏明细（4）

| type | amis 出处 | Vamis 现状 / 建议 |
|------|-----------|-------------------|
| `cascader-select` | `Form/NestedSelect.tsx:1118` | `NestedSelect` 已实现多列级联，按变体注册即可 |
| `card-item-field` | `Card.tsx:859` | 并入 `cell` 别名（与 `list-item-field` 同类） |
| `cell-field` | `Table2/TableCell.tsx:8` | 并入 `cell` 别名 |
| `navigation` | `minimal.ts:748`，别名 → `nav` | `nav` 已有，补 alias |

### 3.2 Vamis 扩展（49）

语言族别名（`json-editor` 等）并入 `editor`（含 `js-editor` / `ts-editor`）。另有兼容别名：`columns-toggler`、`static-json`、`static-table`、`static-tpl`、`table-cell`、`tooltip`、`fieldSet`。

这些是 Vamis 为常用写法补的别名或额外 type，不属于与 amis 的差异。

## 4. 实现深度（人工评估）

### 4.1 已经能用的主链路

- **表单**：64 个 `isFormItem` 控件；`initApi`、`validate` / `rules`、`submit` / `reset`、`onEvent.submit`。
- **条件显隐**：`visibleOn` / `hiddenOn` / `disabledOn` 在 core（`formula.ts` + `SchemaRenderer.vue`）统一处理。
- **数据**：`crud` 支持 `api`、分页、`filter`、排序、多选 / `bulkActions`、`headerToolbar`、弹窗编辑；配套 `table` / `table2`、`operation`、`column-toggler`、`cell`。
- **动作**：`ajax`、`toast`、`setValue`、`reload`、`dialog`、`drawer`、`closeDialog` / `closeDrawer` / `cancel`、`submit`；支持 `onEvent`。
- **公式**：仓内 `@vamis/formula`；模板 `${}` 走 parser；P0 过滤器与 Amis 扩展过滤器（序列化、日期、字符串、URL、数组、结构转换、算术、时长 / 字节、Base64、条件、`map` / `filter` 等）已接。
- **布局 / 展示**：`page`（initApi overlay 已接，95%）、`container`（100%）、`flex`、`grid`、`tabs`、`wizard`、`panel`、`collapse`、`nav`、`cards`、`chart`（需 `config` / `api`）等。

### 4.2 深度分级

| 级别 | 说明 | 典型组件 |
|------|------|----------|
| L1 可交互 | 接 api、事件、校验，能承担真实页面 | `form`、`crud`、`table`、`tabs`、`dialog` / `drawer`、`service`、`action`、`formula` |
| L2 最小可用 | 能渲染、能绑定表单值，缺高级配置或真实数据源 | `input-city`（内置 3 省示例）、`users-select`（内置 3 个用户）、`input-excel`（只记文件名）、`location-picker`（三个输入框）、`icon-picker`（8 个字符图标）、`wizard`（步骤切换可用，initApi/api 提交未齐）。`editor` / `diff-editor` 已接 Monaco，不再属于此类 |
| L3 占位 / 降级 | 明确提示未接入 | `pdf-viewer`、`office-viewer`（`ViewerStub`「未接入预览」）；`amis`（只嵌内层 schema）；`web-component`（仅 tag + props）；`custom`（html 或 body 直通） |

其他已知未实现：CRUD 的 `autoGenerateFilter`、Amis JS 函数 `matchFunc` 与完整 quickSave API；`PageDef` 仅在声明 `spec.schema` / `spec.type` 时透传，固定壳（LIST / TREE_LIST 等）仍为占位提示。CRUD 的 `quickEdit`、`loadDataOnce`、`syncLocation` 与表达式 `matchFunc` 已接。

## 5. 作者态、IR 与工具链

- **作者态**：YAML 1.2 Core 与 JSON 并列；`On` / `yes` / `012` 在 YAML 里当字符串；JSON → IR → YAML 往返可用。
- **IR**：`UiPage`、`FormDef`、`TableDef` 可编译为 widget 树；未知 kind / 未知 type 显示占位，不崩。
- **公式**：`@vamis/formula` 已替代 npm `amis-formula`；`filterTpl` 走 parser，`${name|raw}` / `${name|html}` 可用；P0 与 Amis 扩展过滤器已接。
- **Playground**：`/` 文档、`/components` 组件、`/examples` 示例（15 个样例文件）；`/editor` 仍在。
- **JS SDK**：`vamis.embed` P0 已有；`getComponentByName` / `doAction` 已接，等更多组件动作覆盖。
- **编辑器**：树 + 预览 + 属性 + YAML/JSON；无插件市场。
- **测试**：formula / core / editor / sdk 有单测；core 已覆盖多类渲染器行为，SDK 另有 embed 与对照目录用例。

## 6. 下一阶段建议（按性价比）

> 运行时语义与实现顺序见 [语义设计](2026-10-20-vamis-runtime-semantics-design.md)；本节只列同步动作。

1. **补齐 4 个遗漏**：`navigation` 是一行别名；`cascader-select` 复用 `NestedSelect`；`card-item-field` / `cell-field` 并进 `cell`。
2. **提交门禁**：`pnpm typecheck` 已清零；CI（`.github/workflows/ci.yml`）跑 `pnpm test` + `pnpm typecheck`，Pages 构建同样先过 typecheck。后续研发必须保持 0。
3. **补深度而不是补数量**：
   - CRUD：`autoGenerateFilter`、Amis JS 函数 `matchFunc`、完整 quickSave API；`loadDataOnce` / `quickEdit` / `syncLocation` 已接；
   - 表单：`combo` 独立域、`combo` / `input-table` 的子表单 `api`、更多校验规则；
   - 预览：pdf / office 真实渲染仍可继续占位（非目标）。
4. **样例冒烟测试**：挂载 15 个 YAML 样例，断言不出现「未知类型」占位并检查关键文案。
5. **上游 watch**：amis master 自 2026-03-18 未动；等新版本发布后再对齐，不必逐日 diff。

## 7. 怎么复查

```bash
# 覆盖矩阵（需要本机 amis 仓库）
pnpm status -- --amis ../amis
pnpm status -- --amis ../amis --json

# 上游是否有新提交
git -C ../amis fetch
git -C ../amis log --oneline -1 origin/master

# 仓库健康
pnpm test
pnpm build
pnpm typecheck
```

覆盖数字变化时，同步更新本文第 3 节的表格与结论。
