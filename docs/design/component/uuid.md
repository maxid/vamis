# UUID 唯一标识 · `uuid` 设计

> 状态：**进行中 45%** · 复杂度：**S 轻**
> 文档：[在线 API 手册](/components/form/uuid) · Amis：`/zh-CN/components/form/uuid`
> 盘点日期：2026-11-18。本文是研发设计文档。

## 0. 一页结论

UUID 当前是**挂载时生成一次 UUID**并只读展示（24 行）：crypto.randomUUID 或时间兜底。没有重新生成/格式/复制/隐藏；45% 是精简。

## 1. 边界与优先级（先读）

1. **生成**：字段为空才生成；已有值不覆盖；crypto 不可用兜底。
2. **展示**：disabled Input；hidden 时不渲染。
3. **包边界**：无 `<style>`、无 fetch。

### 边界用例

- 空/已有值/hidden/crypto 不可用
- 重新生成/复制（未接）
- 窄屏/深色

## 2. 复杂度

- 等级：**S 轻**（Amis 54 行；Vamis 24 行）。

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| name/value | 字段 | 已接 |
| hidden | 不渲染 | 已接 |
| 重新生成/格式 | 目标 | 未接 |

## 4. 架构

- `form/UUID.vue`：onMounted 生成/只读 Input。

## 5. 缺口

重新生成/格式/复制。

## 6. 验收

- 空生成/已有值/hidden/crypto 兜底。

## 7. 后续

保持一次性生成；不做可编辑 UUID。

---

返回 [组件设计索引](README.md)
