# 组件设计文档

> 2026-11-18 生成：以 Amis 6.13.0 源码、Vamis `register.ts`/渲染器、组件 TODO 为输入；每篇含复杂度、Amis 契约、Vamis 设计、规范约束、现状与验证。自动盘点之外的设计取舍由组件负责人补充。

## 设计文档标准（2026-11-18）

所有组件文档采用同一结构：**边界与优先级 → 复杂度 → Amis 契约 → Vamis 实现 → 样式与边界 → 当前状态 → 验收计划 → 后续**。

- **边界优先**：行身份、事件时序、数据域、状态顺序、包边界、测量/浮层等 P0 项写在最前；先过边界再谈属性。
- **契约可追溯**：Amis 入口源码、依赖、文档章节、Vamis 渲染器/注册文件必须可点。
- **验收分层**：功能清单与工程清单分开；未核对项必须保留 `[ ]`，不能用实现百分比代替验收。
- **样板**：[Table 设计](table.md) 已完成首轮核对（功能 13/15、工程 4/8）。
- **已深化**：[Form](form.md)、[CRUD](crud.md)、[Action](action.md)、[Select](select.md)、[InputText](input-text.md)、[InputDate](input-date.md)、[Picker](picker.md)、[Transfer](transfer.md)、[InputTree](input-tree.md)、[Combo](combo.md)、[Table2](table2.md)、[Dialog](dialog.md)、[Drawer](drawer.md)、[Service](service.md)、[Cards](cards.md)、[Card](card.md)、[Wizard](wizard.md)、[InputTable](input-table.md)、[Chart](chart.md)、[ConditionBuilder](condition-builder.md)、[InputArray](input-array.md)、[List](list.md)、[InputSubForm](input-sub-form.md)、[MatrixCheckboxes](matrix-checkboxes.md)、[NestedSelect](nestedselect.md)、[Editor](editor.md)、[DiffEditor](diff-editor.md)、[InputKV](input-kv.md)、[InputCity](input-city.md)、[InputRichText](input-rich-text.md)、[LocationPicker](location-picker.md)、[InputExcel](input-excel.md)、[Checkbox](checkbox.md)、[Checkboxes](checkboxes.md)、[Radio](radio.md)、[InputRange](input-range.md)、[InputTag](input-tag.md)、[InputRating](input-rating.md)、[InputNumber](input-number.md)、[InputPassword](input-password.md)、[InputDateRange](input-date-range.md)、[InputDatetime](input-datetime.md)、[InputMonth](input-month.md)、[InputMonthRange](input-month-range.md)、[InputYear](input-year.md)、[InputQuarter](input-quarter.md)、[InputYearRange](input-year-range.md)、[InputQuarterRange](input-quarter-range.md)、[InputTimeRange](input-time-range.md)、[InputDatetimeRange](input-datetime-range.md)、[TabsTransfer](tabs-transfer.md)、[TabsTransferPicker](tabs-transfer-picker.md)、[InputRepeat](input-repeat.md)、[InputSignature](input-signature.md)、[InputVerificationCode](input-verification-code.md)、[JsonSchema](json-schema.md)、[JsonSchemaEditor](json-schema-editor.md)、[ListSelect](list-select.md)、[ChainedSelect](chain-select.md)、[TableView](table-view.md)、[InputGroup](input-group.md)、[InputKVS](input-kvs.md)、[ButtonGroupSelect](button-group-select.md)、[ChartRadios](chart-radios.md)、[InputColor](input-color.md)、[Steps](steps.md)、[Status](status.md)、[Timeline](timeline.md)、[Pagination](pagination.md)、[PaginationWrapper](pagination-wrapper.md)、[Container](container.md)、[Grid](grid.md)、[Panel](panel.md)、[Page](page.md)、[Flex](flex.md)、[HBox](hbox.md)、[Grid2D](grid-2d.md)、[Wrapper](wrapper.md)、[Divider](divider.md)、[Collapse](collapse.md)、[CollapseGroup](collapse-group.md)、[AnchorNav](anchor-nav.md)、[SwitchContainer](switch-container.md)、[App](app.md)、[Nav](nav.md)、[Portlet](portlet.md)、[Mapping](mapping.md)、[Link](link.md)、[Tpl](tpl.md)、[Html](html.md)、[Markdown](markdown.md)、[Code](code.md)、[Property](property.md)、[Json](json.md)、[Log](log.md)、[Image](image.md)、[Images](images.md)、[IFrame](iframe.md)、[Audio](audio.md)、[Video](video.md)、[Each](each.md)、[SearchBox](search-box.md)、[QRCode](qrcode.md)、[BarCode](barcode.md)、[Alert](alert.md)、[Spinner](spinner.md)、[Tooltip](tooltip.md)、[Remark](remark.md)、[PopOver](popover.md)、[Tasks](tasks.md)、[Avatar](avatar.md)、[Breadcrumb](breadcrumb.md)、[Table](table.md)、[Progress](progress.md)、[Badge](badge.md)、[Button](button.md)、[ButtonGroup](button-group.md)、[ButtonToolbar](button-toolbar.md)、[Tabs](tabs.md)、[Tag](tag.md)、[Radios](radios.md)、[Switch](switch.md)、[Textarea](textarea.md)、[Static](static.md)、[InputFile](input-file.md)、[InputImage](input-image.md)、[Calendar](calendar.md)、[FormItem](formitem.md)、[Options](options.md)、[Formula](formula.md)、[InputFormula](input-formula.md)、[Toast](toast.md)、[Number](number.md)、[Slider](slider.md)、[Date](date.md)、[InputTime](input-time.md)、[Control](control.md)、[Hidden](hidden.md)、[Fieldset](fieldset.md)、[Group](group.md) 已按边界/契约/状态机/验收结构展开；其余 16 篇完成边界优先结构统一，验收清单为 3/12 的**文档定位核对**，功能/对照/深色仍需按实现刀逐项勾。

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

