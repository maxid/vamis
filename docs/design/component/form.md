# Form 表单 · `form` 设计

> 状态：**进行中 75%** · 复杂度：**XL 特重**
> 文档：[在线 API 手册](/components/form) · Amis：`/zh-CN/components/form`
> 盘点日期：2026-11-18。本文是**研发设计文档**；属性 / 事件 / 动作全表以在线文档为准，这里只写实现必须遵守的边界、状态机与验收口径。

## 0. 一页结论

Form 是 Vamis 表单项的根数据域与提交/校验壳。它自身不画具体控件，主要难点在：

1. **数据域**：父数据、`schema.data`、初始化值、`canAccessSuperData`、Scope 与表单 store 的边界；
2. **注册生命周期**：`initApi` → `inited` → 子项注册 → 提交/重置/清空；
3. **校验**：本地 `validateValue`、异步 `validateApi`、`rules` 组合校验、错误回填；
4. **提交时序**：校验 → 远程提交 → 数据合并 / `target` / `reload` → `submit` / `submitSucc` / `submitFail` → 持久化 / 重定向 / 关闭弹层；
5. **嵌套与浮层**：顶层 `<form>`、嵌套降级 `<div>`、弹层内表单绑定。

## 1. 边界与优先级（先读）

> **边界优先组（P0）**：先证明不破坏下列边界，再谈属性/样式。

### 1.1 P0 不可破坏边界

1. **顶层 form / 嵌套降级**：只有没有父 Form 时用 `<form>`；嵌套 Form 必须是 `div`，`submit` 按钮 `type="button"`，Enter 要 `preventDefault + stopPropagation` 后走本表单 `submit()`（`preventEnterSubmit` 优先）。
2. **数据域边界**：初始值 = 父数据 + `schema.data` + `initFormStoreData`（`canAccessSuperData !== false` 才映射同名父字段）；提交/调试不能把父域其它字段带进本表单。
3. **值路径**：所有子项通过 `formContext` / `useFieldValue` 读写；有 Form 走 `form.getValue/setValue`，脱离 Form（表格单元格、Page/Service 内）走 ValueHost / Scope，不能只写 Form 而丢值。
4. **提交时序**：`trimValues` → 本地校验 → 异步 `validateApi` → `target` / `api` → 数据合并 → `submit` 事件 → `submitSucc` / `submitFail` → `clearPersistDataAfterSubmit` / `resetAfterSubmit` / `redirect` / 关闭弹层。不要把事件放到 API 前面（与 Amis 的差异已写在在线文档）。
5. **错误形状**：`store.errors` 以字段名为键；`rules` 命中 `name` 时高亮对应项，否则错误挂 `__form`；远程提交错误按字段回填。
6. **Scope / 持久化**：`persistData` / `persistDataKeys` 只持久化指定表单数据；`clearPersistDataAfterSubmit` 默认清；从 Scope 合并/替换要区分 `merge` / `override`。
7. **包边界**：渲染器无 `<style>`、无直接 `fetch`；`requestApi(env)` 统一网络；`@vamis/ui` 不依赖 core。

### 1.2 边界用例（先写，再实现）

- 父数据为空 / `schema.data` 覆盖 / `canAccessSuperData: false`
- `submitText: ""`、body 已有 submit/button/reset/toolbar、`wrapWithPanel: false`
- `initApi` 慢返回、失败、reload 与 props 变化竞态；`submitOnInit`
- 本地校验失败、`validateApi` 失败、`rules` 命中/未命中、远程字段错误
- `target` 提交、`reload`、`redirect`、`resetAfterSubmit`、`clearPersistDataAfterSubmit`
- 嵌套 Form、弹层 Form 关闭回写、Enter 提交、`preventEnterSubmit`
- `persistData` 命中/未命中、`trimValues`、`trackExpression`、`static` 切换
- 移动端 375px、水平/行内 mode、labelWidth、深色 panel

### 1.3 优先级

1. 生命周期与提交/校验时序
2. 数据域 / 路径值 / Scope / 持久化
3. 事件与动作（缺失项最后补）
4. 样式与 panel / 响应式
5. 对照与深色

## 2. 复杂度

- 等级：**XL 特重**（Amis 入口 2657 行；Vamis 772 行 + formContext / 表单工具）
- 依赖：`FormItem`、`Options`、`action`、`checkbox`、`container`、`hidden`、`input-date`、`input-file`、`input-image`、`input-number`、`input-text`、`panel`、`radio`、`select`、`spinner`、`static`、`switch`、`textarea`
- 施工粒度：**1 个切片**；不要与 `combo` / `input-table` / `crud` 混批

## 3. Amis 契约

### 3.1 入口与文档

