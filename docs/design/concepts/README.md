# Concepts 概念文档设计

> 状态：**进行中** · 覆盖 [website/src/concepts](../../../website/src/concepts) · 9 篇
> 盘点日期：2026-11-18。本文是站点文档域的设计，不替代各页正文。

## 0. 一页结论

Concepts 是 Vamis 作者模型的**第一层心智模型**：配置树 → 数据域/数据链 → 模板/映射/表达式 → 联动/事件动作 → 行为 → 样式。9 篇中 7 篇自报 90–100%，但 `action` 与 `linkage` 仍是 90%，模板的 raw/过滤器边界要用正文兜住。

## 1. 边界与优先级（先读）

### 1.1 P0 不可破坏边界

1. **配置树**：`type` 选渲染器；`page` 是唯一顶级页面节点；子节点可为模板/Schema/SchemaArray。
2. **作者态**：JSON / YAML / IR 信封走同一渲染管线，文档示例必须三者语义一致，不教 YAML 专属语法。
3. **数据域**：Page / Form / Row 各自建域；`name` 路径读写；父子域优先级和隔离要一致，不能用全局变量兜底。
4. **模板**：默认转义；`|raw` / 字符串函数只用于可信内容；不要把用户输入当 HTML。
5. **表达式**：只求值/过滤，不产生写值副作用；写值归联动/事件/Formula。
6. **联动**：`visibleOn` / `disabledOn` / 表达式条件不能形成无限回写；联动是声明式，事件动作是命令式，两者边界要写清。
7. **事件动作**：动作按顺序执行；`confirm`/`confirmText` 先于后续动作；`preventDefault` 阻断；异步动作要等待。
8. **行为**：`actionType` 是动作分派键；按钮/链接/菜单复用，不各写一套动作语义。
9. **样式**：概念页只教 `cssVars` / `className` / token，不教 cxd 前缀和主题 SCSS。

### 1.2 页面清单

| 页面 | 设计重点 | 自报 |
|---|---|---|
| [配置与组件](../../../website/src/concepts/schema.md) | type、组件树、YAML/JSON/IR、LazyComponent | 100% |
| [数据域与数据链](../../../website/src/concepts/datascope-and-datachain.md) | Page/Form/Row 域、路径、优先级、隔离 | 90% |
| [模板](../../../website/src/concepts/template.md) | 插值、转义、raw、过滤器、嵌套 | 95% |
| [数据映射](../../../website/src/concepts/data-mapping.md) | `source`/`map`/字段映射/字典 | 100% |
| [表达式](../../../website/src/concepts/expression.md) | 变量、运算、函数、过滤器 | 100% |
| [联动](../../../website/src/concepts/linkage.md) | 条件显隐/禁用/值联动 | 90% |
| [事件动作](../../../website/src/concepts/event-action.md) | onEvent、动作表、上下文、控制流 | 100% |
| [行为](../../../website/src/concepts/action.md) | actionType、confirm、请求、跳转 | 90% |
| [样式](../../../website/src/concepts/style.md) | cssVars、className、token、主题 | 90% |

## 2. 文档契约

- **frontmatter**：必须有 `title`；长页可加 `outline: deep`。
- **进度横幅**：`::: tip|info|warning|danger 实现进度 N% · 状态`；`playground/src/docs/doc-progress.ts` 用正则读取。
- **活示例**：` ```schema ` 围栏进入活渲染；可带 `scope` / `height` 元信息；普通代码块不要用 `schema` 语言。
- **提示块**：`::: tip|info|warning|danger` 映射为 callout；样式章节可用 `warning` 标未完成。
- **链接**：站内用 `/concepts/...`，运行时经 `docHref` 重写；不要写死 `.html`。
- **顺序**：先作者能跑的最小例，再属性/边界，再反例；每页至少一个可运行示例。

## 3. 站点实现与数据流

- [pages.ts](../../../playground/src/docs/pages.ts)：`import.meta.glob('../../../website/src/**/*.md')` → `resolveDoc` 按 `/concepts/x` 找 `x.md` / `x/index.md`。
- [render.ts](../../../playground/src/docs/render.ts)：frontmatter/H1 → Markdown → `schema`/code/callout 分块 → 标题锚点。
- [sidebar.ts](../../../playground/src/docs/sidebar.ts) + [nav.mjs](../../../website/nav.mjs)：文档侧栏来自 `conceptNav`，路径以 `/concepts/` 开头。
- [doc-progress.ts](../../../playground/src/docs/doc-progress.ts)：读取进度横幅并汇总侧栏。

```text
website/src/concepts/*.md
  → resolveDoc(path)
  → parseFrontmatter / parseDoc
  → html | schema | code blocks
  → DocView + 活示例
```

## 4. 当前缺口

- `linkage` / `action` / `style` 自报 90%，说明还有未覆盖的边界或示例。
- 模板 raw/过滤器、事件动作 `abort`/`confirm`、数据域隔离等高风险点需要逐页反例。
- 概念页与组件页的交叉链接尚未统一；建议每页底部固定「相关组件 / 相关类型」。
- 示例依赖 mock API 时，要说明数据来源与失败态。

## 5. 验收清单（文档核对：3 / 12）

- [x] website/src/concepts 9 篇与 nav 已定位
- [x] 站点解析/渲染/侧栏链路已定位
- [x] 概念页优先级与高风险边界已盘点
- [ ] 每页 frontmatter / 进度横幅格式核对
- [ ] 每页至少一个活示例可运行、无 console error
- [ ] 模板转义/raw 反例可复现
- [ ] 数据域优先级/隔离示例可复现
- [ ] 事件动作顺序/confirm/异步示例可复现
- [ ] 概念 → 组件 / 类型交叉链接补齐
- [ ] 桌面 1280 / 移动 375 阅读与代码块横向滚动
- [ ] 深色主题下 callout/code/schema 预览可读
- [ ] `pnpm typecheck` 0（只改文档时说明未跑）

## 6. 后续

1. 先补 `linkage` / `action` / `template` 三页的反例与跨页链接。
2. 给每页底部加固定「相关」区，复用组件设计文档。
3. 概念页的 schema 示例统一收录到可回归的 mock 用例。