## 索引

### 布局

- [Page 页面](page.md) — `page` · XL 特重 · 95%
- [Container 容器](container.md) — `container` · L 重 · 100%
- [Collapse 折叠器](collapse.md) — `collapse` · L 重 · 70%
- [Divider 分割线](divider.md) — `divider` · M 中 · 65%
- [Flex 布局](flex.md) — `flex` · M 中 · 65%
- [Grid 水平分栏](grid.md) — `grid` · L 重 · 65%
- [Grid 2D 布局](grid-2d.md) — `grid-2d` · M 中 · 65%
- [HBox 布局](hbox.md) — `hbox` · M 中 · 65%
- [Pagination 分页](pagination.md) — `pagination` · M 中 · 92%
- [PaginationWrapper 分页容器](pagination-wrapper.md) — `pagination-wrapper` · M 中 · 65%
- [Panel 面板](panel.md) — `panel` · L 重 · 65%
- [Tabs 选项卡](tabs.md) — `tabs` · XL 特重 · 95%
- [Wrapper 包裹容器](wrapper.md) — `wrapper` · M 中 · 65%
- [Portlet 门户栏目](portlet.md) — `portlet` · L 重 · 65%
- [switch-container 状态容器](switch-container.md) — `switch-container` · M 中 · 65%

### 功能

- [Action 行为按钮](action.md) — `action` · XL 特重 · 95%
- [App 多页应用](app.md) — `app` · L 重 · 55%
- [Button 按钮](button.md) — `button` · XL 特重 · 96%
- [ButtonGroup 按钮组](button-group.md) — `button-group` · M 中 · 92%
- [Breadcrumb 面包屑](breadcrumb.md) — `breadcrumb` · M 中 · 65%
- [Custom 自定义组件](custom.md) — `custom` · M 中 · 15%
- [DropDownButton 下拉按钮](dropdown-button.md) — `dropdown-button` · L 重 · 88%
- [Service 功能型容器](service.md) — `service` · XL 特重 · 70%
- [Nav 导航](nav.md) — `nav` · XL 特重 · 55%
- [AnchorNav 锚点导航](anchor-nav.md) — `anchor-nav` · L 重 · 55%
- [TooltipWrapper 文字提示容器](tooltip.md) — `tooltip-wrapper` · L 重 · 92%
- [PopOver 弹出提示](popover.md) — `popOver` · L 重 · 90%

