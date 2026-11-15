# Table 对标 + 脱离表单的数据链：交接

状态：**进行中，代码已改、未验证、未提交**。写于 2026-11-15，上一位 agent 配额用尽，中途交接。

接手先读本文件，再读 `CONTEXT.md`「后续计划」和 `.cursor/rules/lessons.mdc`。本文件做完即删，结论回写 CONTEXT / TODO / lessons。

## 用户要什么

1. 「table 的工作还差得远，一次按 vamis 约定修正 table 组件所有未对 amis 标实现」。对照页：Vamis `http://localhost:5173/components/table`，Amis `http://localhost:8888/zh-CN/components/table`。用户**打回过「table 99%」**，进度数字必须保守。
2. 「表格的数据变了，没有互相同步更新。列类型示例里状态与开关是同一个字段，开关变了状态列不变。核查是否是系统性问题（是不是 vamis 核心数据链的问题）」。

第 2 条已答复用户：**是系统性问题**，并承诺按根因修（见下）。

## 当前工作区状态

- HEAD `3d09081`（main）。**本轮所有改动都没提交**，用户没要求提交就不要 `git commit`。
- 工作区里还有**别人的未提交改动**，不要覆盖、不要顺手带进提交：`README*.md`、`docs/marketing/*`、同步状态、运行时语义 spec、`website/src/components/chart.md`、`form/{group,input-datetime,input-time}.md`。`CONTEXT.md` 和组件 TODO 两边都动过，只做定点编辑。
- **本段改动之后以下全部没跑过**：`pnpm typecheck`（基线 68 错，改过的文件里不应有新增）、`pnpm test`、`pnpm sdk:build`、`pnpm compare`。`CONTEXT.md`「测试」行里的 `table` 33/33 是旧内核的数字，不代表当前。

## 第 2 条：数据链问题

### 根因（两站实测 + 读源码，已确认）

Amis 的表单项不在表单里时，`wrapControl.handleChange` 把变化交给最近的 `onChange`：`TableRow.handleChange` → `Table.handleQuickChange` → `item.change`（行变成已修改，表格加 `Table--unsaved`），`Page` / `Service` / `Dialog` / `Drawer` / `Wizard` 写进各自的 store。`TableCell` 渲染单元格时保留列 `name`。

Vamis 没有这条链。表单项只会 `form?.getValue` / `form?.setValue`，没有祖先表单时读不到数据链、写的值直接丢掉（57 个文件、约 130 处）。`Switch` 退回组件本地 `localValue`，所以开关自己会动、同字段的状态列不动。`TableCellBody` 还把列 `name` 删了。只有 `Radios` 自己写了 `scope.set`。

### 已写的修复（未验证）

| 位置 | 改动 |
|---|---|
| `packages/vamis-core/src/context.ts` | 新增 `ValueHost { setValue(name, value) }`、`provideValueHost`、`useValueHost` |
| `packages/vamis-core/src/scope.ts` | `getByPath` 改为导出，并先认字面 key 再走路径；新增 `setByPathCopy`（沿途浅拷贝，原对象不动） |
| `packages/vamis-core/src/SchemaRenderer.vue` | 每个节点 provide 一个转发 host：本节点有自己的数据域（`scope: self/isolate`）就写进本层 scope；否则交给上层 host；都没有就写父 scope |
| `packages/vamis-core/src/schema-type-catalog.ts`、`factory.ts` | 新增并导出 `isFormItemType(type)` |
| `packages/vamis/src/formContext.ts` | 新增 `useFieldValue()`：有表单就是表单本身；没有表单时读 `useData()`、写最近的 `ValueHost`，兜底 `scope.set` |
| `packages/vamis/src/renderers/form/*.vue`（48 个）、`optionsControl.ts`、`SearchBox.vue` | 脚本把 `form?.getValue(` / `form?.setValue(` 换成 `fieldApi.*`；`if (!form) return` 这类守卫手工改掉（InputText / InputNumber / Textarea / DateRange / Editor / DiffEditor / Formula / Radios / Switch / optionsControl）。`Switch` 有 `name` 时不再用本地态 |
| `packages/vamis/src/renderers/table/TableCellBody.vue` | provide 行级 host，emit `change { name, value, init }`；列 type 是表单项时保留 `name` |
| `packages/vamis/src/renderers/Table.vue` | `onQuickEdit` 抽成 `changeRow(row, field, value, { asPristine, silent })`，新增 `onCellChange`；提交栏只在表格有 `quickEdit` 列时出现；有改动的行仍标 `is-modified`、外壳 `is-unsaved` |

