# FormItem 表单项 · `formitem`（契约）设计

> 状态：**进行中 90%** · 复杂度：**XL 特重**
> 文档：[在线 API 手册](/components/form/formitem) · Amis：`/zh-CN/components/form/formitem`
> 盘点日期：2026-11-18。本文是研发设计文档；formitem 是 kernel 契约，不是独立业务 type。

## 0. 一页结论

FormItem 是**表单项外壳契约**：label/description/required/校验/静态/布局/错误/remark，所有表单控件复用它。它不渲染控件本身；改 FormItem 影响整个表单体系。

## 1. 边界与优先级（先读）

1. **路径值**：name 支持 `a.b[0]`；通过 form/useFieldValue 读写；不要直接 props.data。
2. **校验**：required/validations/validateApi 错误写 `form.errors[name]`；FormItem 根节点加 `is-error`，控件边框统一用 destructive，label/star/错误文案显示。Dialog 的 `Dialog-error` 复用同一验证等级。
3. **静态**：static/staticOn/staticSchema；选择器静态走 selectorStatic；不要各控件自写。
4. **布局**：horizontal/inline/row/normal；labelWidth/labelAlign/horizontal 比例；窄屏 ≤767 切 28% 同行。
5. **描述/remark**：description HTML/Schema；labelRemark 走 Remark。
6. **包边界**：无 `<style>`、无 fetch；form token。

### 边界用例

- 空 label/required/description/error
- 路径 name/嵌套 form/静态/禁用
- 水平/inline/row/窄屏/labelWidth
- remark/description HTML/深色

### 优先级

1. 路径值/校验；2. 静态/布局；3. label/desc/remark；4. 样式。

## 2. 复杂度

- 等级：**XL 特重**（Amis 2438 行；Vamis 196 行 + formContext）；依赖 form/options/remark。
- 风险：影响所有控件，回归面最大。

## 3. 契约

| 属性 | 语义 | 现状 |
|---|---|---|
| name/label/description | 基础 | 已接 |
| required/validations | 校验 | 已接 |
| static/staticOn/staticSchema | 静态 | 已接 |
| horizontal/inline/row/labelWidth | 布局 | 已接 |
| remark/popOver/copyable | 附属 | 已接 |
| themeCss | 目标 | 未接 |

## 4. 架构

- [`FormItem.vue`](../../../../packages/vamis/src/renderers/FormItem.vue)：layout/label/error/static/remark。
- [`formContext.ts`](../../../../packages/vamis/src/formContext.ts)：useForm/useFieldValue。
- [`form-item.ts`](../../../../packages/vamis-core/src/utils/form-item.ts)：required/static/layout。

## 5. 样式

- label/star/description/error token；无 `<style>`；窄屏/深色单独核。

## 6. 缺口

themeCss、路径级 combo/table 错误、autoFill suggestion 族；深色逐项。

## 7. 验收

- 路径/校验/静态/布局/remark/error/窄屏；未接不误标。

### 验收清单（文档核对：3 / 12）

- [x] Amis 入口 / 文档章节已定位
- [x] Vamis 渲染器或注册文件已定位
- [x] 复杂度、依赖、集成面已盘点
- [ ] schema 属性 / 默认值逐项核对
- [ ] 事件 / 动作逐项核对
- [ ] 边界用例逐项核对
- [ ] 组件页活示例运行、无 console error
- [ ] `pnpm test`（组件相关）
- [ ] `pnpm typecheck` 0
- [ ] `pnpm compare --page <type>` 桌面
- [ ] `pnpm compare --page <type> --mobile`
- [ ] 深色 / 375px 窄屏核对

## 8. 后续

FormItem 改动必须跑全表单对照；不要为单控件加特例。

---

返回 [组件设计索引](../README.md)
