# InputFile 文件上传 · `input-file` 设计

> 状态：**进行中 92%** · 复杂度：**L 重**
> 文档：[在线 API 手册](/components/form/input-file) · Amis：`/zh-CN/components/form/input-file`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

InputFile 是**上传管线**（938 行）：receiver POST、autoUpload、多选、asBlob/asBase64、accept/maxSize/maxLength、拖拽、分片 start/chunk/finish、change/success/fail/remove、clear。主路径成熟；提交等待 pending 上传已接；缺口 themeCss、深色 / 窄屏专项。

## 1. 边界与优先级（先读）

1. **选择/校验**：accept/maxSize/maxLength；非法文件不加入；错误提示。
2. **上传管线**：receiver POST form-data；autoUpload false 需手动；分片 start/chunk/finish；失败保留 item/错误。
3. **值**：joinValues/multiple/asBlob/asBase64/extractValue；上传成功写 url/value。
4. **拖拽**：drag 才接收；拖拽态/leave 清理。
5. **提交**：pending 上传未完成时自动开传并等待，失败阻止提交。
6. **包边界**：无 `<style>`、无 fetch 直接调用（receiver 走 requestApi）；file token。

### 边界用例

- 空/单/多/非法类型/超 size/超数量
- autoUpload true/false、分片成功/失败、删除/重试
- asBlob/asBase64/joinValues/extractValue
- 拖拽进入/离开/放下；提交 pending
- 窄屏/深色

### 优先级

1. 选择/校验；2. 上传/分片；3. 值/拖拽；4. 提交/样式。

## 2. 复杂度

- 等级：**L 重**（Amis 1657 行；Vamis 938 行）；依赖 input-image/requestApi。
- 风险：上传状态/分片/值形态。

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| receiver/autoUpload | 上传 | 已接 |
| accept/maxSize/maxLength | 校验 | 已接 |
| multiple/asBlob/asBase64 | 值 | 已接 |
| 分片 start/chunk/finish | 大文件 | 已接 |
| 拖拽/删除/重试 | 交互 | 已接 |
| pending 提交 | 自动开传、等待完成、失败阻止 | 已接 |
| themeCss | 皮肤变量 | 未接 |

## 4. 架构

- [`form/InputFile.vue`](../../../../packages/vamis/src/renderers/form/InputFile.vue)：选择/上传/分片/值/拖拽。
- [`input-file.ts`](../../../../packages/vamis-core/src/utils/input-file.ts)：accept/size/值/分片。
- [`FormItem.vue`](../../../../packages/vamis/src/renderers/FormItem.vue)：label/校验。

## 5. 样式

- file list/上传按钮/错误/拖拽 token；无 `<style>`；窄屏/深色单独核。

## 6. 缺口

themeCss、深色窄屏；外部独立 validate 动作仍只做同步规则校验。

## 7. 验收

- 选择/校验/上传/分片/值/拖拽/删除/窄屏；缺口不误标。

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

补 themeCss/深色；独立 validate 动作若需等待上传另做异步动作契约。

---

返回 [组件设计索引](../README.md)
