# README 与素材

## 1. README 首屏布局

已按这个顺序改 [README.md](../../README.md)：

```
# Vamis                                   ← 名字
> Amis 的 Schema，原生跑在 Vue 3 上。     ← 一句话定位

[License] [Status: alpha] [Amis types] [Tests] [Vue]   ← 徽章

[在线 Demo] · [组件文档] · [Amis 对照] · [English]      ← 四个入口

[editor.png：编辑器截图]                  ← 真实产品图，不用 logo 墙

> ⚠️ Alpha / 非官方声明                   ← 状态与边界

## 为什么是 Vamis                          ← 三条卖点
## 现在能做什么                            ← 能力表
## 快速开始                                ← 最短可运行路径
```

原则：

- 首屏只放"是什么 / 给谁 / 能跑什么 / 怎么试"，设计文档、包结构、LCDP 细节全部后移。
- 不写"复刻"作为第一句；用"兼容实现 / 原生重写"，减少"换皮"误读。
- 状态数字（184/189、59%、880）必须与 `CONTEXT.md` 同步；每次发版改 README 时一起改。
- 英文 README 与中文结构一致，但不要把中文长文全量翻译；链接到中文文档即可。

## 2. 徽章

npm 发布前：

```markdown
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)
[![Status](https://img.shields.io/badge/status-alpha-orange.svg)](CONTEXT.md)
[![Amis types](https://img.shields.io/badge/Amis%20types-184%2F189-brightgreen.svg)](docs/superpowers/specs/2026-10-20-amis-sync-status.md)
[![Tests](https://img.shields.io/badge/tests-880%20passing-brightgreen.svg)](package.json)
[![Vue](https://img.shields.io/badge/Vue-3.5-42b883.svg)](https://vuejs.org/)
```

npm 发布后追加：

```markdown
[![npm](https://img.shields.io/npm/v/vamis.svg)](https://www.npmjs.com/package/vamis)
[![npm downloads](https://img.shields.io/npm/dm/vamis.svg)](https://www.npmjs.com/package/vamis)
```

不要在 npm 发布前放 npm 徽章——会显示 `package not found`，比没有更伤。

## 3. 现有素材

| 文件 | 用途 | 原始尺寸 | README 引用 |
|------|------|----------|-------------|
| `assets/readme/editor.png` | 首屏主图：组件树 + 实时预览 + 属性 + YAML/IR | 2880 × 2000 | 是 |
| `assets/readme/compare-amis.png` | 证明图：同一份 CRUD schema，Amis 左 / Vamis 右 | 3200 × 2400 | 是 |
| `docs/marketing/assets/docs-home.png` | 备选：文档首页 + 内嵌 CRUD 示例 | 2880 × 2000 | 否 |

图片都是从本地 `pnpm dev` 的真实页面截的，不是设计稿。重新截图的方法见下一节。

**Alt 文案**：

- `editor.png`：`Vamis 编辑器：左侧组件树、中间实时预览、右侧属性与 YAML/IR`
- `compare-amis.png`：`同一份 CRUD schema 在 Amis（左）与 Vamis（右）中并排渲染`

## 4. 重新截图（Playwright）

前置：

```bash
pnpm install
pnpm dev            # http://127.0.0.1:5173
```

依赖已经装在 `packages/vamis-sdk/node_modules/playwright`，浏览器也在本机缓存里。脚本示例（放到 `/tmp` 跑，不要进仓库）：

```js
import { chromium } from '<repo>/packages/vamis-sdk/node_modules/playwright/index.mjs'

const browser = await chromium.launch()
const page = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  deviceScaleFactor: 2,
})

// 1) 编辑器主图：先删掉默认示例里的 unknown-chart 占位
await page.goto('http://127.0.0.1:5173/editor', { waitUntil: 'networkidle' })
await page.waitForTimeout(2000)
await page.getByText('未知类型', { exact: false }).first().click()
await page.getByRole('button', { name: '删除' }).first().click()
await page.waitForTimeout(500)
await page.screenshot({ path: 'assets/readme/editor.png' })

// 2) 对照图：同一份 CRUD schema，Amis 左 / Vamis 右
await page.goto(
  'http://127.0.0.1:5173/sdk/compare.html?case=src-components-crud-0',
  { waitUntil: 'domcontentloaded' },
)
await page.waitForTimeout(12000) // 等 Amis CDN 与两侧 iframe 渲染
await page.screenshot({ path: 'assets/readme/compare-amis.png' })

await browser.close()
```

