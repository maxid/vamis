# npm 发布清单（alpha）

结论：**npm 发布是当前首发最大的阻塞项，不建议为了赶首发硬发源码。**
现状是所有包（除 `@vamis/sdk`）的 `main` / `types` / `exports` 都指向 `./src/index.ts`，npm 用户 `pnpm add vamis` 之后拿到的是 TypeScript 源码——Vite 能勉强处理一部分，但库的 `exports` 条件、CSS、字体、类型声明都不对，属于"装上了但跑不起来"。

这份清单按"最小可用 alpha"写，目标是 `pnpm add vamis @vamis/ui` 后能在 Vue 3 + Vite 工程里渲染一个表单。

## 1. 当前缺口

| 包 | 缺口 | 影响 |
|----|------|------|
| 全部 | `repository` / `homepage` / `bugs` 缺失 | npm 页面没有源码入口，不像正经包 |
| 全部 | `files` 缺失（除 sdk） | `npm pack` 会把 `__tests__`、源码、README 一起塞进去 |
| `vamis` / `@vamis/core` / `@vamis/ui` / `@vamis/editor` | `main` / `types` / `exports` 指向 `src/*.ts` | 消费方拿到 TS 源码，未编译 |
| 全部 | 没有 `dist` 构建脚本（sdk 有） | 同上 |
| 全部 | `description` 不完整（core / ui / editor / vamis 没有） | npm 搜索与页面信息缺失 |
| `vamis` / `@vamis/core` | `vue` / `pinia` 放在 `dependencies` 而非 `peerDependencies` | 宿主可能出现双份 Vue |
| `vamis` | `echarts` / `monaco-editor` 是硬依赖 | 安装体积大；不用图表/Monaco 的人也被迫装 |
| `@vamis/ui` | CSS 与 Font Awesome webfont 的产物路径未定义 | `import '@vamis/ui/styles.css'` 需要保证文件在包内 |
| `@vamis/editor` | 依赖 `vamis` 的源码入口 | 编辑器包必须等主包构建 |
| `@vamis/sdk` | `exports` 只有 `sdk.js` loader；`sdk.esm.js` 没导出 | npm 用户不能按 ESM 导入 |
| scope | `@vamis` 未确认占用 | npm 上 `@vamis/core` / `vamis` 当前 404，需要先注册/占名 |

另外：`pnpm typecheck` 目前仍有既有报错（Card / Tpl / Wizard 等，见 `CONTEXT.md`），**声明文件（.d.ts）构建会受影响**。要么先修到干净，要么这一版只发 JS（不带类型），在 README 里标注"类型待补"。

## 2. 推荐方案：先做完整构建，再发 alpha

### 2.1 构建顺序

```
@vamis/formula  →  @vamis/core  →  @vamis/ui  →  vamis  →  @vamis/sdk / @vamis/editor
```

- `@vamis/formula`：纯 TS，`tsc` / Vite lib 均可；注意 `doc.md` 与内置函数文档要随包。
- `@vamis/core`：依赖 formula + vue + pinia；`env`、IR、渲染器注册表。
- `@vamis/ui`：需要把 `src/styles.css`、`fontawesome.css`、webfonts、shadcn 组件样式一起打进 `dist`；CSS 引用路径要相对 dist。
- `vamis`：渲染器注册表 + `register.ts`；把 `echarts` / `monaco-editor` 改成 optional / 动态导入（或至少放到 `peerDependenciesMeta.optional`），否则安装会拖两个大包。
- `@vamis/sdk`：现在的 `vite build` 已产出 `sdk.js` / `sdk.esm.js` / chunks / `sdk.css`；补 `files` + `exports` 即可。
- `@vamis/editor`：最后发；依赖主包和 ui 的 dist。

统一建议：

- 每个包加 `"build": "vite build"`（lib mode）+ `"types": "vue-tsc --emitDeclarationOnly"` 或 `vite-plugin-dts`；
- `package.json` 的 `exports` 至少给 `import` / `types` 两个条件；
- 保留 `src` 到 npm 的映射吗？不建议：消费者只应看到 `dist`；
- `sideEffects` 标出 CSS 与注册副作用，避免被 tree-shake。

### 2.2 元数据模板

每个包补齐（按包替换 name / description）：

```jsonc
{
  "name": "vamis",
  "version": "0.1.0-alpha.1",
  "description": "用 Vue 3 原生渲染 Amis schema 的 JSON/YAML 低代码运行时",
  "license": "Apache-2.0",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/maxid/vamis.git",
    "directory": "packages/vamis"
  },
  "homepage": "https://github.com/maxid/vamis#readme",
  "bugs": { "url": "https://github.com/maxid/vamis/issues" },
  "files": ["dist", "README.md"],
  "main": "./dist/index.js",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    },
    "./package.json": "./package.json"
  },
  "sideEffects": ["*.css", "./dist/**/*.css"]
}
```

`@vamis/ui` 额外：

