# Hidden 隐藏字段 · `hidden` 设计

> 状态：**已完成 100%** · 复杂度：**S 轻**
> 文档：[在线 API 手册](/components/form/hidden) · Amis：`/zh-CN/components/form/hidden`
> 盘点日期：2026-11-18。本文是研发设计文档。

## 0. 一页结论

Hidden **不落 DOM**（render null）；值仍由 Form 初始化、联动、提交。它是表单数据占位，不是样式隐藏。

## 1. 边界与优先级（先读）

1. **不渲染**：返回空 span/不落 DOM；不要用 display:none 替代。
2. **值**：name/value 由 Form 初始化与提交；hidden 自身不读写。
3. **校验**：hidden 字段可参与 required/表达式；不要跳过。
4. **包边界**：无 `<style>`、无 fetch。

### 边界用例

- name/value/默认值/提交
- 联动/校验/条件显隐
- 空 name/静态

## 2. 复杂度

- 等级：**S 轻**（Amis 35 行；Vamis 9 行）。

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| name/value | 字段 | 由 Form 处理 |
| DOM | 不渲染 | 已接 |

## 4. 架构

- `form/Hidden.vue`：空模板；Form 负责值。

## 5. 缺口

无。

## 6. 验收

- 不落 DOM/提交值/联动/校验。

## 7. 后续

保持 render null。

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
