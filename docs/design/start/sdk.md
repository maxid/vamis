# JS SDK 设计

> 状态：**已完成 90%** · 对应站点：`/start/sdk` · 源码：[website/src/start/sdk.md](../../../website/src/start/sdk.md)

## 0. 设计结论

SDK 页定义**任意 HTML 嵌入**：`sdk.js` loader + `vamis.embed('#root', schema)`，与 Vue `VamisRoot` 同内核/注册表。设计重点是构建产物、样式、API 与失败态。

## 1. 边界与优先级

1. **产物**：`pnpm --filter @vamis/sdk build` → `dist/sdk.js`/`sdk.css`。
2. **入口**：`vamis.embed`；`registerRenderer` 同注册表。
3. **样式**：`sdk.css` 必须加载；否则控件裸奔。
4. **作者态**：schema 可 JSON/YAML；embed 参数与 locale 目标契约。
5. **API**：doAction/getComponentByName/reload 等（以 SDK 导出为准）。
6. **安全**：不搬 amisRequire；不执行不可信 JS。

## 2. 内容契约

- 先给最小 HTML（含 css/js），再给 API 表。
- 构建前提写清；不写不存在 CDN。
- 给未加载 css/找不到 root/未注册 type 失败态。
- 与 getting-started/i18n 互链。

## 3. 实现

- [SDK src](../../../packages/vamis-sdk/src)：embed/register。
- [SDK spec](../../superpowers/specs/2026-10-21-vamis-js-sdk.md)：契约。
- [Vite SDK build](../../../packages/vamis-sdk)：产物。

## 4. 缺口

- npm/CDN 版本口径未稳定。
- locale 参数未注入。

## 5. 验收清单（文档核对：3 / 12）

- [x] 产物/嵌入/注册边界已盘点
- [x] SDK 源码/spec 已定位
- [ ] 最小 HTML 按文档跑通
- [ ] 构建产物路径/说明核对
- [ ] 失败态可复现
- [ ] API 表与导出一致
- [ ] 与 getting-started/i18n 互链
