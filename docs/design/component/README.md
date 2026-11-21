# 组件设计文档

> 2026-11-18 生成：以 Amis 6.13.0 源码、Vamis `register.ts`/渲染器、组件 TODO 为输入；每篇含复杂度、Amis 契约、Vamis 设计、规范约束、现状与验证。自动盘点之外的设计取舍由组件负责人补充。

## 设计文档标准（2026-11-18）

所有组件文档采用同一结构：**边界与优先级 → 复杂度 → Amis 契约 → Vamis 实现 → 样式与边界 → 当前状态 → 验收计划 → 后续**。

- **边界优先**：行身份、事件时序、数据域、状态顺序、包边界、测量/浮层等 P0 项写在最前；先过边界再谈属性。
- **契约可追溯**：Amis 入口源码、依赖、文档章节、Vamis 渲染器/注册文件必须可点。
- **验收分层**：功能清单与工程清单分开；未核对项必须保留 `[ ]`，不能用实现百分比代替验收。
- **完成状态**：155 篇组件设计文档（另有 CollapseGroup 配套篇）均已按标准展开；文件按功能分目录：`layout/`（布局）、`functional/`（功能）、`form/`（数据输入）、`display/`（数据展示）、`feedback/`（反馈）、`other/`（其他）。
- **样板**：[Table 设计](display/table.md) 已完成首轮核对（功能 13/15、工程 4/8）。

> 本索引的复杂度统计是源码盘点，不是功能验收；组件进度以 [组件 P0 TODO](../../superpowers/specs/2026-10-20-vamis-component-todo.md) 为准。

## 复杂度口径

- 共 **155** 项，等级统计如下（与 TODO「实现复杂度评估」一致）：

| 等级 | 组件数 | 占比 |
|---|---:|---:|
| S 轻 | 7 | 4.5% |
| M 中 | 60 | 38.7% |
| L 重 | 40 | 25.8% |
| XL 特重 | 48 | 31.0% |
| **合计** | **155** | **100%** |

分类分布：

| 分类 | S 轻 | M 中 | L 重 | XL 特重 | 合计 |
|---|---:|---:|---:|---:|---:|
| 布局 | 0 | 8 | 5 | 2 | 15 |
| 功能 | 0 | 3 | 5 | 4 | 12 |
| 数据输入 | 1 | 22 | 20 | 29 | 72 |
| 数据展示 | 4 | 24 | 6 | 10 | 44 |
| 反馈 | 0 | 2 | 1 | 2 | 5 |
| 其他 | 2 | 1 | 3 | 1 | 7 |
| **合计** | **7** | **60** | **40** | **48** | **155** |

- **S 轻**：Amis 源码 ≤120 行、无依赖或单依赖、无数据域/浮层/API 集成；多为纯展示叶子。
- **M 中**：Amis 源码 120–399 行，或 2–4 个依赖，或有 form/data/api/overlay 单一集成。
- **L 重**：Amis 源码 400–799 行，或 ≥5 个依赖，或 Amis 250+ 且带数据域/浮层；含地图/图表/树等外设。
- **XL 特重**：Amis 源码 ≥800 行，或 ≥8 个依赖，或表单/表格/CRUD/页面/编辑器等枢纽组件。

Amis LOC 是 `@Renderer`/`@FormItem`/`OptionsControl` 入口文件行数（不含 Amis UI 内部实现）；依赖数取 TODO 全量顺序表；集成面从源码实际 import/调用检测。Vamis LOC 只作实现现状参考，不用来降级复杂度。

## 规范基线

- `@vamis/ui` 不依赖 core；渲染器默认皮肤与 chrome 图标归 `@vamis/ui`，渲染器不带 `<style>`。
- 表单：`FormItem` + `formContext`；数据域：`useData`/`useScoped`；网络：`requestApi(env)`；浮层：`VamisOverlay`/`PopOverHost`；图标：`resolveIcon`。
- 样式照 [样式规范](../../superpowers/specs/2026-11-15-vamis-style-standard.md)：token 只引用，选择器不写死字号/色号；作者值才走 `:style`。

## 分类目录

| 目录 | 文件 | 篇数 |
|---|---|---:|
| [布局](layout/README.md) | `layout/` | 16 |
| [功能](functional/README.md) | `functional/` | 12 |
| [数据输入](form/README.md) | `form/` | 72 |
| [数据展示](display/README.md) | `display/` | 44 |
| [反馈](feedback/README.md) | `feedback/` | 5 |
| [其他](other/README.md) | `other/` | 7 |

## 索引

### 布局

