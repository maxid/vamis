# Panel 面板 · `panel` 设计

> 状态：**进行中 65%** · 复杂度：**L 重**
> 文档：[在线 API 手册](/components/panel) · Amis：`/zh-CN/components/panel`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

Panel 当前是**带标题/体/脚/操作的面板**（99 行）：title/header、body、footer、actions、collapsible、affixFooter、区域 className。没有 themeCss/色档/移动端 Panel--form 专项；65% 是真实缺口。

## 1. 边界与优先级（先读）

1. **区域**：header（优先）或 title、body、footer-warp（actions+footer）、affixFooter。
2. **折叠**：collapsible 才显示箭头；折叠只隐藏 body/footer，不隐藏 header。
3. **showBody/showHeading**：schema 控制；空 body 不画空壳。
4. **title**：字符串模板或 SchemaNode；header 存在时 title 不画。
5. **区域 className**：header/body/footer/actions/footerWrap 各自作用，不互相污染。
6. **包边界**：无 `<style>`、无 fetch；panel token。

### 边界用例

- 空 title/header/body/footer/actions
- collapsible/affixFooter
- title SchemaNode/模板/空标题
- 区域 class/嵌套面板
- 窄屏/深色/Panel--form（未接）

### 优先级

1. 区域/折叠；2. 标题/空态；3. affix/class；4. 移动/深色。

## 2. 复杂度

- 等级：**L 重**（Amis 435 行；Vamis 99 行）；依赖 container/action/tpl。
- 风险：区域组合/折叠状态。

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| `title` / `header` | 标题 | 已接 |
| `body` / `footer` / `actions` | 区域 | 已接 |
| `collapsible` | 折叠 | 已接 |
| `affixFooter` | 底栏固定 | 已接 |
| 区域 className | 样式 | 已接 |
| themeCss/移动 Panel--form | 目标 | 未接 |

## 4. 架构

- [`Panel.vue`](../../../../packages/vamis/src/renderers/Panel.vue)：header/title/body/footer/actions/collapse。
- [`panel.ts`](../../../../packages/vamis-core/src/utils/panel.ts)：区域/显示/折叠纯函数。
- [`SchemaRenderer`](../../../../packages/vamis-core/src/SchemaRenderer.vue)：子 schema。

## 5. 样式

- panel heading/body/footer/actions token；无 `<style>`；窄屏/深色单独核。

## 6. 缺口

themeCss、色档、移动端 Panel--form、深色逐项。

## 7. 验收

- 区域/折叠/affix/空态/嵌套/窄屏；未接不误标。

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

补 themeCss/移动 Panel；色档与深色单独核。

---

返回 [组件设计索引](../README.md)
