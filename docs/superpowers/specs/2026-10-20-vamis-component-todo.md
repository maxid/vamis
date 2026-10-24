# Vamis 组件 P0 TODO（amis 文档对齐）

- 日期：2026-10-21
- 状态：对照清单（随实现更新进度，不改分类）
- 优先级：**全部 P0**
- 设计口径：[运行时语义设计](./2026-10-20-vamis-runtime-semantics-design.md)
- 视觉口径：[样式系统（Amis 水标 × shadcn）](./2026-10-21-vamis-style-system.md) — 渲染器走 token / Button·Input·Table·Card variants；不搬 `cxd-` 前缀，能力尽量像素级转写
- 覆盖数字（只比 type 名）：[同步状态](./2026-10-20-amis-sync-status.md)
- 文档侧栏：`../amis/examples/components/Components.tsx`（布局 / 功能 / 数据输入 / 数据展示 / 反馈 / 其他）
- 文档正文：`../amis/docs/zh-CN/components`
- 注册核对：`packages/vamis/src/register.ts` 与 `extras/*.ts` 的 `registerRenderer`

## 怎么读

1. **一行一个侧栏条目**，不是一行一个内部别名。`button` 是 `action` 的别名，仍单列，因为文档有独立页。
2. **已注册 ≠ 语义完成**。进度看的是该组件文档主路径是否对齐，不是 `registerRenderer` 有没有调用。
3. **状态**
   - `未开始`：未注册，且没有等价能力（属性级能力也算）。
   - `进行中`：已注册或有部分能力，但占位 / 精简 / 缺文档高级项 / 被 P0 kernel（D1–D8）挡住。
   - `已完成`：文档主路径行为对齐；视觉以 shadcn-vue / Tailwind 尽量像素级转写 cxd 能力（不搬前缀）。当前 **2 项**（`page` / `container`）。其余仍被 D2–D8 或组件自身缺口挡住。
4. **进度**是渲染器深度，不是 type 覆盖率（覆盖率 95.8% 见同步状态）。档位：
   | 进度 | 含义 |
   |------|------|
   | 0% | 未开始 |
   | 10–15% | 占位（明确未接入、html 直通、空壳） |
   | 20–35% | 精简（能绑值渲染，缺真实能力：Monaco / 地图 / 城市库 / Excel 解析 / 实时日志等） |
   | 40–70% | 主路径可交互，缺文档高级项或 P0 契约（Scope / 表达式过滤器 / API 管线 / 事件对象 / 表单路径） |
   | 80–90% | 接近文档语义，仅剩 P1/P2 |
   | 100% | 文档示例行为对齐 |
5. 本清单不另起分类。侧栏未收录但 `docs/zh-CN` 有独立页的，在对应类末尾用脚注标出。

## 分类汇总

| 分类 | 已完成 / 总数 | 进行中 | 未开始 | 平均进度 | ≥50%（主路径可用） |
|------|---------------|--------|--------|----------|-------------------|
| 布局 | 2 / 15 | 13 | 0 | 65% | 12 |
| 功能 | 0 / 12 | 11 | 1 | 44% | 8 |
| 数据输入 | 0 / 72 | 72 | 0 | 47% | 39 |
| 数据展示 | 0 / 44 | 44 | 0 | 50% | 28 |
| 反馈 | 0 / 5 | 5 | 0 | 54% | 4 |
| 其他 | 0 / 7 | 6 | 1 | 32% | 2 |
| **合计** | **2 / 155** | **151** | **2** | **48%** | **93** |

未开始只有 2 项，都不是独立 `type`：功能类 `popOver` 属性、其他类 `badge` 属性。Toast 文档主路径（`toast.items` / 位置）未齐，但 `actionType: toast` 已能弹出，算进行中 40%。

---

## 布局（2/15，均 65%）

侧栏 14 项 + 文档有页但未进侧栏的 `switch-container`。

