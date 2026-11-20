---
title: Formula 公式
outline: deep
---

# Formula 公式

::: warning 实现进度 65% · 进行中
基本用法对标 Amis 自动 A+B（隐藏 formula + 只读和），Formula 写值记 `__changeReason.type = formula`。对照桌面 **2/3**（P0 0；空值示例 Amis `rendered` 常假红）。缺 input-formula 编辑器与表达式层统一（D2）
:::

`formula` 对齐 Amis 同名 schema。Vamis 用 YAML 或 JSON 书写，字段名不改写；UI 走 shadcn-vue / Tailwind：不搬 `cxd-` 前缀，cxd 的盒子、密度、交互尽量像素级落到 token 与 utility。

属于侧栏分类 **数据输入**。对照进度以仓库组件 P0 TODO 为准。作者态 YAML 与 JSON 同等有效。

可以设置公式，将公式结果设置到指定表单项上。

> 该表单项是隐藏的

## 基本用法

```schema: scope="body"
{
  "type": "form",
  "body": [
    {
      "type": "input-number",
      "name": "a",
      "label": "A"
    },
    {
      "type": "input-number",
      "name": "b",
      "label": "B"
    },
    {
      "type": "input-number",
      "name": "sum",
      "label": "和",
      "disabled": true,
      "description": "自动计算 A + B"
    },
    {
      "type": "formula",
      "name": "sum",
      "value": 0,
      "formula": "a + b"
    }
  ]
}
```

## 自动应用

```schema: scope="body"
{
  "type": "form",
  "body": [
    {
      "type": "input-number",
      "name": "a",
      "label": "A"
    },
    {
      "type": "input-number",
      "name": "b",
      "label": "B"
    },
    {
      "type": "input-number",
      "name": "sum",
      "label": "和",
      "disabled": true,
      "description": "自动计算 A + B"
    },
    {
      "type": "formula",
      "name": "sum",
      "value": 0,
      "formula": "a + b"
    }
  ]
}
```

## 手动应用

配置`"autoSet": false`，然后按钮上配置`target`，配置值为`formula`的`id`值，就可以实现手动触发公式应用

```schema: scope="body"
{
  "type": "form",
  "body": [
    {
      "type": "input-number",
      "name": "a",
      "label": "A"
    },
    {
      "type": "input-number",
      "name": "b",
      "label": "B"
    },
    {
      "type": "group",
      "body": [
        {
          "type": "input-number",
          "name": "sum",
          "label": "和",
          "disabled": true,
          "columnClassName": "col-sm-11"
        },
        {
          "type": "button",
          "label": "计算",
          "columnClassName": "col-sm-1 v-bottom",
          "target": "theFormula"
        }
      ]
    },
    {
      "type": "formula",
      "name": "sum",
      "id": "theFormula",
      "value": 0,
      "formula": "a + b",
      "initSet": false,
      "autoSet": false
    }
  ]
}
```

> 为什么设置`id`而不是设置`name`?
>
> 因为`name`值已经用来设置目标变量名了，这个表单项肯定已经存在了，所以不是唯一了，不能够被按钮指定。

## 条件应用

可以配置`condition`用来指定作用条件，有两种写法：

- 用 tpl 语法，把关联的字段写上如： `${xxx} ${yyy}` 意思是当 xxx 和 yyy 的取值结果变化了就再应用一次公式结果。
- 自己写判断如: `this.xxx == "a" && this.xxx !== this.__prev.xxx` 当 xxx 变化了，且新的值是字符 "a" 时应用，可以写更加复杂的判断。

```schema: scope="body"
{
  "type": "form",
  "body": [
    {
      "type": "radios",
      "name": "radios",
      "label": "radios",
      "options": [
        {
          "label": "a",
          "value": "a"
        },
        {
          "label": "b",
          "value": "b"
        }
      ],
      "description": "radios 变化会自动清空 B"
    },
    {
      "type": "input-text",
      "name": "b",
      "label": "B"
    },
    {
      "type": "formula",
      "name": "b",
      "value": "some string",
      "formula": "''",
      "condition": "${radios}",
      "initSet": false
    }
  ]
}
```

## 使用新表达式语法

通过新的[表达式](/concepts/expression)语法，可以调用其中的函数，比如

```schema: scope="body"
{
  "type": "form",
  "debug": true,
  "body": [
    {
      "type": "static",
      "value": "这个表单没有内容，通过上面的 debug 可以看到输出当前日期"
    },
    {
      "type": "formula",
      "name": "date",
      "formula": "${DATETOSTR(NOW(), 'YYYY-MM-DD')}"
    }
  ]
}
```

这种写法默认会解决浮点数计算问题（需要更新到 amis），比如

```schema: scope="body"
{
  "type": "form",
  "body": [
    {
      "type": "input-number",
      "name": "a",
      "value": 0.1,
      "label": "A"
    },
    {
      "type": "input-number",
      "name": "b",
      "value": 0.2,
      "label": "B"
    },
    {
      "type": "input-number",
      "name": "sum",
      "label": "直接相加",
      "disabled": true
    },
    {
      "type": "formula",
      "name": "sum",
      "formula": "a + b"
    },
    {
      "type": "input-number",
      "name": "sum-new",
      "label": "使用新表达式",
      "disabled": true
    },
    {
      "type": "formula",
      "name": "sum-new",
      "formula": "${a + b}"
    }
  ]
}
```

## 属性表

| 属性名    | 类型                                        | 默认值 | 说明                                                                                                           |
| --------- | ------------------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------- |
| name      | `string`                                    |        | 需要应用的表单项`name`值，公式结果将作用到此处指定的变量中去。                                                 |
| formula   | [表达式](/concepts/expression) |        | 应用的公式                                                                                                     |
| condition | [表达式](/concepts/expression) |        | 公式作用条件                                                                                                   |
| initSet   | `boolean`                                   | `true` | 初始化时是否设置                                                                                               |
| autoSet   | `boolean`                                   | `true` | 观察公式结果，如果计算结果有变化，则自动应用到变量上                                                           |
| id        | `string`                                    |        | 定义个名字，当某个按钮的目标指定为此值后，会触发一次公式应用。这个机制可以在 `autoSet` 为 false 时用来手动触发 |

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core（`yes` / `On` / `012` 当字符串）。
- 可包在 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage` 里，`spec` 仍是这棵 widget 树。
- 当前实现：基本用法对标 Amis 自动 A+B（隐藏 formula + 只读和），Formula 写值记 `__changeReason.type = formula`。对照桌面 **2/3**（P0 0；空值示例 Amis `rendered` 常假红）。缺 input-formula 编辑器与表达式层统一（D2）。属性 / 事件 / 动作表按 Amis 主路径列出，运行时尚未接上的字段预览可能无对应行为。
