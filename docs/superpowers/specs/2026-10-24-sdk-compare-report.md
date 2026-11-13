# SDK 对照报告

- 日期：2026-11-13
- 视口：桌面 1100×800
- 状态：自动生成。`pnpm compare` 用同一份 schema 跑 `amis.embed` / `vamis.embed`，判定是 **Vamis 是否对齐 Amis 实测**。移动端加 `--mobile`。
- 合计 **58** · 通过 **41** · 失败 **17**（P0 0）· Vamis 多出 extra **0**

## 问题分类

| 范围 | 条数 | 怎么改 |
|------|------|--------|
| 全局 | 49 | html/body、SDK 根、主题 token。修一处会大面积变化，不要逐组件打补丁。 |
| 样式 helper | 0 | schema className 工具类，对标 Amis helper SCSS / 计算样式。 |
| 组件 | 130 | 某个 type 的默认外观。只改该渲染器 / cva，不要改全局 token。 |

### 全局（49）

html/body、SDK 根、主题 token。修一处会大面积变化，不要逐组件打补丁。

- `components-form-index-0` fontSize: Amis `12px` / Vamis `14px`
- `form-default` fontSize: Amis `12px` / Vamis `14px`
- `components-form-index-1` fontSize: Amis `12px` / Vamis `14px`
- `components-form-index-2` fontSize: Amis `12px` / Vamis `14px`
- `components-form-index-3` fontSize: Amis `12px` / Vamis `14px`
- `components-form-index-4` fontSize: Amis `12px` / Vamis `14px`
- `components-form-index-5` fontSize: Amis `12px` / Vamis `14px`
- `components-form-index-6` fontSize: Amis `12px` / Vamis `14px`
- `components-form-index-7` fontSize: Amis `12px` / Vamis `14px`
- `components-form-index-8` fontSize: Amis `12px` / Vamis `14px`
- `components-form-index-9` fontSize: Amis `12px` / Vamis `14px`
- `components-form-index-10` fontSize: Amis `12px` / Vamis `14px`
- …其余 37 条见 last-report.json

整改：
- html/body、SDK 根、主题 token。修一处会大面积变化，不要逐组件打补丁。

### 样式 helper（0）

schema className 工具类，对标 Amis helper SCSS / 计算样式。

- 无。

### 组件（130）

某个 type 的默认外观。只改该渲染器 / cva，不要改全局 token。

- `components-form-index-0` lineHeight: Amis `18px` / Vamis `14px`
- `components-form-index-0` fontWeight: Amis `400` / Vamis `500`
- `form-default` lineHeight: Amis `18px` / Vamis `14px`
- `form-default` fontWeight: Amis `400` / Vamis `500`
- `components-form-index-1` lineHeight: Amis `18px` / Vamis `14px`
- `components-form-index-1` fontWeight: Amis `400` / Vamis `500`
- `components-form-index-2` lineHeight: Amis `18px` / Vamis `14px`
- `components-form-index-2` fontWeight: Amis `400` / Vamis `500`
- `components-form-index-3` lineHeight: Amis `18px` / Vamis `14px`
- `components-form-index-3` fontWeight: Amis `400` / Vamis `500`
- `components-form-index-4` lineHeight: Amis `18px` / Vamis `14px`
- `components-form-index-4` fontWeight: Amis `400` / Vamis `500`
- …其余 118 条见 last-report.json

整改：
- 控件行高跟该 type 默认走，不要改 html 行高。对照 Amis 该 type 的计算样式。
- Button 默认字重：Amis 400，Vamis shadcn font-medium=500。改 button cva，不要改全局。
- 运行时值应对齐 Amis：schema.value / 表单域 / 控件当前值，不要只看能不能画出。
- 有 name 的结点应能 getComponentByName。Vamis 要在该 type 注册 Scoped。
- schema 树该结点要能在 DOM 里定位（name / label）。
- 点一下后动作效果应对齐 Amis（dialog / toast / setValue）。

## 文档结构（对标 Amis：文档 / 组件 / 样式）

| 面 | 合计 | 失败 |
|----|------|------|
| 文档 | 0 | 0 |
| 组件 | 58 | 17 |
| 样式 | 0 | 0 |

Vamis 可以比 Amis 多（尤其是样式）。多出来的页标 extra，不删。

## 分组

| 组 | 合计 | 失败 |
|----|------|------|
| 组件 / 数据输入 | 58 | 17 |

## P0 失败（驱动下一刀）

- 无失败。

## 文档 smoke 失败（最多 20 条）

