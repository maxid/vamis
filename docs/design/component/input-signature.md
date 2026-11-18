# InputSignature 签名 · `input-signature` 设计

> 状态：**进行中 35%** · 复杂度：**L 重**
> 文档：[在线 API 手册](/components/form/input-signature) · Amis：`/zh-CN/components/form/input-signature`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

InputSignature 当前是**canvas 鼠标涂鸦**（68 行）：固定 360×140、mousedown/move/up 画线，mouseup 写 dataURL，清空写空串。没有触控/压感/笔刷配置/导出格式/事件/校验；35% 是真实缺口。

## 1. 边界与优先级（先读）

1. **值**：鼠标抬起时 `toDataURL()` 字符串；清空写空串；无 name 不写。不要每 move 写值。
2. **坐标**：client 坐标减 rect；canvas 固定 width/height，CSS 缩放会导致坐标偏移。
3. **输入**：当前仅 mouse；触控笔/pointer/touch 未接。
4. **安全**：dataURL 是图片字符串；上传/存储由表单/后端处理，组件不 fetch。
5. **包边界**：无 `<style>`、无 fetch；canvas 边框/按钮 token。

### 边界用例

- 空/画线/清空/重复签名/disabled
- CSS 缩放/窄屏/深色
- 触控/笔压感/导出（未接）
- 外部 setValue/reset

### 优先级

1. 值/坐标/清空；2. 触控/缩放；3. 导出/事件/校验。

## 2. 复杂度

- 等级：**L 重**（Amis 240 行；Vamis 68 行）；依赖 `FormItem`、canvas。
- 风险：固定尺寸/仅 mouse。

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| `name` / `value` | 签名 dataURL | 已接 |
| 宽高/笔刷 | 目标 | 未接（固定） |
| 触控/压感 | 目标 | 未接 |
| 导出格式/事件 | 目标 | 未接 |

## 4. 架构

- [`form/InputSignature.vue`](../../../packages/vamis/src/renderers/form/InputSignature.vue)：canvas + 鼠标事件 + dataURL。
- [`FormItem.vue`](../../../packages/vamis/src/renderers/FormItem.vue)：label/校验。
- 无 scoped API。

### 数据流

```text
mouseup → canvas.toDataURL → setValue
clear → clearRect + setValue('')
```

## 5. 样式

- 固定 canvas 尺寸，`w-full` 拉伸会失真；按钮/边框 token；无 `<style>`。

## 6. 缺口

触控/指针、坐标缩放、笔刷/压感、导出格式、事件/校验、深色。

## 7. 验收

- 画线/清空/disabled/窄屏；不要按触控/压感验收。

## 8. 后续

先做 pointer 事件与坐标缩放，再做导出/笔刷；触控笔单独评估。

---

返回 [组件设计索引](README.md)
