---
title: InputFile 文件上传
outline: deep
---

# InputFile 文件上传

::: info 实现进度 88% · 进行中
主路径已对齐：`receiver` POST form-data、默认 `autoUpload`、`accept` / `maxSize` / 多选 `joinValues`、`asBlob` / `asBase64`、拖拽、分片 start/chunk/finish、`change` / `success` / `fail` / `remove`、`clear`。缺 `themeCss`、提交时未等 pending 传完（FormItem validate hook）。
:::

用来负责文件上传。文件上传成功后会返回文件地址，这个地址会作为表单项的值；整个表单提交时提交的是文件地址，上传已经在这个控件里完成。

> 如果希望文件内容伴随表单一起提交，可以配置 `asBlob` 或者 `asBase64`。

Vamis 用 YAML 或 JSON 书写，字段名不改写；UI 走 shadcn-vue / Tailwind：不搬 `cxd-` 前缀，cxd 的盒子、密度、交互尽量像素级落到 token 与 utility。

属于侧栏分类 **数据输入**。对照进度以仓库组件 P0 TODO 为准。

## 基本用法

```schema: scope="body"
type: form
api: /api/mock2/form/saveForm
body:
  - type: input-file
    name: file
    label: File
    accept: "*"
    receiver: /api/upload/file
```

### 接口说明

这是单文件上传模式，通过配置 `receiver` 来接管文件上传。

接口发送方式是 POST，数据体为 form-data。对应的文件字段名为 `file`，可以通过 `fileField` 改。要求返回的数据格式如下。

```json
{
  "status": 0,
  "msg": "",
  "data": {
    "value": "xxxx"
  }
}
```

- value：必须返回该字段用作回显，一般是文件资源地址

> 注意这只是单文件上传部分，如果允许上传的文件比较大，建议用分块上传，请阅读下面的分块上传部分。

## 限制文件类型

可以配置 `accept` 来限制可选择的文件类型，格式是文件后缀名 `.xxx`

```schema: scope="body"
type: form
api: /api/mock2/form/saveForm
body:
  - type: input-file
    name: file
    label: 限制只能上传csv文件
    accept: .csv
    receiver: /api/upload/file
```

想要限制多个类型，则用逗号分隔，例如：`.csv,.md`

## 限制文件大小

可以配置 `maxSize` 来限制文件大小

```schema: scope="body"
type: form
api: /api/mock2/form/saveForm
body:
  - type: input-file
    name: file
    label: 不能上传超过 1M 的文件
    maxSize: 1048576
    receiver: /api/upload/file
```

## 手动上传

默认 `"autoUpload": true`，即添加文件后自动上传。可以设置 `"autoUpload": false` 关闭自动上传，此时通过点击上传按钮上传。

```schema: scope="body"
type: form
api: /api/mock2/form/saveForm
data:
  file:
    id: 2ba48d02d348
    value: http://amis.bj.bcebos.com/amis/2017-11/1510713111265/fis3-react.md
    url: http://amis.bj.bcebos.com/amis/2017-11/1510713111265/fis3-react.md
    filename: file(single).md
    name: file(single).md
    state: uploaded
  files:
    - id: 2ba48d02d349
      value: http://amis.bj.bcebos.com/amis/2017-11/1510713111265/fis3-react.md
      url: http://amis.bj.bcebos.com/amis/2017-11/1510713111265/fis3-react.md
      filename: file1.md
      name: file1.md
      state: uploaded
    - id: "14723e0bc640"
      value: http://amis.bj.bcebos.com/amis/2017-11/1510713111265/fis3-react.md
      url: http://amis.bj.bcebos.com/amis/2017-11/1510713111265/fis3-react.md
      filename: file2.md
      name: file2.md
      state: uploaded
body:
  - type: input-file
    name: files
    label: File(多选)
    mode: horizontal
    labelAlign: left
    accept: "*"
    receiver: /api/upload/file
    multiple: true
    autoUpload: false
    joinValues: false
    onEvent:
      success:
        actions:
          - actionType: toast
            args:
              msgType: info
              msg: 「${event.data.path}」上传成功
  - type: input-file
    name: file
    label: File(单选)
    mode: horizontal
    labelAlign: left
    accept: "*"
    receiver: /api/upload/file
    multiple: false
    autoUpload: false
    joinValues: false
    onEvent:
      success:
        actions:
          - actionType: toast
            args:
              msgType: info
              msg: 「${event.data.path}」上传成功
```

