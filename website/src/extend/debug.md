---
title: 调试
---

# 调试

::: tip 实现进度 90% · 已完成
动作、API、表达式和渲染器诊断已落地；支持 Vamis 的 env / 全局变量 / URL 激活方式。可视化 Debug 面板与数据链检查器仍未接。
:::

Vamis 的调试分为**控制台日志**与**结构化诊断**。默认不输出日志；宿主始终可以通过 `env.onDiagnostic` 接收诊断对象。

## 开启方法

可以用下面三种方式开启控制台日志：

1. 在 env 中设置 `enableVamisDebug: true`。
2. 设置 `window.enableVamisDebug = true`。
3. 在页面 URL 参数中加 `vamisDebug=1`，例如 `http://localhost:5173/?vamisDebug=1`。

Vamis 也支持 `env.debug: true` 作为简写。表单上的 `schema.debug: true` 只显示表单数据域，不开启动作日志。

## 运行日志

日志按动作或诊断类型分组，包含：

- 动作配置、求值后的数据、事件对象与结束标记
- API 请求方法、URL、响应状态与数据
- 表达式文本与异常
- 未知类型和渲染器错误路径

## 结构化诊断

```javascript
const scoped = vamis.embed('#root', schema, {}, {
  onDiagnostic(diagnostic) {
    // type: api | expression | renderer | action
    // message / path / detail / error
    console.log(diagnostic)
  }
})
```

渲染器异常会显示带组件路径的错误块，不再让子树错误扩散成整页白屏。生产环境请通过 `onDiagnostic` 接入自己的监控，不要默认开启控制台调试。

## 尚未接入

- 页面右侧的可视化 Debug 面板
- 点击组件查看完整数据链的检查器
- Amis 风格的 MobX 内部状态检查

不要为了方便调试在 schema 中执行任意 JS；自定义脚本仍受 `env.trusted` 限制。
