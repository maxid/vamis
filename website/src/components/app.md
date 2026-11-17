---
title: App 多页应用
outline: deep
---

# App 多页应用

::: warning 实现进度 55% · 进行中
主路径可交互（未逐章节两站核完，不进 80%）：`pages` 分组 / 相对 `url` 拼父级、`schema` 内嵌、`link` 外链、`visible: false` 不进菜单、`isDefaultPage` 当 404、`brandName` / `logo`、`header` / `asideBefore` / `asideAfter` / `footer`。缺 hash 路由、`keepPageHistory`、`schemaApi` / `api` 拉 pages、`redirect` / `rewrite`。
:::

用于实现多页应用，适合全屏模式；只做局部渲染请用 [Page](/components/page)。Vamis 用 YAML 或 JSON 书写，字段名不改写；UI 走 shadcn-vue / Tailwind：不搬 `cxd-` 前缀，cxd 的盒子、密度、交互尽量像素级落到 token 与 utility。

属于侧栏分类 **功能**。对照进度以仓库组件 P0 TODO 为准。作者态 YAML 与 JSON 同等有效。默认吃满布局槽宽度。组装壳是 `div`，不用 `header` / `aside` / `section`。

`className` / `style` 打在宿主 `div.vamis-node`。

## 基本用法

类型定义为 `app`，通过 `pages` 定义页面，支持层级，支持内嵌 `schema`。数组第一层通常是分组（只配 `label` + `children`），真正的页面从第二层开始。

点「编辑 Schema」可切 JSON。

```schema
type: app
brandName: 应用名称
pages:
  - label: 分组1
    children:
      - label: 页面A
        url: /pageA
        schema:
          type: page
          body: Page A
      - label: 页面B
        url: /pageB
        schema:
          type: page
          body: Page B
```

相对路径会拼父级：父级 `url` 为 `/parent`、子级为 `pageA` 时，命中路径是 `/parent/pageA`。以 `/` 打头则不拼接。

## 外链与隐藏页

`link` 配外部链接菜单。`visible: false` 的页面不出现在菜单里。`isDefaultPage` 只当 404，不是首页；首页取第一个带 `schema` 的叶子。

```yaml
type: app
brandName: 外链示例
pages:
  - label: 文档
    link: https://aisuda.bce.baidu.com/amis
  - label: 隐藏页
    visible: false
    schema:
      type: page
      body: 不在菜单里
  - label: 404
    isDefaultPage: true
    schema:
      type: page
      body: 页面不存在
```

## 顶栏与页脚

`header` / `asideBefore` / `asideAfter` / `footer` 是普通 schema 槽。

```schema
{
  "type": "app",
  "brandName": "带页脚",
  "footer": {
    "type": "tpl",
    "tpl": "页脚文案"
  },
  "pages": [
    {
      "label": "首页",
      "schema": {
        "type": "page",
        "body": "主内容"
      }
    }
  ]
}
```

远程 `api` 拉 `pages`、`schemaApi` 拉单页、`redirect` / `rewrite` 对照不跑：

```yaml
type: app
api: /api/pages
pages:
  - label: 远程页
    schemaApi: /api/pageA
  - label: 跳转
    url: /old
    redirect: /pageA
```

## 属性说明

- `type` 请配置成 `app`
- `api` 页面配置接口，如果你想远程拉取页面配置请配置。返回配置路径 `json>data>pages`，具体格式请参考 `pages` 属性。
- `brandName` 应用名称。
- `logo` 支持图片地址，或者 svg。
- `className` css 类名。
- `header` 顶部区域。
- `asideBefore` 页面菜单上前面区域。
- `asideAfter` 页面菜单下前面区域。
- `footer` 页面。
- `pages` `Array<页面配置>`具体的页面配置。
  通常为数组，数组第一层为分组，一般只需要配置 label 集合，如果你不想分组，直接不配置，真正的页面请在第二层开始配置，即第一层的 children 中。

  具体的页面配置也支持属性结构，每层有以下配置。

  - `label` 菜单名称。
  - `icon` 菜单图标，比如：fa fa-file.
  - `url` 页面路由路径，当路由命中该路径时，启用当前页面。当路径不是 `/` 打头时，会连接父级路径。比如：父级的路径为 `folder`，而此时配置 `pageA`, 那么当页面地址为 `/folder/pageA` 时才会命中此页面。当路径是 `/` 开头如： `/crud/list` 时，则不会拼接父级路径。另外还支持 `/crud/view/:id` 这类带参数的路由，页面中可以通过 `${params.id}` 取到此值。
  - `schema` 页面的配置，具体配置请前往 [Page 页面说明](./page)
  - `schemaApi` 如果想通过接口拉取，请配置。返回路径为 `json>data`。schema 和 schemaApi 只能二选一。
  - `link` 如果想配置个外部链接菜单，只需要配置 link 即可。
  - `redirect` 跳转，当命中当前页面时，跳转到目标页面。
  - `rewrite` 改成渲染其他路径的页面，这个方式页面地址不会发生修改。
  - `isDefaultPage` 当你需要自定义 404 页面的时候有用，不要出现多个这样的页面，因为只有第一个才会有用。
  - `visible` 有些页面可能不想出现在菜单中，可以配置成 `false`，另外带参数的路由无需配置，直接就是不可见的。
  - `className` 菜单类名。

## 属性表

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| type | `string` | `"app"` | 指定为 app 渲染器 |
| pages | `Array` | | 页面树。第一层多为分组 |
| pages[].label | `string` | | 菜单名称 |
| pages[].icon | `string` | | 菜单图标（fa 字体未接） |
| pages[].url | `string` | | 路由路径。非 `/` 打头时拼父级 |
| pages[].schema | Schema | | 内嵌页面，通常是 `type: page` |
| pages[].schemaApi | Api | | 远程拉页面。与 schema 二选一，尚未接入 |
| pages[].link | `string` | | 外链菜单 |
| pages[].redirect | `string` | | 命中后跳转，尚未接入 |
| pages[].rewrite | `string` | | 改渲染其它路径，地址不变，尚未接入 |
| pages[].isDefaultPage | `boolean` | | 自定义 404，只认第一个 |
| pages[].visible | `boolean` | | `false` 不出现在菜单 |
| brandName | `string` | | 应用名称 |
| logo | `string` | | 图片地址 |
| header | Schema | | 顶栏 |
| asideBefore | Schema | | 菜单上方 |
| asideAfter | Schema | | 菜单下方 |
| footer | Schema | | 页脚 |
| api | Api | | 远程拉 pages，尚未接入 |
| className | `string` | | 打在宿主 `div.vamis-node` |

## 事件表

| 事件名称 | 事件参数 | 说明 |
|----------|----------|------|
| init | - | 组件实例插入 DOM 时。尚未派发 |

## 动作表

| 动作名称 | 动作配置 | 说明 |
|----------|----------|------|
| reload | - | 刷新。尚未接入 |
| setValue | `value: object` | 更新数据。尚未接入 |

## 和 Amis 文档的差异
- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core（`yes` / `On` / `012` 当字符串）。
- 可包在 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage` 里，`spec` 仍是这棵 widget 树。
- 组装壳是 `div`，不用 landmark 标签。
- 未接浏览器 hash 路由、`keepPageHistory`、`:id` 路由参数、`schemaApi` / `api`、`redirect` / `rewrite`。当前是菜单切内嵌 schema。