| type | 文档 | 状态 | 进度 | 原因 | P |
|------|------|------|------|------|---|
| `page` | Page 页面 | 已完成 | 95% | 主路径对齐：独立 Scope、URL 查询种子、initApi overlay（GET 不把数据域拼进 query）、reload/setValue、完整事件对象；无标题时 toolbar 吃满上级；根/header/aside 用 div 组装。`pullRefresh` 明确未接（移动端） | P0 |
| `container` | Container 容器 | 已完成 | 100% | 主路径对齐：布局属性 + click/mouseenter/mouseleave 完整事件对象；沿用父 Scope；无对外动作。`draggable` 非运行时主路径 | P0 |
| `collapse` / `collapse-group` | Collapse 折叠器 | 进行中 | 85% | 文档主路径已对齐：`activeKey` / 手风琴 / 禁用 / `showArrow` / 图标位置 / `change` 事件。缺 `mountOnEnter`、`expand`·`collapse` 动作、FieldSet 像素级 | P0 |
| `divider` | Divider 分割线 | 进行中 | 90% | 文档主路径已对齐：`lineStyle` / `direction` / `color` / `rotate` / `title` / `titlePosition`。缺 `themeCss`、窄屏 `scaleY(0.5)` | P0 |
| `flex` | Flex 布局 | 进行中 | 60% | `justify`/`direction` 可用；缺 `alignItems`、子项 `flex` | P0 |
| `grid` | Grid 水平分栏 | 进行中 | 65% | 12 栅格 span 可用，列等高靠 `className: h-full`；缺响应式 `xs/sm` 全套 | P0 |
| `grid-2d` | Grid 2D 布局 | 进行中 | 45% | 已注册，二维格子精简 | P0 |
| `hbox` | HBox 布局 | 进行中 | 50% | 已注册；列宽/垂直对齐未对齐文档 | P0 |
| `pagination` | Pagination 分页 | 进行中 | 55% | 页码可用；缺 `layout` 插槽、完整 `mode` | P0 |
| `pagination-wrapper` | PaginationWrapper 分页容器 | 进行中 | 50% | 已注册；与数据域分页契约未对齐（D10） | P0 |
| `panel` | Panel 面板 | 进行中 | 65% | title/body 可用，`h-full` 吃满父槽；缺 `actions` 语义细节 | P0 |
| `tabs` | Tabs 选项卡 | 进行中 | 60% | 切 tab 可用；缺 `source` 动态、`mountOnEnter` | P0 |
| `wrapper` | Wrapper 包裹容器 | 进行中 | 65% | 能包一层；size/style 未齐 | P0 |
| `portlet` | Portlet 门户栏目 | 进行中 | 45% | 已注册，工具栏/拖拽精简 | P0 |
| `switch-container` | switch-container 状态容器 | 进行中 | 45% | 按 `visibleOn` 取首个状态；外观/事件未齐。侧栏未收录，docs 有独立页 | P0 |

---

## 功能（0/12，均 43%）

| type | 文档 | 状态 | 进度 | 原因 | P |
|------|------|------|------|------|---|
| `action` | Action 行为按钮 | 进行中 | 55% | ajax/toast/dialog 等 P0 动作有；无事件对象 / `__rendererData` / 控制流（D4） | P0 |
| `app` | App 多页应用 | 进行中 | 35% | 能切 pages；路由/`keepPageHistory` 精简 | P0 |
| `button` | Button 按钮 | 进行中 | 55% | `action` 别名，同一渲染器 | P0 |
| `button-group` | ButtonGroup 按钮组 | 进行中 | 60% | 能排按钮；缺 `vertical`/`tiled` 细节 | P0 |
| `breadcrumb` | Breadcrumb 面包屑 | 进行中 | 60% | 静态 items 可用；缺下拉/动态 source | P0 |
| `custom` | Custom 自定义组件 | 进行中 | 15% | **占位**：`html` 直通或渲染 `body`，不执行 onMount JS | P0 |
| `dropdown-button` | DropDownButton 下拉按钮 | 进行中 | 50% | 能展开按钮；缺 `overlayPlacement` 等 | P0 |
| `service` | Service 功能型容器 | 进行中 | 58% | 独立 Scope + `data` 遮蔽父域；`api` 按 `isApiOutdated` 刷新；`name` 支持 `${id}` 动态名。`schemaApi` 未单独拉 schema；`dataProvider` 未接 | P0 |
| `nav` | Nav 导航 | 进行中 | 50% | 链接列表可用；缺 overflow/缩起/搜索 | P0 |
| `anchor-nav` | AnchorNav 锚点导航 | 进行中 | 45% | 已注册，滚动联动精简 | P0 |
| `tooltip-wrapper` | TooltipWrapper 文字提示容器 | 进行中 | 50% | 能出 tip；触发/主题未齐 | P0 |
| （属性 `popOver`） | PopOver 弹出提示 | **未开始** | 0% | 不是独立 type；table/list/static/cards 字段均未实现 `popOver` | P0 |

