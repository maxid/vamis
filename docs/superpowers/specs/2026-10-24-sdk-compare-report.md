# SDK 对照报告

- 日期：2026-11-19
- 视口：桌面 1100×800
- 状态：自动生成。`pnpm compare` 用同一份 schema 跑 `amis.embed` / `vamis.embed`，判定是 **Vamis 是否对齐 Amis 实测**。移动端加 `--mobile`。
- 合计 **14** · 通过 **8** · 失败 **6**（P0 0）· Vamis 多出 extra **0**

## 问题分类

| 范围 | 条数 | 怎么改 |
|------|------|--------|
| 全局 | 5 | html/body、SDK 根、主题 token。修一处会大面积变化，不要逐组件打补丁。 |
| 样式 helper | 0 | schema className 工具类，对标 Amis helper SCSS / 计算样式。 |
| 组件 | 11 | 某个 type 的默认外观。只改该渲染器 / cva，不要改全局 token。 |

### 全局（5）

html/body、SDK 根、主题 token。修一处会大面积变化，不要逐组件打补丁。

- `src-components-service-0` fontSize: Amis `14px` / Vamis `12px`
- `src-components-service-1` fontSize: Amis `14px` / Vamis `12px`
- `src-components-service-7` fontSize: Amis `14px` / Vamis `12px`
- `src-components-service-8` fontSize: Amis `14px` / Vamis `12px`
- `src-components-service-11` fontSize: Amis `12px` / Vamis `14px`

整改：
- html/body、SDK 根、主题 token。修一处会大面积变化，不要逐组件打补丁。

### 样式 helper（0）

schema className 工具类，对标 Amis helper SCSS / 计算样式。

- 无。

### 组件（11）

某个 type 的默认外观。只改该渲染器 / cva，不要改全局 token。

- `src-components-service-0` lineHeight: Amis `21px` / Vamis `18px`
- `src-components-service-1` lineHeight: Amis `21px` / Vamis `18px`
- `src-components-service-2` page/body/0:form/body/1:service/body/2:input-datetime.rendered: Amis `false` / Vamis `true`
- `src-components-service-7` lineHeight: Amis `21px` / Vamis `18px`
- `src-components-service-8` lineHeight: Amis `21px` / Vamis `18px`
- `src-components-service-9` page/body/1:service.named: Amis `false` / Vamis `true`
- `src-components-service-10` page/body/1:service.named: Amis `false` / Vamis `true`
- `src-components-service-11` page/body/2:service.named: Amis `false` / Vamis `true`
- `src-components-service-11` lineHeight: Amis `24px` / Vamis `20px`
- `src-components-service-12` page/body/1:service.named: Amis `false` / Vamis `true`
- `src-components-service-13` page/body/1:service.named: Amis `false` / Vamis `true`

整改：
- 控件行高跟该 type 默认走，不要改 html 行高。对照 Amis 该 type 的计算样式。
- schema 树该结点要能在 DOM 里定位（name / label）。
- 有 name 的结点应能 getComponentByName。Vamis 要在该 type 注册 Scoped。

## 文档结构（对标 Amis：文档 / 组件 / 样式）

| 面 | 合计 | 失败 |
|----|------|------|
| 文档 | 0 | 0 |
| 组件 | 14 | 6 |
| 样式 | 0 | 0 |

Vamis 可以比 Amis 多（尤其是样式）。多出来的页标 extra，不删。

## 分组

| 组 | 合计 | 失败 |
|----|------|------|
| 组件 / 功能 | 14 | 6 |

## P0 失败（驱动下一刀）

- 无失败。

## 文档 smoke 失败（最多 20 条）

- `src-components-service-2` Service 功能型容器 #3 — page/body/0:form/body/1:service/body/2:input-datetime.rendered: Amis `false` / Vamis `true`
- `src-components-service-9` Service 功能型容器 #10 — page/body/1:service.named: Amis `false` / Vamis `true`
- `src-components-service-10` Service 功能型容器 #11 — page/body/1:service.named: Amis `false` / Vamis `true`
- `src-components-service-11` Service 功能型容器 #12 — page/body/2:service.named: Amis `false` / Vamis `true`
- `src-components-service-12` Service 功能型容器 #13 — page/body/1:service.named: Amis `false` / Vamis `true`
- `src-components-service-13` Service 功能型容器 #14 — page/body/1:service.named: Amis `false` / Vamis `true`

## 重跑口径

- **全局**修完：必须 `pnpm compare` 重跑全部用例（token / 默认字体会影响每一页）。动到 `m:` / 窄屏表单再加 `pnpm compare --mobile`。
- **组件**修完：只重跑自身 `pnpm compare --page button`（或 `--id src-components-button-0`）。移动端再加 `--mobile`。
- **样式 helper** 修完：只重跑该页 `pnpm compare --page margin`。

- `pnpm compare` — 全局修完必须重跑全部用例
- `pnpm compare --page "src-components-service-2"` — 只重跑「src-components-service-2」自身
- `pnpm compare --page "src-components-service-9"` — 只重跑「src-components-service-9」自身
- `pnpm compare --page "src-components-service-10"` — 只重跑「src-components-service-10」自身
- `pnpm compare --page "src-components-service-11"` — 只重跑「src-components-service-11」自身
- `pnpm compare --page "src-components-service-12"` — 只重跑「src-components-service-12」自身
- `pnpm compare --page "src-components-service-13"` — 只重跑「src-components-service-13」自身

