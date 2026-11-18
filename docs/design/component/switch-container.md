# SwitchContainer 状态容器 · `switch-container` 设计

> 状态：**进行中 65%** · 复杂度：**M 中**
> 文档：[在线 API 手册](/components/switch-container) · Amis：`/zh-CN/components/switch-container`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

SwitchContainer 当前是**按 visibleOn 选首个 items 渲染**（25 行）：无动画/切换动作/状态缓存；65% 是真实缺口。

## 1. 边界与优先级（先读）

1. **items**：数组；switchContainerActive 返回首个 visibleOn 命中；无命中 body 空。
2. **数据域**：visibleOn 基于当前 data；data 变化重新选择。
3. **body**：active.body 渲染；空不画。
4. **switchTo 动作**：未接；当前只靠数据域驱动。
5. **包边界**：无 `<style>`、无 fetch；container token。

### 边界用例

- 空/单/多 items、无命中、多个命中
- data 变化切换、空 body
- switchTo 动作（未接）
- 窄屏/深色

### 优先级

1. items/visibleOn；2. body/数据；3. 动画/动作；4. 样式。

## 2. 复杂度

- 等级：**M 中**（Amis 200 行；Vamis 25 行）；依赖 container。
- 风险：visibleOn 解析/动作缺口。

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| items[].body | 内容 | 已接 |
| visibleOn | 选择 | 已接 |
| style | 样式 | 透传 |
| switchTo 动作 | 目标 | 未接 |

## 4. 架构

- [`layout/SwitchContainer.vue`](../../../packages/vamis/src/renderers/layout/SwitchContainer.vue)：active/body。
- [`switch-container.ts`](../../../packages/vamis-core/src/utils/switch-container.ts)：active/body。

## 5. 样式

- 容器 w-full；无 `<style>`；窄屏/深色单独核。

## 6. 缺口

switchTo 动作/动画/深色。

## 7. 验收

- items/visibleOn/无命中/空 body/窄屏；未接不误标。

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

补 switchTo 动作（需 scoped API）；动画/深色后置。

---

返回 [组件设计索引](README.md)
