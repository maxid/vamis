# Mapping 映射 · `mapping` 设计

> 状态：**进行中 85%** · 复杂度：**M 中**
> 文档：[在线 API 手册](/components/mapping) · Amis：`/zh-CN/components/mapping`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

Mapping 是**值 → 展示**的映射组件：map 支持 k-v、单 key 对象数组、多 key 对象数组；source 支持变量/远程字典；label 支持字符串/HTML/Schema；数组多值、tag/itemSchema、placeholder。主路径较完整；风险在映射来源优先级、HTML 信任边界与多值。

## 1. 边界与优先级（先读）

1. **值来源**：schema.value 或 data[name]；数组按多值匹配；空值 placeholder。
2. **map 形态**：k-v / `[{key,label}]` / 多 key 对象；valueField/labelField；匹配优先精确、再字符串。
3. **source**：变量映射或远程字典；远程失败保留空 map，不崩。
4. **label**：字符串模板 / HTML / SchemaNode；itemSchema 决定项渲染；tagFriendly 处理 tag。
5. **安全**：HTML/`.label-*` 是作者可信内容；不要把用户输入 raw 插入；普通模板默认转义。
6. **包边界**：无 `<style>`、无 fetch（source 走 requestApi）；styles token。

### 边界用例

- 空/单值/数组/布尔 1/0/未知值
- k-v/对象数组/多 key/重复 key
- source 变量/远程/失败；valueField/labelField
- label HTML/tag/Schema/itemSchema/多值
- 窄屏/深色/表格内 label

### 优先级

1. 值/匹配；2. map/source；3. label/HTML/tag；4. 多值/样式。

## 2. 复杂度

- 等级：**M 中**（Amis 362 行；Vamis 195 行）；依赖 tpl/tag。
- 风险：映射形态/多值/HTML 信任。

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| `map` | 三种形态 | 已接 |
| `source` | 变量/远程 | 已接 |
| valueField/labelField | 字段 | 已接 |
| label/itemSchema/tag | 展示 | 已接 |
| placeholder/多值 | 空/数组 | 已接 |
| 30s source 缓存 | 性能 | 未单实现 |

## 4. 架构

- [`Mapping.vue`](../../../../packages/vamis/src/renderers/Mapping.vue)：normalizeMap/source/match/label/schema。
- ``mapping.ts``：映射匹配/形态。
- [`Tpl`](tpl.md)/[`Tag`](tag.md)：label/html/tag 渲染。

## 5. 样式

- `.vamis-mapping`/`.label-*`/tag token；无 `<style>`；表格内/深色/窄屏单独核。

## 6. 缺口

30s source 缓存未单实现；深色/表格内 label 逐项；HTML 信任边界需保持。

## 7. 验收

- map 三形态/source/多值/html/tag/itemSchema/空值/窄屏；未接不误标。

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

补 source 缓存（如需）；保持 HTML 只给可信作者内容。

---

返回 [组件设计索引](../README.md)