---

## 数据输入（0/72，均 47%）

Form / FormItem / Options 是契约页，不是业务 type，但挡住所有表单项（D6），必须进清单。

| type | 文档 | 状态 | 进度 | 原因 | P |
|------|------|------|------|------|---|
| `form` | Form 表单 | 进行中 | 68% | 默认标题「表单」、只画提交、标题栏灰底对齐 Amis 面板壳。`panelClassName` 等 xxxClassName 已接。扁平路径、`clearValueOnHidden`、嵌套不递归校验仍等 D6 | P0 |
| （契约） | FormItem 表单项通用 | 进行中 | 48% | 有 label/required/error 壳，以及 `labelClassName` / `inputClassName` / `descriptionClassName`。缺路径值、`requiredOn`、`validateOnChange`、`clearValueOnHidden` | P0 |
| `control` | Control 表单项包裹 | 进行中 | 40% | 已注册；只做包裹 | P0 |
| （契约） | Options 选择器表单项 | 进行中 | 35% | 无统一 OptionsControl；`source`/`autoComplete`/`joinValues` 各控件自实现且不齐 | P0 |
| `input-array` | InputArray 数组输入框 | 进行中 | 50% | 能增删行；子域/校验未齐 | P0 |
| `button-toolbar` | ButtonToolbar 按钮工具栏 | 进行中 | 60% | 能排按钮 | P0 |
| `button-group-select` | ButtonGroupSelect 按钮点选 | 进行中 | 55% | 能选值；多选/自适应未齐 | P0 |
| `chained-select` | ChainedSelect 链式下拉框 | 进行中 | 50% | 能链式选；api 级联精简 | P0 |
| `checkbox` | Checkbox 勾选框 | 进行中 | 60% | 能绑布尔；`trueValue`/`option` 形态未齐 | P0 |
| `checkboxes` | Checkboxes 复选框 | 进行中 | 55% | 能多选；列数/全选未齐 | P0 |
| `input-city` | InputCity 城市选择器 | 进行中 | 25% | **精简**：内置 3 省示例，非全国数据 | P0 |
| `input-color` | InputColor 颜色选择器 | 进行中 | 50% | 能选色；预设/格式未齐 | P0 |
| `combo` | Combo 组合 | 进行中 | 50% | 能多行子表单；子项 api、扁平模式未齐 | P0 |
| `condition-builder` | ConditionBuilder 条件组合 | 进行中 | 35% | **精简**：基础规则组；缺公式/嵌套组/日期控件 | P0 |
| `input-date` | InputDate 日期选择器 | 进行中 | 55% | 能选日期；快捷/限制未齐 | P0 |
| `input-datetime` | InputDatetime 日期时间 | 进行中 | 50% | `input-date` 别名，时间 UI 不独立 | P0 |
| `input-month` | InputMonth 月份选择器 | 进行中 | 45% | DatePart 精简 | P0 |
| `input-date-range` | InputDateRange 日期范围 | 进行中 | 50% | 能选区间 | P0 |
| `input-datetime-range` | InputDatetimeRange 日期时间范围 | 进行中 | 45% | `input-date-range` 别名 | P0 |
| `input-month-range` | InputMonthRange 月份范围 | 进行中 | 45% | DatePartRange 精简 | P0 |
| `input-kv` | InputKV 键值对 | 进行中 | 50% | 能增删 KV | P0 |
| `input-kvs` | InputKVS 键值对象 | 进行中 | 45% | 结构精简 | P0 |
| `input-formula` | InputFormula 公式编辑器 | 进行中 | 30% | **精简**：复用 Formula，无公式编辑器 UI | P0 |
| `diff-editor` | DiffEditor 对比编辑器 | 进行中 | 65% | Monaco Diff：左侧 `diffValue` 只读，右侧绑 `name`；`options` / 事件已接。动作仍缺 D7 | P0 |
| `editor` | Editor 代码编辑器 | 进行中 | 85% | Monaco 编辑器：`hideButtons`、`size: full`、`intellisense: schema`（`registerRenderer` 自述即感知；按组件树定位 type，JSON Schema `$defs`+`if/then`）。文档「编辑 Schema」只消费。`editorDidMount` 未接；动作仍缺 D7 | P0 |
| `fieldset` | FieldSet 表单项集合 | 进行中 | 55% | 能分组折叠 | P0 |
| `input-excel` | InputExcel Excel 解析 | 进行中 | 20% | **精简**：只记文件名/大小，不解析表格 | P0 |
| `input-file` | InputFile 文件上传 | 进行中 | 40% | 能选文件；receiver/分片/自动上传未齐 | P0 |
| `formula` | Formula 公式 | 进行中 | 50% | 能按公式写值；与 expr 层未统一（D2） | P0 |
| `group` | Group 表单项组 | 进行中 | 55% | 能横排表单项 | P0 |
| `hidden` | Hidden 隐藏字段 | 进行中 | 70% | 能存值；仍走扁平 name | P0 |
| `input-image` | InputImage 图片 | 进行中 | 40% | 能选图；裁剪/多图/上传 api 未齐 | P0 |
| `input-group` | InputGroup 输入框组合 | 进行中 | 55% | 能并排控件 | P0 |
| `list-select` | ListSelect 选择器 | 进行中 | 50% | 能点选列表 | P0 |
| `location-picker` | LocationPicker 地理位置 | 进行中 | 25% | **精简**：地址/经/纬三个输入框，无地图 | P0 |
| `uuid` | UUID 随机 ID | 进行中 | 70% | 能生成；仍走扁平 name | P0 |
| `matrix-checkboxes` | MatrixCheckboxes 矩阵勾选 | 进行中 | 40% | 已注册，行列数据精简 | P0 |
| `nested-select` | NestedSelect 级联选择器 | 进行中 | 45% | 能级联；`cascader-select` 别名未注册 | P0 |
| `input-number` | InputNumber 数字输入 | 进行中 | 55% | native number；步进/精度/大数未齐 | P0 |
| `input-password` | InputPassword 密码 | 进行中 | 60% | `input-text` 别名 | P0 |
| `picker` | Picker 列表选择器 | 进行中 | 50% | 能弹层多选 | P0 |
| `input-quarter` | InputQuarter 季度 | 进行中 | 45% | DatePart 精简 | P0 |
| `input-quarter-range` | InputQuarterRange 季度范围 | 进行中 | 45% | DatePartRange 精简 | P0 |
| `radio` | Radio 单选框 | 进行中 | 60% | 单个 radio | P0 |
| `radios` | Radios 单选框 | 进行中 | 55% | 组单选 | P0 |
| `chart-radios` | ChartRadios 图表单选框 | 进行中 | 35% | **精简**：无真实图表点选 | P0 |
| `input-rating` | InputRating 评分 | 进行中 | 55% | 能打分；半星/自定义字符未齐 | P0 |
| `input-range` | InputRange 滑块 | 进行中 | 50% | 能滑；双滑块/刻度未齐 | P0 |
| `input-repeat` | InputRepeat 重复频率 | 进行中 | 40% | 已注册，选项精简 | P0 |
| `input-rich-text` | InputRichText 富文本 | 进行中 | 25% | **精简**：多行文本，未接 TinyMCE/Froala（设计非目标） | P0 |
| `select` | Select 下拉框 | 进行中 | 60% | 能选；`source` 按 `isApiOutdated` 刷新，可被 `reload` 点名（`form.select`）。检索/无限滚动/多选细节未齐 | P0 |
| `input-sub-form` | InputSubForm 子表单 | 进行中 | 45% | 能嵌表单；弹层/多选未齐 | P0 |
| `switch` | Switch 开关 | 进行中 | 65% | 能切换；`trueValue` 未齐 | P0 |
| `static` | Static 静态展示 | 进行中 | 55% | 能展示；`popOver`/`quickEdit` 无 | P0 |
| `input-table` | InputTable 表格 | 进行中 | 45% | 能行内编辑；子 api、增删校验未齐 | P0 |
| `input-tag` | InputTag 标签选择器 | 进行中 | 50% | 能回车加标签 | P0 |
| `input-text` | InputText 输入框 | 进行中 | 60% | 主路径可用；`addOn`/清值/计数未齐 | P0 |
| `textarea` | Textarea 多行输入框 | 进行中 | 60% | 主路径可用 | P0 |
| `input-time` | InputTime 时间 | 进行中 | 45% | `input-date` 别名 | P0 |
| `input-time-range` | InputTimeRange 时间范围 | 进行中 | 45% | 已注册 | P0 |
| `transfer` | Transfer 穿梭器 | 进行中 | 50% | 能左右移动；树/搜索未齐 | P0 |
| `transfer-picker` | TransferPicker 穿梭选择器 | 进行中 | 45% | 已注册 | P0 |
| `tabs-transfer` | TabsTransfer 组合穿梭器 | 进行中 | 40% | 已注册，tabs 数据精简 | P0 |
| `tabs-transfer-picker` | TabsTransferPicker | 进行中 | 35% | `tabs-transfer` 别名 | P0 |
| `input-tree` | InputTree 树形选择框 | 进行中 | 50% | 能勾树；懒加载/检索未齐 | P0 |
| `tree-select` | TreeSelect 树形选择器 | 进行中 | 50% | 能下拉树 | P0 |
| `input-year` | InputYear 年输入 | 进行中 | 45% | DatePart 精简 | P0 |
| `input-year-range` | InputYearRange 年份范围 | 进行中 | 45% | DatePartRange 精简 | P0 |
| `json-schema` | JsonSchema | 进行中 | 30% | **精简**：只渲染 string/number/boolean 属性 | P0 |
| `json-schema-editor` | JsonSchema Editor | 进行中 | 30% | `json-schema` 别名，无 schema 编辑器 | P0 |
| `input-signature` | InputSignature 签名面板 | 进行中 | 35% | **精简**：canvas 涂鸦，无压感/导出配置 | P0 |
| `input-verification-code` | InputVerificationCode 验证码 | 进行中 | 50% | 能分格输入 | P0 |

