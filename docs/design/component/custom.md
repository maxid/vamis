# Custom 自定义 · `custom` 设计

> 状态：**进行中 15%** · 复杂度：**S 轻**
> 文档：[在线 API 手册](/components/custom) · Amis：`/zh-CN/components/custom`
> 盘点日期：2026-11-18。本文是研发设计文档。

## 0. 一页结论

Custom 当前是**HTML/body 二选一容器**（14 行）：schema.html 走 v-html，否则 SchemaRenderer body。没有 JS 渲染/生命周期/回调；15% 是精简占位。

## 1. 边界与优先级（先读）

1. **html/body**：html 优先 v-html；否则 body。
2. **信任边界**：html 是作者可信内容；不要把用户输入 raw。
3. **无 JS**：没有 render/onMount 自定义函数；不要按 Amis custom 验收。
4. **包边界**：无 `<style>`、无 fetch。

### 边界用例

- html/body/空/不可信 html
- 嵌套 schema/窄屏/深色

## 2. 复杂度

- 等级：**S 轻**（Amis 235 行；Vamis 14 行）。

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| html | HTML | 已接 |
| body | schema | 已接 |
| JS 渲染/回调 | 目标 | 未接 |

## 4. 架构

- `rest/Custom.vue`：html/body。

## 5. 缺口

JS 渲染/生命周期/安全沙箱（非目标）。

## 6. 验收

- html/body/空/信任边界；不按 JS 自定义验收。

## 7. 后续

保持精简；JS 自定义需安全单独立项。

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
