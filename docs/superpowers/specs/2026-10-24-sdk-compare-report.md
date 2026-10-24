# SDK 对照报告

- 日期：2026-10-24
- 状态：自动生成。`pnpm compare` 用同一份 schema 跑 `amis.embed` / `vamis.embed`，判定是 **Vamis 是否对齐 Amis 实测**。
- 合计 **793** · 通过 **785** · 失败 **8**（P0 8）

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

下一刀优先修 P0 helper 阶。报告覆盖 `CONTEXT.md`「后续计划」里的对照项。`pnpm compare:p0` 是盒模型门禁。
