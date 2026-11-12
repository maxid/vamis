---
title: InputImage 图片
outline: deep
---

# InputImage 图片

::: info 实现进度 80% · 进行中
主路径已对齐：`receiver` 上传（POST form-data、返回 `data.value` / `data.url`）、`autoUpload` / 手动上传、`multiple` / `joinValues` / `extractValue` / `delimiter`、`accept` / `capture`、`maxSize` / `maxLength`、`limit` 尺寸校验、`frameImage` / `fixedSize`、`uploadBtnText`、`autoFill` / `initAutoFill`、`draggable` 排序、`change` / `remove` / `success` / `fail`、`clear`；缩略图 120 方块（`--input-image-*`）。缺 `crop` / `dropCrop` / `initCrop` / `cropFormat` / `cropQuality`、`allowInput`、图片预览画廊。
:::

图片格式输入。选中文件后按 `receiver` 上传，**提交的是接口返回的图片 url**；如果需要以表单文件方式提交，用 [InputFile](./input-file)。属于普通表单项，通用属性见 [FormItem](./formitem)；YAML / JSON 同等有效。

属于侧栏分类 **数据输入**。对照进度以仓库组件 P0 TODO 为准。

## 基本用法

```schema: scope="body"
type: form
api: /api/mock2/form/saveForm
body:
  - type: input-image
    name: image
    label: image
    receiver: /api/upload/file
```

默认 `autoUpload: true`，选完图就调用 `receiver`；接口返回 `{ "status": 0, "data": { "value": "/uploads/xx.png" } }` 后，提交表单时 `image` 就是该地址。也可以返回 `data.url` / `data.filename`，`autoFill` 用得到。

## 限制文件类型

`accept` 传图片后缀（`.jpg,.png`）或 MIME：

```schema: scope="body"
type: form
api: /api/mock2/form/saveForm
body:
  - type: input-image
    name: image
    label: 限制只能上传 jpg
    accept: ".jpg"
    receiver: /api/upload/file
```

## 限制文件宽度

`limit` 支持 `width` / `height` / `minWidth` / `minHeight` / `maxWidth` / `maxHeight` / `aspectRatio`，超出标红且不进入上传：

```schema: scope="body"
type: form
api: /api/mock2/form/saveForm
body:
  - type: input-image
    name: image
    label: 限制只能上传宽度大于 1000 的图片
    accept: ".jpg"
    limit:
      minWidth: 1000
    receiver: /api/upload/file
```

## 限制文件大小

`maxSize` 单位 B：

```schema: scope="body"
type: form
api: /api/mock2/form/saveForm
body:
  - type: input-image
    name: image
    label: 上传文件不能大于 1K
    accept: ".jpg"
    maxSize: 1024
    receiver: /api/upload/file
```

## 支持裁剪（未接）

Amis 通过 `crop` / `cropFormat` / `cropQuality` / `dropCrop` / `initCrop` 接 cropper。Vamis 暂不内置裁剪器，这些字段不生效，已列入 TODO；需要裁剪请宿主侧处理后再写入图片地址。

## 手动上传

默认 `"autoUpload": true`，即添加文件后自动上传。可以设置 `"autoUpload": false` 关闭自动上传，此时通过点击底部上传按钮上传。

```schema: scope="body"
type: form
api: /api/mock2/form/saveForm
data:
  file:
    id: "2ba48d02d348"
    value: "https://internal-amis-res.cdn.bcebos.com/images/2020-1/1578395693148/1314a2a3d3f6.jpeg"
    url: "https://internal-amis-res.cdn.bcebos.com/images/2020-1/1578395693148/1314a2a3d3f6.jpeg"
    filename: "file(single).md"
    name: "file(single).md"
    state: "uploaded"
  files:
    - id: "2ba48d02d349"
      value: "https://internal-amis-res.cdn.bcebos.com/images/2020-1/1578395692722/4f3cb4202335.jpeg"
      url: "https://internal-amis-res.cdn.bcebos.com/images/2020-1/1578395692722/4f3cb4202335.jpeg"
      preview: "https://internal-amis-res.cdn.bcebos.com/images/2020-1/1578395692722/4f3cb4202335.jpeg"
      filename: "file1.md"
      name: "file1.md"
      state: "uploaded"
    - id: "14723e0bc640"
      value: "https://internal-amis-res.cdn.bcebos.com/images/2020-1/1578395692942/d8e4992057f9.jpeg"
      url: "https://internal-amis-res.cdn.bcebos.com/images/2020-1/1578395692942/d8e4992057f9.jpeg"
      preview: "https://internal-amis-res.cdn.bcebos.com/images/2020-1/1578395692942/d8e4992057f9.jpeg"
      filename: "file2.md"
      name: "file2.md"
      state: "uploaded"
body:
  - type: input-image
    name: files
    label: File(多选)
    mode: horizontal
    labelAlign: left
    accept: "image/jpeg, image/jpg, image/png, image/gif"
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
              msg: "「${event.data.path}」上传成功"
  - type: input-image
    name: file
    label: File(单选)
    mode: horizontal
    labelAlign: left
    accept: "image/jpeg, image/jpg, image/png, image/gif"
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
              msg: "「${event.data.path}」上传成功"
```

