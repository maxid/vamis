---
title: 联动
---

# 联动

::: tip 实现进度 90% · 已完成
文档主路径已对齐 Amis「联动」：`visibleOn` / `disabledOn`、select `source` 自动刷新、`sendOn`、主动 `reload`、提交回写、`form.target`、`name?a=${a}`、逗号多目标、动态 `target` / `name`、`clearValueOnHidden`。JSON 与 YAML 同等有效。
:::

上一节介绍了 [表达式](/concepts/expression)。表达式用得最多的场景，就是页面联动。作者态 **JSON 与 YAML 并列**，解析后走同一套 Scope / 组件注册表。

## 基本联动

常见需求包括：

- 某个条件下显示或隐藏某个组件
- 某个条件下请求接口
- 某个条件下停止轮询
- 等等

联动配置项一般都是 [表达式](/concepts/expression)。

### 组件配置联动

控制组件显隐、表单项禁用等：

```schema: scope="body"
type: form
body:
  - type: radios
    name: foo
    label: false
    options:
      - label: 类型1
        value: 1
      - label: 类型2
        value: 2
  - type: input-text
    name: text1
    label: false
    placeholder: 选中 类型1 时可见
    visibleOn: "${foo == 1}"
  - type: input-text
    name: text2
    label: false
    placeholder: 选中 类型2 时不可点
    disabledOn: "${foo == 2}"
```

同一份 JSON 也有效：

```schema: scope="body"
{
  "type": "form",
  "body": [
    {
      "type": "radios",
      "name": "foo",
      "label": false,
      "options": [
        { "label": "类型1", "value": 1 },
        { "label": "类型2", "value": 2 }
      ]
    },
    {
      "type": "input-text",
      "name": "text1",
      "label": false,
      "placeholder": "选中 类型1 时可见",
      "visibleOn": "${foo == 1}"
    },
    {
      "type": "input-text",
      "name": "text2",
      "label": false,
      "placeholder": "选中 类型2 时不可点",
      "disabledOn": "${foo == 2}"
    }
  ]
}
```

效果：

1. 选中「类型1」时才显示第一项输入
2. 选中「类型2」时第二项输入禁用

> **注意：**
>
> 表单项隐藏后，当前数据域**不会**删掉该字段，提交时可能仍带上隐藏项的值。
>
> 若提交时不要这个字段，配 [clearValueOnHidden](/components/form/formitem)。

### 接口联动

#### 基本使用

```schema: scope="body"
type: form
mode: horizontal
actions: []
body:
  - type: radios
    name: a
    label: 选项1
    inline: true
    options:
      - label: 选项A
        value: 1
      - label: 选项B
        value: 2
      - label: 选项C
        value: 3
  - type: select
    name: b
    label: 选项2
    size: sm
    source: /api/mock2/options/level2?a=${a}
    description: 切换「选项1」会重新拉取「选项2」的 source
```

每次改「选项1」，「选项2」的 `source` 会按新的 `a` 再请求一次。

初始化类接口的 URL 里如果用了数据映射（例如 `query=${query}`），当前域里被引用的变量一变，就会自动重拉：

```json
{
  "initApi": "/api/initData?query=${query}"
}
```

触发变量变化的常见方式：

