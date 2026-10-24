---
title: App 多页应用
outline: deep
---

# App 多页应用

::: info 实现进度 80% · 进行中
文档主路径已对齐：`pages` 分组 / 相对 `url` 拼父级、`schema` 内嵌、`link` 外链、`visible: false` 不进菜单、`isDefaultPage` 当 404、`brandName` / `logo`、`header` / `asideBefore` / `asideAfter` / `footer`。缺 hash 路由、`keepPageHistory`、`schemaApi` / `api` 拉 pages、`redirect` / `rewrite`。
:::

用于实现多页应用，适合全屏模式；只做局部渲染请用 [Page](/components/page)。Vamis 用 YAML 或 JSON 书写，字段名不改写；UI 走 shadcn-vue / Tailwind：不搬 `cxd-` 前缀，cxd 的盒子、密度、交互尽量像素级落到 token 与 utility。

属于侧栏分类 **功能**。对照进度以仓库组件 P0 TODO 为准。作者态 YAML 与 JSON 同等有效。默认吃满布局槽宽度。组装壳是 `div`，不用 `header` / `aside` / `section`。

`className` / `style` 打在宿主 `div.vamis-node`。

## 基本用法

类型定义为 `app`，通过 `pages` 定义页面，支持层级，支持内嵌 `schema`。数组第一层通常是分组（只配 `label` + `children`），真正的页面从第二层开始。

```schema
{
  "type": "app",
  "brandName": "应用名称",
  "pages": [
    {
      "label": "分组1",
      "children": [
        {
          "label": "页面A",
          "url": "/pageA",
          "schema": {
            "type": "page",
            "body": "Page A"
          }
        },
        {
          "label": "页面B",
          "url": "/pageB",
          "schema": {
            "type": "page",
            "body": "Page B"
          }
        }
      ]
    }
  ]
}
```

同一段也可以写成 YAML（文案不同，对照不跳过）：

```schema
type: app
brandName: 应用名称 YAML
pages:
  - label: 分组1
    children:
      - label: 页面A YAML
        url: /pageA
        schema:
          type: page
          body: Page A YAML
      - label: 页面B YAML
        url: /pageB
        schema:
          type: page
          body: Page B YAML
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
