# SDK 对照报告

- 日期：2026-11-26
- 视口：移动 375×812（Amis <768 表单）
- 状态：自动生成。`pnpm compare` 用同一份 schema 跑 `amis.embed` / `vamis.embed`，判定是 **Vamis 是否对齐 Amis 实测**。移动端加 `--mobile`。
- 合计 **7** · 通过 **4** · 失败 **3**（P0 0）· Vamis 多出 extra **0**

## 问题分类

| 范围 | 条数 | 怎么改 |
|------|------|--------|
| 全局 | 1 | html/body、SDK 根、主题 token。修一处会大面积变化，不要逐组件打补丁。 |
| 样式 helper | 0 | schema className 工具类，对标 Amis helper SCSS / 计算样式。 |
| 组件 | 4 | 某个 type 的默认外观。只改该渲染器 / cva，不要改全局 token。 |

### 全局（1）

html/body、SDK 根、主题 token。修一处会大面积变化，不要逐组件打补丁。

- `components-form-radio-3` fontSize: Amis `14px` / Vamis `16px`

整改：
- html/body、SDK 根、主题 token。修一处会大面积变化，不要逐组件打补丁。

### 样式 helper（0）

schema className 工具类，对标 Amis helper SCSS / 计算样式。

- 无。

### 组件（4）

某个 type 的默认外观。只改该渲染器 / cva，不要改全局 token。

- `components-form-radio-0` page/body/0:form/body/0:combo.value: Amis `` / Vamis `[{"isAnswer":false,"answer":"选项 1"},{"isAnswer":false,"answer":"选项 2"}]`
- `components-form-radio-1` page/body/0:form/body/0:input-table.value: Amis `` / Vamis `[{"isAnswer":false,"answer":"选项 1"},{"isAnswer":false,"answer":"选项 2","children":[{"isAnswer":false,"answer":"选项 1"},{"isAnswer":false,"answer":"选项 2"}]}]`
- `components-form-radio-2` page/body/0:form/body/0:combo.value: Amis `` / Vamis `[{"isAnswer":false,"answer":"选项 1"},{"isAnswer":false,"answer":"选项 2"}]`
- `components-form-radio-3` lineHeight: Amis `18px` / Vamis `24px`

整改：
- 运行时值应对齐 Amis：schema.value / 表单域 / 控件当前值，不要只看能不能画出。
- 控件行高跟该 type 默认走，不要改 html 行高。对照 Amis 该 type 的计算样式。

## 文档结构（对标 Amis：文档 / 组件 / 样式）

| 面 | 合计 | 失败 |
|----|------|------|
| 文档 | 0 | 0 |
| 组件 | 7 | 3 |
| 样式 | 0 | 0 |

Vamis 可以比 Amis 多（尤其是样式）。多出来的页标 extra，不删。

## 分组

| 组 | 合计 | 失败 |
|----|------|------|
| 组件 / 数据输入 | 7 | 3 |

## P0 失败（驱动下一刀）

- 无失败。

## 文档 smoke 失败（最多 20 条）

- `components-form-radio-0` Radio 单选框 #1 — page/body/0:form/body/0:combo.value: Amis `` / Vamis `[{"isAnswer":false,"answer":"选项 1"},{"isAnswer":false,"answer":"选项 2"}]`
- `components-form-radio-1` Radio 单选框 #2 — page/body/0:form/body/0:input-table.value: Amis `` / Vamis `[{"isAnswer":false,"answer":"选项 1"},{"isAnswer":false,"answer":"选项 2","children":[{"isAnswer":false,"answer":"选项 1"},{"isAnswer":false,"answer":"选项 2"}]}]`
- `components-form-radio-2` Radio 单选框 #3 — page/body/0:form/body/0:combo.value: Amis `` / Vamis `[{"isAnswer":false,"answer":"选项 1"},{"isAnswer":false,"answer":"选项 2"}]`

## 重跑口径

- **全局**修完：必须 `pnpm compare` 重跑全部用例（token / 默认字体会影响每一页）。动到 `m:` / 窄屏表单再加 `pnpm compare --mobile`。
- **组件**修完：只重跑自身 `pnpm compare --page button`（或 `--id src-components-button-0`）。移动端再加 `--mobile`。
- **样式 helper** 修完：只重跑该页 `pnpm compare --page margin`。

- `pnpm compare --page "components-form-radio-0" --mobile` — 只重跑「components-form-radio-0」自身
- `pnpm compare --page "components-form-radio-1" --mobile` — 只重跑「components-form-radio-1」自身
- `pnpm compare --page "components-form-radio-2" --mobile` — 只重跑「components-form-radio-2」自身