---

## 数据展示（0/44，均 49%）

| type | 文档 | 状态 | 进度 | 原因 | P |
|------|------|------|------|------|---|
| `crud` | CRUD 增删改查 | 进行中 | 58% | 文档介绍页用 `/api/mock2/sample` 真跑（筛选/批量/删除/重置）；`api` 按 `isApiOutdated` 刷新；`title` / `headerToolbar: []` 可用。无 `loadDataOnce`/`syncLocation`/`quickEdit`/`matchFunc`（D10） | P0 |
| `table` | Table 表格 | 进行中 | 50% | 能渲染列；无独立数据域、无 `popOver`/`quickEdit` | P0 |
| `table2` | Table2 表格 | 进行中 | 40% | 已注册，能力弱于 table | P0 |
| `table-view` | Table View 表格视图 | 进行中 | 40% | 已注册，合并单元格/布局模式精简 | P0 |
| `calendar` | Calendar 日历日程 | 进行中 | 40% | 已注册，日程数据精简 | P0 |
| `card` | Card 卡片 | 进行中 | 50% | 能展示字段；媒体/操作区未齐 | P0 |
| `cards` | Cards 卡片组 | 进行中 | 50% | 能铺卡片；masonry 未齐 | P0 |
| `carousel` | Carousel 轮播图 | 进行中 | 45% | 能轮播 | P0 |
| `chart` | Chart 图表 | 进行中 | 45% | 文档已补属性表 / 事件表 / 动作表。画布走 LazyComponent（`unMountOnHidden` 默认 false）。事件与 `reload`/`setValue` 未接；无 `mapURL` / `source` | P0 |
| `code` | Code 代码高亮 | 进行中 | 92% | 只读 monaco 展示（无编辑光标）；行号/折叠/感知默认关；wordWrap 按容器宽度折行。不收 `options`。customLang inherit 共享主题，滚动不丢高亮。YAML 多行 `value` 用 `\|` | P0 |
| `color` | Color 颜色 | 进行中 | 50% | StaticValue 展示 | P0 |
| `date` / `datetime` / `time` / `month` | Date 日期时间 | 进行中 | 60% | StaticValue 展示；date / datetime 过滤器已接，组件自身格式档未齐 | P0 |
| `each` | Each 循环渲染器 | 进行中 | 70% | 不再给 item 套竖排壳；tpl item 默认 inline。placeholder / itemKeyName / indexKeyName 已接。缺 maxLength | P0 |
| `html` | Html | 进行中 | 85% | `tpl` 别名；始终 HTML 插入，插值默认转义，raw 才插入变量 HTML。标题/列表/链接在 html 岛内补回。缺 maxLine / badge | P0 |
| `icon` | Icon 图标 | 进行中 | 60% | 能出图标；iconfont/vendor 未齐 | P0 |
| `iframe` | iFrame | 进行中 | 55% | 能嵌页 | P0 |
| `image` | Image 图片 | 进行中 | 55% | 能显示；放大/图集未齐 | P0 |
| `images` | Images 图片集 | 进行中 | 50% | 能平铺 | P0 |
| `grid-nav` | GridNav 宫格导航 | 进行中 | 50% | 能宫格；仅此处读了 `badge` | P0 |
| `json` | Json | 进行中 | 50% | 能展开 JSON | P0 |
| `link` | Link 链接 | 进行中 | 60% | 能出链 | P0 |
| `list` | List 列表 | 进行中 | 50% | 能列条目 | P0 |
| `log` | Log 实时日志 | 进行中 | 25% | **精简**：静态分行，无轮询/ANSI | P0 |
| `mapping` | Mapping 映射 | 进行中 | 55% | 能 map 取值 | P0 |
| `number` | Number 展示 | 进行中 | 60% | StaticValue；number / percent 过滤器已接，组件自身精度档未齐 | P0 |
| `markdown` | Markdown 渲染 | 进行中 | 45% | 已注册；远程 `src` 按 `isApiOutdated` 拉。渲染库精简 | P0 |
| `office-viewer` | OfficeViewer Word 渲染 | 进行中 | 10% | **占位**：ViewerStub「未接入预览」（设计非目标） | P0 |
| `office-viewer` | OfficeViewer Excel 渲染 | 进行中 | 10% | **占位**：同一 type + `excelOptions`，同样未接入 | P0 |
| `pdf-viewer` | PDFViewer 渲染 | 进行中 | 10% | **占位**：ViewerStub | P0 |
| `progress` | Progress 进度条 | 进行中 | 60% | 线性条；缺圆/仪表盘 | P0 |
| `steps` | Steps 步骤条 | 进行中 | 55% | 能展示步骤 | P0 |
| `property` | Property 属性表 | 进行中 | 50% | 能出 label/content | P0 |
| `qrcode` | QRCode 二维码 | 进行中 | 45% | 已注册 | P0 |
| `barcode` | BarCode 条形码 | 进行中 | 45% | 已注册 | P0 |
| `remark` | Remark 标记 | 进行中 | 70% | 圆形问号徽标 + tooltip；缺自定义 icon / 移动端弹层 | P0 |
| `search-box` | SearchBox 搜索框 | 进行中 | 50% | 能输入搜索；历史/增强未齐 | P0 |
| `sparkline` | Sparkline 走势图 | 进行中 | 45% | svg 折线精简 | P0 |
| `status` | Status 状态 | 进行中 | 55% | 能映射状态 | P0 |
| `tpl` | Tpl 模板 | 进行中 | 85% | 对齐 Amis：始终 HTML 插入，插值默认转义，raw 才插入变量 HTML。标题/列表/链接在 html 岛内补回。P0 过滤器可用。缺 maxLine / badge；其余过滤器仍 P1 | P0 |
| `tag` | Tag 标签 | 进行中 | 55% | 能展示标签 | P0 |
| `video` | Video 视频 | 进行中 | 45% | 能播；弹幕/直播未齐 | P0 |
| `timeline` | Timeline 时间轴 | 进行中 | 50% | 能列节点 | P0 |
| `shape` | Shape 形状 | 进行中 | 40% | 已注册，图形精简 | P0 |
| `slider` | Slider 滑动条 | 进行中 | 45% | 展示型滑条精简 | P0 |

