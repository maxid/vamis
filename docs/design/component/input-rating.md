# InputRating 评分 · `input-rating` 设计

> 状态：**进行中 55%** · 复杂度：**M 中**
> 文档：[在线 API 手册](/components/form/input-rating) · Amis：`/zh-CN/components/form/input-rating`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

InputRating 当前是**整数星级**（36 行）：count、value、点击设置、只读展示。没有半星、自定义字符/图标、清除、键盘、事件/动作；55% 是真实缺口。

## 1. 边界与优先级（先读）

### 1.1 P0 不可破坏边界

1. **值**：number；空/非法值回落 0；无 name 不写。
2. **范围**：value 限制 0..count；点击第 n 颗写 n。
3. **展示**：`n <= value` 点亮；当前没有半星。
4. **禁用**：disabled 不能点；只读/static 未接。
5. **包边界**：无 `<style>`、无 fetch；星/按钮 token。

### 1.2 边界用例

- 空值/0/越界/非数字
- count 0/1/10
- disabled/static/readOnly
- 清除/半星/自定义图标（未接）
- 键盘/无障碍
- 窄屏/深色

### 1.3 优先级

1. 值/范围
2. 清除/只读
3. 半星/自定义字符
4. 键盘/事件动作/无障碍

## 2. 复杂度

- 等级：**M 中**（Amis 240 行；Vamis 36 行）
- 依赖：`FormItem`、`icon`
- 风险：当前只有整数星

## 3. Amis 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| `name` / `value` | 分数 | 已接 |
| `count` | 星数 | 已接，默认 5 |
| `readOnly` / `disabled` | 只读 | disabled 已接；readOnly 未接 |
| `allowHalf` | 半星 | 未接 |
| `character` / icon | 自定义字符 | 未接 |
| `clearable` | 清除 | 未接 |
| 事件/动作 | 目标 | 未接 |

## 4. 架构

- [`form/InputRating.vue`](../../../packages/vamis/src/renderers/form/InputRating.vue)：count/value/按钮渲染。
- [`FormItem.vue`](../../../packages/vamis/src/renderers/FormItem.vue)：label/校验/状态。
- 当前未注册 scoped API。

### 数据流

```text
field value → Number/0 → value
click n → setValue(n)
```

## 5. 样式与边界

- `.vamis-rating` / `__star` / `__value`；无 `<style>`。
- 深色星色/禁用、窄屏星数换行单独核。

## 6. 当前状态与缺口

- 已接：count、整数点击、展示、disabled。
- 未接：半星/自定义字符/清除/readOnly/键盘/事件动作/深色。
- 对照：TODO 55%；本轮未重跑。

## 7. 验收计划与完成度

### 验收清单（文档核对：3 / 12）

- [x] Amis 入口 / 文档章节已定位
- [x] Vamis InputRating 已定位
- [x] 复杂度、依赖、集成面已盘点
- [ ] schema 属性 / 默认值逐项核对
- [ ] 事件 / 动作逐项核对（当前无）
- [ ] 边界用例逐项核对
- [ ] 组件页活示例运行、无 console error
- [ ] `pnpm test`（InputRating 相关）
- [ ] `pnpm typecheck` 0
- [ ] `pnpm compare --page input-rating` 桌面
- [ ] `pnpm compare --page input-rating --mobile`
- [ ] 深色 / 375px 窄屏

## 8. 后续

1. 先补允许清除/readOnly/范围兜底。
2. 再做半星/自定义字符/键盘。
3. 深色/无障碍最后做。

---

返回 [组件设计索引](README.md)