### 接手第一步：验证

```bash
pnpm typecheck          # 看改过的文件有没有新增错误
pnpm test
cd /tmp/vamis-table-probe && PLAYWRIGHT_BROWSERS_PATH="$HOME/Library/Caches/ms-playwright" node sync.mjs vamis
```

`sync.mjs` 点列类型示例第一行的开关，打印点击前后「状态 / 开关」单元格。通过标准：状态列跟着翻（Amis 是 `StatusField--1` → `--0`），页面无报错。`node sync.mjs amis` 是参照。探针脚本在 `/tmp/vamis-table-probe/`，另存了一份在用户个人 store 的 `vamis-table-probe/`（`/tmp` 被清就从那里拿），需要 `required_permissions: ["all"]`。

### 已知风险，逐条核

1. **挂载时写默认值的控件**（Uuid、Formula、Editor、DiffEditor、`selectFirst` 等）以前在表单外是空操作，现在会写进 page / service 数据域。留意 `service` 的 `isApiOutdated` 重拉、死循环。
2. 表单外的控件现在读 `data[name]`。原来读 `schema.value` 或空的地方显示会变，对照可能有分数变化（方向应是向 Amis 靠拢）。`schema.value` 默认值在表单外**仍不会种进数据域**，这是遗留缺口。
3. 单元格保留 `name` 后，原生控件带 `[name]`，对照的 named 探针可能在 `--page table` 出现假红。
4. `TableCellBody` 用「挂载后一个 tick」区分默认值和用户修改。接口返回后才写的默认值会被算成用户修改。
5. `getByPath` 先认字面 key 是行为变化，影响 `scope.get`。
6. **没接的宿主**：`CRUD.vue` 自己画单元格（不走 `Table.vue`），`List`、`Cards` 的行也没有行级 host。`card` 是 `scope: self`，写进 card scope 后会被行 `extraData` 盖住，看不到变化。`Dialog` / `Drawer` 没有自己的 scope，会写到页面域（Amis 写进弹层 store）。至少把 CRUD 接上，其余诚实写进后续计划。
7. `Formula.apply()` 仍然 `!form` 就返回，`SearchBox` 仍只在有表单时读写，这两处是有意没动。
8. 新链路**没有单测**。要补：`useFieldValue` 三种落点（表单 / 行 host / scope）、`setByPathCopy` 不改原对象、`isFormItemType`。
9. 核心数据链动了，收工要跑**全量** `pnpm compare`，不是只跑 `--page table`。

## 第 1 条：table 对标

### 本段新写、未充分验证

- `deferApi` 懒加载子行（转圈 / 失败重试图标、mock `/api/mock2/crud/table6`、文档「懒加载子行」）：**没在浏览器里点过**。
- `lazyRenderAfter` 虚拟窗口（默认 100 行、缓冲 10）：**完全没测**。
- `affixHeader` / `affixFooter`：截图确认过粘住，没核盒模型、没核深色。文档预览和 PreviewFrame 的 env 里设了 `affixHeader: false`（Amis 文档站就是这么传的）。`packages/vamis-sdk/embed-case.html` 的 env 还没加，对照可能因此有差。
- `persistKey`、`filterable.source` 接口选项、拖拽开关的 tooltip：代码在，未逐项核。

### 还没做

- `website/src/components/table.md` 的进度条已从占位改成手写，数字是保守估计，验证完按实际改。
- `packages/vamis-core/__tests__/table.test.ts` 还是旧的字符串包含断言，要按 `utils/table.ts` 重写。
- `pnpm sdk:build` + 对照（桌面 + `--mobile`），再并排开两站 table 页核浅色 + 深色。
- 明确未接：`reUseRow`、工具栏 `export-excel` / `export-excel-template`。
- 收工回写：CONTEXT（进度 / 最近交付 / 测试 / 后续计划）、TODO `table` 行与汇总、lessons、在线文档 spec；核心契约变了，运行时语义 spec 的 D6 也要提一句。

## 约束提醒

- 回复用简体中文；改了文件就在回复末尾给 commit message，不要自动提交，不要加 Co-authored-by。
- 没有当轮批准不跑云端任务。
- 不手改、不提交 `compare-cases.js`；Amis 仓只用相对路径 `../amis`。
- 收尾删掉 `/tmp/vamis-table-probe`、`/tmp/vamis-table-doc`、`/tmp/vamis-table-backup` 和本文件。
