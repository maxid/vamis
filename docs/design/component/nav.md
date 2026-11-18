# Nav 导航 · `nav` 设计

> 状态：**进行中 55%** · 复杂度：**M 中**
> 文档：[在线 API 手册](/components/nav) · Amis：`/zh-CN/components/nav`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

Nav 当前是**多级导航列表**（80 行）：links/source、stacked/横排、children 展开、active/disabled、icon。没有 overflow/缩起/搜索；55% 是真实缺口。

## 1. 边界与优先级（先读）

1. **links/source**：navLinks 归一；children 递归。
2. **展开**：opened 记录用户展开；默认用 link.unfolded；父节点点击只 toggle。
3. **跳转**：叶子 link.to 走 env.jumpTo；disabled 不响应。
4. **图标**：iconSrc/iconClass；URL 用 img，class 用 i。
5. **包边界**：无 `<style>`、无 fetch；nav token。

### 边界用例

- 空 links/单层/多级/disabled/active
- source 变量、图标 URL/class、stacked/横排
- 窄屏/深色
- overflow/缩起/搜索（未接）

### 优先级

1. 链接/展开；2. 跳转/图标；3. 布局/响应式；4. overflow。

## 2. 复杂度

- 等级：**M 中**（Amis 1688 行；Vamis 80 行）；依赖 icon/action/tpl/link/badge。
- 风险：多级展开/跳转。

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| links/source | 导航 | 已接 |
| children/unfolded | 多级 | 已接 |
| stacked | 布局 | 已接 |
| icon/active/disabled | 状态 | 已接 |
| overflow/搜索 | 目标 | 未接 |

## 4. 架构

- [`Nav.vue`](../../../packages/vamis/src/renderers/Nav.vue)：links/rows/opened/onClick。
- [`nav.ts`](../../../packages/vamis-core/src/utils/nav.ts)：navLinks/stacked。
- [`IconMark`](../../../packages/vamis/src/renderers/IconMark.vue)：图标。

## 5. 样式

- nav 项/缩进/横排；无 `<style>`；窄屏/深色单独核。

## 6. 缺口

overflow/缩起/搜索/深色/键盘。

## 7. 验收

- 多级/展开/跳转/disabled/图标/布局/窄屏；未接不误标。

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

先做 overflow/缩起，再做搜索；深色/键盘后置。

---

返回 [组件设计索引](README.md)
