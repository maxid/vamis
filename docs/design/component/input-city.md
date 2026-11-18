# InputCity 城市选择器 · `input-city` 设计

> 状态：**进行中 25%** · 复杂度：**L 重**
> 文档：[在线 API 手册](/components/form/input-city) · Amis：`/zh-CN/components/form/input-city`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

InputCity 当前是**内置 3 省示例**（50 行）：省/市两级 Select，值默认 `省,市` 字符串。它不是全国数据，也没有区县、搜索、远程数据、对象字段名、事件/动作；25% 是真实缺口。

## 1. 边界与优先级（先读）

### 1.1 P0 不可破坏边界

1. **值格式**：默认写 `province,city` 字符串；`extractValue: false` 写 `{province, city}`。改格式要迁移，不要两套并存。
2. **数据边界**：当前 `CITIES` 硬编码 3 省，是示例不是全国；文档/验收必须标明。
3. **联动**：切换省必须清空市；市选项只来自当前省；非法省值要兜底。
4. **字段名**：当前固定 `province/city`；`provinceField` / `cityField` 未接。
5. **包边界**：无 `<style>`、无 fetch；Select/token 由 `@vamis/ui`。

### 1.2 边界用例

- 空值 / 逗号字符串 / 对象值 / 非法省
- 切换省清市；只选省不选市
- extractValue true/false
- disabled/static、FormItem 错误
- 全国数据/区县/远程 source/搜索（未接）
- 窄屏、深色

### 1.3 优先级

1. 值格式/省市级联
2. 数据源（示例 vs 全国/远程）
3. 区县/搜索
4. 事件/动作/样式

## 2. 复杂度

- 等级：**L 重**（Amis `Form/InputCity.tsx` 633 行；Vamis 50 行）
- 依赖：`FormItem`、`select`
- 风险：硬编码示例容易被误当真实能力

## 3. Amis 契约

### 3.1 入口

- 入口：`type: 'input-city'`
- Amis 渲染器：`packages/amis/src/renderers/Form/InputCity.tsx`
- 在线文档：[Vamis `/components/form/input-city`](/components/form/input-city)

### 3.2 核心属性（目标/现状）

| 属性 | 语义 | 现状 |
|---|---|---|
| `name` / `value` | 省市值 | 已接 |
| `extractValue` | 对象/字符串 | 部分接 |
| `provinceField` / `cityField` | 字段名 | 未接 |
| 全国数据/区县 | 数据 | 未接（3 省示例） |
| `source` / 远程 | 数据源 | 未接 |
| 搜索 | 搜索 | 未接 |
| 事件/动作 | 目标 | 未接 |

### 3.3 事件/动作

当前无独立事件/动作；不要按 Select 的事件套用。

## 4. Vamis 架构

### 4.1 文件

| 文件 | 职责 |
|---|---|
| [`InputCity.vue`](../../../packages/vamis/src/renderers/form/InputCity.vue) | CITIES 示例、province/city 计算属性、两级 Select |
| [`FormItem.vue`](../../../packages/vamis/src/renderers/FormItem.vue) | label/校验/静态/错误 |
| [`styles.css`](../../../packages/vamis-ui/src/styles.css) | select/网格 token |

### 4.2 状态

```text
field value：string 'province,city' 或 object {province,city}
  → parts {province, city}
切换省 → city 清空 → 写回
市选项 = CITIES[province].children
```

- `extractValue !== false`：字符串 join；false：对象。
- 省/市 Select 受控；无搜索/远程。
- 数据硬编码，不能当全国。

## 5. 样式与边界

- 两列 grid（sm:grid-cols-2）；窄屏单列。
- Select 使用 UI 原语/token；无 `<style>`。
- 深色/错误态单独核。

## 6. 当前状态与缺口

- 已接：省/市两级、值转换、切换省清市、extractValue 基础。
- 未接：全国数据/区县、provinceField/cityField、source/搜索、事件/动作、深色窄屏。
- 对照：TODO 25%；本轮未重跑。

## 7. 验收计划与完成度

### 验收清单（文档核对：3 / 12）

- [x] Amis 入口 / 文档章节已定位
- [x] Vamis InputCity / Select 依赖已定位
- [x] 复杂度、依赖、集成面已盘点
- [ ] schema 属性 / 默认值逐项核对
- [ ] 事件 / 动作逐项核对（当前无）
- [ ] 边界用例逐项核对
- [ ] 组件页活示例运行、无 console error
- [ ] `pnpm test`（InputCity 相关）
- [ ] `pnpm typecheck` 0
- [ ] `pnpm compare --page input-city` 桌面
- [ ] `pnpm compare --page input-city --mobile`
- [ ] 深色 / 375px 窄屏

### 验收重点

- 值格式/切换省清市
- 示例数据边界
- extractValue 两态
- 全国/远程缺口不要误标

## 8. 后续

1. 先抽城市数据源接口；决定内置全国数据还是远程 source。
2. 再补 provinceField/cityField 与区县。
3. 搜索/事件动作/深色后置。

---

返回 [组件设计索引](README.md)
