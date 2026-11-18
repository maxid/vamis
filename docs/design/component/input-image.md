# InputImage 图片上传 · `input-image` 设计

> 状态：**进行中 80%** · 复杂度：**L 重**
> 文档：[在线 API 手册](/components/form/input-image) · Amis：`/zh-CN/components/form/input-image`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

InputImage **没有独立渲染器**：`InputFile.vue` 通过 `type: input-image` 切换图片模式；复用上传管线、缩略图、拖拽排序、limit/fixedSize/crop 等。80% 是真实缺口（crop/预览画廊未接）。

## 1. 边界与优先级（先读）

1. **共享 InputFile**：改图片模式只改 InputFile/工具；不要复制上传。
2. **图片专用**：accept/capture/frameImage/fixedSize/limit、缩略图 120、拖拽排序。
3. **值**：同 InputFile（url/value/多选/asBase64）；图片预览用 displaySrc。
4. **上传**：receiver/autoUpload/手动上传/hideUploadButton；pending 提交未接。
5. **crop/allowInput/画廊**：未接；不要按裁剪/预览画廊验收。
6. **包边界**：无 `<style>`、无直接 fetch；image token。

### 边界用例

- 空/单/多图/非法类型/超 size/limit
- 手动上传/隐藏按钮/拖拽排序/删除
- crop/allowInput/画廊（未接）
- 窄屏/深色

### 优先级

1. 共享/值；2. 上传/缩略图；3. 拖拽/limit；4. crop/画廊。

## 2. 复杂度

- 等级：**L 重**（Amis 2187 行；Vamis 复用 InputFile 938 行）；依赖 input-file/image。
- 风险：图片模式分支/crop。

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| multiple/joinValues | 值 | 继承 InputFile |
| accept/capture/frameImage/fixedSize | 图片 | 已接 |
| limit/autoUpload/拖拽 | 交互 | 已接 |
| crop/allowInput/画廊 | 目标 | 未接 |

## 4. 架构

- [`form/InputFile.vue`](../../../packages/vamis/src/renderers/form/InputFile.vue)：imageMode 分支。
- [`image`](image.md)：预览组件（非上传）。
- [`FormItem.vue`](../../../packages/vamis/src/renderers/FormItem.vue)：label/校验。

## 5. 样式

- 缩略图/上传按钮/拖拽 token；无 `<style>`；窄屏/深色单独核。

## 6. 缺口

crop 系列/allowInput/画廊；themeCss/深色。

## 7. 验收

- 单/多/上传/拖拽/limit/窄屏；crop 未接不误标。

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

crop/画廊单独立项；保持上传复用。

---

返回 [组件设计索引](README.md)
