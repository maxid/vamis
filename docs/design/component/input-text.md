# InputText 输入框 · `input-text` 设计

> 状态：**进行中 92%** · 复杂度：**XL 特重**
> 文档：[在线 API 手册](/components/form/input-text) · Amis：`/zh-CN/components/form/input-text`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性 / 事件 / 动作表以在线文档为准。

## 0. 一页结论

InputText 同时承担三种形态：**普通输入**、**选择器模式**（`options` / `source` / `suggest`）和**多选标签输入**。它的复杂度不在输入框本身，而在：

1. 输入值 / 选择值 / 多选序列化的统一写回；
2. 受控输入与 IME 组合态、trim、transform、clearValueOnEmpty；
3. 选择器模式的远程 source、自动补全、键盘导航；
4. 密码显隐、addOn、前后缀、计数器、校验与事件拦截。

## 1. 边界与优先级（先读）

### 1.1 P0 不可破坏边界

1. **值写回**：统一走 `fieldApi.setValue(name, value)`；有 Form 走 Form，无 Form 走 ValueHost/Scope。没有 `name` 时不写值。
2. **三种形态的提交时机不同**：
   - 普通输入：input 事件 `change` 通过后写值；
   - 选择器模式（`suggest` 或 `multiple` / 非 `creatable`）：draft 先输入，选择项才写正式值；
   - 多选：`dumpTextValue` 决定 string / array；`joinValues` / `extractValue` / `delimiter` 是同一矩阵。
3. **事件先于写值**：`change` / `focus` / `blur` / `enter` / `clear` / `review` / `encrypt` 都先 `runOnEvent`，`prevented` 时不写状态。
4. **IME 与 keydown**：组合输入（`isComposing`）不能用 Enter/方向键提前提交；选择器键盘导航只处理上下/Enter/Esc。
5. **trim / transform / empty**：提交前 `transformInputText` → `trimContents` → `applyTextEmptyValue(clearValueOnEmpty)`；失焦 trim 只对普通输入。
6. **密码/浏览器能力**：`input-password` 的 reveal 走 `review` / `encrypt` 事件；不把明文写进 schema 或日志。
7. **包边界**：渲染器无 `<style>`、无直接 fetch；`source` 远程只走 `requestApi`；计数器/addOn 走控件 token。

### 1.2 边界用例

- 空值 / `clearValueOnEmpty` / `resetValue` / 初始值
- 空 `name`、路径 `a.b[0]`、父域同名/不同名
- `multiple` × `joinValues` × `extractValue` × `delimiter`
- `suggest` 本地/远程、`creatable: false`、只选预设、搜索无结果
- `autoComplete` 慢返回/竞态/清空
- IME 组合态、Enter、Esc、上下键、Tab 失焦
- `trimContents`、`transform`、`maxLength/minLength`、计数器超限
- `addOn` 按钮/文本、前后缀、密码 reveal、disabled/static/readOnly
- 选择器多选标签移除、重复值、禁用 option
- 移动端键盘/弹层、深色、校验错误态

### 1.3 优先级

1. 值序列化与写回时序
2. 选择器模式/draft/远程/键盘
3. trim/transform/empty/密码
4. addOn/计数器/样式/窄屏
5. 对照与深色

## 2. 复杂度

- 等级：**XL 特重**（Amis `Form/InputText.tsx` 1387 行；Vamis 656 行）
- 依赖：`FormItem`、`Options`、`mapping`、`popOver`、`button` 等（suggest/addOn）
- 风险：普通输入与选择器共用同一个 input，状态分支容易写错

## 3. Amis 契约

### 3.1 入口与源码

- 入口：`input-text`；密码/邮箱/URL 等是 Amis 的 InputText 变体（本设计只覆盖 input-text 主渲染器）
- Amis 渲染器：`packages/amis/src/renderers/Form/InputText.tsx`
- 在线文档：[Vamis `/components/form/input-text`](/components/form/input-text) / Amis `/zh-CN/components/form/input-text`

### 3.2 核心属性（摘要）

| 属性 | 语义 | 注意 |
|---|---|---|
| `name` / `value` | 字段绑定 | 无 name 不写值；路径值按 FormItem |
| `type` | 原生 input 类型 | password 支持 reveal；number/email/url 只换原生类型，不替代 input-number |
| `multiple` / `joinValues` / `extractValue` / `delimiter` | 多选形态 | 与 Select 共用序列化矩阵 |
| `options` / `source` / `labelField` / `valueField` | 选择器选项 | suggest/只选预设；远程走 requestApi |
| `suggest` / `creatable` | 选择器模式 | creatable false 只能选预设；multiple 时 draft + 标签 |
| `autoComplete` | 自动补全 | 远程建议，防竞态 |
| `clearable` / `clearValueOnEmpty` | 清除 | clear 事件可阻止；空串→undefined |
| `trimContents` / `transform` | 输入清洗 | transform 先于 trim；提交/失焦都按此 |
| `prefix` / `suffix` / `addOn` | 附加内容 | addOn 有按钮/文本 schema；不要写死样式 |
| `showCounter` / `maxLength` / `minLength` | 计数/长度 | 计数超限只提示，是否阻止由校验决定 |
| `borderMode` | 边框风格 | 走控件 token |
| `resetValue` | reset 动作值 | 与 clear 区分 |
| `disabled` / `static` / `readOnly` | 状态 | 禁用/静态由 FormItem 统一；静态不触发输入 |

