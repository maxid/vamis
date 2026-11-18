# Color 颜色展示 · `color` 设计

> 状态：**进行中 50%** · 复杂度：**S 轻**
> 文档：[在线 API 手册](/components/color) · Amis：`/zh-CN/components/color`
> 盘点日期：2026-11-18。本文是研发设计文档。

## 0. 一页结论

Color **没有独立渲染器**：注册到 `StaticValue`，按静态文本展示颜色值。没有色块/颜色预览/格式转换；50% 是真实缺口。

## 1. 边界与优先级（先读）

1. **别名**：color → StaticValue；值/模板继承。
2. **无预览**：只显示字符串，不画色块。
3. **格式**：HEX/rgb/hsl 原样显示；不校验。
4. **包边界**：无 `<style>`、无 fetch。

### 边界用例

- 空/HEX/rgb/hsl/非法/变量
- 深色/窄屏
- 色块预览（未接）

## 2. 复杂度

- 等级：**S 轻**（Amis 71 行；Vamis 复用 StaticValue）。

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| value/name | 颜色 | 继承 Static |
| 色块/预览 | 目标 | 未接 |

## 4. 架构

- `extras/rest.ts` → `StaticValue`。

## 5. 缺口

色块预览/格式校验。

## 6. 验收

- 值/空/格式/窄屏；不按取色器验收。

## 7. 后续

若需预览，复用 InputColor 色块；保持静态。

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

---

返回 [组件设计索引](README.md)
