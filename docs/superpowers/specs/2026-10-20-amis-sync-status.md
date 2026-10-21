# vamis × amis 同步状态

- 同步时间：2026-10-20
- vamis 基线：`c3396b0`（`main`，与 `origin/main` 一致）
- amis 基线：`43a33ee06`（`master`，2026-03-18，与 `origin/master` 一致）
- amis 版本：6.13.0（`packages/amis/package.json`）
- amis 本地路径：`/Users/maxid/Develop/IdeaProjects/github/amis`
- 覆盖数字可复现：`pnpm status -- --amis ../amis`（详见文末）

## 结论

1. **上游没有新东西要搬**：amis master 停在 2026-03-18，`git ls-remote` 与本地一致；npm 最新版仍是 6.13.0，`amis-formula` 也还是 6.13.0。
2. **type 名称覆盖 181 / 189（95.8%）**：只剩 5 个真实 type 和 3 个遗漏别名，补注册的成本很低。
3. **仓库可运行**：`pnpm test` 37/37 通过，`pnpm build` 通过；`pnpm typecheck` 仍有 27 个错误，暂时不能作为提交门禁。
4. **主要缺口已从“有没有”变成“有多深”**：最近补齐的组件多为最小可用实现，CRUD/表单的高级行为、真实预览、编辑器仍未对齐。按文档侧栏拆开的语义进度见 [组件 P0 TODO](./2026-10-20-vamis-component-todo.md)（已注册 ≠ 语义完成）。

## 1. 上游对齐

| 项 | 值 |
|----|----|
| amis 本地 master | `43a33ee06`，2026-03-18 |
| amis `origin/master` | `43a33ee06`（`git ls-remote` 校验一致） |
| amis 包版本 | 6.13.0 |
| npm `amis@latest` | 6.13.0（gitHead `37d23b4`，落后于本机 master） |
| npm `amis-formula@latest` | 6.13.0，与 vamis 的 pin 一致 |
| vamis 依赖 pin | `amis-formula@6.13.0` |

结论：vamis 以 amis master 源码为参考基线（比 npm 发布包多出若干未发版修复），版本语义仍是 6.13.0。**本轮同步没有新增待搬运组件。**

## 2. 仓库健康

| 检查 | 命令 | 结果 |
|------|------|------|
| 单元测试 | `pnpm test` | 7 个文件 / 37 个用例全过 |
| 构建 | `pnpm build` | 通过；两个主 JS chunk 858.7 kB / 1,042.7 kB（gzip 254.8 / 345.8），Vite 有 >500 kB 警告 |
| 类型检查 | `pnpm typecheck` | **失败：27 个错误** |
| 工作区 | `git status` | 同步前 clean，`main` 与 `origin/main` 一致 |

### typecheck 错误分布（27）

| 类别 | 数量 | 位置 |
|------|------|------|
| 缺 `@types/node` | 11 | `playground/src/mock/plugin.ts`（Buffer / IncomingMessage，5 个）；`vamis-core` 两个测试里的 `node:fs` / `node:path` / `node:url`（6 个） |
| 模板 / 类型窄化 | 16 | `SchemaRenderer.vue`、`FormItem.vue`、`CRUD.vue`、`Table.vue`、`data/Table2.vue`；表单侧 `Checkbox`、`Editor`、`InputArray`、`InputDate`、`InputGroup`、`InputNumber`、`InputRichText`、`InputTable`、`InputText`、`Radios`、`Textarea` |

窄化错误以 `TS2322`（`{}` 传给 `string | number`）、`TS2538`（用 `undefined` 做索引）、`TS2367`（字符串与布尔比较）为主。
结论：`dev` / `build` 可用；`typecheck` 需要清理后才能进 CI。

## 3. amis type 覆盖

统计口径（`scripts/amis-parity.mjs`）：

- amis：扫描 `packages/amis/src` 与 `packages/amis-core/src`，取 `@Renderer` / `@FormItem` / `@OptionsControl` / `@Control` 装饰器或函数调用里的 `type` 与 `alias`；`test` 正则注册（`static`、`diff-editor`）折算为 type。
- vamis：扫描 `packages/vamis/src/register.ts` 与 `extras/*.ts` 的 `registerRenderer({ type, alias })`。
- 只比较 type **字符串**，不衡量属性、事件、数据行为等实现深度。

| 指标 | 数值 |
|------|------|
| amis type 名 | 176 |
| amis 独有别名 | 13（另有 2 个别名与 type 同名） |
| amis 去重合计 | **189** |
| vamis 注册 type | 159（`register.ts` 61、`extras` 98） |
| vamis 别名 | 43 |
| vamis 合计 | **202** |
| 交集 | **181** |
| 覆盖率 | **181 / 189 = 95.8%** |
| 遗漏 | 8（5 个 type + 3 个别名） |
| vamis 扩展 | 21 |

### 3.1 遗漏明细（8）

