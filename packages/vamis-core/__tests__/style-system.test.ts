import { readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

// 样式系统的标尺守卫。口径见 .cursor/rules/style.mdc「标尺」。
// 字号 / 字重 / 圆角 / 色号只有一处定义（:root 的标尺 token），选择器只 var()。
// 带「存量」字样的上限只许减：清掉一批就把数字调小，不许调大。
const here = dirname(fileURLToPath(import.meta.url))
const packagesDir = resolve(here, '../..')
const css = readFileSync(join(packagesDir, 'vamis-ui/src/styles.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')

function vueFiles(dir: string): string[] {
  const out: string[] = []
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) out.push(...vueFiles(full))
    else if (name.endsWith('.vue')) out.push(full)
  }
  return out
}

const rendererDir = join(packagesDir, 'vamis/src')
const renderers = vueFiles(rendererDir).map(file => ({
  name: relative(rendererDir, file).split('\\').join('/'),
  text: readFileSync(file, 'utf8'),
}))

/** 普通声明（不是 `--token:`）里匹配到的行。 */
function plainDeclarations(pattern: RegExp): string[] {
  return [...css.matchAll(/^[ \t]*(?!--)[a-z-]+:[^;{}]*;/gm)].map(m => m[0].trim()).filter(line => pattern.test(line))
}

function count(pattern: RegExp): number {
  return renderers.reduce((sum, file) => sum + (file.text.match(pattern)?.length ?? 0), 0)
}

function filesWith(pattern: RegExp): string[] {
  return renderers.filter(file => pattern.test(file.text)).map(file => file.name)
}

