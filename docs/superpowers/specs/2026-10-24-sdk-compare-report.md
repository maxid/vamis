# SDK 对照报告

- 日期：2026-11-14
- 视口：桌面 1100×800
- 状态：自动生成。`pnpm compare` 用同一份 schema 跑 `amis.embed` / `vamis.embed`，判定是 **Vamis 是否对齐 Amis 实测**。移动端加 `--mobile`。
- 合计 **19** · 通过 **17** · 失败 **2**（P0 0）· Vamis 多出 extra **0**

## 问题分类

| 范围 | 条数 | 怎么改 |
|------|------|--------|
| 全局 | 5 | html/body、SDK 根、主题 token。修一处会大面积变化，不要逐组件打补丁。 |
| 样式 helper | 0 | schema className 工具类，对标 Amis helper SCSS / 计算样式。 |
| 组件 | 12 | 某个 type 的默认外观。只改该渲染器 / cva，不要改全局 token。 |

### 全局（5）

html/body、SDK 根、主题 token。修一处会大面积变化，不要逐组件打补丁。

- `src-components-image-2` fontSize: Amis `15px` / Vamis `14px`
- `src-components-image-3` fontSize: Amis `12px` / Vamis `14px`
- `src-components-image-4` fontSize: Amis `12px` / Vamis `14px`
- `src-components-image-12` fontSize: Amis `14px` / Vamis `12px`
- `src-components-image-13` fontSize: Amis `12px` / Vamis `14px`

整改：
- html/body、SDK 根、主题 token。修一处会大面积变化，不要逐组件打补丁。

### 样式 helper（0）

schema className 工具类，对标 Amis helper SCSS / 计算样式。

- 无。

### 组件（12）

某个 type 的默认外观。只改该渲染器 / cva，不要改全局 token。

- `src-components-image-2` lineHeight: Amis `22.5px` / Vamis `21px`
- `src-components-image-2` fontWeight: Amis `700` / Vamis `400`
- `src-components-image-3` lineHeight: Amis `18px` / Vamis `14px`
- `src-components-image-3` fontWeight: Amis `400` / Vamis `500`
- `src-components-image-4` lineHeight: Amis `18px` / Vamis `14px`
- `src-components-image-4` fontWeight: Amis `400` / Vamis `500`
- `src-components-image-12` lineHeight: Amis `21px` / Vamis `16px`
- `src-components-image-12` fontWeight: Amis `400` / Vamis `500`
- `src-components-image-13` lineHeight: Amis `18px` / Vamis `14px`
- `src-components-image-13` fontWeight: Amis `400` / Vamis `500`
- `src-components-image-17` page/body/0:container/body/0:image.rendered: Amis `false` / Vamis `true`
- `src-components-image-18` page/body/0:container/body/0:flex/items/0:image.rendered: Amis `false` / Vamis `true`

整改：
- 控件行高跟该 type 默认走，不要改 html 行高。对照 Amis 该 type 的计算样式。
- Button 默认字重：Amis 400，Vamis shadcn font-medium=500。改 button cva，不要改全局。
- schema 树该结点要能在 DOM 里定位（name / label）。

## 文档结构（对标 Amis：文档 / 组件 / 样式）

| 面 | 合计 | 失败 |
|----|------|------|
| 文档 | 0 | 0 |
| 组件 | 19 | 2 |
| 样式 | 0 | 0 |

Vamis 可以比 Amis 多（尤其是样式）。多出来的页标 extra，不删。

## 分组

| 组 | 合计 | 失败 |
|----|------|------|
| 组件 / 数据展示 | 19 | 2 |

## P0 失败（驱动下一刀）

- 无失败。

## 文档 smoke 失败（最多 20 条）

- `src-components-image-17` Image 图片 #18 — page/body/0:container/body/0:image.rendered: Amis `false` / Vamis `true`
- `src-components-image-18` Image 图片 #19 — page/body/0:container/body/0:flex/items/0:image.rendered: Amis `false` / Vamis `true`

## 重跑口径

- **全局**修完：必须 `pnpm compare` 重跑全部用例（token / 默认字体会影响每一页）。动到 `m:` / 窄屏表单再加 `pnpm compare --mobile`。
- **组件**修完：只重跑自身 `pnpm compare --page button`（或 `--id src-components-button-0`）。移动端再加 `--mobile`。
- **样式 helper** 修完：只重跑该页 `pnpm compare --page margin`。

- `pnpm compare --page "src-components-image-17"` — 只重跑「src-components-image-17」自身
- `pnpm compare --page "src-components-image-18"` — 只重跑「src-components-image-18」自身

