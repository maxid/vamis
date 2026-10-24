# Vamis × amis 同步状态

- 同步时间：2026-10-21
- Vamis 基线：`f7aa2bb`（`main`，与 `origin/main` 一致）
- amis 基线：`43a33ee06`（`master`，2026-03-18）
- amis 版本：6.13.0（`packages/amis/package.json`）
- amis 本地路径：`../amis`（相对本仓库根；仓不在旁时用 `--amis <相对路径>`）
- 覆盖数字可复现：`pnpm status -- --amis ../amis`（详见文末）

## 结论

1. **上游没有新东西要搬**：amis 本地 master 仍停在 `43a33ee06`（2026-03-18）；type 集合与上次同步相同。
2. **type 名称覆盖 184 / 189（97.4%）**：`pager` 已并入 `pagination` 别名。还剩 3 个真实 type 和 2 个别名。
3. **语义进度**：侧栏 155 项已完成 **2**（`page` / `container`）/ 进行中 151 / 未开始 2，平均 47%。D1 Scope 与 D4 事件对象 P0 已落地；D2/D3/D5–D8 仍挡其它组件。
4. **主要缺口仍是深度不是数量**：CRUD/表单高级行为、API 管线、真实预览、编辑器插件未对齐。按文档侧栏拆开的语义进度见 [组件 P0 TODO](./2026-10-20-vamis-component-todo.md)（已注册 ≠ 语义完成）。任务级进度与下一步见仓库根 [CONTEXT.md](../../../CONTEXT.md)。

## 1. 上游对齐

| 项 | 值 |
|----|----|
| amis 本地 master | `43a33ee06`，2026-03-18 |
| amis 包版本 | 6.13.0 |
| Vamis HEAD | `f7aa2bb`，2026-10-21，`main` = `origin/main` |
| Vamis 公式引擎 | 仓内 `@vamis/formula`，从 amis-formula 6.13.0 源码搬运；内置过滤器目前只有 `raw` / `html` |

结论：Vamis 以 amis master 源码为参考基线，版本语义仍是 6.13.0。**本轮同步没有新增待搬运组件。**

## 2. 仓库健康

| 检查 | 命令 | 结果 |
|------|------|------|
| 单元测试 | `pnpm test` | 源码用例：formula 185 + core 175 + sdk 13 |
| 构建 | `pnpm build` | 未本轮重跑；上次记录通过，主 JS chunk 偏大（Vite >500 kB 警告） |
| 类型检查 | `pnpm typecheck` | 已通过（playground `vue-tsc --noEmit`） |
| 工作区 | `git status` | 同步时 clean，`main` 与 `origin/main` 一致 |

结论：`dev` / `build` / `typecheck` 可用；`typecheck` 可进 CI。

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
| Vamis 注册 type | 159（`register.ts` 61、`extras` 98） |
| Vamis 别名 | 72 |
| Vamis 合计 | **231** |
| 交集 | **184** |
| 覆盖率 | **184 / 189 = 97.4%** |
| 遗漏 | 5（3 个 type + 2 个别名） |
| Vamis 扩展 | 47 |

### 3.1 遗漏明细（5）

| type | amis 出处 | Vamis 现状 / 建议 |
|------|-----------|-------------------|
| `cascader-select` | `Form/NestedSelect.tsx:1118` | `NestedSelect` 已实现多列级联，按变体注册即可 |
| `card-item-field` | `Card.tsx:859` | 并入 `cell` 别名（与 `list-item-field` 同类） |
| `cell-field` | `Table2/TableCell.tsx:8` | 并入 `cell` 别名 |
| `map` | `minimal.ts:677`，别名 → `mapping` | `mapping` 已有，补 alias |
| `navigation` | `minimal.ts:748`，别名 → `nav` | `nav` 已有，补 alias |

### 3.2 Vamis 扩展（47）

语言族别名（`json-editor` 等）并入 `editor`（含 `js-editor` / `ts-editor`）。另有兼容别名：`columns-toggler`、`static-json`、`static-table`、`static-tpl`、`table-cell`、`tooltip`、`fieldSet`。

这些是 Vamis 为常用写法补的别名或额外 type，不属于与 amis 的差异。

## 4. 实现深度（人工评估）

### 4.1 已经能用的主链路