- [Page 页面](layout/page.md) — `page` · XL 特重 · 95%
- [Container 容器](layout/container.md) — `container` · L 重 · 100%
- [Collapse 折叠器](layout/collapse.md) — `collapse` · L 重 · 70%
- [CollapseGroup 折叠组](layout/collapse-group.md) — `collapse-group` · L 重 · 70%
- [Divider 分割线](layout/divider.md) — `divider` · M 中 · 65%
- [Flex 布局](layout/flex.md) — `flex` · M 中 · 65%
- [Grid 水平分栏](layout/grid.md) — `grid` · L 重 · 65%
- [Grid 2D 布局](layout/grid-2d.md) — `grid-2d` · M 中 · 65%
- [HBox 布局](layout/hbox.md) — `hbox` · M 中 · 65%
- [Pagination 分页](layout/pagination.md) — `pagination` · M 中 · 92%
- [PaginationWrapper 分页容器](layout/pagination-wrapper.md) — `pagination-wrapper` · M 中 · 65%
- [Panel 面板](layout/panel.md) — `panel` · L 重 · 65%
- [Tabs 选项卡](layout/tabs.md) — `tabs` · XL 特重 · 95%
- [Wrapper 包裹容器](layout/wrapper.md) — `wrapper` · M 中 · 65%
- [Portlet 门户栏目](layout/portlet.md) — `portlet` · L 重 · 65%
- [switch-container 状态容器](layout/switch-container.md) — `switch-container` · M 中 · 65%

### 功能

- [Action 行为按钮](functional/action.md) — `action` · XL 特重 · 95%
- [App 多页应用](functional/app.md) — `app` · L 重 · 55%
- [Button 按钮](functional/button.md) — `button` · XL 特重 · 96%
- [ButtonGroup 按钮组](functional/button-group.md) — `button-group` · M 中 · 92%
- [Breadcrumb 面包屑](functional/breadcrumb.md) — `breadcrumb` · M 中 · 65%
- [Custom 自定义组件](functional/custom.md) — `custom` · M 中 · 15%
- [DropDownButton 下拉按钮](functional/dropdown-button.md) — `dropdown-button` · L 重 · 88%
- [Service 功能型容器](functional/service.md) — `service` · XL 特重 · 70%
- [Nav 导航](functional/nav.md) — `nav` · XL 特重 · 55%
- [AnchorNav 锚点导航](functional/anchor-nav.md) — `anchor-nav` · L 重 · 55%
- [TooltipWrapper 文字提示容器](functional/tooltip.md) — `tooltip-wrapper` · L 重 · 92%
- [PopOver 弹出提示](functional/popover.md) — `popOver` · L 重 · 90%

### 数据输入