### 隐藏上传按钮

设置 `"hideUploadButton": true` 隐藏手动上传的按钮。

```schema: scope="body"
type: form
api: /api/mock2/form/saveForm
data:
  file:
    id: "2ba48d02d348"
    value: "https://internal-amis-res.cdn.bcebos.com/images/2020-1/1578395693148/1314a2a3d3f6.jpeg"
    url: "https://internal-amis-res.cdn.bcebos.com/images/2020-1/1578395693148/1314a2a3d3f6.jpeg"
    filename: "file(single).md"
    name: "file(single).md"
    state: "uploaded"
  files:
    - id: "2ba48d02d349"
      value: "https://internal-amis-res.cdn.bcebos.com/images/2020-1/1578395692722/4f3cb4202335.jpeg"
      url: "https://internal-amis-res.cdn.bcebos.com/images/2020-1/1578395692722/4f3cb4202335.jpeg"
      preview: "https://internal-amis-res.cdn.bcebos.com/images/2020-1/1578395692722/4f3cb4202335.jpeg"
      filename: "file1.md"
      name: "file1.md"
      state: "uploaded"
    - id: "14723e0bc640"
      value: "https://internal-amis-res.cdn.bcebos.com/images/2020-1/1578395692942/d8e4992057f9.jpeg"
      url: "https://internal-amis-res.cdn.bcebos.com/images/2020-1/1578395692942/d8e4992057f9.jpeg"
      preview: "https://internal-amis-res.cdn.bcebos.com/images/2020-1/1578395692942/d8e4992057f9.jpeg"
      filename: "file2.md"
      name: "file2.md"
      state: "uploaded"
body:
  - type: input-image
    name: files
    label: File(多选)
    mode: horizontal
    labelAlign: left
    accept: "image/jpeg, image/jpg, image/png, image/gif"
    receiver: /api/upload/file
    multiple: true
    autoUpload: false
    joinValues: false
    hideUploadButton: true
    onEvent:
      success:
        actions:
          - actionType: toast
            args:
              msgType: info
              msg: "「${event.data.path}」上传成功"
  - type: input-image
    name: file
    label: File(单选)
    mode: horizontal
    labelAlign: left
    accept: "image/jpeg, image/jpg, image/png, image/gif"
    receiver: /api/upload/file
    multiple: false
    autoUpload: false
    joinValues: false
    hideUploadButton: true
    onEvent:
      success:
        actions:
          - actionType: toast
            args:
              msgType: info
              msg: "「${event.data.path}」上传成功"
```

## 自动填充

上传成功后，可以通过配置 `autoFill` 将上传接口返回的值填充到某个表单项中：

```schema: scope="body"
type: form
api: /api/mock2/form/saveForm
body:
  - type: input-image
    name: image
    label: image
    receiver: /api/upload/file
    autoFill:
      myUrl: "${url}"
  - type: input-text
    name: myUrl
    label: url
```

接口返回 `data.value` / `data.filename` / `data.url`，`autoFill` 里可用 `${url}` / `${filename}` 等字段。

### 多选模式

多选时通过 `items` 取当前选中集合：

```schema: scope="body"
type: form
debug: true
api: /api/mock2/form/saveForm
body:
  - type: input-image
    name: image
    label: image
    multiple: true
    receiver: /api/upload/file
    autoFill:
      myUrl: "${items|pick:url}"
      lastUrl: "${items|last|pick:url}"
  - type: tpl
    label: false
    inline: false
    tpl: "<strong>myUrl集合</strong>"
  - type: each
    name: myUrl
    className: mb-1
    items:
      type: tpl
      tpl: "<span class='label label-info m-l-sm inline-block mb-1'>${item}</span>"
  - type: tpl
    label: false
    inline: false
    tpl: "<strong>lastUrl</strong>"
  - type: input-text
    name: lastUrl
    label: lastUrl
    inline: false
```

### 其他表单项填充

反过来，其他表单项也可以用 `autoFill` 给 `input-image` 填值：

```schema: scope="body"
type: form
title: 表单
body:
  - type: select
    label: 选项
    name: imageUrl
    delimiter: "|"
    autoFill:
      inputImage: "${value}"
    options:
      - label: imageURL
        value: "https://internal-amis-res.cdn.bcebos.com/images/2020-1/1578395692722/4f3cb4202335.jpeg"
      - label: 空链接
        value: ""
  - type: input-image
    label: 图片上传
    name: inputImage
    imageClassName: r w-full
```

### initAutoFill 初始化时自动同步

表单反显时用 `initAutoFill` 控制 `autoFill` 是否执行（默认 `true`，与 Amis 源码一致；Amis 属性表写 `false`，按源码为准）。Amis 原例放在 CRUD 弹窗里，这里用等价 form 展示：

