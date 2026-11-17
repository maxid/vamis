#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { stripProductVersions } from './rewrite-amis-doc.mjs'

const root = path.resolve(fileURLToPath(new URL('../..', import.meta.url)))
const dir = path.join(root, 'website/src/components')

function walk(folder) {
  const out = []
  for (const name of fs.readdirSync(folder)) {
    const full = path.join(folder, name)
    if (fs.statSync(full).isDirectory()) out.push(...walk(full))
    else if (name.endsWith('.md')) out.push(full)
  }
  return out
}

let changed = 0
for (const file of walk(dir)) {
  const src = fs.readFileSync(file, 'utf8')
  const next = stripProductVersions(src)
  if (next !== src) {
    fs.writeFileSync(file, next.endsWith('\n') ? next : `${next}\n`)
    changed += 1
  }
}
console.log(`strip-amis-versions: ${changed} files updated`)
