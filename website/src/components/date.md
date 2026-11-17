---
title: Date 日期时间
outline: deep
---

# Date 日期时间

::: warning 实现进度 60% · 进行中
StaticValue 展示；date / datetime 过滤器已接，组件自身格式档未齐
:::

`date` 对齐 Amis 同名 schema。Vamis 用 YAML 或 JSON 书写，字段名不改写；UI 走 shadcn-vue / Tailwind：不搬 `cxd-` 前缀，cxd 的盒子、密度、交互尽量像素级落到 token 与 utility。

属于侧栏分类 **数据展示**。对照进度以仓库组件 P0 TODO 为准。作者态 YAML 与 JSON 同等有效。

用于展示日期

## 基本使用

```schema
{
  "type": "page",
  "body": {
    "type": "date",
    "value": "1591326307"
  }
}
```

## 用作 Field 时

当用在 Table 的列配置 Column、List 的内容、Card 卡片的内容和表单的 Static-XXX 中时，可以设置`name`属性，映射同名变量

### Table 中的列类型

```schema: scope="body"
{
  "type": "table",
  "data": {
    "items": [
      {
        "id": "1",
        "date": "1591326307"
      },
      {
        "id": "2",
        "date": "1591321307"
      },
      {
        "id": "3",
        "date": "1591322307"
      }
    ]
  },
  "columns": [
    {
      "name": "id",
      "label": "Id"
    },
    {
      "name": "date",
      "label": "日期",
      "type": "date"
    }
  ]
}
```

List 的内容、Card 卡片的内容配置同上

### Form 中静态展示

```schema: scope="body"
{
  "type": "form",
  "data": {
    "now": "1591322307"
  },
  "body": [
    {
      "type": "static-date",
      "name": "now",
      "label": "日期",
      "format": "YYYY年MM月DD日 HH时mm分ss秒"
    }
  ]
}
```

## 配置展示格式

例如你想将某一个时间值，以 `xxxx年xx月xx日 xx时xx分xx秒` 这样的格式输出，那么查找 [moment 文档](https://momentjs.com/docs/#/displaying/format/) 可知配置格式应为 `YYYY年MM月DD日 HH时mm分ss秒`，即：

```schema
{
  "type": "page",
  "data": {
    "now": 1586865590
  },
  "body": {
    "type": "date",
    "value": "1586865590",
    "format": "YYYY年MM月DD日 HH时mm分ss秒"
  }
}
```

## 配置数据格式

如果你的数据值默认不是`X`格式（时间戳秒格式），那么需要配置 `valueFormat` 参数用于解析当前时间值，比如毫秒是配置 `"valueFormat": "x"`。

除此之外还支持各种自定义日期格式，例如下面`value`值为：`"2020/4/14 19:59:50"`，查阅 [moment 文档](https://momentjs.com/docs/#/displaying/format/) 可知，需要配置数据格式为 `"YYYY/MM/DD HH:mm:ss"`，然后我们配置输出格式`format`，输出指定格式日期：

```schema
{
  "type": "page",
  "body": {
    "type": "date",
    "value": "2020/4/14 19:59:50",
    "valueFormat": "YYYY/MM/DD HH:mm:ss",
    "format": "YYYY年MM月DD日 HH时mm分ss秒"
  }
}
```

## 转成相对当前时间的描述

```schema
{
  "type": "page",
  "body": {
    "type": "date",
    "fromNow": true,
    "value": "1591326307"
  }
}
```

## 设置展示时区

通过配置 `displayTimeZone` 参数，可以设置展示时区，默认展示当前时区。

```schema: scope="body"
{
  "type": "crud",
  "api": {
    "method": "get",
    "url": "/whatever/api",
    "mockResponse": {
      "status": 200,
      "data": [
        {
          "date": "2023-10-27 15:00:00"
        }
      ]
    }
  },
  "columns": [
    {
      "type": "date",
      "label": "Asia/Shanghai",
      "name": "date",
      "displayTimeZone": "Asia/Shanghai",
      "format": "YYYY-MM-DD HH:mm:ss"
    },
    {
      "type": "date",
      "label": "America/Los_Angeles",
      "name": "date",
      "displayTimeZone": "America/Los_Angeles",
      "format": "YYYY-MM-DD HH:mm:ss"
    },
    {
      "type": "date",
      "name": "date",
      "label": "Asia/Tokyo",
      "displayTimeZone": "Asia/Tokyo",
      "format": "YYYY-MM-DD HH:mm:ss"
    }
  ]
}
```

## 属性表

| 属性名 | 类型 | 默认值 | 说明 |
| --------------- | --------- | ------------ | ------------------------------------------------------------------------------------------------------ |
| type | `string` |  | 如果在 Table、Card 和 List 中，为`"date"`；在 Form 中用作静态展示，为`"static-date"` |
| className | `string` |  | 外层 CSS 类名 |
| value | `string` |  | 显示的日期数值 |
| name | `string` |  | 在其他组件中，时，用作变量映射 |
| placeholder | `string` | `-` | 占位内容 |
| displayFormat | `string` | `YYYY-MM-DD` | 展示格式, 更多格式类型请参考 [文档](https://momentjs.com/docs/#/displaying/format/) |
| valueFormat | `string` | `X` | 数据格式，默认为时间戳。更多格式类型请参考 [文档](https://momentjs.com/docs/#/displaying/format/) |
| fromNow | `boolean` | `false` | 是否显示相对当前的时间描述，比如: 11 小时前、3 天前、1 年前等，fromNow 为 true 时，format 不生效。 |
| updateFrequency | `number` | `60000` | 更新频率， 默认为 1 分钟 |
| displayTimeZone | `string` |  | 设置日期展示时区，可设置清单参考：https://gist.github.com/diogocapela/12c6617fc87607d11fd62d2a4f42b02a |

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core（`yes` / `On` / `012` 当字符串）。
- 可包在 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage` 里，`spec` 仍是这棵 widget 树。
- 当前实现：StaticValue 展示；date / datetime 过滤器已接，组件自身格式档未齐。属性 / 事件 / 动作表按 Amis 6.13.0 主路径列出，运行时尚未接上的字段预览可能无对应行为。