### 数据输入

- [Form 表单](form.md) — `form` · XL 特重 · 75%
- [FormItem 表单项通用](formitem.md) — `formitem` · XL 特重 · 90%
- [Control 表单项包裹](control.md) — `control` · S 轻 · 40%
- [Options 选择器表单项](options.md) — `options` · XL 特重 · 88%
- [InputArray 数组输入框](input-array.md) — `input-array` · M 中 · 50%
- [ButtonToolbar 按钮工具栏](button-toolbar.md) — `button-toolbar` · M 中 · 60%
- [ButtonGroupSelect 按钮点选](button-group-select.md) — `button-group-select` · M 中 · 55%
- [ChainedSelect 链式下拉框](chain-select.md) — `chained-select` · L 重 · 50%
- [Checkbox 勾选框](checkbox.md) — `checkbox` · L 重 · 90%
- [Checkboxes 复选框](checkboxes.md) — `checkboxes` · L 重 · 55%
- [InputCity 城市选择器](input-city.md) — `input-city` · L 重 · 25%
- [InputColor 颜色选择器](input-color.md) — `input-color` · M 中 · 50%
- [Combo 组合](combo.md) — `combo` · XL 特重 · 55%
- [ConditionBuilder 条件组合](condition-builder.md) — `condition-builder` · XL 特重 · 35%
- [InputDate 日期选择器](input-date.md) — `input-date` · XL 特重 · 92%
- [InputDatetime 日期时间](input-datetime.md) — `input-datetime` · XL 特重 · 62%
- [InputMonth 月份选择器](input-month.md) — `input-month` · XL 特重 · 45%
- [InputDateRange 日期范围](input-date-range.md) — `input-date-range` · L 重 · 90%
- [InputDatetimeRange 日期时间范围](input-datetime-range.md) — `input-datetime-range` · L 重 · 45%
- [InputMonthRange 月份范围](input-month-range.md) — `input-month-range` · M 中 · 45%
- [InputKV 键值对](input-kv.md) — `input-kv` · XL 特重 · 50%
- [InputKVS 键值对象](input-kvs.md) — `input-kvs` · XL 特重 · 45%
- [InputFormula 公式编辑器](input-formula.md) — `input-formula` · L 重 · 30%
- [DiffEditor 对比编辑器](diff-editor.md) — `diff-editor` · XL 特重 · 65%
- [Editor 代码编辑器](editor.md) — `editor` · XL 特重 · 85%
- [FieldSet 表单项集合](fieldset.md) — `fieldset` · M 中 · 55%
- [InputExcel Excel 解析](input-excel.md) — `input-excel` · XL 特重 · 20%
- [InputFile 文件上传](input-file.md) — `input-file` · XL 特重 · 88%
- [Formula 公式](formula.md) — `formula` · M 中 · 65%
- [Group 表单项组](group.md) — `group` · M 中 · 75%
- [Hidden 隐藏字段](hidden.md) — `hidden` · M 中 · 100%
- [InputImage 图片](input-image.md) — `input-image` · XL 特重 · 80%
- [InputGroup 输入框组合](input-group.md) — `input-group` · M 中 · 55%
- [ListSelect 选择器](list-select.md) — `list-select` · M 中 · 50%
- [LocationPicker 地理位置](location-picker.md) — `location-picker` · L 重 · 25%
- [UUID 随机 ID](uuid.md) — `uuid` · M 中 · 70%
- [MatrixCheckboxes 矩阵勾选](matrix-checkboxes.md) — `matrix-checkboxes` · L 重 · 40%
- [NestedSelect 级联选择器](nestedselect.md) — `nested-select` · XL 特重 · 45%
- [InputNumber 数字输入](input-number.md) — `input-number` · L 重 · 88%
- [InputPassword 密码](input-password.md) — `input-password` · XL 特重 · 90%
- [Picker 列表选择器](picker.md) — `picker` · XL 特重 · 65%
- [InputQuarter 季度](input-quarter.md) — `input-quarter` · XL 特重 · 45%
- [InputQuarterRange 季度范围](input-quarter-range.md) — `input-quarter-range` · M 中 · 45%
- [Radio 单选框](radio.md) — `radio` · M 中 · 88%
- [Radios 单选框](radios.md) — `radios` · L 重 · 55%
- [ChartRadios 图表单选框](chart-radios.md) — `chart-radios` · L 重 · 35%
- [InputRating 评分](input-rating.md) — `input-rating` · M 中 · 55%
- [InputRange 滑块](input-range.md) — `input-range` · XL 特重 · 50%
- [InputRepeat 重复频率](input-repeat.md) — `input-repeat` · M 中 · 40%
- [InputRichText 富文本](input-rich-text.md) — `input-rich-text` · XL 特重 · 25%
- [Select 下拉框](select.md) — `select` · XL 特重 · 92%
- [InputSubForm 子表单](input-sub-form.md) — `input-sub-form` · L 重 · 45%
- [Switch 开关](switch.md) — `switch` · M 中 · 88%
- [Static 静态展示](static.md) — `static` · M 中 · 85%
- [InputTable 表格](input-table.md) — `input-table` · XL 特重 · 45%
- [InputTag 标签选择器](input-tag.md) — `input-tag` · L 重 · 50%
- [InputText 输入框](input-text.md) — `input-text` · XL 特重 · 92%
- [Textarea 多行输入框](textarea.md) — `textarea` · L 重 · 85%
- [InputTime 时间](input-time.md) — `input-time` · XL 特重 · 60%
- [InputTimeRange 时间范围](input-time-range.md) — `input-time-range` · L 重 · 45%
- [Transfer 穿梭器](transfer.md) — `transfer` · XL 特重 · 65%
- [TransferPicker 穿梭选择器](transfer-picker.md) — `transfer-picker` · L 重 · 45%
- [TabsTransfer 组合穿梭器](tabs-transfer.md) — `tabs-transfer` · L 重 · 40%
- [TabsTransferPicker](tabs-transfer-picker.md) — `tabs-transfer-picker` · L 重 · 35%
- [InputTree 树形选择框](input-tree.md) — `input-tree` · XL 特重 · 78%
- [TreeSelect 树形选择器](treeselect.md) — `tree-select` · XL 特重 · 78%
- [InputYear 年输入](input-year.md) — `input-year` · XL 特重 · 45%
- [InputYearRange 年份范围](input-year-range.md) — `input-year-range` · M 中 · 45%
- [JsonSchema](json-schema.md) — `json-schema` · L 重 · 30%
- [JsonSchema Editor](json-schema-editor.md) — `json-schema-editor` · M 中 · 30%
- [InputSignature 签名面板](input-signature.md) — `input-signature` · M 中 · 35%
- [InputVerificationCode 验证码](input-verification-code.md) — `input-verification-code` · M 中 · 50%

