# BarCode 条形码 · `barcode` 设计

> 状态：**进行中 45%** · 复杂度：**S 轻**
> 文档：[在线 API 手册](/components/barcode) · Amis：`/zh-CN/components/barcode`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

BarCode 当前是**自研 Code 128 SVG**（29 行）：value、format/width/height/lineColor/background/displayValue；仅 ASCII 32–127。没有其它条码格式/下载/事件；45% 是真实缺口。

## 1. 边界与优先级（先读）

1. **内容**：readText；空显示“未配置”；不可编码显示错误。
2. **格式**：当前仅 CODE128；其它 format 名不生效。
3. **编码范围**：仅 ASCII 32–127；中文/控制字符失败。
4. **样式**：width/height/lineColor/background/displayValue；SVG v-html 是自研可信输出。
5. **包边界**：无 `<style>`、无 fetch；barcode token。

### 边界用例

- 空/ASCII 数字/字母/中文/控制字符
- format/width/height/颜色/displayValue
- 下载/事件（未接）
- 窄屏/深色

### 优先级

1. 内容/编码范围；2. 样式/格式；3. 其它条码/下载/事件。

## 2. 复杂度

- 等级：**S 轻**（Amis 73 行；Vamis 29 行）；依赖自研 barcode。
- 风险：仅 Code128/ASCII。

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| value | 内容 | 已接 |
| options.format | 格式 | 仅 CODE128 |
| width/height/颜色/displayValue | 样式 | 已接 |
| 下载/事件 | 目标 | 未接 |

## 4. 架构

- [`display/BarCode.vue`](../../../packages/vamis/src/renderers/display/BarCode.vue)：value/options/svg。
- [`display/barcode.ts`](../../../packages/vamis/src/renderers/display/barcode.ts)：encodeBarcode。
- [`prop.ts`](../../../packages/vamis/src/renderers/display/prop.ts)：readText。

## 5. 样式

- SVG 颜色/尺寸；无 `<style>`；深色/窄屏单独核。

## 6. 缺口

其它条码格式/下载/事件/深色。

## 7. 验收

- ASCII/中文失败/空/样式/窄屏；未接不误标。

### 验收清单（文档核对：3 / 12）

- [x] Amis 入口 / 文档章节已定位
- [x] Vamis 渲染器或注册文件已定位
- [x] 复杂度、依赖、集成面已盘点
- [ ] schema 属性 / 默认值逐项核对
- [ ] 事件 / 动作逐项核对
- [ ] 边界用例逐项核对
- [ ] 组件页活示例运行、无 console error
- [ ] `pnpm test`（组件相关）
- [ ] `pnpm typecheck` 0
- [ ] `pnpm compare --page <type>` 桌面
- [ ] `pnpm compare --page <type> --mobile`
- [ ] 深色 / 375px 窄屏核对

## 8. 后续

若需 EAN/Code39 单独立项；当前保持 Code128 并明确范围。

---

返回 [组件设计索引](README.md)
