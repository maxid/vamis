# 快速开始 样式设计

> 状态：**进行中 50%** · 对应站点：`/style/index` · 源码：[index.md](../../../website/src/style/index.md)
> 盘点日期：2026-11-18。本文是页面级设计，不是站点正文副本。

## 0. 设计结论

样式快速开始是**四条改观感通道的总入口**：cssVars、className、主题包、局部 style。设计目标是让作者先选通道，再跳转具体类页；不复制 63 页类表。

## 1. 边界与优先级

1. 四通道各司其职：整页换肤/局部覆盖/主题包/单块样式。
2. 不编译 Amis SCSS、不写 cxd-*。
3. 示例只引 token/helper，不写死 hex/px。
4. 失败态：类名冲突、变量覆盖顺序、缺样式。

## 2. 类名/变量契约

页面契约：Vamis 改观感有四条路，对齐 Amis 的用法，实现换成 shadcn token：



## 3. 实现

- [styles.css](../../../packages/vamis-ui/src/styles.css)：token/helper/默认皮肤。
- [themes.css](../../../packages/vamis-ui/src/themes.css)：主题色阶。
- [样式规范](../../superpowers/specs/2026-11-15-vamis-style-standard.md)：标尺与守卫。
- `resolveClassName` / `resolveCssVars`：作者值落地。

## 4. 缺口

四条通道的演示与失败态未收口。

## 5. 验收清单（文档核对：3 / 12）

- [x] 页面、类表/变量表与实现入口已定位
- [x] 通道/前缀/落点边界已盘点
- [ ] 类名与计算值逐项核对
- [ ] 响应式/状态前缀组合可复现
- [ ] 浅色/深色视觉一致
- [ ] 375px 下演示不溢出
- [ ] 与相关样式页互链
