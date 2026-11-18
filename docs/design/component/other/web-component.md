# WebComponent 自定义元素 · `web-component` 设计

> 状态：**进行中 35%** · 复杂度：**S 轻**
> 文档：[在线 API 手册](/components/web-component) · Amis：`/zh-CN/components/web-component`
> 盘点日期：2026-11-18。本文是研发设计文档。

## 0. 一页结论

WebComponent 当前是**动态标签 + attrs + body**（34 行）：tag 白名单、props 转 attribute、SchemaRenderer body。没有 slot 映射/事件桥接/生命周期；35% 是精简。

## 1. 边界与优先级（先读）

1. **tag**：webComponentTag；非法/空要有兜底。
2. **props**：null/false 跳过，true 空串，其他 String；不要传对象属性。
3. **body**：webComponentBody；子 schema。
4. **事件/生命周期**：未接；不要按自定义元素事件桥接验收。
5. **包边界**：无 `<style>`、无 fetch。

### 边界用例

- 空/tag/props/body/非法 tag
- 自定义元素未注册/属性类型
- 事件/生命周期（未接）
- 窄屏/深色

## 2. 复杂度

- 等级：**S 轻**（Amis 71 行；Vamis 34 行）。

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| tag/props/body | 元素 | 已接 |
| 事件/生命周期 | 目标 | 未接 |

## 4. 架构

- `rest/WebComponent.vue`：tag/attrs/body。
- `web-component.ts`：tag/props/body。

## 5. 缺口

事件桥接/生命周期/slot。

## 6. 验收

- tag/props/body/非法/窄屏；未接不误标。

## 7. 后续

事件桥接单独立项；保持 attrs/body。

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

返回 [组件设计索引](../README.md)
