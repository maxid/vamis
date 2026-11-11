# Amis 只能 React？我用 Vue 3 重写了整套低代码运行时

> 同一份 schema，184/189 个 Amis type，880 个测试，1142 条并排对照用例。
>
> 利益相关：我是 Vamis 作者。本文是项目首发文，含完整的限制说明。

---

## 0. 先说结论

Amis 是百度开源的 JSON 低代码框架：用一份 schema 描述后台页面，表单、表格、CRUD、弹窗、校验、联动都能直接配出来。它的文档和生态很成熟，但运行时是 **React** 的。

很多团队是 Vue 技术栈。把 amis 的 JS SDK 嵌进 Vue 能跑，但页面里始终有一层 React：主题、Vue 组件复用、调试链路、包体积、升级路径都要绕着走。

过去三周，我把这套运行时用 Vue 3 重写了一遍，取名 **Vamis**，今天开源 alpha：

- Amis type 名称覆盖 **184 / 189（97.4%）**，剩 3 个 type 和 2 个别名；
- 侧栏 155 个组件，**语义平均 59%**，`container` / `toast` 两个到 100%；
- `VamisRoot`（Vue）和 `vamis.embed`（任意 HTML）两条入口，同一套内核；
- YAML 与 JSON 双作者态，信封对齐 LCDP IR；
- 880 个单测，1142 条 Playwright 并排对照用例，P0 差异归零；
- **alpha，不建议直接上关键生产。**

这篇文章讲三件事：为什么重写而不是封装、怎么保证像 Amis、以及现在还不能做什么。

---

## 1. 三条路：iframe、React 壳、原生重写

在 Vue 项目里用 amis，通常有三条路。

| 方案 | 做法 | 优点 | 代价 |
|------|------|------|------|
| iframe | 把 amis 页面塞进 iframe | 隔离干净、接入最快 | 数据/动作/主题跨窗口，弹窗和路由难统一，移动端体验差 |
| React 壳 | 用 `amis.embed` 挂一个 React 根 | 官方路径，能力最全 | Vue 里始终有 React；主题、组件复用、调试、包体积都绕不开 |
| 原生重写 | 用 Vue 重写渲染器、数据域、动作 | 真正的 Vue 运行时，schema 不变 | 工作量最大，要持续追 Amis 语义 |

前两条不是错，很多项目就这么跑着。但它们解决的是"把 amis 放进来"，不是"让 amis 的 schema 长在 Vue 里"。

我选第三条，判断依据只有一句：**schema 是资产，运行时可以换。** 如果 schema 字段名和语义不变，团队就有第二次选择运行时的机会；如果 schema 被绑定在 React 运行时上，Vue 团队永远只能"嵌一个 React"。

边界也先说清楚：

- 不是 fork Amis，不复制 Amis 源码；Amis 是 Apache-2.0，Vamis 只做 schema 语义兼容。
- 公式引擎从 MIT 的 `amis-formula@6.13.0` 移植，署名写在 `NOTICE` 里。
- UI 不搬 `cxd-` 前缀和主题 SCSS，用 shadcn-vue + Tailwind token 重写。
- 不追求"像素级复制 Amis"，而是"盒模型、密度、交互对齐"，方便逐项对照。

---

## 2. 架构：schema 进来，Vue 组件树出去

整个运行时可以压成一条线：

```
YAML / JSON / IR 信封
        │  parseSchemaText() / jsonToIr()
        ▼
IR（apiVersion: lcdp.ir/v1, kind: UiPage）
        │  compileIrToWidget()
        ▼
widget 树（仍是 Amis schema 语义）
        │  SchemaRenderer + register.ts 渲染器注册表
        ▼
Vue 组件树（shadcn-vue / reka-ui + Tailwind token）
        │
        ├── Pinia hub：数据域、表单、CRUD 节点状态
        └── env：fetcher / jumpTo / notify / confirm
```

几个关键决定：

**① 不发明第二套 schema。** 字段名、`type`、表达式、动作都按 Amis 的语义走；扩展只加新字段或新 IR `kind`。这样 Amis 的 schema 可以原样进来，Vamis 也不会长成一个只有自己认识的方言。

**② YAML 与 JSON 平权。** `parseSchemaText` 以 `{` / `[` 开头走 JSON，否则走 YAML（YAML 1.2 Core）。作者态可以混用，同一份内容在 Playground 里能实时切 YAML / JSON。

**③ IR 是唯一真源。** 裸 widget 会被 `jsonToIr()` 包成 `kind: UiPage`；运行时先 normalize 成 IR，再编译成 widget 树：