| type | amis 出处 | vamis 现状 / 建议 |
|------|-----------|-------------------|
| `cascader-select` | `Form/NestedSelect.tsx:1118` | `NestedSelect` 已实现多列级联，按变体注册即可 |
| `card-item-field` | `Card.tsx:859` | 并入 `cell` 别名（与 `list-item-field` 同类） |
| `cell-field` | `Table2/TableCell.tsx:8` | 并入 `cell` 别名 |
| `js-editor` | `Form/Editor.tsx:425` | 归入现有 `editor` 家族（语言由 type 推导） |
| `ts-editor` | `Form/Editor.tsx:436` | 同上 |
| `map` | `minimal.ts:677`，别名 → `mapping` | `mapping` 已有，补 alias |
| `navigation` | `minimal.ts:748`，别名 → `nav` | `nav` 已有，补 alias |
| `pager` | `minimal.ts:100`，别名 → `pagination` | `pagination` 已有，补 alias |

### 3.2 vamis 扩展（21）

- 编辑器族（15）：`editor`、`css-editor`、`go-editor`、`html-editor`、`java-editor`、`javascript-editor`、`json-editor`、`markdown-editor`、`php-editor`、`plaintext-editor`、`python-editor`、`sql-editor`、`typescript-editor`、`xml-editor`、`yaml-editor`。
- 兼容/补齐（6）：`columns-toggler`、`static-json`、`static-table`、`table-cell`、`tooltip`、`fieldSet`。

这些是 vamis 为常用写法补的别名或额外 type，不属于与 amis 的差异。

## 4. 实现深度（人工评估）

### 4.1 已经能用的主链路

- **表单**：62 个 `isFormItem` 控件；`initApi`、`validate` / `rules`、`submit` / `reset`、`onEvent.submit`。
- **条件显隐**：`visibleOn` / `hiddenOn` / `disabledOn` 在 core（`formula.ts` + `SchemaRenderer.vue`）统一处理。
- **数据**：`crud` 支持 `api`、分页、`filter`、排序、多选 / `bulkActions`、`headerToolbar`、弹窗编辑；配套 `table` / `table2`、`operation`、`column-toggler`、`cell`。
- **动作**：`ajax`、`toast`、`setValue`、`reload`、`dialog`、`drawer`、`closeDialog` / `closeDrawer` / `cancel`、`submit`；支持 `onEvent`。
- **布局 / 展示**：`page`、`container`、`flex`、`grid`、`tabs`、`wizard`、`panel`、`collapse`、`nav`、`cards`、`chart`（需 `config` / `api`）等。

### 4.2 深度分级

| 级别 | 说明 | 典型组件 |
|------|------|----------|
| L1 可交互 | 接 api、事件、校验，能承担真实页面 | `form`、`crud`、`table`、`tabs`、`wizard`、`dialog` / `drawer`、`service`、`action`、`formula` |
| L2 最小可用 | 能渲染、能绑定表单值，缺高级配置或真实数据源 | `input-city`（内置 3 省示例）、`users-select`（内置 3 个用户）、`input-excel`（只记文件名）、`diff-editor`（双 textarea）、`location-picker`（三个输入框）、`icon-picker`（8 个字符图标）、`editor` 家族（等宽 textarea，未接 Monaco） |
| L3 占位 / 降级 | 明确提示未接入 | `pdf-viewer`、`office-viewer`（`ViewerStub`「未接入预览」）；`amis`（只嵌内层 schema）；`web-component`（仅 tag + props）；`custom`（html 或 body 直通） |

其他已知未实现：`quickEdit`、`loadDataOnce`、CRUD 的 `syncLocation`（URL 同步）；`PageDef` 仅在声明 `spec.schema` / `spec.type` 时透传，固定壳（LIST / TREE_LIST 等）仍为占位提示。

## 5. 作者态、IR 与工具链

- **YAML**：Core Schema 解析，`On` / `yes` / `012` 不会被误判；JSON → IR → YAML 往返可用。
- **IR**：`UiPage`、`FormDef`、`TableDef` 可编译为 widget 树；未知 kind / 未知 type 显示占位，不崩。
- **Playground**：`/` 与 `/editor` 两个路由；14 个 YAML 样例（表单、CRUD、向导、组合录入、选择器、展示、布局、事件、校验、Amis REST 等）。
- **编辑器**：树 + 预览 + 属性 + YAML；palette 5 组 49 个条目。
- **测试**：37 个用例集中在 core（YAML、IR、actions、validate、form-extra、schema-path、notify），渲染器还没有组件级测试。

## 6. 下一阶段建议（按性价比）

> 运行时语义与实现顺序见 [语义设计](2026-10-20-vamis-runtime-semantics-design.md)；本节只列同步动作。

1. **补齐 8 个遗漏**：3 个别名是一行改动；`cascader-select` 复用 `NestedSelect`；`js-editor` / `ts-editor` 复用 `editor`；`card-item-field` / `cell-field` 并进 `cell`。
2. **清 typecheck**：先加 `@types/node` 消掉 11 个，再修 16 个模板窄化；之后把 `pnpm test + typecheck + build` 组合成提交门禁。
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
