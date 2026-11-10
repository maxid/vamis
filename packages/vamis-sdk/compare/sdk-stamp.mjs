import fs from 'node:fs'
import path from 'node:path'

/** 源 HTML 里的占位。构建 / 开发中间件换成 sdk.js 等产物 mtime。 */
export const SDK_STAMP_TOKEN = '__VAMIS_SDK_V__'

const STAMP_FILES = ['dist/sdk.js', 'dist/sdk.esm.js', 'dist/sdk.css', 'compare-cases.js', 'dist/compare-cases.js']
const HTML_FILES = ['compare.html', 'embed-case.html']

export function sdkCacheStamp(sdkRoot) {
  let latest = 0
  for (const rel of STAMP_FILES) {
    const full = path.join(sdkRoot, rel)
    if (!fs.existsSync(full)) continue
    const t = fs.statSync(full).mtimeMs
    if (t > latest) latest = t
  }
  return latest ? Math.trunc(latest).toString(16) : 'dev'
}

export function applySdkStamp(html, stamp = '') {
  return String(html).split(SDK_STAMP_TOKEN).join(stamp || 'dev')
}

export function stampSdkHtmlFiles(sdkRoot, destDir = path.join(sdkRoot, 'dist')) {
  const stamp = sdkCacheStamp(sdkRoot)
  for (const name of HTML_FILES) {
    const full = path.join(destDir, name)
    if (!fs.existsSync(full)) continue
    fs.writeFileSync(full, applySdkStamp(fs.readFileSync(full, 'utf8'), stamp))
  }
  return stamp
}
