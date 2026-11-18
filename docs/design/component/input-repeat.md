# InputRepeat 重复频率 · `input-repeat` 设计

> 状态：**进行中 40%** · 复杂度：**M 中**
> 文档：[在线 API 手册](/components/form/input-repeat) · Amis：`/zh-CN/components/form/input-repeat`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

InputRepeat 当前是**四档频率 + 原始字符串输入**（32 行）：none/daily/weekly/monthly，value 直接写字符串。没有 cron/周期配置、周几/几号、时区、事件/动作；40% 是真实缺口。

## 1. 边界与优先级（先读）

### 1.1 P0 不可破坏边界

1. **值**：字符串；空值显示 none；`daily` 等写回原字符串；不要擅自转对象/cron。
2. **频率**：当前 4 档 + 自由输入；`daily` 前缀特殊处理，其他按原值。
3. **联动**：选 none 隐藏输入；切换到其他档显示输入。
4. **校验/事件**：当前无；不要把自由字符串当合法 cron 校验。
5. **包边界**：无 `<style>`、无 fetch；Select/Input token。

### 1.2 边界用例

- 空/daily/weekly/monthly/cron 字符串/非法字符串
- 切 none/非 none
- disabled/static
- 外部 setValue/reset
- 事件动作/校验（未接）
- 窄屏/深色

### 1.3 优先级

1. 值/频率切换
2. 输入合法性
3. 周期配置/事件动作
4. 样式

## 2. 复杂度

- 等级：**M 中**（Amis 252 行；Vamis 32 行）
- 依赖：`FormItem`、`select`、`input-text`

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| `name` / `value` | 频率字符串 | 已接 |
| 频率档 | none/daily/weekly/monthly | 已接 |
| cron/周期配置 | 目标 | 未接 |
| 事件/动作 | 目标 | 未接 |

## 4. 架构

- [`form/InputRepeat.vue`](../../../packages/vamis/src/renderers/form/InputRepeat.vue)：value + Select + Input。
- [`FormItem.vue`](../../../packages/vamis/src/renderers/FormItem.vue)：label/校验。

### 数据流

```text
field value → string（默认 none）
select/input → setValue(string)
```

## 5. 样式

- Select+Input；无专属类、无 `<style>`；窄屏/深色单独核。

## 6. 缺口

cron/周几/几号/时区/校验/事件动作。

## 7. 验收

- 值/频率切换/空值/disabled；未接不误标。

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

先定频率模型（字符串 vs 结构），再做 cron 配置；否则保持精简并明确。

---

返回 [组件设计索引](README.md)
