# SDK 对照报告

- 日期：2026-10-27
- 视口：桌面 1100×800
- 状态：自动生成。`pnpm compare` 用同一份 schema 跑 `amis.embed` / `vamis.embed`，判定是 **Vamis 是否对齐 Amis 实测**。移动端加 `--mobile`。
- 合计 **14** · 通过 **5** · 失败 **9**（P0 9）· Vamis 多出 extra **0**

## 问题分类

| 范围 | 条数 | 怎么改 |
|------|------|--------|
| 全局 | 7 | html/body、SDK 根、主题 token。修一处会大面积变化，不要逐组件打补丁。 |
| 样式 helper | 2 | schema className 工具类，对标 Amis helper SCSS / 计算样式。 |
| 组件 | 3 | 某个 type 的默认外观。只改该渲染器 / cva，不要改全局 token。 |

### 全局（7）

html/body、SDK 根、主题 token。修一处会大面积变化，不要逐组件打补丁。

- `form-default` fontSize: Amis `12px` / Vamis `14px`
- `helper-m-l` gap: Amis `15` / Vamis `12`
- `helper-m-l-lg` gap: Amis `30` / Vamis `20`
- `helper-m-l-md` gap: Amis `20` / Vamis `16`
- `helper-m-l-sm` gap: Amis `10` / Vamis `8`
- `helper-m-l-xl` gap: Amis `40` / Vamis `24`
- `style-two-buttons-ml` gap: Amis `15` / Vamis `12`

整改：
- html/body、SDK 根、主题 token。修一处会大面积变化，不要逐组件打补丁。
- compact 阶应对齐 Amis 5/10/15/20/30/40/50。现在 --gap-* 是 4/8/12/16/20/24。改 token 一处，m/p 整阶回来。

### 样式 helper（2）

schema className 工具类，对标 Amis helper SCSS / 计算样式。

- `helper-m-l-n` gap: Amis `-15` / Vamis `0`
- `helper-m-l-xxl` gap: Amis `50` / Vamis `0`

整改：
- 缺档：补 Amis 同名 helper（m-l-n），不要用邻近档或 token 近似。
- 缺档：补 Amis 同名 helper（m-l-xxl），不要用邻近档或 token 近似。

### 组件（3）

某个 type 的默认外观。只改该渲染器 / cva，不要改全局 token。

- `form-default` page/body/0:form/body/0:input-text.rendered: Amis `true` / Vamis `false`
- `form-default` lineHeight: Amis `18px` / Vamis `14px`
- `form-default` fontWeight: Amis `400` / Vamis `500`

整改：
- schema 树该结点要能在 DOM 里定位（name / label）。
- 控件行高跟该 type 默认走，不要改 html 行高。对照 Amis 该 type 的计算样式。
- Button 默认字重：Amis 400，Vamis shadcn font-medium=500。改 button cva，不要改全局。

## 文档结构（对标 Amis：文档 / 组件 / 样式）

| 面 | 合计 | 失败 |
|----|------|------|
| 文档 | 0 | 0 |
| 组件 | 3 | 1 |
| 样式 | 11 | 8 |

Vamis 可以比 Amis 多（尤其是样式）。多出来的页标 extra，不删。

## 分组

| 组 | 合计 | 失败 |
|----|------|------|
| 组件 / 功能 | 2 | 0 |
| 组件 / 数据输入 | 1 | 1 |
| 样式 / Spacing | 11 | 8 |

## P0 失败（驱动下一刀）

- `form-default` 默认 Form — page/body/0:form/body/0:input-text.rendered: Amis `true` / Vamis `false`
- `helper-m-l` className: m-l — gap: Amis `15` / Vamis `12`
- `helper-m-l-lg` className: m-l-lg — gap: Amis `30` / Vamis `20`
- `helper-m-l-md` className: m-l-md — gap: Amis `20` / Vamis `16`
- `helper-m-l-n` className: m-l-n — gap: Amis `-15` / Vamis `0`
- `helper-m-l-sm` className: m-l-sm — gap: Amis `10` / Vamis `8`
- `helper-m-l-xl` className: m-l-xl — gap: Amis `40` / Vamis `24`
- `helper-m-l-xxl` className: m-l-xxl — gap: Amis `50` / Vamis `0`
- `style-two-buttons-ml` 第二个按钮 className: m-l 拉开缝 — gap: Amis `15` / Vamis `12`

## 文档 smoke 失败（最多 20 条）

- 无失败。

## 重跑口径

- **全局**修完：必须 `pnpm compare` 重跑全部用例（token / 默认字体会影响每一页）。动到 `m:` / 窄屏表单再加 `pnpm compare --mobile`。
- **组件**修完：只重跑自身 `pnpm compare --page button`（或 `--id src-components-button-0`）。移动端再加 `--mobile`。
- **样式 helper** 修完：只重跑该页 `pnpm compare --page margin`。

- `pnpm compare` — 全局修完必须重跑全部用例
- `pnpm compare --page "form-default"` — 只重跑「form-default」自身
- `pnpm compare --page "helper-m-l-n"` — 只重跑「helper-m-l-n」自身
- `pnpm compare --page "helper-m-l-xxl"` — 只重跑「helper-m-l-xxl」自身

