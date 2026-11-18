# Image 图片 · `image` 设计

> 状态：**进行中 90%** · 复杂度：**L 重**
> 文档：[在线 API 手册](/components/image) · Amis：`/zh-CN/components/image`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

Image 是**缩略图 + 预览/放大**组件：src/name、标题/说明、thumbMode/Ratio、宽高、imageMode original、enlargeAble、originalSrc、href、clickAction、toolbar/zoom。主路径成熟；缺口 CRUD 图集、hoverMode、themeCss。

## 1. 边界与优先级（先读）

1. **src 优先级**：src/name 插值；无 src 显示 placeholder/defaultSrc；isPlaceholder 不启用放大。
2. **thumb**：thumbMode/ratio/宽高；h-stretch 吃满父级；original 模式不裁切。
3. **放大**：enlargeAble && !href 才启用；originalSrc 优先；工具栏/缩放/关闭；图集 galleryItems。
4. **点击**：href 优先；clickAction 在无 href 时执行；事件 click/mouseenter/mouseleave；prevented 不执行 action。
5. **安全**：src 仅允许可信 URL；dataURL/外部图由宿主决定；放大层黑底白字不跟深色换肤。
6. **包边界**：无 `<style>`、无 fetch；image token。

### 边界用例

- 空/placeholder/src/href/原图不同
- thumbMode/ratio/宽高/h-stretch/original
- enlargeAble/工具栏/缩放/关闭/图集
- clickAction 阻止、disabled/static-image
- 深色/窄屏/大图

### 优先级

1. src/placeholder/thumb；2. 放大/图集；3. href/clickAction/事件；4. 样式。

## 2. 复杂度

- 等级：**L 重**（Amis 798 行；Vamis 212 行）；依赖 overlay/action。
- 风险：放大层/图集/点击优先级。

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| src/name/defaultSrc/placeholder | 图源 | 已接 |
| thumbMode/thumbRatio/width/height | 缩略图 | 已接 |
| enlargeAble/originalSrc/toolbar/zoom | 放大 | 已接 |
| href/clickAction/事件 | 点击 | 已接，可阻止 |
| enlargeWithGallary/hoverMode/themeCss | 目标 | 未接 |

## 4. 架构

- [`Image.vue`](../../../packages/vamis/src/renderers/Image.vue)：src/thumb/enlarge/gallery/click。
- [`image.ts`](../../../packages/vamis-core/src/utils/image.ts)：src/尺寸/thumb/toolbar。
- [`ImageGallery.vue`](../../../packages/vamis/src/overlay/ImageGallery.vue)：放大层。

## 5. 样式

- 缩略图/放大层/工具栏 token；无 `<style>`；深色/窄屏单独核。

## 6. 缺口

CRUD enlargeWithGallary、hoverMode、themeCss、深色/窄屏。

## 7. 验收

- src/placeholder/thumb/放大/图集/href/clickAction/窄屏；未接不误标。

## 8. 后续

补 hoverMode/themeCss/图集；保持放大层深色策略。

---

返回 [组件设计索引](README.md)