```jsonc
"exports": {
  ".": { "types": "./dist/index.d.ts", "import": "./dist/index.js" },
  "./styles.css": "./dist/styles.css",
  "./fontawesome.css": "./dist/fontawesome.css"
}
```

`@vamis/sdk` 额外：

```jsonc
"exports": {
  ".": "./dist/sdk.js",
  "./esm": "./dist/sdk.esm.js",
  "./sdk.css": "./dist/sdk.css"
}
```

### 2.3 peerDependencies

宿主会自己装 Vue / Pinia，库包应改成 peer：

```jsonc
"peerDependencies": { "vue": "^3.5.0", "pinia": "^3.0.0" },
"devDependencies": { "vue": "^3.5.22", "pinia": "^3.0.0" }
```

`vamis` 的 `echarts` / `monaco-editor` 建议：

- 改成 `optionalDependencies` 或 `peerDependenciesMeta.optional`；
- 代码里已经按需动态加载（monaco / echarts 用到才加载），npm 侧不应强制安装；
- 如果这一版来不及，至少把 README 的安装说明写清楚"会装 echarts 和 monaco"。

## 3. 发布前验证（必须做）

```bash
# 0) 确认 scope 可用（npm 上 @vamis/core 当前 404）
npm login
npm org ls @vamis || npm whoami

# 1) 每个包 dry-run，检查文件列表与体积
cd packages/vamis && npm pack --dry-run
# 期望：dist/、README.md、LICENSE；不应出现 src/、__tests__/、.map 之外的调试文件

# 2) workspace 依赖替换检查（pnpm publish 会自动替换 workspace:*）
pnpm -r publish --dry-run --tag alpha
```

再开一个**空目录**做真实安装验证：

```bash
mkdir /tmp/vamis-consumer && cd /tmp/vamis-consumer
pnpm init
pnpm add vue pinia vite @vitejs/plugin-vue
pnpm add vamis @vamis/ui
# 按 README 写一个最小 App，确认：
# - import { VamisRoot } from 'vamis' 能解析
# - import '@vamis/ui/styles.css' 有样式
# - 浏览器控制台无 Vue 重复实例、无 404
```

## 4. 发布步骤

```bash
# 1) 统一版本号（6 个包一起）
#    建议 0.1.0-alpha.1，之后 alpha.2/alpha.3 递增
pnpm -r exec npm version 0.1.0-alpha.1 --no-git-tag-version

# 2) 先构建
pnpm --filter @vamis/formula build
pnpm --filter @vamis/core build
pnpm --filter @vamis/ui build
pnpm --filter vamis build
pnpm --filter @vamis/sdk build
pnpm --filter @vamis/editor build

# 3) 发布（--tag alpha 不会顶掉 latest）
pnpm -r publish --tag alpha --access public

# 4) 验证
npm view vamis versions --json
npm view vamis dist-tags
```

注意：

- 公司/个人 npm 账号开 2FA；不要把 token 写进仓库或 CI 明文。
- `pnpm publish -r` 会按依赖顺序发布；如果某个包失败，后面的会停，修完重跑即可（已发布的版本不能覆盖，只能升版本）。
- 第一次发 `vamis` / `@vamis/core` 等包名时确认没有被抢注；如果 `vamis` 被占，改用 `@vamis/vamis` 并同步改 README 与 SDK 文档。

## 5. 发布后

- README 打开 npm 徽章与 `pnpm add vamis` 安装段（当前 README 先按源码运行写）。
- 加 StackBlitz / CodeSandbox 模板：`vamis` + Vite + Vue，一条链接能跑。
- npm 页面 README 用根 README 的英文版（`README.en.md`），中文版可另放。
- 打 tag：`git tag v0.1.0-alpha.1 && git push --tags`（需要作者确认后再做）。
- 在 GitHub Release 里写"npm 已发布 / 仅源码"。

## 6. 回滚

- 72 小时内可以 `npm unpublish <pkg>@<version>`；超过 72 小时不要删，用 `npm deprecate` 标注问题版本。
- 已发布的版本不能被覆盖；出错就发 `alpha.2` 并在 Release 说明。
- 不要 unpublish 整个包名（会触发 24 小时重发限制，也可能被别人抢注）。

## 7. 如果首发来不及

可以按这个顺序降级，保证首发仍有"可安装"的入口：

1. **只发 `@vamis/sdk`**：它的产物是完整的 `sdk.js` + `sdk.css`，不依赖消费方构建；但要把 workspace 依赖改为具体版本并确认产物已 bundle，否则安装会 404。
2. **只发 `@vamis/formula`**：纯 TS 包，构建最简单，先占住 `@vamis` scope，建立 npm 存在感。
3. **都不发**：README 必须明确写"当前从源码运行"，不要出现 `npm i`；首发文案里也不要暗示 npm 可用。等构建补齐后单独做一次"npm 发布"小事件。

无论哪种，**不要发一个装不上的包**——首发的信任成本比晚一周高得多。
