# API 类型设计

> 状态：**已完成 92%** · Amis 核对：类型主路径 + Vamis 源码 / 活示例 · 对应站点：`/types/api` · 源码：[website/src/types/api.md](../../../website/src/types/api.md)

## 0. 设计结论

API 类型页定义**唯一请求管线**：normalize → sendOn → requestAdaptor → cache → fetch → payload → adaptor → responseData，由 `env.fetcher` 发出。渲染器禁止自行 fetch。

## 1. 边界与优先级

1. **形态**：字符串 `[method:]url` 或对象；模板 URL。
2. **方法**：get/post/put/patch/delete；表单提交默认 post。
3. **返回**：`status/msg/data`；兼容错误码形态；无 status 时整体当 data。
4. **管线**：sendOn/cache/adaptor/responseData/replaceData/messages/dataType/GraphQL。
5. **GET 域**：initApi 不把整个数据域拼 query。
6. **安全**：不打印密钥；错误提示不泄露响应体。

## 2. 内容契约

- 先字符串后对象；方法/URL/参数表。
- 返回格式与错误形态表格化。
- 管线每阶段给可观察结果。
- P1（全局 adaptor/blob 下载）标未接。
- 与 concepts/data-mapping、concepts/event-action 互链。

## 3. 实现

- [api.ts](../../../packages/vamis-core/src/utils/api.ts)：requestApi/normalize/adaptor。
- [env.ts](../../../packages/vamis-core/src/env.ts)：fetcher。
- [action run](../../../packages/vamis-core/src/actions/run.ts)：ajax 动作。

## 4. 缺口

- 全局 `addApiRequestAdaptor` 未接；Blob 的 `Content-Disposition` 文件名解析已接。
- 错误对象结构未完全统一。

## 5. 验收清单（已核对）

- [x] 管线/形态/返回边界已盘点
- [x] requestApi/env/action 已定位
- [x] 字符串/对象配置可运行
- [x] 返回/错误形态逐项核对
- [x] 管线阶段示例可观察
- [x] GET 域拼接边界可复现
- [x] P1 缺口标注
