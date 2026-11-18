# InputVerificationCode 验证码 · `input-verification-code` 设计

> 状态：**进行中 50%** · 复杂度：**M 中**
> 文档：[在线 API 手册](/components/form/input-verification-code) · Amis：`/zh-CN/components/form/input-verification-code`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

InputVerificationCode 当前是**分格数字输入**（37 行）：length 默认 6，每格 maxlength 1，只保留数字，值写拼接字符串。没有粘贴填充、退格回退、自动聚焦、发送验证码按钮、事件/动作；50% 是真实缺口。

## 1. 边界与优先级（先读）

1. **值**：拼接字符串，trim；无 name 不写；长度不足不补齐（当前只显示空格占位）。
2. **输入**：每格只保留一个数字；非数字丢弃；粘贴/多字符未接。
3. **长度**：length 为正整数兜底；length 改变时值截断/补空。
4. **焦点**：当前无自动跳格/退格回退；不要把 DOM autofocus 当已支持。
5. **包边界**：无 `<style>`、无 fetch；Input/token。

### 边界用例

- 空/部分输入/全输入/非数字/粘贴/退格/长度变更
- disabled/static、FormItem 校验
- 发送验证码按钮（未接）
- 窄屏/深色

### 优先级

1. 值/每格数字；2. 焦点/粘贴/退格；3. 发送验证码/事件动作；4. 样式。

## 2. 复杂度

- 等级：**M 中**（Amis 103 行；Vamis 37 行）；依赖 `FormItem`、`input-text`。
- 风险：多格输入细节多。

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| `name` / `value` | 验证码字符串 | 已接 |
| `length` | 位数 | 已接，默认 6 |
| 粘贴/退格/自动聚焦 | 输入体验 | 未接 |
| 发送验证码 | 目标 | 未接 |
| 事件/动作 | 目标 | 未接 |

## 4. 架构

- [`form/InputVerificationCode.vue`](../../../packages/vamis/src/renderers/form/InputVerificationCode.vue)：chars/setAt/拼接。
- [`FormItem.vue`](../../../packages/vamis/src/renderers/FormItem.vue)：label/校验。
- 无 scoped API。

### 数据流

```text
field value → padEnd/split → chars
setAt → 数字截取 → join trim → setValue
```

## 5. 样式

- 每格 w-10、居中；无专属类、无 `<style>`；窄屏 6 格可能溢出。

## 6. 缺口

粘贴/退格/自动聚焦、发送验证码、事件动作、长度变更、窄屏/深色。

## 7. 验收

- 输入/清空/长度/disabled/窄屏；未接不误标。

## 8. 后续

先做焦点/粘贴/退格，再做发送验证码/事件；长度变更补边界。

---

返回 [组件设计索引](README.md)
