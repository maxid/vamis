# vamis 在线文档

- 日期：2026-10-21
- 状态：部分落地（与 Playground 同应用、同端口）
- 范围：正文在 `website/src/`；运行时由 playground 在 5173 挂载。目录对齐 Amis zh-CN 侧栏；不拷贝 Amis 原文

## 口径

和 Amis 一样：**文档 / 组件 / 示例** 在同一个开发服务器里。

| 顶栏 | 路由 | 内容 |
|------|------|------|
| 文档 | `/docs` | 开始、概念、样式、类型、扩展 |
| 组件 | `/components` | 侧栏 155 项 + 实时 YAML |
| 示例 | `/` | Playground 分类树 + 预览 |
| 编辑器 | `/editor` | 可视化骨架 |

- 作者态 YAML；` ```schema ` 在页面内交给 `VamisRoot` 真跑（可编辑即时预览），对齐 Amis `MdRenderer` + Play mini，不是截图。
- fence 支持 `scope` / `height`（如 ` ```schema: scope="form-item" height=300`）。
- 介绍页 CRUD 打 playground mock `/api/mock2/sample`（engine/browser/platform/grade）。
- 组件页进度来自 P0 TODO。已注册 ≠ 语义完成。

## 怎么跑

```bash
pnpm dev           # http://127.0.0.1:5173  （文档和示例同一进程）
pnpm docs:build    # 可选：VitePress 静态导出
pnpm --filter @vamis/docs gen   # 按 nav + TODO 重生组件页
```

手写页（介绍、Form 总览、FormItem/Control/Options）不要被生成器覆盖。