- [Form 表单](form/form.md) — `form` · XL 特重 · 75%
- [FormItem 表单项通用](form/formitem.md) — `formitem` · XL 特重 · 90%
- [Control 表单项包裹](form/control.md) — `control` · S 轻 · 40%
- [Options 选择器表单项](form/options.md) — `options` · XL 特重 · 89%
- [InputArray 数组输入框](form/input-array.md) — `input-array` · M 中 · 50%
- [ButtonToolbar 按钮工具栏](form/button-toolbar.md) — `button-toolbar` · M 中 · 60%
- [ButtonGroupSelect 按钮点选](form/button-group-select.md) — `button-group-select` · M 中 · 55%
- [ChainedSelect 链式下拉框](form/chain-select.md) — `chained-select` · L 重 · 50%
- [Checkbox 勾选框](form/checkbox.md) — `checkbox` · L 重 · 90%
- [Checkboxes 复选框](form/checkboxes.md) — `checkboxes` · L 重 · 55%
- [InputCity 城市选择器](form/input-city.md) — `input-city` · L 重 · 25%
- [InputColor 颜色选择器](form/input-color.md) — `input-color` · M 中 · 50%
- [Combo 组合](form/combo.md) — `combo` · XL 特重 · 55%
- [ConditionBuilder 条件组合](form/condition-builder.md) — `condition-builder` · XL 特重 · 35%
- [InputDate 日期选择器](form/input-date.md) — `input-date` · XL 特重 · 92%
- [InputDatetime 日期时间](form/input-datetime.md) — `input-datetime` · XL 特重 · 62%
- [InputMonth 月份选择器](form/input-month.md) — `input-month` · XL 特重 · 45%
- [InputDateRange 日期范围](form/input-date-range.md) — `input-date-range` · L 重 · 90%
- [InputDatetimeRange 日期时间范围](form/input-datetime-range.md) — `input-datetime-range` · L 重 · 45%
- [InputMonthRange 月份范围](form/input-month-range.md) — `input-month-range` · M 中 · 45%
- [InputKV 键值对](form/input-kv.md) — `input-kv` · XL 特重 · 50%
- [InputKVS 键值对象](form/input-kvs.md) — `input-kvs` · XL 特重 · 45%
- [InputFormula 公式编辑器](form/input-formula.md) — `input-formula` · L 重 · 30%
- [DiffEditor 对比编辑器](form/diff-editor.md) — `diff-editor` · XL 特重 · 65%
- [Editor 代码编辑器](form/editor.md) — `editor` · XL 特重 · 85%
- [FieldSet 表单项集合](form/fieldset.md) — `fieldset` · M 中 · 55%
- [InputExcel Excel 解析](form/input-excel.md) — `input-excel` · XL 特重 · 20%
- [InputFile 文件上传](form/input-file.md) — `input-file` · XL 特重 · 88%
- [Formula 公式](form/formula.md) — `formula` · M 中 · 65%
- [Group 表单项组](form/group.md) — `group` · M 中 · 75%
- [Hidden 隐藏字段](form/hidden.md) — `hidden` · M 中 · 100%
- [InputImage 图片](form/input-image.md) — `input-image` · XL 特重 · 80%
- [InputGroup 输入框组合](form/input-group.md) — `input-group` · M 中 · 55%
- [ListSelect 选择器](form/list-select.md) — `list-select` · M 中 · 50%
- [LocationPicker 地理位置](form/location-picker.md) — `location-picker` · L 重 · 25%
- [UUID 随机 ID](form/uuid.md) — `uuid` · M 中 · 70%
- [MatrixCheckboxes 矩阵勾选](form/matrix-checkboxes.md) — `matrix-checkboxes` · L 重 · 40%
- [NestedSelect 级联选择器](form/nestedselect.md) — `nested-select` · XL 特重 · 45%
- [InputNumber 数字输入](form/input-number.md) — `input-number` · L 重 · 88%
- [InputPassword 密码](form/input-password.md) — `input-password` · XL 特重 · 90%
- [Picker 列表选择器](form/picker.md) — `picker` · XL 特重 · 65%
- [InputQuarter 季度](form/input-quarter.md) — `input-quarter` · XL 特重 · 45%
- [InputQuarterRange 季度范围](form/input-quarter-range.md) — `input-quarter-range` · M 中 · 45%
- [Radio 单选框](form/radio.md) — `radio` · M 中 · 88%
- [Radios 单选框](form/radios.md) — `radios` · L 重 · 55%
- [ChartRadios 图表单选框](form/chart-radios.md) — `chart-radios` · L 重 · 35%
- [InputRating 评分](form/input-rating.md) — `input-rating` · M 中 · 55%
- [InputRange 滑块](form/input-range.md) — `input-range` · XL 特重 · 50%
- [InputRepeat 重复频率](form/input-repeat.md) — `input-repeat` · M 中 · 40%
- [InputRichText 富文本](form/input-rich-text.md) — `input-rich-text` · XL 特重 · 25%
- [Select 下拉框](form/select.md) — `select` · XL 特重 · 95%
- [InputSubForm 子表单](form/input-sub-form.md) — `input-sub-form` · L 重 · 45%
- [Switch 开关](form/switch.md) — `switch` · M 中 · 88%
- [Static 静态展示](form/static.md) — `static` · M 中 · 85%
- [InputTable 表格](form/input-table.md) — `input-table` · XL 特重 · 45%
- [InputTag 标签选择器](form/input-tag.md) — `input-tag` · L 重 · 50%
- [InputText 输入框](form/input-text.md) — `input-text` · XL 特重 · 92%
- [Textarea 多行输入框](form/textarea.md) — `textarea` · L 重 · 85%
- [InputTime 时间](form/input-time.md) — `input-time` · XL 特重 · 60%
- [InputTimeRange 时间范围](form/input-time-range.md) — `input-time-range` · L 重 · 45%
- [Transfer 穿梭器](form/transfer.md) — `transfer` · XL 特重 · 65%
- [TransferPicker 穿梭选择器](form/transfer-picker.md) — `transfer-picker` · L 重 · 45%
- [TabsTransfer 组合穿梭器](form/tabs-transfer.md) — `tabs-transfer` · L 重 · 40%
- [TabsTransferPicker](form/tabs-transfer-picker.md) — `tabs-transfer-picker` · L 重 · 35%
- [InputTree 树形选择框](form/input-tree.md) — `input-tree` · XL 特重 · 78%
- [TreeSelect 树形选择器](form/treeselect.md) — `tree-select` · XL 特重 · 78%
- [InputYear 年输入](form/input-year.md) — `input-year` · XL 特重 · 45%
- [InputYearRange 年份范围](form/input-year-range.md) — `input-year-range` · M 中 · 45%
- [JsonSchema](form/json-schema.md) — `json-schema` · L 重 · 30%
- [JsonSchema Editor](form/json-schema-editor.md) — `json-schema-editor` · M 中 · 30%
- [InputSignature 签名面板](form/input-signature.md) — `input-signature` · M 中 · 35%
- [InputVerificationCode 验证码](form/input-verification-code.md) — `input-verification-code` · M 中 · 50%

