# 安全策略

Vamis 是低代码运行时。Schema 可能来自外部系统，宿主可能开启 `|raw`、自定义函数或 `env.trusted`，这些边界请按你的威胁模型评估。

## 报告漏洞

请不要在公开 issue 里贴可利用细节、密钥或用户数据。优先使用 GitHub 的私密报告：

1. 打开仓库 **Security → Advisories → Report a vulnerability**；
2. 写清影响版本 / commit、复现步骤、影响范围；
3. 如果仓库还没开私密报告，先发一个不包含细节的 issue，说明"需要私下联系"。

## 范围

重点关注的类型：

- Schema / 模板注入导致 XSS（`|raw`、字符串函数、`tpl`）；
- `env.fetcher` / `requestApi` 的 SSRF 或凭据泄露；
- 事件动作 / 自定义 JS 的越权执行；
- SDK `vamis.embed` 的宿主隔离问题。

已知设计取舍（不是漏洞，但请评估）：

- `|raw` 与字符串函数默认只在受信任模式启用；
- `env.trusted: true` 会执行 schema 里的字符串函数体；
- SDK 默认不开启 `trusted`。

## 支持版本

当前只有 alpha 线（`0.1.x-alpha.*`）。修复会进最新的 alpha；不维护旧 alpha 的安全补丁。
