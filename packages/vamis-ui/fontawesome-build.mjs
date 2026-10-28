import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ui = path.dirname(fileURLToPath(import.meta.url))
const repo = path.resolve(ui, '../..')

export function resolveFontAwesome() {
  const candidates = [
    path.join(ui, 'node_modules/@fortawesome/fontawesome-free'),
    path.join(repo, 'node_modules/@fortawesome/fontawesome-free'),
  ]
  const pnpm = path.join(repo, 'node_modules/.pnpm')
  if (fs.existsSync(pnpm)) {
    for (const name of fs.readdirSync(pnpm)) {
      if (!name.startsWith('@fortawesome+fontawesome-free@')) continue
      candidates.push(path.join(pnpm, name, 'node_modules/@fortawesome/fontawesome-free'))
    }
  }
  return candidates.find((dir) => fs.existsSync(path.join(dir, 'css/all.min.css')))
}

export function fontAwesomeCss(urlPrefix = './assets/') {
  const fa = resolveFontAwesome()
  if (!fa) return ''
  const rewrite = (css) => css.replaceAll('../webfonts/', urlPrefix)
  return [
    rewrite(fs.readFileSync(path.join(fa, 'css/all.min.css'), 'utf8')),
    rewrite(fs.readFileSync(path.join(fa, 'css/v4-shims.min.css'), 'utf8')),
  ].join('\n')
}

export function copyFontAwesomeWebfonts(assetsDir) {
  const fa = resolveFontAwesome()
  if (!fa) return []
  fs.mkdirSync(assetsDir, { recursive: true })
  const webfonts = path.join(fa, 'webfonts')
  const copied = []
  for (const file of fs.readdirSync(webfonts)) {
    fs.copyFileSync(path.join(webfonts, file), path.join(assetsDir, file))
    copied.push(file)
  }
  return copied
}
