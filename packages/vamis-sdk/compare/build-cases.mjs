import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadCatalog, toBrowserScript } from './catalog.mjs'

const sdk = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

export function buildCases(options = {}) {
  const cases = loadCatalog({
    docs: true,
    amisDocs: options.amisDocs === true,
  })
  const script = toBrowserScript(cases)
  const dest = path.join(sdk, 'compare-cases.js')
  fs.writeFileSync(dest, script)
  const dist = path.join(sdk, 'dist', 'compare-cases.js')
  if (fs.existsSync(path.join(sdk, 'dist'))) fs.writeFileSync(dist, script)
  return { dest, count: cases.length, cases }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const { count } = buildCases({
    amisDocs: process.argv.includes('--all'),
  })
  console.log(`wrote compare-cases.js (${count} cases)`)
}