---

## 反馈（0/5，均 54%）

| type | 文档 | 状态 | 进度 | 原因 | P |
|------|------|------|------|------|---|
| `alert` | Alert 提示 | 进行中 | 60% | title/body/level 可用；可关闭/操作未齐 | P0 |
| `dialog` | Dialog 对话框 | 进行中 | 50% | overlay 能开；内嵌只是 Card，尺寸/模态/确认未齐 | P0 |
| `drawer` | Drawer 抽屉 | 进行中 | 50% | 同 dialog | P0 |
| `spinner` | Spinner 加载中 | 进行中 | 70% | 能转圈；缺 overlay/size/show | P0 |
| （动作 `toast`） | Toast 轻提示 | 进行中 | 40% | `actionType: toast` + `msg` 可用；文档 `toast.items`/位置/超时未实现 | P0 |

---

## 其他（0/7，均 32%）

| type | 文档 | 状态 | 进度 | 原因 | P |
|------|------|------|------|------|---|
| `avatar` | Avatar 头像 | 进行中 | 60% | 图/文字可用；尺寸/角标未齐 | P0 |
| `audio` | Audio 音频 | 进行中 | 45% | 已注册 | P0 |
| `tasks` | Tasks 任务操作集合 | 进行中 | 40% | 已注册，状态机精简 | P0 |
| （属性 `badge`） | Badge 角标 | **未开始** | 0% | 不是独立 type；avatar/action/tpl 的 `badge` 未实现（仅 `grid-nav` 读了） | P0 |
| `wizard` | Wizard 向导 | 进行中 | 50% | 能分步；数据域/校验衔接未齐 | P0 |
| `web-component` | Web Component | 进行中 | 15% | **占位**：只渲染 tag + props | P0 |
| `amis` | amis 渲染器 | 进行中 | 15% | **占位**：只嵌内层 schema | P0 |