- 入口：`type: 'form'`
- Amis 渲染器：`packages/amis-core/src/renderers/Form.tsx`
- 在线文档：[Vamis `/components/form`](/components/form) / Amis `/zh-CN/components/form`
- 依赖页面：`FormItem`、`Options`、`action`、`panel`、表单项各控件

### 3.2 核心属性（摘要）

| 属性 | 语义 | 实现要求 |
|---|---|---|
| `body` / `controls` | 表单项树 | 递归渲染；`actions` 为空时决定默认提交栏是否注入 |
| `data` | 表单初始/附加数据 | 与父数据、`canAccessSuperData` 合并后进 store |
| `initApi` / `initFetch` / `initFetchOn` | 初始化拉数 | `initApiFinished` / `inited`；props 变化时按 `isApiOutdated` reload |
| `api` | 提交接口 | `requestApi` POST；成功合并数据、`submitSucc`；失败回填 errors、`submitFail` |
| `target` / `reload` | 提交给目标/刷新 | `target` 走 `scoped.reload`，不直接发本表单 api |
| `rules` | 组合校验 | 表达式 + `name` 高亮；失败挂 `__form` 或对应字段 |
| `messages` | 成功/失败文案 | 统一 `env.notify`，不要硬编码中文 |
| `submitText` / `reset` / `actions` | 默认按钮 | `submitText: ""` 去掉提交；body 已有动作不注入底栏 |
| `wrapWithPanel` / `title` | panel 壳 | `wrapWithPanel: false` 时 title/actions 失效 |
| `mode` / `horizontal` / `labelWidth` / `labelAlign` | 布局 | 传给 FormItem；不要各渲染器自算 |
| `trimValues` / `preventEnterSubmit` / `autoFocus` | 输入行为 | 提交前 trim；Enter 只影响嵌套/非 native form |
| `persistData` / `persistDataKeys` / `clearPersistDataAfterSubmit` | 本地持久化 | localStorage key / 字段；提交后默认清 |
| `canAccessSuperData` | 父域映射 | 默认 true，只映射同名表单项；不把父域其它字段带进提交 |
| `trackExpression` | 数据链联动 | 表达式变化时同步表单项；依赖 `canAccessSuperData` |
| `debug` | 数据域调试 | 只读展示，不参与提交 |
| `static` / `staticOn` / `staticSchema` | 静态态 | 由 FormItem 静态展示；Form 壳负责切换 |

### 3.3 事件

| 事件 | 触发 | 备注 |
|---|---|---|
| `inited` | 初始化完成（无论有没有 initApi） | 参数含 responseData/Status/Msg/error + 字段 |
| `initApiFinished` | initApi 完成（init/reload） | `__trigger` 区分 |
| `change` | 表单值变化 | 当前数据域 |
| `formItemValidateSucc` / `formItemValidateError` | 单项校验 | `__formName` / `__formValue` / `__errors` |
| `validateSucc` / `validateError` | 整表本地校验 | 当前数据域 |
| `submit` | 提交触发 | **Vamis 先校验/保存再发**；与 Amis 自定义提交语义不同 |
| `submitSucc` / `submitFail` | 远程提交结果 | result / error |
| `asyncApiFinished` | **未接** | 不要在文档/实现里声称支持 |

### 3.4 动作

已接：`submit`、`setValue`、`reload`、`reset`、`clear`、`static`、`nonstatic`。

未接：`validate`、`validateFormItem`、`clearError`（在线文档标未接）。`submit` 的 `outputVar` 未接。

组件 API：

```ts
getValue(name)
setValue(name, value)
getData()
setData(values, replace, reason)
reload(extra, replace)
submit()
validate()
reset()
clear()
```

## 4. Vamis 架构

### 4.1 文件与职责

| 文件 | 职责 |
|---|---|
| [`Form.vue`](../../../packages/vamis/src/renderers/Form.vue) | store、Scope、initApi、校验、提交、panel、嵌套/弹层绑定、组件 API |
| [`formContext.ts`](../../../packages/vamis/src/formContext.ts) | `FormContext`、`useForm`、`useFieldValue`（Form/ValueHost/Scope 三态）、Combo radio 上下文 |
| [`FormItem.vue`](../../../packages/vamis/src/renderers/FormItem.vue) | label/描述/校验/静态/路径值；具体控件在 `renderers/form/*` |
| [`form.ts`](../../../packages/vamis-core/src/utils/form.ts) | `collectFormItems`、初始值、校验、rules、隐藏值清理、track 同步 |
| [`styles.css`](../../../packages/vamis-ui/src/styles.css) | `--form-*` / panel / label / actions token |

### 4.2 生命周期

```text
props.data + schema.data + initFormStoreData
        │
        ├─ persistData 恢复 → store.data
        ├─ onMounted: initApi → merge store + scope → initApiFinished → inited
        ├─ submitOnInit / autoFocus / dialogForm 绑定
        └─ watches: store.data → clearHidden/persist; trackExpression → sync;
                    initApi 变化 → reload
```

