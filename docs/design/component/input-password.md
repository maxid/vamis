# InputPassword 密码 · `input-password` 设计

> 状态：**进行中 90%** · 复杂度：**XL 特重**
> 文档：[在线 API 手册](/components/form/input-password) · Amis：`/zh-CN/components/form/input-password`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

InputPassword **没有独立渲染器**：注册表把它作为 `input-text` 的别名，实际行为在 `InputText.vue`（原生 `type: password` + `review/encrypt` 显隐）。因此设计/修复必须改 InputText，不要把密码逻辑复制成新组件。

## 1. 边界与优先级（先读）

### 1.1 P0 不可破坏边界

1. **别名映射**：`register.ts` 把 `input-password` 映射到 `InputText`；组件 API/外观/事件与 input-text 一致。
2. **密码类型**：原生 input type=password；`revealPassword: false` 时无显隐按钮；默认有。
3. **显隐事件**：切换明文触发 `review`，切回触发 `encrypt`；事件被 prevented 时不切换。
4. **值**：仍是字符串；trim/transform/clearValueOnEmpty 与 input-text 共用；不要把密码特殊化存储。
5. **安全**：不在日志/事件 payload 之外暴露密码；展示端不默认 raw。
6. **包边界**：无 `<style>`、无 fetch；输入/按钮 token 由 InputText/UI。

### 1.2 边界用例

- 空值/初始值/disabled/readOnly/static
- revealPassword true/false、review/encrypt 阻止
- 表单提交/校验/trim
- 浏览器密码管理器/自动填充
- 窄屏/深色/错误态

### 1.3 优先级

1. 别名/类型/reveal
2. 显隐事件/值
3. 安全/自动填充
4. 样式/无障碍

## 2. 复杂度

- 等级：**XL 特重**（Amis 复用 InputText 1387 行；Vamis 复用 InputText 656 行，无独立文件）
- 依赖：`InputText`、`FormItem`
- 风险：改密码却去新建组件，会和 input-text 分叉

## 3. Amis 契约

| 属性 | 语义 | 现状（InputText） |
|---|---|---|
| `name` / `value` | 字段 | 已接 |
| `revealPassword` | 显隐按钮 | 已接 |
| `review` / `encrypt` 事件 | 显隐 | 已接 |
| 普通 input-text 属性 | 继承 | 已接 |
| `themeCss` | 皮肤 | 未接 |

### 事件/动作

与 input-text 相同：change/focus/blur/click/enter/review/encrypt；动作 clear/reset/focus/reload/setValue。

## 4. 架构

- [`register.ts`](../../../packages/vamis/src/register.ts) 别名 → [`form/InputText.vue`](../../../packages/vamis/src/renderers/form/InputText.vue)。
- [`input-text.ts`](../../../packages/vamis-core/src/utils/input-text.ts)：`showPasswordReveal` / transform / empty 等。
- [`FormItem.vue`](../../../packages/vamis/src/renderers/FormItem.vue)：label/校验/状态。

### 数据流

```text
input type=password → reveal 切换 text/password
review/encrypt 事件 → prevented? stop → 切换
值仍走 InputText 的 fieldApi.setValue
```

## 5. 样式与边界

- 显隐按钮/输入框走 InputText/UI token；无 `<style>`。
- 深色图标、窄屏按钮、错误态单独核。
- 作者 className 只落节点。

## 6. 当前状态与缺口

- 已接：别名、password 类型、revealPassword、review/encrypt、input-text 全部主路径。
- 缺口：themeCss、深色/无障碍细节、密码管理器/自动填充的浏览器差异。
- 对照：TODO 90%；本轮未重跑。

## 7. 验收计划与完成度

### 验收清单（文档核对：3 / 12）

- [x] Amis 入口 / 文档章节已定位
- [x] register 别名 / InputText 已定位
- [x] 复杂度、依赖、集成面已盘点
- [ ] schema 属性 / 默认值逐项核对
- [ ] 事件 / 动作逐项核对
- [ ] 边界用例逐项核对
- [ ] 组件页活示例运行、无 console error
- [ ] `pnpm test`（InputPassword/InputText 相关）
- [ ] `pnpm typecheck` 0
- [ ] `pnpm compare --page input-password` 桌面
- [ ] `pnpm compare --page input-password --mobile`
- [ ] 深色 / 375px 窄屏

### 验收重点

- 别名确实走 InputText
- reveal/review/encrypt
- 值/trim/校验
- 安全/自动填充

## 8. 后续

1. 改密码行为只改 InputText/共享工具。
2. themeCss/深色/无障碍专项。
3. 不新增独立 InputPassword.vue。

---

返回 [组件设计索引](README.md)
