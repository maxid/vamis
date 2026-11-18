# DropdownButton 下拉按钮 · `dropdown-button` 设计

> 状态：**进行中 88%** · 复杂度：**L 重**
> 文档：[在线 API 手册](/components/dropdown-button) · Amis：`/zh-CN/components/dropdown-button`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

DropdownButton 是**按钮 + 下拉菜单**（251 行）：items、trigger、align、label/icon/rightIcon、hideCaret/showLabel、closeOnClick/outside、tooltip、mobile menu、菜单项 Action。主路径成熟；缺口 themeCss/深色。

## 1. 边界与优先级（先读）

1. **items**：dropdownButtonItems；菜单项继承 Action；空菜单不打开。
2. **触发**：click/hover；open/defaultIsOpened；外部关闭/closeOnClick。
3. **定位**：align right/left；VamisOverlay；菜单宽度取 root 宽度。
4. **外观**：label/icon/rightIcon/hideCaret/showLabel；tooltip。
5. **移动**：overlayIsMobile → 底部菜单。
6. **包边界**：无 `<style>`、无 fetch；dropdown token。

### 边界用例

- 空/单/多菜单/click/hover/defaultOpen
- align/宽度/closeOnClick/outside
- label/icon/caret/tooltip/mobile
- 禁用/窄屏/深色

### 优先级

1. items/触发；2. 定位/关闭；3. 外观/移动；4. 样式。

## 2. 复杂度

- 等级：**L 重**（Amis 608 行；Vamis 251 行）；依赖 action/overlay。
- 风险：触发/关闭/移动菜单。

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| items | 菜单 | 已接 |
| click/hover/defaultOpen | 触发 | 已接 |
| align/closeOnClick/outside | 定位/关闭 | 已接 |
| label/icon/tooltip | 外观 | 已接 |
| themeCss/深色 | 目标 | 未接 |

## 4. 架构

- `rest/DropdownButton.vue`：items/trigger/overlay/tooltip/menu。
- `dropdown-button.ts`：items/trigger/align/label。
- `VamisOverlay`：菜单。

## 5. 样式

- 按钮/菜单/箭头 token；无 `<style>`；窄屏/深色单独核。

## 6. 缺口

themeCss/深色逐项；菜单项皮肤。

## 7. 验收

- 触发/对齐/关闭/移动/外观/禁用/窄屏；未接不误标。

## 8. 后续

themeCss/深色随主题；菜单项复用 Action 不复制。

---

返回 [组件设计索引](README.md)
