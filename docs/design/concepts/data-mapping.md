# 数据映射设计

> 状态：**已完成** · 对应站点：`/concepts/data-mapping` · 源码：[website/src/concepts/data-mapping.md](../../../website/src/concepts/data-mapping.md)

## 0. 设计结论

Data Mapping 页解决**接口/字典/字段值 → 组件消费值**的转换。设计核心是 `source` / `map` / `valueField` / `labelField` 的优先级与数组/对象形态，不是教 AJAX。

## 1. 边界与优先级

1. **映射优先级**：本地 `map` > `source` 变量 > 远程字典；空值保留 placeholder。
2. **形态**：k-v、单 key 对象数组、多 key 对象数组；匹配先精确后字符串。
3. **字段**：`valueField` / `labelField` 决定对象数组；缺省 value/label。
4. **多值**：数组按多值映射，不把数组字符串化成一个 key。
5. **远程**：source API 失败不覆盖旧值；30s 缓存是待实现项。
6. **安全**：映射出的 HTML 只信作者配置。

## 2. 内容契约

- 必须给三种 map 形态各一个可运行例子。
- 远程 source 示例要说明 loading/失败/空字典。
- 多值 + placeholder + 未知值三态要表格化。
- 与 Mapping 组件、Select options 的边界互链。

## 3. 实现

- [Mapping 组件](../../../packages/vamis/src/renderers/Mapping.vue)：map/source/label/itemSchema。
- [data-mapping.ts](../../../packages/vamis-core/src/utils/data-mapping.ts)：映射匹配。
- [options.ts](../../../packages/vamis-core/src/utils/options.ts)：选择器映射。

## 4. 缺口

- `source` 30s 缓存未单实现。
- 多 key 对象数组的冲突策略未文档化。

## 5. 验收清单（文档核对：3 / 12）

- [x] map 三形态/source 边界已盘点
- [x] Mapping/映射工具已定位
- [ ] 三形态示例可运行
- [ ] 远程失败/空字典示例可复现
- [ ] 多值/未知值/placeholder 表格核对
- [ ] 与 Select/Mapping 组件互链
- [ ] 桌面/移动/深色可读
