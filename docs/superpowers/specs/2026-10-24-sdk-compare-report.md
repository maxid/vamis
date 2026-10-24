# SDK 对照报告

- 日期：2026-10-24
- 状态：自动生成。`pnpm compare` 用同一份 schema 跑 `amis.embed` / `vamis.embed`，判定是 **Vamis 是否对齐 Amis 实测**。
- 合计 **793** · 通过 **785** · 失败 **8**（P0 8）

## 问题分类

| 范围 | 条数 | 怎么改 |
|------|------|--------|
| 全局 | 7 | html/body、SDK 根、主题 token。修一处会大面积变化，不要逐组件打补丁。 |
| 样式 helper | 3 | schema className 工具类，对标 Amis helper SCSS / 计算样式。 |
| 组件 | 2 | 某个 type 的默认外观。只改该渲染器 / cva，不要改全局 token。 |

### 全局（7）

html/body、SDK 根、主题 token。修一处会大面积变化，不要逐组件打补丁。

- `style-two-buttons-ml` gap: Amis `15` / Vamis `12`
- `helper-m-l-sm` gap: Amis `10` / Vamis `8`
- `helper-m-l` gap: Amis `15` / Vamis `12`
- `helper-m-l-md` gap: Amis `20` / Vamis `16`
- `helper-m-l-lg` gap: Amis `30` / Vamis `20`
- `helper-m-l-xl` gap: Amis `40` / Vamis `24`
- `style-grid-auto-columns-0` bodyFont: Amis `PingFang SC` / Vamis `Helvetica Neue`

整改：
- compact 阶应对齐 Amis 5/10/15/20/30/40/50。现在 --gap-* 是 4/8/12/16/20/24。改 token 一处，m/p 整阶回来。
- Amis SDK 把 html/body 钉成 PingFang SC；Vamis 走 --fonts-base-family 长栈，实际落到 Helvetica Neue。在 sdk 根 / embed 的 html,body 对齐 Amis 默认中文栈。

### 样式 helper（3）

schema className 工具类，对标 Amis helper SCSS / 计算样式。

- `helper-m-l-xxl` gap: Amis `50` / Vamis `0`
- `helper-m-l-n` gap: Amis `-15` / Vamis `0`
- `style-grid-auto-columns-0` fontSize: Amis `12px` / Vamis `14px`

整改：
- 缺档：补 Amis 同名 helper（m-l-xxl），不要用邻近档或 token 近似。
- 缺档：补 Amis 同名 helper（m-l-n），不要用邻近档或 token 近似。
- 对标 Amis helper 计算字号（text-sm 实测 12px，不是 TW 0.875rem=14px）。以计算样式为准，不要只抄 markdown 表。

### 组件（2）

某个 type 的默认外观。只改该渲染器 / cva，不要改全局 token。

- `style-two-buttons` fontWeight: Amis `400` / Vamis `500`
- `style-two-buttons` lineHeight: Amis `21px` / Vamis `20px`

整改：
- Button 默认字重：Amis 400，Vamis shadcn font-medium=500。改 button cva，不要改全局。
- 控件行高跟该 type 默认走，不要改 html 行高。对照 Amis 该 type 的计算样式。

## 分组

| 组 | 合计 | 失败 |
|----|------|------|
| p0-layout | 4 | 1 |
| p0-helper | 10 | 7 |
| docs-concepts | 85 | 0 |
| docs-start | 2 | 0 |
| amis-concepts | 40 | 0 |
| docs-style | 460 | 0 |
| docs-components | 192 | 0 |

## P0 失败（驱动下一刀）

- `style-two-buttons-ml` 第二个按钮 className: m-l 拉开缝 — gap: Amis `15` / Vamis `12`
- `helper-m-l-sm` className: m-l-sm — gap: Amis `10` / Vamis `8`
- `helper-m-l` className: m-l — gap: Amis `15` / Vamis `12`
- `helper-m-l-md` className: m-l-md — gap: Amis `20` / Vamis `16`
- `helper-m-l-lg` className: m-l-lg — gap: Amis `30` / Vamis `20`
- `helper-m-l-xl` className: m-l-xl — gap: Amis `40` / Vamis `24`
- `helper-m-l-xxl` className: m-l-xxl — gap: Amis `50` / Vamis `0`
- `helper-m-l-n` className: m-l-n — gap: Amis `-15` / Vamis `0`

## 文档 smoke 失败（最多 20 条）

- 无失败。

下一刀按问题分类：先全局 token / 默认字体，再补缺档 helper，最后改组件默认外观。`pnpm compare:p0` 是盒模型门禁。