---

## 附录：侧栏没有、Vamis 已注册

不计入分类总数，避免和文档侧栏冲突。实现深度同样按「已注册 ≠ 完成」计。

| type | 归入 | 备注 | 进度 |
|------|------|------|------|
| `vbox` | 布局 | 文档无独立页 | 50% |
| `crud2` | 数据展示 | 文档无独立页 | 35% |
| `card2` | 数据展示 | 文档无独立页 | 35% |
| `words` | 数据展示 | 文档无独立页 | 40% |
| `operation` / `column-toggler` | 数据展示 | CRUD 配套 | 50% |
| `cell` / `table-cell` / `field` / `list-item-field` | 数据展示 | 缺 `card-item-field`/`cell-field` 别名 | 40% |
| `list-item` / `flex-item` | 布局/展示 | 子节点 type | 40% |
| `users-select` | 数据输入 | **精简**：内置 3 个用户 | 25% |
| `icon-picker` / `icon-select` | 数据输入 | **精简**：8 个字符图标 | 25% |
| `input-email` / `input-url` / `text` / `native-*` | 数据输入 | `input-text` 别名 | 60% |
| `multi-select` | 数据输入 | `select` 别名 | 55% |
| `qr-code` | 数据展示 | `qrcode` 别名 | 45% |
| `static-json` / `static-table` | 数据展示 | json/table 别名 | 50% |
| `password` / `multiline-text` / `date-range` | 数据展示 | StaticValue | 50% |
| `tooltip` | 功能 | `tooltip-wrapper` 别名 | 50% |
| `fieldSet` | 数据输入 | `fieldset` 别名 | 55% |
| `tags` | 数据展示 | `tag` 别名 | 55% |
| editor 语言族（`javascript-editor` 等） | 数据输入 | 全部指向 Monaco Editor（含 `js-editor` / `ts-editor`）；`yaml-editor`/`json-editor` 可开 schema 感知 | 78% |