```yaml
apiVersion: lcdp.ir/v1
kind: UiPage
metadata:
  name: user-form
spec:
  type: page
  title: 新建用户
  body:
    - type: form
      api: /api/mock2/form/saveForm
      body:
        - type: input-text
          name: name
          label: 名称
          required: true
        - type: select
          name: role
          label: 角色
          options:
            - label: 管理员
              value: admin
            - label: 编辑
              value: editor
```

**④ 渲染器只消费 `schema` / `data` / `env`。** 组件里禁止直接 `fetch`，请求统一走 `env.fetcher`，跳转走 `env.jumpTo`，提示走 `env.notify`。这样同一套渲染器可以在文档、Playground、SDK、宿主应用里跑，行为一致。

**⑤ 状态用 Pinia hub。** 表单、CRUD、弹窗这些需要跨层级共享的状态，收进 Pinia；不引入 MST。对 Vue 团队来说，这是现成的调试工具和心智模型。

最小 Vue 用法（npm 包发布前按仓库 workspace 引用，包名相同；发布后直接 `pnpm add vamis @vamis/ui`）：

```ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { VamisRoot, parseSchemaText } from 'vamis'
import '@vamis/ui/styles.css'

const app = createApp({
  components: { VamisRoot },
  setup() {
    const schema = parseSchemaText(`
type: page
title: Hello
body:
  - type: form
    api: /api/mock2/form/saveForm
    body:
      - type: input-text
        name: name
        label: 名称
`)
    return { schema }
  },
  template: '<VamisRoot :schema="schema" />',
})
app.use(createPinia())
app.mount('#app')
```

任意 HTML 用 SDK，同一个内核，不是第二套运行时：

```html
<link rel="stylesheet" href="./sdk.css" />
<div id="root"></div>
<script src="./sdk.js"></script>
<script>
  vamis.embed('#root', {
    type: 'page',
    title: 'Hello',
    body: [{ type: 'tpl', tpl: '来自 JSON 的页面' }],
  })
</script>
```

---

## 3. 怎么保证"像 Amis"：把对照变成工程

重写最大的风险不是"写不出来"，而是"写出来不像"。看截图、凭感觉对齐，最后一定会在边角上翻车。

所以这个项目从第一天就把"对照"当成一等公民：

**同一份 schema，左右两边同时跑。** 对照页用 `amis.embed` 和 `vamis.embed` 各挂一个 iframe，左侧 Amis 6.13.0（官方 `sdk.css` / `helper.css`），右侧 Vamis，中间是同一份 YAML/JSON 编辑器。改 schema，两边同时重渲染。

**比的是 schema 树结点，不是整页截图。** 每个用例按 Amis 侧栏分成文档 / 组件 / 样式；组件用例按 schema 树逐结点检查：是否渲染出来、运行时 `value` 是什么、`getComponentByName` 能不能拿到、点击后 dialog / toast / setValue 有没有发生。截图只能证明"看起来像"，结点比较才能证明"行为像"。

**盒模型当契约。** 对齐 cxd 的盒子、密度、helper 时，用 `getBoundingClientRect()` 和计算样式比，而不是目测；移动端固定 375 宽对照 Amis 的 `sm` 断点；深色主题、浮层、日期滚轮单独回归。

**进度公开。** 每个组件文档页标题下都写着"实现进度 · 完成状态"；`已注册 ≠ 语义完成` 是仓库里的硬规则。组件 TODO 按侧栏 155 项逐条维护，`CONTEXT.md` 每次任务收工必须回写。

目前的结果：

- 对照用例 **1142** 条，P0 差异归零；
- 最近一次全量：**878 过 / 30 条非 P0 差异**（差异在收敛，不是"全绿"）；
- 单测 **880** 个（formula 185 + core 620 + sdk 75）；
- 桌面与 375 移动端都能跑，对照页可切视口。

这套对照方法论本身也可能是项目除了运行时之外最有价值的产出：它把"像不像"从审美问题变成了可回归的测试问题。

---

## 4. 现在能跑什么

不是"能渲染一个 Hello World"的程度。当前可用的主路径：