注意：

- 对照页左侧依赖 unpkg 的 Amis 6.13.0，网络慢时多等；截之前确认两边都有内容。
- 编辑器默认 schema 带一个 `unknown-chart` 占位（用来演示"未知 type 不崩"），做产品图时先删掉，否则看起来像 bug。
- 截图前确认页面在浅色、桌面、默认密度；不要带浏览器地址栏和书签。
- 截完用 `sips -g pixelWidth -g pixelHeight` 检查尺寸；README 用 2x 图即可，不用再放大。

## 5. GIF 分镜（可选，不是视频站）

视频站暂不做；README 首屏的动图仍然值得有。目标：**8–10 秒、< 2 MB、960–1200 宽**，只展示一个动作，不要解说字幕。

| 镜头 | 画面 | 时长 |
|------|------|------|
| 1 | 文档页，CRUD 已渲染，鼠标停在「编辑 Schema」上 | 1.5s |
| 2 | 点开 Schema，YAML 面板出现 | 1.5s |
| 3 | 把 `title: crud` 改成 `title: 客户列表`，右侧标题实时变化 | 2.5s |
| 4 | 切到「对照」页，同一份 schema 在 Amis / Vamis 两边出现 | 2.5s |
| 5 | 切 375 移动端，点开日期滚轮 | 2s |

采集方式二选一：

```bash
# 方案 A：Playwright 逐帧截图，再打包 GIF（无视频站依赖）
#   每 200–300ms 截一帧，统一 1200×750，最后：
ffmpeg -framerate 5 -i frame-%03d.png -vf "split[a][b];[a]palettegen[p];[b][p]paletteuse" -loop 0 out.gif

# 方案 B：Playwright 录 webm，再转 GIF（需要本机 ffmpeg）
ffmpeg -i recording.webm -vf "fps=8,scale=1200:-1:flags=lanczos,split[a][b];[a]palettegen[p];[b][p]paletteuse" -loop 0 out.gif
```

没有 GIF 不阻塞首发；截图先顶，首发后再补。

## 6. 社交预览图（1280 × 640）

给 GitHub Social preview、掘金封面、X 卡片共用。规格：

- 尺寸 **1280 × 640**，PNG，< 1 MB；
- 左侧：`Vamis`（大字）+ `Amis 的 Schema，原生跑在 Vue 3 上`（副标题）+ 三行小字：`184/189 Amis types · YAML / JSON · Vue 3 + shadcn-vue`；
- 右侧：`editor.png` 裁切，放在 12–16px 圆角卡片里；
- 底部一行：`github.com/maxid/vamis`；
- 背景用浅色（跟编辑器截图一致），不要深色科技风，和产品气质不符。

现成文件：`docs/marketing/assets/og-card.png`（1280 × 640，201 KB，已生成）。如需改文案，写一个 1280×640 的 HTML，把截图作为 `<img>`，用 Playwright 截一张，再上传到 GitHub Settings。

## 7. README 自检

- [ ] 首屏图片路径正确，手机宽度下不溢出
- [ ] 所有链接可点：Demo / 文档 / 对照 / English / License
- [ ] 徽章没有坏图（尤其 npm 未发布时）
- [ ] 数字与 `CONTEXT.md` 一致（184/189、59%、880、1142）
- [ ] 有 alpha 声明 + 非官方声明
- [ ] 英文 README 顶部有互链
- [ ] 不出现公开的 `localhost` 链接（开发命令里的 `127.0.0.1` 除外）、`{{占位}}`、本地绝对路径
- [ ] 不出现"100% 兼容 / 生产可用 / 官方"
