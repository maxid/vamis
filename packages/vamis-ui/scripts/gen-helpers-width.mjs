/** Generate Amis-compatible width helpers (w-* / min-w-* / max-w-*) with m: / pc: prefixes. */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const out = path.join(here, '../src/helpers-width.css')

const widths = [
  ['w-px', '0.0625rem'],
  ['w-0', '0'],
  ['w-none', '0'],
  ['w-0.5', '0.125rem'],
  ['w-1', '0.25rem'],
  ['w-1.5', '0.375rem'],
  ['w-2', '0.5rem'],
  ['w-2.5', '0.625rem'],
  ['w-3', '0.75rem'],
  ['w-3.5', '0.875rem'],
  ['w-4', '1rem'],
  ['w-5', '1.25rem'],
  ['w-6', '1.5rem'],
  ['w-7', '1.75rem'],
  ['w-8', '2rem'],
  ['w-9', '2.25rem'],
  ['w-10', '2.5rem'],
  ['w-11', '2.75rem'],
  ['w-12', '3rem'],
  ['w-14', '3.5rem'],
  ['w-16', '4rem'],
  ['w-18', '4.5rem'],
  ['w-20', '5rem'],
  ['w-24', '6rem'],
  ['w-28', '7rem'],
  ['w-32', '8rem'],
  ['w-36', '9rem'],
  ['w-40', '10rem'],
  ['w-44', '11rem'],
  ['w-48', '12rem'],
  ['w-52', '13rem'],
  ['w-56', '14rem'],
  ['w-60', '15rem'],
  ['w-64', '16rem'],
  ['w-72', '18rem'],
  ['w-80', '20rem'],
  ['w-96', '24rem'],
  ['w-auto', 'auto'],
  ['w-1x', '1em'],
  ['w-2x', '2em'],
  ['w-3x', '3em'],
  ['w-1/2', '50%'],
  ['w-1/3', '33.333333%'],
  ['w-2/3', '66.666667%'],
  ['w-1/4', '25%'],
  ['w-2/4', '50%'],
  ['w-3/4', '75%'],
  ['w-1/5', '20%'],
  ['w-2/5', '40%'],
  ['w-3/5', '60%'],
  ['w-4/5', '80%'],
  ['w-1/6', '16.666667%'],
  ['w-2/6', '33.333333%'],
  ['w-3/6', '50%'],
  ['w-4/6', '66.666667%'],
  ['w-5/6', '83.333333%'],
  ['w-1/12', '8.333333%'],
  ['w-2/12', '16.666667%'],
  ['w-3/12', '25%'],
  ['w-4/12', '33.333333%'],
  ['w-5/12', '41.666667%'],
  ['w-6/12', '50%'],
  ['w-7/12', '58.333333%'],
  ['w-8/12', '66.666667%'],
  ['w-9/12', '75%'],
  ['w-10/12', '83.333333%'],
  ['w-11/12', '91.666667%'],
  ['w-full', '100%'],
  ['w-screen', '100vw'],
  ['w-min', 'min-content'],
  ['w-max', 'max-content'],
]

const minWidths = [
  ['min-w-none', 'none'],
  ['min-w-0', '0rem'],
  ['min-w-xs', '20rem'],
  ['min-w-sm', '24rem'],
  ['min-w-md', '28rem'],
  ['min-w-lg', '32rem'],
  ['min-w-xl', '36rem'],
  ['min-w-2xl', '42rem'],
  ['min-w-3xl', '48rem'],
  ['min-w-4xl', '56rem'],
  ['min-w-5xl', '64rem'],
  ['min-w-6xl', '72rem'],
  ['min-w-7xl', '80rem'],
  ['min-w-full', '100%'],
  ['min-w-min', 'min-content'],
  ['min-w-max', 'max-content'],
  ['min-w-prose', '65ch'],
]

const maxWidths = [
  ['max-w-none', 'none'],
  ['max-w-0', '0rem'],
  ['max-w-xs', '20rem'],
  ['max-w-sm', '24rem'],
  ['max-w-md', '28rem'],
  ['max-w-lg', '32rem'],
  ['max-w-xl', '36rem'],
  ['max-w-2xl', '42rem'],
  ['max-w-3xl', '48rem'],
  ['max-w-4xl', '56rem'],
  ['max-w-5xl', '64rem'],
  ['max-w-6xl', '72rem'],
  ['max-w-7xl', '80rem'],
  ['max-w-full', '100%'],
  ['max-w-min', 'min-content'],
  ['max-w-max', 'max-content'],
  ['max-w-prose', '65ch'],
]

function escapeClass(name) {
  return name.replace(/[./]/g, '\\$&')
}

function rule(name, prop, value, prefix = '') {
  const sel = `${prefix}${escapeClass(name)}`
  return `  .${sel} { ${prop}: ${value}; }`
}

function block(prefix = '') {
  const lines = []
  for (const [name, value] of widths) lines.push(rule(name, 'width', value, prefix))
  for (const [name, value] of minWidths) lines.push(rule(name, 'min-width', value, prefix))
  for (const [name, value] of maxWidths) lines.push(rule(name, 'max-width', value, prefix))
  return lines.join('\n')
}

const css = `/* Amis helper width. Values match helper/sizing/_width. m: <768px, pc: >=768px. */
@layer utilities {
${block()}
}
@media (max-width: 767px) {
${block('m\\:')}
}
@media (min-width: 768px) {
${block('pc\\:')}
}
`

fs.writeFileSync(out, css)
console.log(`wrote ${path.relative(process.cwd(), out)} (${css.split('\n').length} lines)`)
