---
title: Avatar 头像
outline: deep
---

# Avatar 头像

::: info 实现进度 90% · 进行中
文档主路径已对齐：`src` 真图、`text`、`icon: fa fa-user`、`$var` 降级、`shape` / `size` / `fit` / `gap` 像素缩放、`onError` 置换、`draggable`、`badge`（含 ribbon）。对照 **13/13**。`fa-*` 走 Font Awesome；`onError` 字符串只在 `env.trusted` 编译（对照页已开）。
:::

用来显示用户头像。Vamis 用 YAML 或 JSON 书写，字段名不改写；UI 走 shadcn-vue / Tailwind：不搬 `cxd-` 前缀，cxd 的盒子、密度、交互尽量像素级落到 token 与 utility。

属于侧栏分类 **其他**。对照进度以仓库组件 P0 TODO 为准。作者态 YAML 与 JSON 同等有效。

`className` / `style` 打在宿主 `div.vamis-node`。头像本身是 `inline-block`，和按钮一样并排。同时有 `src`、`text`、`icon` 时：先图、再字、再图标。没写 `icon` 时默认 `fa fa-user`。

## 基本使用

```schema: scope="body"
type: avatar
src: https://suda.cdn.bcebos.com/amis/images/alice-macaw.jpg
```

## 文字

```schema: scope="body"
type: avatar
text: AM
```

## 图标

通过 `icon` 设置图标。`fa fa-*` 写在 `<i>` 上。

```schema: scope="body"
type: avatar
icon: fa fa-user
```

如果同时存在 `src`、`text` 和 `icon`，会优先用 `src`、接着 `text`、最后 `icon`。

## 动态图片或文字

`src`、`text` 都支持变量，可以从上下文中动态获取图片或文字：

- 第一个获取到了，显示图片
- 第二个没获取到，因此降级为显示 `icon`
- 第三个图片没获取到，由于 `text` 优先级比 `icon` 高，所以显示 `text`

```schema
type: page
data:
  myAvatar: https://suda.cdn.bcebos.com/amis/images/alice-macaw.jpg
body:
  - type: avatar
    icon: fa fa-user
    src: $myAvatar
  - type: avatar
    icon: fa fa-user
    src: $other
  - type: avatar
    src: $other
    icon: fa fa-user
    text: avatar
```

## 方形和圆角形

可以通过 `shape` 改成方形或圆角形。默认 `circle`。

```schema: scope="body"
type: container
bodyClassName: flex flex-wrap items-center
body:
  - type: avatar
    shape: square
    text: AM
  - type: avatar
    shape: rounded
    text: AM
    style:
      marginLeft: 10px
```

## 大小

源码默认 40px（`default` / `normal` / 空）。`small` 32px，`large` 48px，也可写数字。

```schema: scope="body"
type: container
bodyClassName: flex flex-wrap items-center
body:
  - type: avatar
    size: large
    icon: fa fa-user
  - type: avatar
    size: default
    icon: fa fa-user
  - type: avatar
    size: small
    icon: fa fa-user
  - type: avatar
    size: 60
    src: https://suda.cdn.bcebos.com/amis/images/alice-macaw.jpg
  - type: avatar
    src: https://suda.cdn.bcebos.com/amis/images/alice-macaw.jpg
  - type: avatar
    size: 20
    src: https://suda.cdn.bcebos.com/amis/images/alice-macaw.jpg
```

## 控制字符类型距离左右两侧边界单位像素

通过 `gap` 控制文字距左右边界的像素。文字超出时按 `(宽 − 2×gap) / 文字宽` 缩放，不是加内边距。

```schema: scope="body"
type: container
bodyClassName: flex flex-wrap items-center
body:
  - type: avatar
    text: ejson
    gap: 2
  - type: avatar
    text: ejson
    gap: 7
```

## 图片拉伸方式

通过 `fit` 控制图片拉伸方式，默认是 `cover`。

```schema: scope="body"
type: container
bodyClassName: flex flex-wrap items-center
body:
  - type: avatar
    fit: cover
    src: https://suda.cdn.bcebos.com/images/amis/plumeria.jpeg
  - type: avatar
    fit: fill
    src: https://suda.cdn.bcebos.com/images/amis/plumeria.jpeg
  - type: avatar
    fit: contain
    src: https://suda.cdn.bcebos.com/images/amis/plumeria.jpeg
  - type: avatar
    fit: none
    src: https://suda.cdn.bcebos.com/images/amis/plumeria.jpeg
  - type: avatar
    fit: scale-down
    src: https://suda.cdn.bcebos.com/images/amis/plumeria.jpeg
```