### 3.3 事件

`change` / `focus` / `blur` / `click` / `enter` / `clear` / `review` / `encrypt`。参数含 `value` 与 `[name]`。

- `click` / `enter` 只针对选择器模式（有 suggest/options）。
- `review` / `encrypt` 只针对密码 reveal；事件被阻止时不切换。
- 任何事件被 `prevented`，不写值/不切换/不关闭。

### 3.4 动作/API

已接：`clear`、`reset`、`focus`、`reload`、`setValue`。

组件 API：`getData()` 返回 `{ value }`；`setData({ value })` 或 `{ [name]: value }` 写值；`doAction(clear|reset|focus)`。

## 4. Vamis 架构

### 4.1 文件

| 文件 | 职责 |
|---|---|
| [`InputText.vue`](../../../packages/vamis/src/renderers/form/InputText.vue) | input/选择器双形态、draft、键盘、suggest/autoComplete、标签、密码、addOn、计数器 |
| [`optionsControl.ts`](../../../packages/vamis/src/optionsControl.ts) / [`options.ts`](../../../packages/vamis-core/src/utils/options.ts) | 选项归一、选中项、序列化、过滤 |
| [`FormItem.vue`](../../../packages/vamis/src/renderers/FormItem.vue) | label/校验/静态/错误 |
| [`text.ts`](../../../packages/vamis-core/src/utils/input-text.ts) | `inputNativeType` / `transformInputText` / `applyTextEmptyValue` / `dumpTextValue` / `showPasswordReveal` 等纯函数 |

### 4.2 状态

```text
rawValue(name) ──> displayValue / selected
input draft ──> suggest/multiple ? draft : commitNormal
                    │
                    ├─ emit change (prevented → 停)
                    ├─ writeValue(serialized)
                    └─ options/suggest/autoComplete 更新
```

- `selected` 从 options + rawValue 派生；多选标签移除也用同一序列化。
- `draft` 只在 suggest/multiple 模式存在；选择 option 后清空。
- `remote` 只存 source 结果，不能覆盖本地 `options` 的优先级（以 options 工具为准）。

### 4.3 交互

- **普通输入**：input → transform/trim/empty → change 事件 → 写值；blur 再 trim。
- **选择器**：focus/click 打开；输入 draft；上下键 highlight；Enter 选中；Esc 关闭；outside 关闭。
- **多选**：已选项显示标签；选择/移除均派发 change；`joinValues`/`extractValue` 决定值形态。
- **密码**：`review`/`encrypt` 先事件后切换；disabled 不 reveal。
- **addOn**：按 schema 渲染 button/text；addOn 点击不能冒泡成 input click。

## 5. 样式与边界

- 默认类：`.vamis-text-control`、`__addon`、`__affix`、`__counter`、`__chip` 等，位于 `@vamis/ui/styles.css`。
- 输入框/前后缀/addOn/计数器/标签走 token；渲染器无 `<style>`。
- 选择器弹层复用 `VamisOverlay` / popup 样式，不写第二套。
- 窄屏、密码 reveal、深色、错误态需单独截图核对。

## 6. 当前状态与缺口

- 已对齐：普通输入、clearing、trim/transform、空值、计数器、前后缀、addOn、选择器 suggest/远程/自动补全、多选标签、密码 reveal、鼠标/键盘事件、clear/reset/focus 动作。
- 对照：TODO 记录 input-text 主路径；本轮未重跑。
- 风险/缺口：
  - `multiple` 与 `options` / `source` 组合的边界需补测试；
  - `autoComplete` 竞态、IME、`creatable: false` 只选预设；
  - addOn 按钮与点击事件冒泡；
  - 密码 reveal 在 disabled/static 下不出现。

## 7. 验收计划与完成度

### 验收清单（文档核对：3 / 12）

- [x] Amis 入口 / 文档章节已定位
- [x] Vamis 渲染器 / text 工具已定位
- [x] 复杂度、依赖、集成面已盘点
- [ ] schema 属性 / 默认值逐项核对
- [ ] 事件 / 动作逐项核对
- [ ] 边界用例逐项核对
- [ ] 组件页活示例运行、无控制台 error
- [ ] `pnpm test`（InputText/Options 相关）
- [ ] `pnpm typecheck` 0
- [ ] `pnpm compare --page input-text` 桌面
- [ ] `pnpm compare --page input-text --mobile`
- [ ] 深色 / 375px 窄屏

### 验收重点

- change 被阻止时不写值
- 多选序列化矩阵
- suggest 远程竞态 / IME
- clearValueOnEmpty / resetValue
- addOn 点击不误触输入框

## 8. 后续

1. 先补多选 × source 的值/标签/远程边界测试。
2. autoComplete 竞态与 IME 单独立项（与 Select 共用）。
3. addOn/按钮/密码 reveal 走交互专项，不混在样式刀。

---

返回 [组件设计索引](README.md)
