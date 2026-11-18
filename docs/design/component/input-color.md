# InputColor 颜色选择 · `input-color` 设计

> 状态：**进行中 50%** · 复杂度：**M 中**
> 文档：[在线 API 手册](/components/form/input-color) · Amis：`/zh-CN/components/form/input-color`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

InputColor 当前是**原生 color + 十六进制输入 + 预设色点**（48 行）：值字符串，默认 presetColors 6 色。没有 alpha/格式（rgb/hsl）/取色器面板/校验/事件动作；50% 是真实缺口。

## 1. 边界与优先级（先读）

1. **值**：颜色字符串（默认 `#000000`）；无 name 不写；外部值非法时原生 color 可能回落黑。
2. **输入**：原生 color 与文本输入双向；文本非法值不阻止写回（校验未接）。
3. **预设**：presetColors 字符串或 `{color/value}`；空数组仍显示默认色点？当前默认回退 6 色。
4. **格式**：仅 HEX；rgb/hsl/alpha 未接。
5. **包边界**：无 `<style>`、无 fetch；颜色控件/输入 token。

### 边界用例

- 空/HEX/非法字符串/rgb/hsl/alpha
- 预设空/自定义/点击预设
- disabled/static、FormItem 校验
- 外部 setValue/reset
- 取色器面板/格式（未接）
- 窄屏/深色

### 优先级

1. 值/双向输入；2. 预设/校验；3. 格式/alpha/面板；4. 事件动作。

## 2. 复杂度

- 等级：**M 中**（Amis 118 行；Vamis 48 行）；依赖 `FormItem`、input。
- 风险：原生 color 只支持 HEX，格式扩展需自绘。

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| `name` / `value` | 颜色字符串 | 已接 |
| `presetColors` | 预设 | 已接（默认 6 色） |
| alpha/format/取色器 | 目标 | 未接 |
| 校验/事件动作 | 目标 | 未接 |

## 4. 架构

- [`form/InputColor.vue`](../../../packages/vamis/src/renderers/form/InputColor.vue)：value/presets/原生 input/文本。
- [`FormItem.vue`](../../../packages/vamis/src/renderers/FormItem.vue)：label/校验。

### 数据流

```text
field value → string（默认 #000000）
color/text/preset → setValue(string)
```

## 5. 样式

- 色块/文本/预设圆点；无专属类、无 `<style>`；窄屏/深色单独核。

## 6. 缺口

alpha/格式/面板/校验/事件动作/深色。

## 7. 验收

- 值/HEX/预设/disabled/窄屏；未接不误标。

## 8. 后续

先做 HEX 校验/格式，再评估自绘取色器与 alpha。

---

返回 [组件设计索引](README.md)