| 能力 | 状态 | 说明 |
|------|------|------|
| 表单 | 80% | 布局、校验、联动、提交、`static`、窄屏 375 |
| FormItem | 90% | 规则表、`$1`、`validate.*`、`addRule` |
| CRUD | 65% | 查询、分页、批量、弹窗编辑、切页 Spinner |
| Table / Table2 | 55% / 70% | 列、选择、排序、固定列在补 |
| 日期 | 92% | 桌面月历 + 移动端滚轮、范围、`minDate` / `maxDate` |
| Select / Checkbox / InputText | 92% / 90% / 92% | 桌面 + 移动、搜索、多选、分组 |
| 向导 / Dialog / Drawer / Toast | 80–100% | 动作与浮层主路径 |
| JS SDK | 90% | `vamis.embed` / `updateSchema` / `updateProps` / `doAction` |
| 编辑器 | 骨架 | 组件树 / 画布 / 属性 / YAML，无插件市场 |
| 样式 | 部分 | 辅助类、token、深色；色盘表仍在补 |

截图（仓库 `assets/readme/`）：

- `editor.png`：组件树 + 实时预览 + 属性 + IR 源码
- `compare-amis.png`：同一份 CRUD schema，Amis 左 / Vamis 右

想直接看：

```bash
pnpm install
pnpm dev        # http://127.0.0.1:5173
```

或者打开在线 Demo 的 `/components` 和 `/sdk/compare.html`（链接见文末）。

---

## 5. 现在还不能做什么

这一节建议所有 alpha 项目都写，而且写在显眼位置。

- **平均语义 59%，不是 100%。** 155 个侧栏组件里只有 `container` 和 `toast` 到 100%；`table` 55%、`crud` 65%、`diff-editor` 65%。
- **还有 3 个 Amis type 和 2 个别名没注册。** 未知 type 会显示占位，不会崩，但也不是实现。
- **D6 的 combo 独立数据域、D8 的诊断/错误边界、D7 的渲染器 API 余项仍缺。** 复杂表单路径值、调试面板、动作日志都不完整。
- **没有插件市场。** `@vamis/editor` 只是可视化骨架，不是 amis-editor。
- **不搬 office / PDF 真实预览、TinyMCE。** 这些不在当前范围。
- **没有大规模生产验证。** 性能、极端 schema、旧浏览器/WebView 只做了有限覆盖。
- **英文文档只有 README。** 组件文档目前是中文。

如果你要的是"明天上生产"，现在的 Vamis 不是答案；如果你要的是"Vue 技术栈 + Amis schema 的第二种运行时"，现在可以开始试，并且在 issue 里把差距打出来。

---

## 6. 为什么现在开源：250+ 次提交之后

三周，250+ 次提交，一个人。这个速度里 AI 编码助手承担了大量重复工作：组件骨架、文档搬运、对照用例、样式 token 对齐。但真正决定质量的不是生成速度，而是三件事：

1. **架构和边界**：哪些进 IR、哪些留在渲染器、哪些字段不改写；
2. **对照和验收**：1142 条用例、盒模型、移动端，AI 生成的代码必须过这一关；
3. **取舍**：哪些组件先做、哪些明确不做，进度表必须是真的。

越往下写越清楚：一个人可以写出 184 个 type 的骨架，但没法独自验证 184 个 type 的真实语义。真实项目里的 schema 千奇百怪，只有拿到别人的 schema，才知道下一个坑在哪。

所以现在开源，想要三样东西：

- **真实 Amis schema**：跑不通的、渲染不对的、移动端有问题的，直接贴 issue；
- **对照用例**：你有一个 Amis 页面，愿意提供一份脱敏 schema，我们就可以把它加进对照目录；
- **组件/文档贡献**：组件 TODO 和依赖顺序是公开的，文档纠错、样式补全、英文翻译都欢迎。

路线图不藏：先补 `radio` 等主路径组件，再把 `table` / `crud` 语义拉上来，然后 D6 / D7 / D8，最后是样式收尾和 1.0。完整顺序在仓库 `CONTEXT.md` 和组件 TODO 里，任务收工必须回写——这也是我给自己定的规矩。

---

## 7. 链接与反馈

- 源码：<https://github.com/maxid/vamis>
- 在线 Demo：<https://maxid.github.io/vamis/>（自定义域名准备中）
- 与 Amis 并排对照：<https://maxid.github.io/vamis/sdk/compare.html>
- 组件进度：仓库 `CONTEXT.md` + `docs/superpowers/specs/2026-10-20-vamis-component-todo.md`
- 许可：Apache-2.0；非百度官方项目，与百度无关联。

如果你也遇到过"Vue 团队想用 Amis"的场景，欢迎在评论区说说你们最后怎么解决的——这比 star 对我更有用。

---

*利益相关：Vamis 作者。文中进度数据来自仓库 2026-11-10 的 `CONTEXT.md`；alpha 阶段数字会变，以仓库为准。*
