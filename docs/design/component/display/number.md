# Number 数字展示 · `number` 设计

> 状态：**进行中 60%** · 复杂度：**M 中**
> 文档：[在线 API 手册](/components/number) · Amis：`/zh-CN/components/number`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

Number **没有独立渲染器**：`extras/rest.ts` 把 number 注册到 `StaticValue`（静态值展示）；number/percent 过滤器已接，组件自身精度/格式档未齐。60% 是真实缺口。

## 1. 边界与优先级（先读）

1. **别名**：number → StaticValue；值/模板/组件展示继承。
2. **格式**：依赖 number/percent 过滤器；精度/千分位/单位等组件属性未齐。
3. **空值**：placeholder；非数字显示原值。
4. **包边界**：无 `<style>`、无 fetch；static token。

### 边界用例

- 空/整数/小数/负数/NaN/字符串数字
- percent/精度/千分位/单位（未接）
- 深色/窄屏

### 优先级

1. 别名/值；2. 过滤器/格式；3. 精度/单位；4. 样式。

## 2. 复杂度

- 等级：**M 中**（Amis 163 行；Vamis 复用 StaticValue）；依赖 tpl/mapping。
- 风险：格式能力缺口。

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| value/name | 值 | 继承 Static |
| number/percent 过滤器 | 格式 | 已接 |
| 精度/单位/千分位 | 目标 | 未齐 |
| themeCss | 目标 | 未接 |

## 4. 架构

- [`extras/rest.ts`](../../../../packages/vamis/src/extras/rest.ts) → `StaticValue`。
- [`tpl`](tpl.md)/formula 过滤器：number/percent。

## 5. 样式

- 同 StaticValue；无 `<style>`；深色/窄屏单独核。

## 6. 缺口

精度/单位/千分位组件属性、themeCss、深色。

## 7. 验收

- 值/空/过滤器/错误值；未接不误标。

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

格式能力统一到 formula/numeral 工具，不在 Number 复制。

---

返回 [组件设计索引](../README.md)