describe('style ruler: styles.css', () => {
  it('selectors carry no hex color; hex lives only in tokens', () => {
    expect(plainDeclarations(/#[0-9a-fA-F]{3,8}\b/)).toEqual([])
  })

  it('token fallbacks are not a second source of truth', () => {
    // `var(--x, #fff)` 会让同一个量有两处定义
    expect(css.match(/var\(--[\w-]+,\s*#[0-9a-fA-F]{3,8}\)/g) ?? []).toEqual([])
  })

  it('font-size in selectors comes from the ruler', () => {
    expect(plainDeclarations(/^font-size:\s*[\d.]+px/)).toEqual([])
  })

  it('font-weight in selectors comes from the ruler', () => {
    expect(plainDeclarations(/^font-weight:\s*\d/)).toEqual([])
  })

  it('ruler tokens exist once on :root', () => {
    for (const token of [
      '--fontSizeSm: 12px',
      '--fontSizeBase: 14px',
      '--fontSizeLg: 16px',
      '--fontSizeXl: 18px',
      '--fontWeightNormal: 400',
      '--fontWeightMd: 500',
      '--fontWeightBold: 700',
      '--borderRadiusSm: var(--borders-radius-2)',
      '--borderRadius: var(--radius)',
      '--borderRadiusLg: var(--borders-radius-5)',
      '--text-color: var(--colors-neutral-text-2)',
      '--text-secondary: var(--colors-neutral-text-4)',
      '--text-muted: var(--colors-neutral-text-6)',
      '--icon-color: var(--colors-neutral-text-5)',
    ]) {
      expect(css.split(token + ';').length - 1, token).toBe(1)
    }
  })

  it('shadcn names alias the theme scale instead of a second palette', () => {
    expect(css).toContain('--foreground: var(--text-color)')
    expect(css).toContain('--card: var(--colors-neutral-fill-11)')
    expect(css).toContain('--popover: var(--card)')
    expect(css).toContain('--muted-foreground: var(--text-secondary)')
  })

  it('hex tokens stay a short, named list', () => {
    // 色阶之外的 Amis 字面量（存量，只许减）。新增色先找 --colors-* 色阶。
    const hexTokens = css.match(/^[ \t]*--[\w-]+:\s*#[0-9a-fA-F]{3,8};/gm) ?? []
    expect(hexTokens.length).toBeLessThanOrEqual(HEX_TOKEN_CEILING)
  })
})

// 存量上限：只许减。
const HEX_TOKEN_CEILING = 31
const RENDERER_CEILING = {
  lucideTags: 0,
  textSize: 10,
  semanticColor: 16,
}

/** 模板里拿字符当图标。箭头 / 叉 / 勾都该是 @vamis/ui 的 Vamis* 图标。 */
const UNICODE_ICON = /[×✕✖✓✔▾▸▴◂▼▲◀▶‹›«»]/
/** lucide 是第二套字形，chrome 图标要换成 Amis 转写的 `VamisIcon`。 */
const LUCIDE_TAG = /<(?:XIcon|Check|Pencil|PlayIcon|PauseIcon|Volume2Icon|VolumeXIcon)[\s/>]/g
/** 画数据的 SVG（进度环 / 迷你图 / 二维码 / 形状）和 sprite `<use>`，不是 chrome 图标。 */
const DATA_SVG = [
  'renderers/IconMark.vue',
  'renderers/Progress.vue',
  'renderers/display/QRCode.vue',
  'renderers/display/Sparkline.vue',
  'renderers/rest/Shape.vue',
]
/** Tailwind 字号工具类当默认皮肤。 */
const TEXT_SIZE = /(?<![\w-])text-(?:xs|sm|base|lg|xl)(?![\w-])/g
/** Tailwind 语义色工具类当默认皮肤。 */
const SEMANTIC_COLOR =
  /(?<![\w:-])(?:text|bg|border)-(?:muted-foreground|muted|foreground|primary-foreground|primary|accent-foreground|accent|destructive|secondary|card|popover|border|input|background)(?:\/\d+)?(?![\w-])/g
/** 色号字面量（排除 `#slot` 插槽名、`#/` 路由）。 */
const HEX_LITERAL = /['"`\s:(]#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})(?=['"`\s;),])/
/** 色号本身就是数据的地方：取色器预设、条码 / 二维码 / 签名的墨色（不跟主题翻转）、色块回退。 */
const DATA_COLOR = [
  'renderers/calendar/PickerFade.vue',
  'renderers/display/BarCode.vue',
  'renderers/display/QRCode.vue',
  'renderers/form/InputColor.vue',
  'renderers/form/InputSignature.vue',
  'renderers/rest/StaticValue.vue',
]
/** JS 里的 style 对象把皮肤写成常量（`var(--token)` 可以，字面量不行）。 */
const STYLE_CONSTANT =
  /\b(?:fontSize|fontWeight|fontFamily|borderRadius|color|background|backgroundColor|borderColor)\s*:\s*(?:'(?!var\()[^'$]*'|"(?!var\()[^"$]*"|\d)/

describe('style ruler: table primitive', () => {
  const ui = (name: string) => readFileSync(join(packagesDir, 'vamis-ui/src/ui/table', name), 'utf8')

  it('th 14 / td 12 comes from the primitive, so every <Table> user agrees', () => {
    expect(css).toMatch(/\n\[data-slot="table-cell"\] \{[^}]*font-size:\s*var\(--table-font-size\)/)
    expect(css).toMatch(/\n\[data-slot="table-head"\] \{[^}]*font-size:\s*var\(--table-thead-font-size\)/)
    expect(css).toContain('--table-font-size: var(--fontSizeSm)')
    expect(css).toContain('--table-thead-font-size: var(--fontSizeBase)')
  })

  it('primitives carry no shadcn skin utilities', () => {
    for (const name of ['Table.vue', 'TableHeader.vue', 'TableRow.vue', 'TableHead.vue', 'TableCell.vue'])
      expect(ui(name), name).not.toMatch(/text-(?:xs|sm)|bg-muted|text-muted-foreground|font-medium/)
  })
})

describe('style ruler: renderers (legacy ceilings, shrink only)', () => {
  it('hex literals appear only where the color is data', () => {
    expect(filesWith(HEX_LITERAL).sort()).toEqual(DATA_COLOR)
  })

  it(':style carries author values and runtime geometry, never the default skin', () => {
    // 默认皮肤 = class + token。`:style` 只放 schema 给的值、量出来的几何、带 alpha 的字面色。
    expect(filesWith(/(?<![:\w-])style="/)).toEqual([])
    expect(filesWith(STYLE_CONSTANT)).toEqual([])
  })

  it('no unicode character stands in for an icon', () => {
    // IconPicker 的字符是可选的值，不是 chrome
    expect(filesWith(UNICODE_ICON).filter(name => name !== 'renderers/form/IconPicker.vue')).toEqual([])
  })

  it('chrome icons are VamisIcon; inline <svg> only draws data', () => {
    expect(filesWith(/<svg[\s>]/).sort()).toEqual(DATA_SVG)
  })

  it('every VamisIcon name is registered', () => {
    const registry = readFileSync(join(packagesDir, 'vamis-ui/src/ui/vamis-icons.ts'), 'utf8')
    const used = new Set<string>()
    for (const file of renderers) for (const m of file.text.matchAll(/<VamisIcon\s+name="([\w-]+)"/g)) used.add(m[1])
    expect(used.size).toBeGreaterThan(20)
    for (const name of used) expect(registry, name).toMatch(new RegExp(`^  '?${name}'?: \\{`, 'm'))
  })

  it('lucide icons in renderers', () => {
    expect(count(LUCIDE_TAG)).toBeLessThanOrEqual(RENDERER_CEILING.lucideTags)
  })

  it('Tailwind font-size utilities as default skin', () => {
    expect(count(TEXT_SIZE)).toBeLessThanOrEqual(RENDERER_CEILING.textSize)
  })

  it('Tailwind semantic color utilities as default skin', () => {
    expect(count(SEMANTIC_COLOR)).toBeLessThanOrEqual(RENDERER_CEILING.semanticColor)
  })
})