### 数据展示

- [CRUD 增删改查](display/crud.md) — `crud` · XL 特重 · 65%
- [Table 表格](display/table.md) — `table` · XL 特重 · 88%
- [Table2 表格](display/table2.md) — `table2` · XL 特重 · 70%
- [Table View 表格视图](display/table-view.md) — `table-view` · M 中 · 65%
- [Calendar 日历日程](display/calendar.md) — `calendar` · M 中 · 88%
- [Card 卡片](display/card.md) — `card` · XL 特重 · 70%
- [Cards 卡片组](display/cards.md) — `cards` · XL 特重 · 70%
- [Carousel 轮播图](display/carousel.md) — `carousel` · XL 特重 · 45%
- [Chart 图表](display/chart.md) — `chart` · XL 特重 · 65%
- [Code 代码高亮](display/code.md) — `code` · M 中 · 92%
- [Color 颜色](display/color.md) — `color` · S 轻 · 50%
- [Date 日期时间](display/date.md) — `date` · M 中 · 60%
- [Each 循环渲染器](display/each.md) — `each` · M 中 · 90%
- [Html](display/html.md) — `html` · L 重 · 90%
- [Icon 图标](display/icon.md) — `icon` · M 中 · 90%
- [iFrame](display/iframe.md) — `iframe` · M 中 · 55%
- [Image 图片](display/image.md) — `image` · L 重 · 90%
- [Images 图片集](display/images.md) — `images` · XL 特重 · 50%
- [GridNav 宫格导航](display/grid-nav.md) — `grid-nav` · M 中 · 50%
- [Json](display/json.md) — `json` · M 中 · 50%
- [Link 链接](display/link.md) — `link` · M 中 · 85%
- [List 列表](display/list.md) — `list` · XL 特重 · 90%
- [Log 实时日志](display/log.md) — `log` · L 重 · 25%
- [Mapping 映射](display/mapping.md) — `mapping` · M 中 · 85%
- [Number 展示](display/number.md) — `number` · M 中 · 60%
- [Markdown 渲染](display/markdown.md) — `markdown` · M 中 · 45%
- [OfficeViewer Word 渲染](display/office-viewer.md) — `office-viewer` · M 中 · 10%
- [OfficeViewer Excel 渲染](display/office-viewer-excel.md) — `office-viewer` · M 中 · 10%
- [PDFViewer 渲染](display/pdf-viewer.md) — `pdf-viewer` · M 中 · 10%
- [Progress 进度条](display/progress.md) — `progress` · L 重 · 85%
- [Steps 步骤条](display/steps.md) — `steps` · L 重 · 55%
- [Property 属性表](display/property.md) — `property` · M 中 · 50%
- [QRCode 二维码](display/qrcode.md) — `qrcode` · M 中 · 45%
- [BarCode 条形码](display/barcode.md) — `barcode` · S 轻 · 45%
- [Remark 标记](display/remark.md) — `remark` · M 中 · 92%
- [SearchBox 搜索框](display/search-box.md) — `search-box` · M 中 · 50%
- [Sparkline 走势图](display/sparkline.md) — `sparkline` · M 中 · 45%
- [Status 状态](display/status.md) — `status` · M 中 · 75%
- [Tpl 模板](display/tpl.md) — `tpl` · L 重 · 92%
- [Tag 标签](display/tag.md) — `tag` · M 中 · 90%
- [Video 视频](display/video.md) — `video` · XL 特重 · 45%
- [Timeline 时间轴](display/timeline.md) — `timeline` · M 中 · 50%
- [Shape 形状](display/shape.md) — `shape` · S 轻 · 40%
- [Slider 滑动条](display/slider.md) — `slider` · S 轻 · 45%

### 反馈

- [Alert 提示](feedback/alert.md) — `alert` · M 中 · 60%
- [Dialog 对话框](feedback/dialog.md) — `dialog` · XL 特重 · 100%
- [Drawer 抽屉](feedback/drawer.md) — `drawer` · XL 特重 · 88%
- [Spinner 加载中](feedback/spinner.md) — `spinner` · M 中 · 100%
- [Toast 轻提示](feedback/toast.md) — `toast` · L 重 · 100%

### 其他

- [Avatar 头像](other/avatar.md) — `avatar` · M 中 · 90%
- [Audio 音频](other/audio.md) — `audio` · L 重 · 50%
- [Tasks 任务操作集合](other/tasks.md) — `tasks` · L 重 · 45%
- [Badge 角标](other/badge.md) — `badge` · L 重 · 95%
- [Wizard 向导](other/wizard.md) — `wizard` · XL 特重 · 50%
- [Web Component](other/web-component.md) — `web-component` · S 轻 · 35%
- [amis 渲染器](other/amis.md) — `amis` · S 轻 · 40%

