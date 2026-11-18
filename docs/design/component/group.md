# Group 表单项组 · `group` 设计

> 状态：**进行中 75%** · 复杂度：**M 中**
> 文档：[在线 API 手册](/components/form/group) · Amis：`/zh-CN/components/form/group`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

Group 当前是**表单项横向/纵向分组**（43 行）：body/controls、direction、columnRatio 12 等分、mode 继承。缺 gap 档/组标签；75% 是真实缺口。

## 1. 边界与优先级（先读）

1. **方向**：vertical 竖排；hor 横排，列等分/gutter。
2. **columnRatio**：1–12 → flex/max-width/width；未写不输出样式。
3. **子项**：groupChildSchema 继承 mode；formLayoutSkipCol 直接渲染（不分列）。
4. **包边界**：无 `<style>`、无 fetch；form-group token。

### 边界用例

- 空/单/多子项/vertical/hor
- columnRatio 1/8/12/非法/混合
- 子项 skip col/mode 继承
- 窄屏/深色

### 优先级

1. 方向/列；2. columnRatio；3. 子项/mode；4. 样式。

## 2. 复杂度

- 等级：**M 中**（Amis 277 行；Vamis 43 行）；依赖 FormItem。
- 风险：列比例/窄屏 gutter。

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| body/controls | 子项 | 已接 |
| direction | 方向 | 已接 |
| columnRatio | 12 等分 | 已接 |
| gap/组标签 | 目标 | 未接 |

## 4. 架构

- `form/Group.vue`：body/vertical/ratio/child。
- `form-group.ts`：child/mode/skip。

## 5. 样式

- form-group gutters/列 token；无 `<style>`；窄屏/深色单独核。

## 6. 缺口

gap 档/组标签/深色。

## 7. 验收

- 方向/比例/子项/窄屏；未接不误标。

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

gap/组标签最后补；保持 columnRatio 纯样式。

---

返回 [组件设计索引](README.md)