## 控制图片是否允许拖动

通过 `draggable` 控制图片是否允许拖动。

```schema: scope="body"
type: container
bodyClassName: flex flex-wrap items-center
body:
  - type: avatar
    fit: cover
    src: https://suda.cdn.bcebos.com/images/amis/plumeria.jpeg
    draggable: false
  - type: avatar
    fit: cover
    src: https://suda.cdn.bcebos.com/images/amis/plumeria.jpeg
    draggable: true
```

## 图片加载失败后，通过 onError 控制是否进行 text、icon 置换

如果同时存在 `text` 和 `icon`，会优先用 `text`、接着 `icon`。默认失败不置换；`onError: "return true;"` 才换成文字或图标。字符串函数体只在 `env.trusted` 下编译（文档预览已开）。

```schema: scope="body"
type: avatar
src: empty
text: avatar
onError: return true;
```

## 样式

可以通过 `style` 控制背景及文字颜色。

```schema: scope="body"
type: avatar
text: AM
style:
  background: "#DB3E35"
  color: "#FFFFFF"
```

## 角标

`badge` 可以是数字（当 `mode: text`），或 `{ mode, text, position }`。对象默认 `mode: dot`。丝带用 `mode: ribbon`。活示例见 [Badge 角标](./badge)。

```schema: scope="body"
type: container
bodyClassName: flex flex-wrap items-center
body:
  - type: avatar
    text: AM
    badge:
      mode: text
      text: 10
  - type: avatar
    text: AM
    className: m-l
    badge:
      mode: dot
  - type: avatar
    text: AM
    className: m-l
    badge: 3
  - type: avatar
    text: AM
    className: m-l
    badge:
      mode: ribbon
      text: HOT
```

## 属性表

| 属性名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `type` | `string` | `"avatar"` | 指定为头像 |
| `className` | `string` | | 外层 class |
| `style` | `object` | | 外层样式。`background` / `color` 会落到头像圈上 |
| `src` | `string` | | 图片地址，可 `$var` / `${}` |
| `defaultAvatar` | `string` | | 没写 src 时的占位图 |
| `text` | `string` | | 文字 |
| `icon` | `string` | `fa fa-user` | 图标。含 `.` 当图片；`fa fa-*` 写在 `<i>` |
| `shape` | `string` | `circle` | `circle` / `square` / `rounded` |
| `size` | `number \| string` | `40` | `small` 32 / `default` `normal` 40 / `large` 48 / 数字 px |
| `fit` | `string` | `cover` | 图片 object-fit |
| `gap` | `number` | `4` | 文字左右边界像素；超出则缩放 |
| `alt` | `string` | | 图片替代文本 |
| `draggable` | `boolean` | | 图片是否允许拖动 |
| `crossOrigin` | `string` | | `anonymous` / `use-credentials` / `''` |
| `onError` | `string` | | 失败回调函数体，需返回 boolean。`return true;` 才置换为 text/icon |
| `badge` | `number \| object` | | 角标。见 [Badge](./badge) |

## 事件表

当前组件会对外派发以下事件，可以通过 `onEvent` 来监听。

| 事件名称 | 事件参数 | 说明 |
| --- | --- | --- |
| `click` | - | 点击时触发 |
| `mouseenter` | - | 鼠标移入时触发 |
| `mouseleave` | - | 鼠标移出时触发 |

### click

鼠标点击。可以尝试通过 `${event.context.nativeEvent}` 获取鼠标事件对象。

```schema: scope="body"
type: avatar
onEvent:
  click:
    actions:
      - actionType: toast
        args:
          msgType: info
          msg: ${event.context.nativeEvent.type}
```

## 和 Amis 文档的差异

- 作者态同时支持 YAML 与 JSON；YAML 字面量遵循 1.2 Core（`yes` / `On` / `012` 当字符串）。
- 可包在 IR 信封 `apiVersion: lcdp.ir/v1` + `kind: UiPage` 里，`spec` 仍是这棵 widget 树。
- `onError` 字符串函数体只在 `env.trusted` 编译，默认不跑。
- `fa-*` 走 `sdk.css` 里的 Font Awesome（含 v4-shims）。
- 视觉走 token 圆与底（默认底 `#d1d5db`），不是 cxd Avatar 皮肤。
