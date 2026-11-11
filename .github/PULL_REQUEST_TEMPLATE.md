## 做了什么

<!-- 一句话说明改动范围；一个 PR 只做一件事 -->

## 为什么

<!-- 关联 issue / Amis 文档 / 对照用例 id -->

## 验证

- [ ] `pnpm test` 通过
- [ ] `pnpm typecheck`（没有新增报错；既有报错说明）
- [ ] 组件改动：`pnpm sdk:build` + `pnpm compare --page <type>`，附前后结果
- [ ] 全局 token / 样式改动：跑了全量 `pnpm compare`
- [ ] 移动端相关：跑了 `pnpm compare --mobile` 或手动 375 视口
- [ ] 截图 / 对照结果（贴在下面）

## 文档

- [ ] 已按 [AGENTS.md](../AGENTS.md) 回写 `CONTEXT.md`（完成状态 + 下一条计划）
- [ ] 组件修复：已把可复用经验去重回写 `.cursor/rules/lessons.mdc`
- [ ] 没有提交 `dist/`、`compare-cases.js`、密钥或内网地址

## 备注

<!-- 已知限制、后续项、需要 reviewer 特别注意的地方 -->
