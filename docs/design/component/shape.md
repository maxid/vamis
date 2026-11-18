# Shape 图形 · `shape` 设计

> 状态：**进行中 35%** · 复杂度：**S 轻**
> 文档：[在线 API 手册](/components/shape) · Amis：`/zh-CN/components/shape`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

Shape 当前是**方形/圆/三角形 SVG**（15 行）：shapeType/shape、width/height、currentColor。没有边框/旋转/自定义路径/动画；35% 是精简。

## 1. 边界与优先级（先读）

1. **kind**：circle/triangle/其它 square；未知回落 square。
2. **尺寸**：width/height 默认 48；viewBox 48。
3. **颜色**：currentColor，由父级文字色决定。
4. **包边界**：无 `<style>`、无 fetch。

### 边界用例

- 三形状/未知/宽高/颜色
- 深色/窄屏

## 2. 复杂度

- 等级：**S 轻**（Amis 92 行；Vamis 15 行）。

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| shapeType/shape | 形状 | 已接 |
| width/height | 尺寸 | 已接 |
| 自定义路径/边框 | 目标 | 未接 |

## 4. 架构

- `rest/Shape.vue`：kind/svg。

## 5. 缺口

自定义路径/边框/旋转/动画。

## 6. 验收

- 三形状/尺寸/颜色/深色。

## 7. 后续

自定义路径按需扩展；保持 currentColor。

---

返回 [组件设计索引](README.md)
