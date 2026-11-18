# LocationPicker 地理位置 · `location-picker` 设计

> 状态：**进行中 25%** · 复杂度：**L 重**
> 文档：[在线 API 手册](/components/form/location-picker) · Amis：`/zh-CN/components/form/location-picker`
> 盘点日期：2026-11-18。本文是研发设计文档；完整属性表以在线文档为准。

## 0. 一页结论

LocationPicker 当前是**三个输入框**（地址/经度/纬度），没有地图、选点、逆地理、搜索。25% 是精简实现；需要地图能力时必须单独立项（依赖/密钥/安全）。

## 1. 边界与优先级（先读）

### 1.1 P0 不可破坏边界

1. **值格式**：对象 `{address,lng,lat}`；旧字符串值只填 address，lng/lat 空；无 name 不写。
2. **字符串输入**：lng/lat 保持字符串，不擅自转 number（避免精度/空值问题）。
3. **无地图**：不加载地图 SDK、不选点、不逆地理；不要按 Amis 地图交互验收。
4. **包边界**：无 `<style>`、无 fetch；Input/token 由 UI 提供。

### 1.2 边界用例

- 空值 / 字符串 / 对象 / 缺 lng/lat
- 非法经纬度字符串
- disabled/static、FormItem 校验
- 外部 setValue/reset
- 窄屏三列换行/深色
- 地图/搜索/逆地理（非目标）

### 1.3 优先级

1. 值格式/三字段写回
2. 精度/非法值/校验边界
3. 若接地图：SDK/密钥/选点/逆地理独立立项
4. 样式/窄屏

## 2. 复杂度

- 等级：**L 重**（Amis 216 行；Vamis 29 行）
- 依赖：`FormItem`、`input-text`
- 风险：容易被误认为地图选点组件

## 3. Amis 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| `name` / `value` | `{address,lng,lat}` | 已接 |
| `ak` / 地图 SDK | 地图 | **非目标，未接** |
| 地址搜索/逆地理 | 地图 | **非目标，未接** |
| 字段名自定义 | 目标 | 未接 |
| 事件/动作 | 目标 | 未接 |

## 4. 架构

- [`LocationPicker.vue`](../../../packages/vamis/src/renderers/form/LocationPicker.vue)：loc 计算属性 + 三个 Input。
- [`FormItem.vue`](../../../packages/vamis/src/renderers/FormItem.vue)：label/校验/状态。
- 地图若引入，必须独立组件/异步 SDK，不塞进 29 行文件。

## 5. 缺口/非目标

地图/选点/逆地理/地址搜索/密钥；字段名自定义/事件动作。

## 6. 验收

- 值格式/字符串兼容/非法值/disabled/窄屏深色。
- 不测试地图行为。
- 经纬度精度与格式需明确（字符串）。

## 7. 后续

保持精简，或单独立项地图选点；先定 SDK/密钥/隐私边界。

---

返回 [组件设计索引](README.md)
