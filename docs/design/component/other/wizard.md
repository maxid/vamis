# Wizard 向导 · `wizard` 设计

> 状态：**进行中 50%** · 复杂度：**XL 特重**
> 文档：[在线 API 手册](/components/wizard) · Amis：`/zh-CN/components/wizard`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性 / 事件 / 动作表以在线文档为准。

## 0. 一页结论

Wizard 当前是**步骤导航 + 单步 Form** 的最小实现（120 行）：步骤条、上一步/下一步、纵向模式、自定义按钮、当前步校验门。**initApi、step 提交、全部提交、步骤事件、scoped 动作均未接**；文档中的事件/动作表是 Amis 目标，不能当已实现。

## 1. 边界与优先级（先读）

### 1.1 P0 不可破坏边界

1. **单步数据域**：只渲染当前 step 的 `body`，但表单数据/校验属于整份 wizard 数据域；切步不能丢已填值，也不能把其他 step 字段错误地渲染出来。
2. **切换顺序**：向前切必须 `gate.validateCurrent()` 全部通过；向后切必须 `jumpable`（schema 限制）通过；不能绕过校验/跳转限制。
3. **当前步索引**：`startStep` / `initFetch` 决定初始 index；切步用 0-based index，事件 `currentStep` 是 1-based，二者不要混。
4. **表单壳**：每步用 `form`（wrapWithPanel false、actions []）承载；不要为 Wizard 自建第二套输入/校验。
5. **按钮**：自定义 `actions` 优先，否则默认上一步/下一步；最后一步默认 next 文案由 `wizardNextButtonLabel` 决定。
6. **校验门**：`provideWizardGate` 可注册多个 validate；当前步任一失败就阻止前进并 notify。
7. **包边界**：无 `<style>`、无直接 fetch；步骤条/图标走 token；作者 className 只落节点。

### 1.2 边界用例

- 1 步 / 多步 / `startStep` / 最后一步
- 向前/向后跳、`jumpable` 限制、校验失败
- 每步 form body 为空 / 多字段 / 自带 actions
- 自定义 actions、prev/next 文案
- vertical / horizontal 模式
- 数据在步骤间保留；切步后校验状态
- 移动端步骤条换行/横向滚动
- 深色、步骤完成图标

### 1.3 优先级

1. 切换/校验/索引
2. 数据域与表单壳
3. 按钮/自定义 actions
4. initApi/step 提交/事件/动作（后补）
5. 样式/窄屏/深色

## 2. 复杂度

- 等级：**XL 特重**（Amis `Wizard.tsx` 1369 行；Vamis 120 行）
- 依赖：`form`、`action`、`button`、`SchemaRenderer`、wizardGate
- 风险：当前只有导航基座；事件/动作/初始化/提交缺口大

## 3. Amis 契约

### 3.1 入口

- 入口：`type: 'wizard'`
- Amis 渲染器：`packages/amis/src/renderers/Wizard.tsx`
- 在线文档：[Vamis `/components/wizard`](/components/wizard)

### 3.2 核心属性（目标 / 现状）

| 属性 | 语义 | 现状 |
|---|---|---|
| `steps` | 步骤数组（title/body/actions） | 已接 |
| `mode` | horizontal / vertical | 已接 |
| `startStep` / `initFetch` | 初始步 | 部分接 |
| `prevText` / `nextText` | 按钮文案 | 已接 |
| `actions`（step） | 自定义按钮 | 已接 |
| `initApi` / `api` | 初始化/最终提交 | **未接** |
| step `api` | 单步提交 | **未接** |
| `jumpableOn` / 跳转限制 | 步骤条跳转 | 部分接 |
| `reload` / `setValue` / step-submit / next / prev / goto-step | 动作 | **未接 scoped API** |

### 3.3 事件（目标 / 现状）

文档目标：`inited`、`stepChange`、`change`、`stepSubmitSucc`、`stepSubmitFail`、`finished`、`submitSucc`、`submitFail`。

当前 **均未派发**（没有 createVamisEvent/runOnEvent）；不要按事件表声称已支持。

### 3.4 动作

目标：`submit`、`step-submit`、`next`、`prev`、`goto-step`、`reload`、`setValue`。

当前只实现内部 prev/next/goto 函数，**未注册 scoped API/动作**。

## 4. Vamis 架构

### 4.1 文件

| 文件 | 职责 |
|---|---|
| [`Wizard.vue`](../../../../packages/vamis/src/renderers/Wizard.vue) | 步骤条、当前 step、form 壳、prev/next/goto、自定义 actions |
| [`wizardGate.ts`](../../../../packages/vamis/src/wizardGate.ts) | 当前步校验注册/汇总 |
| [`wizard.ts`](../../../../packages/vamis-core/src/utils/wizard.ts) | steps/startIndex/mode/labels/jumpable 纯函数 |
| [`styles.css`](../../../../packages/vamis-ui/src/styles.css) | wizard nav/step/完成图标 token |

### 4.2 状态

```text
schema.steps ──> steps
startStep/initFetch ──> index
index ──> current step + currentStep（1-based）
formSchema = form(body=current.body, actions=[])
gate.validateCurrent() ──> prev/next 前进
```

- 数据域来自父级/Form；Wizard 不另建 store。
- 切换只改 index，不清表单值；校验状态由各步 form/Field 注册。
- `extra = { currentStep }` 传给 schema 渲染。

### 4.3 交互

- 点击步骤条：`jumpable` 才 goto；向前跳要校验当前步。
- 上一步：`wizardShowPrev(index)` 才显示；goto 校验。
- 下一步：最后一步不前进（目标应改为最终提交）。
- 自定义 actions：不再画默认 prev/next；actions 的 onEvent 自行处理页面流转。

## 5. 样式与边界

- 默认类：`.vamis-wizard__nav`、`.vamis-wizard__step`、`__done-icon`。
- 步骤条/完成态/按钮走 token；无 `<style>`。
- 窄屏步骤条换行/滚动；深色完成/激活态单独核。
- 作者 className 只落节点。

## 6. 当前状态与缺口

- 已接：步骤条、prev/next、vertical、自定义 actions、startStep 基础、当前步校验门。
- 未接：initApi/api/stepApi、全部/分步提交、事件、scoped 动作、reload/setValue、stepSubmitted 状态、移动端专项。
- 对照：TODO 记录 wizard 主路径；本轮未重跑。
- 50% 是真实缺口。

## 7. 验收计划与完成度

### 验收清单（文档核对：3 / 12）

- [x] Amis 入口 / 文档章节已定位
- [x] Vamis Wizard / wizardGate 已定位
- [x] 复杂度、依赖、集成面已盘点
- [ ] schema 属性 / 默认值逐项核对
- [ ] 事件 / 动作逐项核对（当前未接）
- [ ] 边界用例逐项核对
- [ ] 组件页活示例运行、无 console error
- [ ] `pnpm test`（Wizard 相关）
- [ ] `pnpm typecheck` 0
- [ ] `pnpm compare --page wizard` 桌面
- [ ] `pnpm compare --page wizard --mobile`
- [ ] 深色 / 375px 窄屏

### 验收重点

- 向前校验、向后 jumpable
- 数据跨步保留
- 最后一步提交（未接）
- 自定义 actions 与默认按钮互斥
- 窄屏步骤条

## 8. 后续

1. 先补 scoped 动作（next/prev/goto-step）与 stepChange 事件（低风险）。
2. 再补 initApi / step api / 最终提交与 stepSubmit* / finished / submit* 事件。
3. 移动端步骤条/深色最后做。

---

返回 [组件设计索引](../README.md)