## 作为表单项上传

如果不希望 InputFile 在提交 Form 之前上传，可以配置 `asBlob` 或者 `asBase64`。采用这种方式后，组件不再自己上传，而是直接把文件数据作为表单项的值，文件内容会在 Form 提交的接口里面一起带上。

```schema: scope="body"
type: form
api: /api/mock2/form/saveForm
debug: true
body:
  - type: input-file
    name: file
    label: File
    accept: "*"
    asBlob: true
```

上例中，选择任意文件，然后观察数据域变化；点击提交，会把接口数据格式调整为 `FormData`。

## 分块上传

如果文件过大，则可能需要使用分块上传。默认大于 5M（`chunkSize` 配置决定）的文件会自动开启，可以通过 `useChunk` 配置成 `false` 关闭。

分块上传需要配置三个接口：

- `startChunkApi` 用来做分块前的准备工作
- `chunkApi` 用来接收每个分块上传
- `finishChunkApi` 用来收尾分块上传

还可以通过 `concurrency` 控制并行数量，默认是 3。

### startChunkApi

用来做分块前的准备工作，一个文件只会调用一次。如果出错了，后续的分块上传就会中断。

发送说明：默认是 post，发送的数据中会包含 `filename` 字段，记录文件名，默认的数据体格式为 json。

要求返回的数据中必须包含：

- `uploadId` 这次上传的唯一 ID。
- `key` 有点类似 `uploadId`，可有可无。

```json
{
  "status": 0,
  "msg": "",
  "data": {
    "key": "images/JSSDK_page-xxxx.zip",
    "uploadId": "036f64cd5dd95750d4bcb33556b629c6"
  }
}
```

### chunkApi

用来接收每个分块上传。大文件会根据 `chunkSize` 分割成多块，然后每块上传都会调用这个接口。

发送说明：默认为 post，发送体格式为 form-data。包含：

- `uploadId` startChunkApi 返回的
- `key` startChunkApi 返回的
- `partNumber` 分块序号，从 1 开始。
- `partSize` 分块大小
- `file` 文件体

要求返回的数据中必须包含 `eTag`。

```json
{
  "status": 0,
  "msg": "",
  "data": {
    "eTag": "016bd9b68ddd5cd7318875da3ea28207"
  }
}
```

### finishChunkApi

等所有分块上传完后，将收集到的 `eTag` 信息合并一起，再次请求后端完成文件上传。

发送说明：默认为 post，数据体默认为 json，包含：

- `filename` 文件名
- `key` startChunkApi 返回的
- `uploadId` startChunkApi 返回的
- `partList` 数组，每个成员为 `{partNumber: xxx, eTag: "xxxxx"}`

数据返回必须有 `value` 属性，可选返回 `url` 用来决定文件的下载地址。

```json
{
  "status": 0,
  "msg": "",
  "data": {
    "value": "https://xxxx.cdn.bcebos.com/images/JSSDK_page-xxxxx.zip"
  }
}
```

## 自动填充

上传成功后，可以通过配置 `autoFill` 将上传接口返回的值填充到某个表单项中（在非表单下暂不支持）：

```schema: scope="body"
type: form
api: /api/mock2/form/saveForm
body:
  - type: input-file
    name: file
    label: File
    accept: "*"
    receiver: /api/upload/file
    autoFill:
      myUrl: "${url}"
  - type: input-text
    name: myUrl
    label: url
```

上例中，file 组件上传后，接口返回格式如下：