### 4.3 校验与提交

- `validate()`：先清 `store.errors`，遍历可见且有 `name` 的表单项，`validateValue` → `store.errors[name]`；`rules` 表达式失败按 `name` / `__form` 回填；派发 `formItemValidate*` 和 `validateSucc/Error`。
- `submit()`：`trimValues` → `validate()` → 逐项 `validateApi` → `target` / `api`；远程成功 `mergeApiData` + Scope merge，派发 `submit` / `submitSucc`；失败回填字段错误并派发 `submitFail`。
- `reset()` 回到 `initialFormData`；`clear()` 清空各 `name` 并同步 Scope；`static` / `nonstatic` 由 FormItem 状态读取。
- 弹层里的 Form：`onMounted` 绑定 `overlay.registerDialogForm(submit)`，提交成功 `closeDialog({...values})`；关闭后恢复上一层数据域。

### 4.4 数据域与值

- 有 Form：`useFieldValue` 返回 Form 的 `getValue/setValue`。
- 无 Form（表格单元格、Page/Service 内）：从 `useData` 读，写最近的 ValueHost（表格行）或 Scope；不要在控件里直接读 `props.data`。
- `canAccessSuperData` 只让**同名**父字段进入初始值/联动，父域其它字段不进入表单提交。
- `persistData` 只缓存表单值；`persistDataKeys` 限定字段，`clearPersistDataAfterSubmit` 默认清。

## 5. 样式与边界

- 默认皮肤类：`.vamis-form`、`.vamis-form--inline`、`.vamis-form-actions`、`.vamis-form-debug`、`.vamis-form-footer-wrap`、`.vamis-form-panel`、`.vamis-form-panel__header`、`.vamis-form__error`（`@vamis/ui/styles.css`）。
- 渲染器无 `<style>`；panel/标题/间距/动作栏走 token；`rounded` 是过渡 API，不要新增组件级圆角字段。
- 水平/行内/窄屏：label 宽度、必填星、actions 对齐按 FormItem/Amis 规则；深色只换 token。
- 弹层窄屏：<576px 弹层拉满、底栏横排均分；不要把 Dialog 默认宽度写进 Form。

## 6. 当前状态与缺口

- TODO：主路径已对齐（initApi / 提交 API / 校验 / 重置 / 调试 / 生命周期事件 / rules / submitOnInit / submitOnChange / resetAfterSubmit / redirect / messages / trimValues / persistData / preventEnterSubmit / autoFocus / static / target / reload / debug / canAccessSuperData / 水平比例与 labelWidth）。
- 对照记录：桌面 **41/58**、移动 **41/58**（P0 0，TODO 2026-11-18 记录，本轮未重跑）。
- 缺：`interval` / `silentPolling` / `asyncApi` / `initAsyncApi`、`promptPageLeave`、`columnCount`、`inheritData`、`validate` / `validateFormItem` / `clearError` 动作、combo 独立域。
- 文档已标：`submit` 事件在 Vamis 是先校验保存后触发，与 Amis 不同；`submitText: ""` / body 自带动作 / `wrapWithPanel: false` 的按钮规则。

## 7. 验收计划与完成度

### 验收清单（文档核对：3 / 12）

> 只勾本轮文档核对已具备项；功能、测试、对照由实现刀逐项勾，未勾不等于未实现。

- [x] Amis 入口源码 / 文档章节已定位
- [x] Vamis 渲染器 / formContext / 表单工具已定位
- [x] 复杂度、依赖、集成面已盘点
- [ ] schema 属性 / 默认值逐项核对
- [ ] 事件 / 动作逐项核对
- [ ] 边界用例逐项核对
- [ ] 组件页活示例运行、无控制台 error
- [ ] `pnpm test`（Form 相关）
- [ ] `pnpm typecheck` 0
- [ ] `pnpm compare --page form` 桌面
- [ ] `pnpm compare --page form --mobile`
- [ ] 深色 / 375px 窄屏核对

### 验收重点

- 提交/校验时序、远程失败回填、`target` / `reload`
- 嵌套 Form、弹层 Form 关闭回写、Enter 提交
- `canAccessSuperData` / Scope / persistData 的字段隔离
- 缺动作不要写进“已支持”清单

## 8. 后续

1. 先补 `validate` / `validateFormItem` / `clearError` 动作（需先定 outputVar 与 scoped API 契约）。
2. 再评估 `asyncApi` / `initAsyncApi` / `interval` / `silentPolling`（属 API 管线，不要和 Form 样式混刀）。
3. `columnCount` / `inheritData` / `promptPageLeave` 单独立项。
4. combo 独立域属于 D1/Combo，不在 Form 内硬塞。

---

返回 [组件设计索引](README.md)
