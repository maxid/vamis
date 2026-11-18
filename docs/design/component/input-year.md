# InputYear 年输入 · `input-year` 设计

> 状态：**进行中 45%** · 复杂度：**XL 特重**（Amis 824 行系列，共享 77 行）
> 文档：[在线 API 手册](/components/form/input-year) · Amis：`/zh-CN/components/form/input-year`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

InputYear **没有独立渲染器**：`extras/form.ts` 把 input-year / input-month / input-quarter 都注册到 `DatePart.vue`。当前 year 是原生 number 1900–2100，值是字符串；没有年历、格式/值格式、范围表达式、事件/动作。45% 是真实缺口。

## 1. 边界与优先级（先读）

### 1.1 P0 不可破坏边界

1. **共享组件**：year/month/quarter 共用 DatePart；改 year 要回归另外两个。
2. **值**：字符串年份；空串保持空；不要擅自转 timestamp/Date。
3. **范围**：原生 min/max 1900–2100；`min/max` schema 表达式未接。
4. **写回**：无 name 不写；FormItem/校验负责 required。
5. **包边界**：无 `<style>`、无 fetch；输入/token 由 UI。

### 1.2 边界用例

- 空/合法年/越界/非数字/小数
- month/quarter 类型切换
- disabled/static/readOnly
- 外部 setValue/reset
- 目标年历/格式限制/事件动作（未接）
- 窄屏/深色

### 1.3 优先级

1. 共享组件/值
2. 范围/空值
3. 格式/年历
4. 事件/动作/样式

## 2. 复杂度

- 等级：**XL 特重**（Amis 824 行；Vamis DatePart 77 行，共享）
- 依赖：`FormItem`、原生 input
- 风险：共享组件改一处影响三类

## 3. Amis 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| `name` / `value` | 年份字符串 | 已接 |
| `min` / `max` | 范围 | 原生 1900–2100；表达式未接 |
| `format` / `valueFormat` | 格式 | 未接 |
| 年历选择 | 目标 | 未接 |
| 事件/动作 | 目标 | 未接 |

## 4. 架构

- [`extras/form.ts`](../../../packages/vamis/src/extras/form.ts)：注册。
- [`form/DatePart.vue`](../../../packages/vamis/src/renderers/form/DatePart.vue)：kind=year，number input。
- [`FormItem.vue`](../../../packages/vamis/src/renderers/FormItem.vue)：label/校验/状态。

### 数据流

```text
field value → text → number input
input → setValue(string)
```

## 5. 样式与边界

- 原生 number；无专属类、无 `<style>`。
- 窄屏宽度/深色原生控件单独核。

## 6. 当前状态与缺口

- 已接：year 输入、1900–2100、值写回。
- 未接：年历/格式/范围表达式/事件动作/深色。
- 对照：TODO 45%；本轮未重跑。

## 7. 验收计划与完成度

### 验收清单（文档核对：3 / 12）

- [x] Amis 入口 / 文档章节已定位
- [x] 共享 DatePart 注册已定位
- [x] 复杂度、依赖、集成面已盘点
- [ ] schema 属性 / 默认值逐项核对
- [ ] 事件 / 动作逐项核对（当前无）
- [ ] 边界用例逐项核对
- [ ] 组件页活示例运行、无 console error
- [ ] `pnpm test`（DatePart 相关）
- [ ] `pnpm typecheck` 0
- [ ] `pnpm compare --page input-year` 桌面
- [ ] `pnpm compare --page input-year --mobile`
- [ ] 深色 / 375px 窄屏

## 8. 后续

1. 三类共享测试。
2. 年历/格式/范围表达式若需要，先改 DatePart 设计。
3. 深色/窄屏专项。

---

返回 [组件设计索引](README.md)
