---
title: 表达式
---

# 表达式

::: tip 实现进度 90% · 已完成
文档主路径已对齐 Amis「表达式」：使用场景、`${}` 语法、公式函数、箭头函数、函数手册均可跑。JSON 与 YAML 同等有效。旧版纯 JS 仅兼容，不写入新示例（D2）。表达式诊断（D8）仍缺。
:::

表达式用来从当前数据域算出一个值。引擎是仓内 `@vamis/formula`（从 `amis-formula@6.13.0` 搬运）。作者态 **JSON 与 YAML 并列**，解析后进同一套求值器。

主路径是 `${...}`，和 [模板](/concepts/template) 取值规则相同，不用来回切换语法。

## 使用场景

很多字段都会走表达式：

- 模板里取值：`my name is ${xxx}`
- 接口地址参数：`/api/xxx?id=${id}`
- 接口发送映射（`api.data` 里的 `${}` 会先求值再发出去）
- 组件显隐：`visibleOn` / `hiddenOn` / `disabledOn`
- 表单默认值：`value: ${TODAY()}`
- 是否发请求：`sendOn`（D3 已接）
- 重新拉取依赖：`trackExpression`

接口映射可以用表达式算出分页参数。下面这份先在当前域里求值，效果和写进 `api.data` 相同：

```schema
type: page
data:
  page: 2
  perPage: 10
body:
  type: tpl
  tpl: "skip=${(page - 1) * perPage} · take=${perPage}"
```

组件显示与隐藏：

```schema
type: page
data:
  show: 1
body:
  - type: tpl
    tpl: 当前作用域中变量 show 是 1 的时候才可以看得到我哦~
    visibleOn: ${show === 1}
```

同一份 JSON 也有效：

```schema
{
  "type": "page",
  "data": { "show": 1 },
  "body": [
    {
      "type": "tpl",
      "tpl": "当前作用域中变量 show 是 1 的时候才可以看得到我哦~",
      "visibleOn": "${show === 1}"
    }
  ]
}
```

表单默认值可以写公式。`TODAY()` 返回今天：

```schema
type: page
body:
  type: tpl
  tpl: "今天是 ${DATETOSTR(TODAY(), 'YYYY-MM-DD')}"
```

Amis 早期还支持纯 JS 表达式，如 `data.xxx === 1`、`this.time % 5`。Vamis **仍能求值**（`visibleOn` / `sendOn` 没写 `${}` 时走同一入口），但文档和示例统一用 `${}`（D2：纯 JS 是历史遗留，安全性差，不要再写新的）。

## 表达式语法

表达式由开始字符、正文、结束字符组成。开始是 `${`，结束是 `}`，中间才是正文。

规则主要包含：

- 变量名：`xxx`、`xxx.yyy`、`xxx[yyy]`
- 布尔值：`true` / `false`
- `null` / `undefined`
- 数字：`123` 或 `123.23`
- 字符串：`"string"` 或 `'string'`
- 字符模板：`` `my name is ${name}` ``
- 数组：`[1, 2, 3]`
- 对象：`{a: 1, b: 2}`
- 组合：`{a: 1, b: [1, 2, 3], [key]: yyy}`
- 三元：`xx == 1 ? 2 : 3`
- 二元：

  - `+` `-` `*` `/` `**`
  - `||` `&&`
  - `|` `^` `&`（位运算）
  - `==` `!=` `===` `!==`
  - `<` `<=` `>` `>=`
  - `<<` `>>` `>>>`

- 一元：`!xx`、`~xx`、`+xx`、`-xx`
- 函数调用：`SUM(1, 2, 3)`
- 箭头函数：`() => abc`（只支持单表达式，不能写多条语句）。用来配其他函数，如 `ARRAYMAP(arr, item => item.abc)`
- 括号改优先级：`(10 - 2) * 3`

示例：

```schema
type: page
data:
  a: 1
  key: y
  obj:
    x: 2
    y: 3
  arr:
    - 1
    - 2
    - 3
body:
  - "a is ${a} <br>"
  - "a + 1 is ${a + 1} <br>"
  - "obj.x is ${obj.x} <br>"
  - "obj['x'] is ${obj['x']} <br>"
  - "obj[key] is ${obj[key]} <br>"
  - "arr[0] is ${arr[0]} <br>"
  - "arr[a] is ${arr[a]} <br>"
  - "arr[a + 1] is ${arr[a + 1]} <br>"
```

### 特殊字符变量名

默认 `${xxx.yyy}` 是取 `xxx` 的 `yyy` 属性。变量名本身就叫 `xxx.yyy` 时，用反斜杠转义：`${xxx\.yyy}`。

```schema
type: page
data:
  "com.xxx.xx": abc
body: "${com\\.xxx\\.xx}"
```

### 公式

除了简单运算，还集成了一批公式函数，如 `${AVG(1, 2, 3, 4)}`：

```schema
type: page
data:
  语文成绩: 81
body:
  - "1, 2, 3, 4 的平均数是 ${AVG(1, 2, 3, 4)} <br>"
  - "当前成绩：${IF(语文成绩 > 80, '优秀', '继续努力')}"
```

箭头函数只支持单表达式，常和 `ARRAYMAP` 一起用：

```schema
type: page
data:
  arr:
    - 1
    - 2
    - 3
body: "${ARRAYMAP(arr, item => item * 2)|json}"
```

## 函数调用示例

函数可以嵌套，参数可以是常量或变量：

```schema
type: page
body:
  type: form
  wrapWithPanel: false
  actions: []
  data:
    val: 3.5
  body:
    - type: static
      label: IF(true, 2, 3)
      tpl: "${IF(true, 2, 3)}"
    - type: divider
    - type: static
      label: MAX(1, -1, 2, 3, 5, -9)
      tpl: "${MAX(1, -1, 2, 3, 5, -9)}"
    - type: divider
    - type: static
      label: ROUND(3.5)
      tpl: "${ROUND(3.5)}"
    - type: divider
    - type: static
      label: ROUND(val)
      tpl: "${ROUND(val)}"
    - type: divider
    - type: static
      label: AVG(4, 6, 10, 10, 10)
      tpl: "${AVG(4, 6, 10, 10, 10)}"
    - type: divider
    - type: static
      label: UPPERMONEY(7682.01)
      tpl: "${UPPERMONEY(7682.01)}"
    - type: divider
    - type: static
      label: "TIMESTAMP(DATE(2021, 11, 21, 0, 0, 0), 'x')"
      tpl: "${TIMESTAMP(DATE(2021, 11, 21, 0, 0, 0), 'x')}"
    - type: divider
    - type: static
      label: "DATETOSTR(NOW(), 'YYYY-MM-DD')"
      tpl: "${DATETOSTR(NOW(), 'YYYY-MM-DD')}"
```

`${expr|filter}` 是同一套 parser 上的过滤器，详见 [模板](/concepts/template)。P0 已接 `raw` / `html` / `json` / `date` / `datetime` / `number` / `percent` / `default` / `truncate` / `first`。Amis 其余运行时过滤器（`map` / `bytes` 等）仍 P1。

下面是目前支持的函数手册（来自 `@vamis/formula`，与引擎同源）。

!!!include(@vamis/formula)!!!
