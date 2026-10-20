# vamis

用 Vue 3 复刻 [百度 Amis](https://github.com/baidu/amis) 的 JSON 低代码运行时。作者格式是 **YAML**；信封对齐 **xdmp LCDP IR**（`apiVersion: lcdp.ir/v1`）。

第一期：可运行渲染器 + playground + 可视化编辑器骨架。不是 Amis 全量组件搬迁，也不是像素级 `cxd` 还原。

## 怎么跑

需要 Node 20+ 与 pnpm。

```bash
pnpm install
pnpm dev
```

浏览器打开 http://127.0.0.1:5173

| 路由 | 做什么 |
|------|--------|
| `/` | Playground：左侧贴 YAML，右侧实时渲染。可加载黄金表单、CRUD，或把 Amis JSON 转成 YAML |
| `/editor` | 编辑器骨架：左树 / 中预览 / 右属性 + YAML |

跑核心测试：

```bash
pnpm test
```

## YAML 与 IR 的关系

xdmp 低代码的唯一真源是 IR 信封（见 `megre/xdmp` 的 `docs/superpowers/specs/2026-10-17-lcdp-ir-kernel-design.md`）：

```yaml
apiVersion: lcdp.ir/v1
kind: UiPage          # vamis 扩展；xdmp 已有 TableDef/FormDef/PageDef…
metadata:
  name: form-page
  description: 表单页面
spec:
  type: page          # 这里是 Amis 兼容的 widget 树
  title: 表单页面
  body: [...]
```

- **YAML** 是作者态。
- **JSON**（Amis 页面）经 `jsonToIr()` 包成 `kind: UiPage`，再 `yamlFromIr()` 写出。
- 运行时 `VamisRoot` 先 normalize 成 IR，再 `compileIrToWidget()` 得到 widget 树。
- 未知 `type` / 未实现的 `kind` 显示占位，不崩。

黄金样例：

- `playground/src/examples/form-page.yaml` — 从 Amis `examples/components/Page/Form.jsx` 转出
- `playground/src/examples/amis-form.json` — 原始 JSON，Playground 里点「Amis JSON → YAML」
- `playground/src/examples/crud-page.yaml` — 查询表 + 表格 + 弹窗编辑

## 与 xdmp 的对接点

| 点 | 做法 |
|----|------|
| 信封 | 同 `apiVersion` / `kind` / `metadata` / `spec` |
| `UiPage` | vamis 扩展 kind，承载 widget 树；将来可挂到 `PageDef.spec.schema` 或 `pageKind: SCHEMA` |
| `FormDef` / `TableDef` | 已能编译成 form / crud 预览 |
| 存储 | 不实现 `lcdp_ir_def`；xdmp 后端把 `UiPage` 注册成 `LcdpIrKind` 即可收纳 |

细节：`docs/superpowers/specs/2026-10-20-vamis-vue3-runtime-design.md`

## 包结构

```
packages/vamis-core     工厂、IR、公式、Pinia hub、SchemaRenderer
packages/vamis-ui       shadcn-vue 原语（Button/Input/Select/Dialog/Table…）
packages/vamis          P0 渲染器注册表
packages/vamis-editor   树 + 属性 + YAML + 预览
playground               Vite 演示与 mock API
```

公式层使用 `amis-formula@6.13.0`（MIT）。Amis 概念与 Schema 兼容性遵循 Apache-2.0，见 `NOTICE`。

## 许可

Apache-2.0。UI 原语来自 shadcn-vue（MIT）。不要把 Amis 源码整仓复制进本仓库。
