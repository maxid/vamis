import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadCatalog, toBrowserScript } from './catalog.mjs'

const sdk = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

export function buildCases(options = {}) {
  const cases = loadCatalog(options)
  const script = toBrowserScript(cases)
  const dest = path.join(sdk, 'compare-cases.js')
  fs.writeFileSync(dest, script)
  const dist = path.join(sdk, 'dist', 'compare-cases.js')
  if (fs.existsSync(path.join(sdk, 'dist'))) fs.writeFileSync(dist, script)
  return { dest, count: cases.length, cases }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const docs = !process.argv.includes('--p0')
  const amisDocs = process.argv.includes('--all')
  const bucketFlag = process.argv.indexOf('--bucket')
  const sectionFlag = process.argv.indexOf('--section')
  const { count } = buildCases({
    docs,
    amisDocs,
    bucket: bucketFlag >= 0 ? process.argv[bucketFlag + 1] : '',
    section: sectionFlag >= 0 ? process.argv[sectionFlag + 1] : '',
  })
  console.log(`wrote compare-cases.js (${count} cases)`)
}
