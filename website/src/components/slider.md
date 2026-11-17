---
title: Slider 滑动条
outline: deep
---

# Slider 滑动条

::: warning 实现进度 45% · 进行中
展示型滑条精简
:::

`slider` 对齐 Amis 同名 schema。Vamis 用 YAML 或 JSON 书写，字段名不改写；UI 走 shadcn-vue / Tailwind：不搬 `cxd-` 前缀，cxd 的盒子、密度、交互尽量像素级落到 token 与 utility。

属于侧栏分类 **数据展示**。对照进度以仓库组件 P0 TODO 为准。作者态 YAML 与 JSON 同等有效。

主要用于移动端中支持左右滑动展示更多内容，在桌面端中更多内容展示在右侧

## 基本用法

```schema
{
  "type": "page",
  "body": {
    "type": "service",
    "api": "/api/mock2/sample?perPage=5",
    "body": [
      {
        "type": "list",
        "source": "$rows",
        "listItem": {
          "body": [
            {
              "type": "slider",
              "body": [
                {
                  "type": "container",
                  "body": {
                    "type": "tpl",
                    "tpl": "Engine: ${engine}"
                  }
                }
              ],
              "left": [
                {
                  "type": "button",
                  "level": "primary",
                  "label": "详情",
                  "actionType": "dialog",
                  "dialog": {
                    "title": "查看详情",
                    "body": {
                      "type": "form",
                      "body": [
                        {
                          "label": "Engine",
                          "name": "engine",
                          "type": "static"
                        },
                        {
                          "name": "version",
                          "label": "Version",
                          "type": "static"
                        }
                      ]
                    }
                  }
                }
              ],
              "right": [
                {
                  "type": "button",
                  "level": "danger",
                  "label": "删除"
                }
              ]
            }
          ]
        }
      }
    ]
  }
}
```

## 事件表

当前组件会对外派发以下事件，可以通过`onEvent`来监听这些事件，并通过`actions`来配置执行的动作，详细查看[事件动作](/concepts/event-action)。

| 事件名称  | 事件参数                     | 说明               |
| --------- | ---------------------------- | ------------------ |
| leftShow  | `label: string` 鼠标事件对象 | 左侧内容出现时触发 |
| leftHide  | `label: string` 鼠标事件对象 | 左侧内容隐藏时触发 |
| rightShow | `label: string` 鼠标事件对象 | 右侧内容出现时触发 |
| rightHide | `label: string` 鼠标事件对象 | 右侧内容隐藏时触发 |

## 属性表

| 属性名    | 类型                                      | 默认值     | 说明                                      |
| --------- | ----------------------------------------- | ---------- | ----------------------------------------- |
| type      | `string`                                  | `'slider'` | 指定为滑动条渲染器                        |
| body      | [SchemaNode](/types/schemanode) |            | 容器主要内容                              |
| right     | [SchemaNode](/types/schemanode) |            | 容器右侧内容，在 pc 下展示在右侧          |
| left      | [SchemaNode](/types/schemanode) |            | 容器左侧内容，在 pc 下展示在右侧          |
| bodyWidth | `string`                                  | `'60%'`    | pc 下 body 即移动端默认宽度占比，默认 60% |

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core（`yes` / `On` / `012` 当字符串）。
- 可包在 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage` 里，`spec` 仍是这棵 widget 树。
- 当前实现：展示型滑条精简。属性 / 事件 / 动作表按 Amis 主路径列出，运行时尚未接上的字段预览可能无对应行为。
