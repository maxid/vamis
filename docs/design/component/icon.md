# Icon 图标 · `icon` 设计

> 状态：**进行中 90%** · 复杂度：**S 轻**
> 文档：[在线 API 手册](/components/icon) · Amis：`/zh-CN/components/icon`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

Icon 是**图标展示**：icon 字段经 filterTpl/resolveIcon，内置 SVG/Font Awesome/URL/缺失兜底；BadgeHost 可加角标。主路径成熟。

## 1. 边界与优先级（先读）

1. **icon**：字符串模板或对象；内置 SVG 优先，否则 resolveIcon。
2. **通道**：FA class 用 `<i>`、URL 用 `<img>`、内置 SVG 用 IconMark；不要 CSS mask。
3. **缺失**：显示“没有 icon”提示，不静默空白。
4. **包边界**：无 `<style>`、无 fetch；图标 token。

### 边界用例

- 内置/FA/URL/缺失/变量
- badge/尺寸/深色
- 非法 icon/空

## 2. 复杂度

- 等级：**S 轻**（Amis 129 行；Vamis 33 行）；依赖 icon 工具。

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| icon | 图标 | 已接 |
| badge | 角标 | 已接 |
| 缺失兜底 | 提示 | 已接 |

## 4. 架构

- [`Icon.vue`](../../../packages/vamis/src/renderers/Icon.vue)：resolved/IconMark。
- [`icon.ts`](../../../packages/vamis-core/src/utils/icon.ts)：resolveIcon/内置 SVG。

## 5. 缺口

图标字形覆盖/深色逐项。

## 6. 验收

- 内置/FA/URL/缺失/badge/深色。

## 7. 后续

随图标通道统一补；不各写判断。

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