- `components-form-index-20` Form 表单 #21 — page/body/0:form/body/0:select.value: Amis `` / Vamis `["a","c"]`
- `components-form-index-30` Form 表单 #31 — page/body/1:service.named: Amis `false` / Vamis `true`
- `components-form-index-32` Form 表单 #33 — page/body/1:form.named: Amis `false` / Vamis `true`
- `components-form-index-33` Form 表单 #34 — page/body/1:form.named: Amis `false` / Vamis `true`
- `components-form-index-36` Form 表单 #37 — page/body/1:input-text.rendered: Amis `false` / Vamis `true`；page/body/1:input-text.value: Amis `responseData: {},responseStatus: 0,responseMsg: ` / Vamis `上下文-`
- `components-form-index-37` Form 表单 #38 — page/body/1:input-text.rendered: Amis `false` / Vamis `true`；page/body/1:input-text.value: Amis `` / Vamis `上下文-`
- `components-form-index-38` Form 表单 #39 — page/body/1:input-text.rendered: Amis `false` / Vamis `true`；page/body/1:input-text.value: Amis `` / Vamis `上下文-`
- `components-form-index-39` Form 表单 #40 — page/body/1:input-text.rendered: Amis `false` / Vamis `true`；page/body/1:input-text.value: Amis `` / Vamis `上下文-`
- `components-form-index-40` Form 表单 #41 — page/body/1:input-text.rendered: Amis `false` / Vamis `true`；page/body/1:input-text.value: Amis `` / Vamis `上下文-`
- `components-form-index-41` Form 表单 #42 — page/body/1:input-text.rendered: Amis `false` / Vamis `true`；page/body/1:input-text.value: Amis `` / Vamis `上下文-`
- `components-form-index-42` Form 表单 #43 — page/body/1:input-text.rendered: Amis `false` / Vamis `true`；page/body/1:input-text.value: Amis `` / Vamis `上下文-`
- `components-form-index-43` Form 表单 #44 — page/body/1:input-text.rendered: Amis `false` / Vamis `true`；page/body/1:input-text.value: Amis `` / Vamis `上下文-`
- `components-form-index-44` Form 表单 #45 — page/body/0:form.toast: Amis `false` / Vamis `true`
- `components-form-index-45` Form 表单 #46 — page/body/1:input-text.rendered: Amis `false` / Vamis `true`；page/body/1:input-text.value: Amis `` / Vamis `上下文-`
- `components-form-index-46` Form 表单 #47 — page/body/0:button.toast: Amis `true` / Vamis `false`；page/body/1:input-text.rendered: Amis `false` / Vamis `true`；page/body/1:input-text.named: Amis `false` / Vamis `true`；page/body/1:input-text.value: Amis `` / Vamis `校验结果：-`
- `components-form-index-47` Form 表单 #48 — page/body/0:button.toast: Amis `true` / Vamis `false`；page/body/1:input-text.rendered: Amis `false` / Vamis `true`；page/body/1:input-text.named: Amis `false` / Vamis `true`；page/body/1:input-text.value: Amis `` / Vamis `提交结果：-`
- `components-form-index-55` Form 表单 #56 — page/body/1:input-text.rendered: Amis `false` / Vamis `true`；page/body/1:input-text.named: Amis `false` / Vamis `true`；page/body/1:input-text.value: Amis `` / Vamis `校验结果：-`

## 重跑口径

- **全局**修完：必须 `pnpm compare` 重跑全部用例（token / 默认字体会影响每一页）。动到 `m:` / 窄屏表单再加 `pnpm compare --mobile`。
- **组件**修完：只重跑自身 `pnpm compare --page button`（或 `--id src-components-button-0`）。移动端再加 `--mobile`。
- **样式 helper** 修完：只重跑该页 `pnpm compare --page margin`。

- `pnpm compare` — 全局修完必须重跑全部用例
- `pnpm compare --page "components-form-index-20"` — 只重跑「components-form-index-20」自身
- `pnpm compare --page "components-form-index-30"` — 只重跑「components-form-index-30」自身
- `pnpm compare --page "components-form-index-32"` — 只重跑「components-form-index-32」自身
- `pnpm compare --page "components-form-index-33"` — 只重跑「components-form-index-33」自身
- `pnpm compare --page "components-form-index-36"` — 只重跑「components-form-index-36」自身
- `pnpm compare --page "components-form-index-37"` — 只重跑「components-form-index-37」自身
- `pnpm compare --page "components-form-index-38"` — 只重跑「components-form-index-38」自身
- `pnpm compare --page "components-form-index-39"` — 只重跑「components-form-index-39」自身
- `pnpm compare --page "components-form-index-40"` — 只重跑「components-form-index-40」自身
- `pnpm compare --page "components-form-index-41"` — 只重跑「components-form-index-41」自身
- `pnpm compare --page "components-form-index-42"` — 只重跑「components-form-index-42」自身
- `pnpm compare --page "components-form-index-43"` — 只重跑「components-form-index-43」自身
- `pnpm compare --page "components-form-index-44"` — 只重跑「components-form-index-44」自身
- `pnpm compare --page "components-form-index-45"` — 只重跑「components-form-index-45」自身
- `pnpm compare --page "components-form-index-46"` — 只重跑「components-form-index-46」自身
- `pnpm compare --page "components-form-index-47"` — 只重跑「components-form-index-47」自身
- `pnpm compare --page "components-form-index-55"` — 只重跑「components-form-index-55」自身

