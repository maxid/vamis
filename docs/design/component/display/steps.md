# Steps 步骤条 · `steps` 设计

> 状态：**进行中 55%** · 复杂度：**L 重**
> 文档：[在线 API 手册](/components/steps) · Amis：`/zh-CN/components/steps`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

Steps 当前是**极简步骤条**（22 行）：steps/options + value/current，显示序号和标题，当前项高亮。没有完成/失败态、描述/图标、点击切换、垂直/横向布局、事件/动作；55% 是真实缺口。

## 1. 边界与优先级（先读）

1. **数据**：`steps` / `options` 数组；title/label 兜底；空数组不崩。
2. **当前步**：`value` / `current`，0-based；越界不应崩，当前无 clamp。
3. **状态**：只有 is-active；完成/错误/禁用态未接。
4. **交互**：无点击切换/事件；纯展示。
5. **包边界**：无 `<style>`、无 fetch；步骤条 token。

### 边界用例

- 空/单步/多步/越界 current/负值
- 标题缺失/模板/描述
- 点击/键盘（未接）
- 窄屏/深色/垂直布局（未接）

### 优先级

1. 数据/current；2. 状态/布局；3. 点击/事件；4. 样式。

## 2. 复杂度

- 等级：**L 重**（Amis 493 行；Vamis 22 行）；依赖 icon/tpl。
- 风险：当前只有基础展示。

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| `steps` / `options` | 步骤 | 已接 |
| `value` / `current` | 当前步 | 已接 |
| 完成/失败/描述/图标 | 目标 | 未接 |
| 点击切换/事件 | 目标 | 未接 |

## 4. 架构

- [`renderers/Steps.vue`](../../../../packages/vamis/src/renderers/Steps.vue)：steps/current + ol/li。
- [`styles.css`](../../../../packages/vamis-ui/src/styles.css)：steps token。

## 5. 样式

- 横向 ol/li；当前项高亮；无 `<style>`；窄屏/深色单独核。

## 6. 缺口

完成/失败态、描述/图标、垂直布局、点击/键盘、事件动作、越界 clamp。

## 7. 验收

- steps/current/空/越界/窄屏；未接不误标。

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

先补状态/描述/垂直布局，再做点击/事件；不要引入向导逻辑（Wizard 负责）。

---

返回 [组件设计索引](../README.md)
