# Breadcrumb 面包屑 · `breadcrumb` 设计

> 状态：**进行中 65%** · 复杂度：**M 中**
> 文档：[在线 API 手册](/components/breadcrumb) · Amis：`/zh-CN/components/breadcrumb`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 1. 一页结论

Breadcrumb 当前是**扁平面包屑**（93 行）：items、separator、label 截断、icon、href 跳转、dropdown 菜单。没有折叠/路由联动/分隔符 Schema；65% 是真实缺口。

## 1. 边界与优先级（先读）

1. **items**：数组；最后一项不可点击；空不崩。
2. **label**：breadcrumbDisplayLabel 截断+title；maxLength。
3. **链接**：href 走 env.jumpTo；dropdown 项也可跳；disabled 未接。
4. **图标**：iconSrc/iconClass；分隔符字符串。
5. **包边界**：无 `<style>`、无 fetch；breadcrumb token。

### 边界用例

- 空/单/多/最后一项/href/dropdown
- label 截断/maxLength/分隔符/icon
- 窄屏/深色

### 优先级

1. items/链接；2. label/截断；3. dropdown/图标；4. 样式。

## 2. 复杂度

- 等级：**M 中**（Amis 168 行；Vamis 93 行）；依赖 icon。
- 风险：截断/最后一项/dropdown。

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| items | 路径 | 已接 |
| separator/maxLength | 展示 | 已接 |
| href/dropdown | 跳转 | 已接 |
| 折叠/路由联动 | 目标 | 未接 |

## 4. 架构

- [`Breadcrumb.vue`](../../../packages/vamis/src/renderers/Breadcrumb.vue)：items/display/go/dropdown。
- [`breadcrumb.ts`](../../../packages/vamis-core/src/utils/breadcrumb.ts)：items/label/separator/display。

## 5. 样式

- 面包屑/分隔符/dropdown token；无 `<style>`；窄屏/深色单独核。

## 6. 缺口

折叠/路由联动/disabled/深色。

## 7. 验收

- items/链接/截断/dropdown/窄屏；未接不误标。

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

先做折叠，再做路由联动；保持最后一项不可点。

---

返回 [组件设计索引](README.md)