- **表单**：62 个 `isFormItem` 控件；`initApi`、`validate` / `rules`、`submit` / `reset`、`onEvent.submit`。
- **条件显隐**：`visibleOn` / `hiddenOn` / `disabledOn` 在 core（`formula.ts` + `SchemaRenderer.vue`）统一处理。
- **数据**：`crud` 支持 `api`、分页、`filter`、排序、多选 / `bulkActions`、`headerToolbar`、弹窗编辑；配套 `table` / `table2`、`operation`、`column-toggler`、`cell`。
- **动作**：`ajax`、`toast`、`setValue`、`reload`、`dialog`、`drawer`、`closeDialog` / `closeDrawer` / `cancel`、`submit`；支持 `onEvent`。
- **公式**：仓内 `@vamis/formula`；模板 `${}` 走 parser；`|raw` / `|html` 可用，其余 Amis 运行时过滤器未搬。
- **布局 / 展示**：`page`（initApi overlay 已接，70%）、`container`（78%）、`flex`、`grid`、`tabs`、`wizard`、`panel`、`collapse`、`nav`、`cards`、`chart`（需 `config` / `api`）等。

### 4.2 深度分级

| 级别 | 说明 | 典型组件 |
|------|------|----------|
| L1 可交互 | 接 api、事件、校验，能承担真实页面 | `form`、`crud`、`table`、`tabs`、`wizard`、`dialog` / `drawer`、`service`、`action`、`formula` |
| L2 最小可用 | 能渲染、能绑定表单值，缺高级配置或真实数据源 | `input-city`（内置 3 省示例）、`users-select`（内置 3 个用户）、`input-excel`（只记文件名）、`diff-editor`（双 textarea）、`location-picker`（三个输入框）、`icon-picker`（8 个字符图标）、`editor` 家族（等宽 textarea，未接 Monaco） |
| L3 占位 / 降级 | 明确提示未接入 | `pdf-viewer`、`office-viewer`（`ViewerStub`「未接入预览」）；`amis`（只嵌内层 schema）；`web-component`（仅 tag + props）；`custom`（html 或 body 直通） |

其他已知未实现：`quickEdit`、`loadDataOnce`、CRUD 的 `syncLocation`（URL 同步）；`PageDef` 仅在声明 `spec.schema` / `spec.type` 时透传，固定壳（LIST / TREE_LIST 等）仍为占位提示。

## 5. 作者态、IR 与工具链

- **作者态**：YAML 1.2 Core 与 JSON 并列；`On` / `yes` / `012` 在 YAML 里当字符串；JSON → IR → YAML 往返可用。
- **IR**：`UiPage`、`FormDef`、`TableDef` 可编译为 widget 树；未知 kind / 未知 type 显示占位，不崩。
- **公式**：`@vamis/formula` 已替代 npm `amis-formula`；`filterTpl` 走 parser，`${name|raw}` / `${name|html}` 可用；`|date` / `|json` 等运行时过滤器仍未搬。
- **Playground**：`/` 文档、`/components` 组件、`/examples` 示例（15 个样例文件）；`/editor` 仍在。
- **JS SDK**：`vamis.embed` P0 已有；`getComponentByName` / `doAction` 仍抛未实现，等 D4/D5。
- **编辑器**：树 + 预览 + 属性 + YAML/JSON；无插件市场。
- **测试**：formula / core / sdk 有单测；渲染器还没有组件级测试。

## 6. 下一阶段建议（按性价比）

> 运行时语义与实现顺序见 [语义设计](2026-10-20-vamis-runtime-semantics-design.md)；本节只列同步动作。

1. **补齐 8 个遗漏**：3 个别名是一行改动；`cascader-select` 复用 `NestedSelect`；`js-editor` / `ts-editor` 复用 `editor`；`card-item-field` / `cell-field` 并进 `cell`。
2. **提交门禁**：`pnpm typecheck` 已清零；可以把 `pnpm test + typecheck + build` 组合成 CI。
3. **补深度而不是补数量**：
   - CRUD：`loadDataOnce`、`quickEdit`、`syncLocation`；
   - 表单：`combo` / `input-table` 的子表单 `api`、更多校验规则；
   - 预览：pdf / office 真实渲染仍可继续占位（非目标）。
4. **样例冒烟测试**：挂载 14 个 YAML 样例，断言不出现「未知类型」占位并检查关键文案。
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