1. 改表单项，`name` 对应的值变了
2. 通过[组件间联动](#组件间联动)把数据发到目标组件

接口联动一般只适用于初始化接口，例如：

- `form` 的 `initApi`
- `select` 的 `source`（`url` 含 `$` 才会自动刷新；对象里配了 `data` 则默认不跟踪 URL，要主动 `reload`）
- `service` 的 `api` / `schemaApi`
- `crud` 的 `api`（Amis 默认跟地址栏联动；Vamis 尚未接 `syncLocation`，文档示例不必关它）

> 如果 api 地址里有变量，比如 `/api/mock2/sample/${id}`，分页参数不会自动带上，需要自己写成 `/api/mock2/sample/${id}?page=${page}&perPage=${perPage}`。

#### 配置请求条件

变量变了默认总会去拉。也可以加 `sendOn`，只有条件成立才请求。

```schema: scope="body"
type: form
mode: horizontal
actions: []
body:
  - type: radios
    name: a
    label: 选项1
    inline: true
    options:
      - label: 选项A
        value: 1
      - label: 选项B
        value: 2
      - label: 选项C
        value: 3
  - type: select
    name: b
    label: 选项2
    size: sm
    source:
      method: get
      url: /api/mock2/options/level2?a=${a}
      sendOn: "${a === 2}"
    description: 只有选「选项B」时才拉取「选项2」
```

更多见 [API · 配置请求条件](/types/api)。Amis 示例里的 `this.a === 2` 仍然能求值，新示例统一写 `${}`。

#### 主动触发

输入框每敲一个字都重拉会很吵。把取值放到 `api.data`，再用按钮 `reload` 指定组件：

```schema: scope="body"
type: form
name: my_form
body:
  - type: input-text
    name: keyword
    addOn:
      type: button
      label: 搜索
      actionType: reload
      target: my_form.select
  - type: select
    name: select
    label: Select
    source:
      method: get
      url: /api/mock2/form/getOptions?waitSeconds=1
      data:
        a: "${keyword}"
```

1. `source` 写成对象，变量放进 `data`（这时 URL 不含 `$`，不会跟着输入自动刷新）
2. 搜索按钮 `actionType: reload`，`target` 指向 `表单名.组件名`
3. 只有点搜索才会把当前 `keyword` 发给 select，重新拉选项

### 表单提交返回数据

提交成功后会把接口返回的 `data` 合并进当前表单域，所以可以立刻拿返回值做显隐。

```schema: scope="body"
type: form
title: 查询用户 ID
api: /api/mock2/form/saveForm
actions: []
body:
  - type: input-group
    name: input-group
    body:
      - type: input-text
        name: name
        label: 姓名
      - type: submit
        label: 查询
        level: primary
  - type: static
    name: id
    label: 返回 ID
    visibleOn: "${id !== undefined}"
```

`actions: []` 去掉默认提交按钮，改用 `input-group` 里的 `submit`。mock 返回类似：

```json
{
  "status": 0,
  "msg": "保存成功",
  "data": {
    "id": 1
  }
}
```

返回的 `data` 会写入表单域，下面的 `static` 就能显示。Amis 示例写的是 `typeof data.id !== 'undefined'`（旧版 JS 表达式里 `data` 即当前域）。公式没有 `typeof` 一元运算，也没有 `data` 别名，新示例用 `${id !== undefined}`。

### 其他联动

还有组件自己的开关，例如 form 的 `disabledOn`、crud 的 `itemDraggableOn`，见对应组件文档。

## 组件间联动

同一层的 `form` 和 `crud` 不在一条数据链上，不能靠 `${keywords}` 从 crud 里取到旁边表单的值。

```schema: scope="body" height=360
- type: form
  title: 查询条件
  body:
    - type: input-text
      name: keywords
      label: 关键字：
  submitText: 搜索
- type: crud
  api: /api/mock2/sample
  headerToolbar: []
  columns:
    - name: id
      label: ID
    - name: engine
      label: Rendering engine
    - name: browser
      label: Browser
    - name: platform
      label: Platform(s)
    - name: version
      label: Engine version
```

上面这份搜了也不会更新列表。改成给 crud 起 `name`，表单写 `target`：

```schema: scope="body" height=360
- type: form
  title: 查询条件
  target: my_crud
  body:
    - type: input-text
      name: keywords
      label: 关键字：
  submitText: 搜索
- type: crud
  name: my_crud
  api: /api/mock2/sample
  headerToolbar: []
  columns:
    - name: id
      label: ID
    - name: engine
      label: Rendering engine
    - name: browser
      label: Browser
    - name: platform
      label: Platform(s)
    - name: version
      label: Engine version
```

两处调整：

1. crud 的 `name` 设为 `my_crud`
2. form 的 `target` 指向这个名字

提交时会把表单数据**合并**进目标组件的数据域并刷新。对 CRUD 来说，刷新就是按新条件重拉列表。

> CRUD 也可以用内置 `filter` 做同一件事，见 [CRUD](/components/crud)。

再看两个 form 之间怎么传值。

### 发送指定数据

`target` 可以带参数，只发一部分字段：`xxx?a=${a}&b=${b}`。

```schema: scope="body"
- type: form
  title: form1
  mode: horizontal
  api: /api/mock2/form/saveForm
  body:
    - type: input-text
      name: name
      label: Name
    - type: input-text
      name: email
      label: Email
    - type: input-text
      name: company
      label: Company
  actions:
    - type: action
      actionType: reload
      label: 发送到 form2
      target: form2?name=${name}&email=${email}
- type: form
  title: form2
  name: form2
  mode: horizontal
  api: /api/mock2/form/saveForm
  body:
    - type: input-text
      name: name
      label: MyName
    - type: input-text
      name: email
      label: MyEmail
    - type: input-text
      name: company
      label: Company
```

按钮上的 `target: form2?name=${name}&email=${email}` 只会把当前域的 `name`、`email` 发给 form2，不会改 company。

### 配置多个目标

`target` 用逗号隔开多个组件名：

```schema: scope="body"
type: page
body:
  - type: service
    name: target1
    data:
      n: 0
    body:
      type: tpl
      tpl: "target1 n=${n}"
  - type: service
    name: target2
    data:
      n: 0
    body:
      type: tpl
      tpl: "target2 n=${n}"
  - type: button
    label: 刷新两个目标
    onEvent:
      click:
        actions:
          - actionType: reload
            target: target1,target2
            data:
              n: 1
```

点击后 `target1` 和 `target2` 都会刷新。组件间联动也能实现上面那些基本联动（显隐、接口重拉等）。

### 动态目标

刷新目标支持表达式，例如 `form-${ xxx ? '1' : '2'}`。

```schema: scope="body" height=520
- type: form
  title: 查询条件
  target: my_crud_${searchTarget}
  data:
    searchTarget: 1
  body:
    - type: radios
      name: searchTarget
      label: 选择目标
      options:
        - value: 1
          label: 列表 1
        - value: 2
          label: 列表 2
    - type: input-text
      name: keywords
      label: 关键字：
  submitText: 搜索
- type: crud
  name: my_crud_1
  title: 列表 1
  api: /api/mock2/sample
  headerToolbar: []
  columns:
    - name: id
      label: ID
    - name: engine
      label: Rendering engine
    - name: browser
      label: Browser
    - name: platform
      label: Platform(s)
    - name: version
      label: Engine version
- type: crud
  name: my_crud_2
  title: 列表 2
  api: /api/mock2/sample
  headerToolbar: []
  columns:
    - name: id
      label: ID
    - name: engine
      label: Rendering engine
    - name: browser
      label: Browser
    - name: platform
      label: Platform(s)
    - name: version
      label: Engine version
```

如果目标在列表里，同一份 schema 会渲染出多份实例，固定名字找不到「这一行」的那个。`name` 本身也可以是动态的，例如 `my-service-${id}` 把行数据里的 id 编进去。

```schema: scope="body" height=420
type: crud
api: /api/mock2/sample
headerToolbar: []
columns:
  - name: id
    label: ID
  - type: service
    name: my-servce-${id}
    api: /api/mock2/sample/${id}
    label: Service
    body:
      type: tpl
      tpl: "${browser}"
  - type: operation
    label: 操作
    buttons:
      - type: button
        label: 编辑
        actionType: dialog
        reload: my-servce-${id}
        dialog:
          title: 编辑
          body:
            type: form
            api: /api/mock2/sample/${id}
            body:
              - type: input-text
                name: browser
                label: Browser
```

> 这个例子的接口是 mock。保存后再刷新对应行的 service，才能看到改过的 `browser`。