```json
{
  "status": 0,
  "msg": "",
  "data": {
    "value": "xxxxxxx",
    "filename": "xxxx.csv",
    "url": "http://xxxx.xxx.xxx"
  }
}
```

然后 file 上配置：

```json
{
  "autoFill": {
    "myUrl": "${url}"
  }
}
```

这样上传成功后，会把接口中的 `url` 变量赋值给 `myUrl`。

**多选模式**

当表单项为多选模式时，不能再直接取选项中的值了，而是通过 `items` 变量来取，通过它可以获取当前选中的选项集合。

```schema: scope="body"
type: form
debug: true
api: /api/mock2/form/saveForm
body:
  - type: input-file
    name: file
    label: File
    multiple: true
    receiver: /api/upload/file
    autoFill:
      myUrl: "${items|pick:url}"
      lastUrl: "${items|last|pick:url}"
```

## 拖拽上传

把文件拖入指定区域，完成上传，同样支持点击上传。

```schema: scope="body"
type: form
api: /api/mock2/form/saveForm
body:
  - type: input-file
    name: file
    label: File
    accept: "*"
    receiver: /api/upload/file
    drag: true
```

## 上传文件列表

```schema: scope="body"
type: form
api: /api/mock2/form/saveForm
debug: true
data:
  files:
    - id: 2ba48d02d349
      value: http://amis.bj.bcebos.com/amis/2017-11/1510713111265/fis3-react.md
      url: http://amis.bj.bcebos.com/amis/2017-11/1510713111265/fis3-react.md
      filename: file1.md
      name: file1.md
      state: uploaded
    - id: "14723e0bc640"
      value: http://amis.bj.bcebos.com/amis/2017-11/1510713111265/fis3-react.md
      url: http://amis.bj.bcebos.com/amis/2017-11/1510713111265/fis3-react.md
      filename: file2.md
      name: file2.md
      state: uploaded
body:
  - type: input-file
    name: files
    label: false
    mode: horizontal
    accept: "*"
    receiver: /api/mock2/upload/random
    multiple: true
    joinValues: false
```

## 属性表