### 数据展示

- [CRUD 增删改查](crud.md) — `crud` · XL 特重 · 65%
- [Table 表格](table.md) — `table` · XL 特重 · 88%
- [Table2 表格](table2.md) — `table2` · XL 特重 · 70%
- [Table View 表格视图](table-view.md) — `table-view` · M 中 · 65%
- [Calendar 日历日程](calendar.md) — `calendar` · M 中 · 88%
- [Card 卡片](card.md) — `card` · XL 特重 · 70%
- [Cards 卡片组](cards.md) — `cards` · XL 特重 · 70%
- [Carousel 轮播图](carousel.md) — `carousel` · XL 特重 · 45%
- [Chart 图表](chart.md) — `chart` · XL 特重 · 65%
- [Code 代码高亮](code.md) — `code` · M 中 · 92%
- [Color 颜色](color.md) — `color` · S 轻 · 50%
- [Date 日期时间](date.md) — `date` · M 中 · 60%
- [Each 循环渲染器](each.md) — `each` · M 中 · 90%
- [Html](html.md) — `html` · L 重 · 90%
- [Icon 图标](icon.md) — `icon` · M 中 · 90%
- [iFrame](iframe.md) — `iframe` · M 中 · 55%
- [Image 图片](image.md) — `image` · L 重 · 90%
- [Images 图片集](images.md) — `images` · XL 特重 · 50%
- [GridNav 宫格导航](grid-nav.md) — `grid-nav` · M 中 · 50%
- [Json](json.md) — `json` · M 中 · 50%
- [Link 链接](link.md) — `link` · M 中 · 85%
- [List 列表](list.md) — `list` · XL 特重 · 90%
- [Log 实时日志](log.md) — `log` · L 重 · 25%
- [Mapping 映射](mapping.md) — `mapping` · M 中 · 85%
- [Number 展示](number.md) — `number` · M 中 · 60%
- [Markdown 渲染](markdown.md) — `markdown` · M 中 · 45%
- [OfficeViewer Word 渲染](office-viewer.md) — `office-viewer` · M 中 · 10%
- [OfficeViewer Excel 渲染](office-viewer-excel.md) — `office-viewer` · M 中 · 10%
- [PDFViewer 渲染](pdf-viewer.md) — `pdf-viewer` · M 中 · 10%
- [Progress 进度条](progress.md) — `progress` · L 重 · 85%
- [Steps 步骤条](steps.md) — `steps` · L 重 · 55%
- [Property 属性表](property.md) — `property` · M 中 · 50%
- [QRCode 二维码](qrcode.md) — `qrcode` · M 中 · 45%
- [BarCode 条形码](barcode.md) — `barcode` · S 轻 · 45%
- [Remark 标记](remark.md) — `remark` · M 中 · 92%
- [SearchBox 搜索框](search-box.md) — `search-box` · M 中 · 50%
- [Sparkline 走势图](sparkline.md) — `sparkline` · M 中 · 45%
- [Status 状态](status.md) — `status` · M 中 · 75%
- [Tpl 模板](tpl.md) — `tpl` · L 重 · 92%
- [Tag 标签](tag.md) — `tag` · M 中 · 90%
- [Video 视频](video.md) — `video` · XL 特重 · 45%
- [Timeline 时间轴](timeline.md) — `timeline` · M 中 · 50%
- [Shape 形状](shape.md) — `shape` · S 轻 · 40%
- [Slider 滑动条](slider.md) — `slider` · S 轻 · 45%

### 反馈

- [Alert 提示](alert.md) — `alert` · M 中 · 60%
- [Dialog 对话框](dialog.md) — `dialog` · XL 特重 · 88%
- [Drawer 抽屉](drawer.md) — `drawer` · XL 特重 · 88%
- [Spinner 加载中](spinner.md) — `spinner` · M 中 · 95%
- [Toast 轻提示](toast.md) — `toast` · L 重 · 100%

### 其他

- [Avatar 头像](avatar.md) — `avatar` · M 中 · 90%
- [Audio 音频](audio.md) — `audio` · L 重 · 50%
- [Tasks 任务操作集合](tasks.md) — `tasks` · L 重 · 45%
- [Badge 角标](badge.md) — `badge` · L 重 · 95%
- [Wizard 向导](wizard.md) — `wizard` · XL 特重 · 50%
- [Web Component](web-component.md) — `web-component` · S 轻 · 35%
- [amis 渲染器](amis.md) — `amis` · S 轻 · 40%