同步状态里尚未注册的遗漏（不在侧栏，但影响别名对齐）：`cascader-select`、`card-item-field`、`cell-field`、`map`→mapping、`navigation`→nav、`pager`→pagination。`js-editor` / `ts-editor` 已并入 `editor` 别名。

---

## 与设计文档的关系

组件进度被 kernel P0 卡住的典型项（不要在组件里各写一套）：

| 组件 | 挡住它的决策 |
|------|----------------|
| `service` / `form` / `crud` / `wizard` | D1 已有 Scope 内核；这些容器还要把 overlay 切到 Scope（page 已切） |
| `tpl` / `html` / Date/Number 展示 | D2 P0 已接；其余过滤器仍 P1 |
| `service` / `form` / `crud` / `action` ajax | D3 API 管线 |
| `action` / `button` / `toast` / `dialog` | D4/D5 事件与目标 |
| 所有表单项 + FormItem/Options | D6 路径值与校验 |
| `crud` / `table` / `pagination-wrapper` | D10（设计标 P1，本清单仍 P0） |

更新规则：改渲染器深度时只改本文件的状态/进度/原因；不要改侧栏分类。覆盖率数字仍只写在 [同步状态](./2026-10-20-amis-sync-status.md)。任务结束还必须回写 [CONTEXT.md](../../../CONTEXT.md) 的进度与后续计划（见 `AGENTS.md` / `.cursor/rules/update-progress.mdc`）。组件约定见 `.cursor/rules/component.mdc`。