```schema: scope="body"
type: form
data:
  image: "https://internal-amis-res.cdn.bcebos.com/images/2020-1/1578395692722/4f3cb4202335.jpeg"
body:
  - type: input-image
    name: image
    label: image
    receiver: /api/upload/file
    autoFill:
      text: "${url}"
    initAutoFill: true
  - type: input-text
    name: text
    label: 文本
  - type: input-image
    name: carousel
    label: image
    receiver: /api/upload/file
    autoFill:
      id: "${url}"
    initAutoFill: false
  - type: input-text
    name: id
    label: ID
```

## 拖拽排序

`multiple` + `draggable: true` 时可拖拽调整图片顺序，值顺序同步变化。

```schema: scope="body"
type: form
title: 表单
data:
  image:
    - http://www.sortablejs.com/assets/img/npm.png
    - http://www.sortablejs.com/assets/img/bower.png
    - http://www.sortablejs.com/assets/img/js.png
body:
  - type: tpl
    tpl: 'Images: <br/>${image|split|join:"<br/>"}'
  - type: input-image
    name: image
    label: Images
    multiple: true
    draggable: true
```

## 属性表

除了支持 [普通表单项属性表](./formitem#属性表) 中的配置以外，还支持：

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `receiver` | API | `/api/upload` | 上传文件接口 |
| `accept` | `string` | `image/jpeg, image/jpg, image/png, image/gif` | 支持的图片类型 |
| `capture` | `string` | | 原生 `input[type=file]` 的 capture |
| `maxSize` | `number` | | 单张大小上限（B） |
| `maxLength` | `number` | | 最多上传张数 |
| `multiple` | `boolean` | `false` | 是否多选 |
| `joinValues` | `boolean` | `true` | 多选值是否拼成字符串 |
| `extractValue` | `boolean` | `false` | 只取 value，不保留整项对象 |
| `delimiter` | `string` | `,` | 拼接符 |
| `autoUpload` | `boolean` | `true` | 选完是否自动上传 |
| `hideUploadButton` | `boolean` | `false` | 隐藏手动上传按钮 |
| `fileField` | `string` | `file` | 上传文件字段名 |
| `limit` | Limit | | 图片尺寸限制 |
| `frameImage` | `string` | | 添加块占位图 |
| `fixedSize` | `boolean` | | 固定尺寸展示 |
| `fixedSizeClassName` | `string` | | 固定尺寸类名 |
| `uploadBtnText` | `string` | `图片上传` | 上传块文案 |
| `initAutoFill` | `boolean` | `true`（源码） | 反显时是否执行 autoFill |
| `draggable` | `boolean` | `false` | 拖拽排序 |
| `draggableTip` | `string` | `拖拽排序` | 拖拽提示 |
| `crop` / `cropFormat` / `cropQuality` / `dropCrop` / `initCrop` | | | **未接** |
| `showErrorModal` / `invalidTypeMessage` / `invalidSizeMessage` | | | 校验失败提示（沿用 FileControl） |

### Limit 属性表

| 属性名 | 类型 | 说明 |
|--------|------|------|
| `width` / `height` | `number` | 精确宽 / 高 |
| `minWidth` / `minHeight` | `number` | 最小宽 / 高 |
| `maxWidth` / `maxHeight` | `number` | 最大宽 / 高 |
| `aspectRatio` | `number` | 宽高比（如 `1.7777`） |

## 事件表

| 事件名称 | 事件参数 | 说明 |
|----------|----------|------|
| `change` | `[name]: FileValue \| Array<FileValue>` | 文件值变化（上传失败同样触发） |
| `remove` | `item: FileValue`、`[name]` | 移除文件 |
| `success` | `item: FileValue`、`result: any`、`id: string`、`[name]` | 上传成功 |
| `fail` | `item: FileValue`、`error: object`、`[name]` | 上传失败 |

### FileValue 属性表

| 属性名 | 类型 | 说明 |
|--------|------|------|
| `name` | `string` | 图片名称 |
| `value` | `string` | 上传后的 url |
| `state` | `string` | `pending` / `uploaded` / `invalid` / `error` |
| `error` | `string` | 错误信息 |

## 动作表

| 动作名称 | 动作配置 | 说明 |
|----------|----------|------|
| `clear` | - | 清空图片 |

### clear

```schema: scope="body"
type: form
debug: true
body:
  - type: input-image
    name: image
    label: Image
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

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core。
- 上传管线复用 InputFile：`receiver` 返回 `data.value` / `data.url` 作为图片地址；`change` / `remove` / `success` / `fail` 与 `clear` 对齐。
- **未接**：`crop` 系列（Vamis 不内置 cropper）、`allowInput`（手填图片地址）、图片预览画廊（点击缩略图目前是新窗口打开原图）；`uploadBtnText` 只收字符串（SchemaNode 未接），`fixedSize` 只加类名、未按占位图换算宽度。
- Vamis 额外支持 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage`。