除了支持 [普通表单项属性表](./formitem#属性表) 中的配置以外，还支持下面一些配置。

| 属性名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| receiver | [API](/types/api) | `/api/upload/file` | 上传文件接口 |
| accept | `string` | `''` | 源码默认空串（任意类型）。文档表曾写 `text/plain`；要限制请配后缀 `.xxx` |
| capture | `string` | | 控制 `input[type=file]` 的 capture，移动端可控制输入来源 |
| asBase64 | `boolean` | `false` | 将文件以 `base64` 的形式赋值给当前组件 |
| asBlob | `boolean` | `false` | 将文件以二进制的形式赋值给当前组件 |
| maxSize | `number` | | 默认没有限制。设置后，文件大小大于此值将不允许上传。单位为 `B` |
| maxLength | `number` | | 默认没有限制。设置后，一次只允许上传指定数量文件 |
| multiple | `boolean` | `false` | 是否多选 |
| drag | `boolean` | `false` | 是否为拖拽上传 |
| joinValues | `boolean` | `true` | [拼接值](./options#拼接值-joinvalues) |
| extractValue | `boolean` | `false` | [提取值](./options#提取多选值-extractvalue) |
| delimiter | `string` | `,` | [拼接符](./options#拼接符-delimiter) |
| autoUpload | `boolean` | `true` | 是否选择完就自动开始上传 |
| hideUploadButton | `boolean` | `false` | 隐藏上传按钮 |
| stateTextMap | object | `{ init: '', pending: '等待上传', uploading: '上传中', error: '上传出错', uploaded: '已上传', ready: '' }` | 上传状态文案 |
| fileField | `string` | `file` | FormData 里的文件字段名 |
| nameField | `string` | `name` | 接口返回哪个字段用来标识文件名 |
| valueField | `string` | `value` | 文件的值用哪个字段来标识 |
| urlField | `string` | `url` | 文件下载地址的字段名 |
| btnLabel | `string` | | 上传按钮的文字 |
| downloadUrl | `boolean` 或 `string` | `""` | 默认点文件名会打开路径；可加前缀。不希望这样可设为 `false` |
| useChunk | `boolean` 或 `"auto"` | `"auto"` | 大于 `chunkSize` 时自动改成分块上传 |
| chunkSize | `number` | `5 * 1024 * 1024` | 分块大小 |
| startChunkApi | [API](/types/api) | `/api/upload/startChunk` | 分块准备 |
| chunkApi | [API](/types/api) | `/api/upload/chunk` | 分块上传 |
| finishChunkApi | [API](/types/api) | `/api/upload/finishChunk` | 分块收尾 |
| concurrency | `number` | `3` | 分块上传时并行个数 |
| documentation | `string` | | 文档内容 |
| documentLink | `string` | | 文档链接 |
| initAutoFill | `boolean` | `true` | 初表单反显时是否执行 autoFill |
| invalidTypeMessage | `string` | | 校验格式失败后的提示。可以用 `{{}}` 取内部变量，如 `{{accept}}` |
| invalidSizeMessage | `string` | | 校验文件大小失败时的文字。可以用 `{{}}` 取内部变量，如 `{{maxSize}}` |

## 事件表

当前组件会对外派发以下事件，可以通过 `onEvent` 来监听这些事件，并通过 `actions` 来配置执行的动作。在 `actions` 中可以通过 `${事件参数名}` 或 `${event.data.[事件参数名]}` 来获取事件产生的数据，详细请查看[事件动作](/concepts/event-action)。

> `[name]` 表示当前组件绑定的名称，即 `name` 属性；如果没有配置 `name` 属性，则通过 `file` 取值。

| 事件名称 | 事件参数 | 说明 |
| --- | --- | --- |
| change | `[name]: FileValue` 或 `Array<FileValue>` 组件的值 | 上传文件值变化时触发（上传失败同样会触发） |
| remove | `item: FileValue` 被移除的文件；`[name]: FileValue` 或 `Array<FileValue>` 组件的值 | 移除文件时触发 |
| success | `item: FileValue` 上传的文件；`result` 接口返回；`[name]` 组件的值 | 上传成功时触发 |
| fail | `item: FileValue` 上传的文件；`error` 错误信息；`[name]` 组件的值 | 上传文件失败时触发 |

### FileValue 属性表

| 属性名 | 类型 | 说明 |
| --- | --- | --- |
| name | `string` | 文件名称 |
| value | `string` | 上传成功后返回的 url |
| state | `string` | 文件当前状态，值可为 `pending` `uploaded` `invalid` |
| error | `string` | 错误信息 |

## 动作表

当前组件对外暴露以下特性动作，其他组件可以通过指定 `actionType: 动作名称`、`componentId: 该组件 id` 来触发这些动作，详细请查看[事件动作](/concepts/event-action#触发其他组件的动作)。

| 动作名称 | 动作配置 | 说明 |
| --- | --- | --- |
| clear | - | 清空 |

### clear

```schema: scope="body"
type: form
debug: true
body:
  - type: input-file
    name: file
    label: File
    accept: "*"
    receiver: /api/upload/file
    id: clear_text
  - type: button
    label: 清空
    onEvent:
      click:
        actions:
          - actionType: clear
            componentId: clear_text
```

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core（`yes` / `On` / `012` 当字符串）。
- 可包在 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage` 里，`spec` 仍是这棵 widget 树。
- 盒模型按 Amis `_file.scss` 落到 `--file-*`，不搬 `.cxd-FileControl`。
- `accept` 源码默认是空串（任意类型），与文档表里的 `text/plain` 不一致；本页按源码。
- `themeCss` 未接。
- 提交时若仍有 `pending` 文件，不会像 Amis 那样在 FormItem `validate` 里拦住并自动开传。
- 剪切板粘贴文件未接。
