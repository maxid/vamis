import fs from 'node:fs'
import http from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildCases } from './build-cases.mjs'
import { matchCatalog, parseViewportArg, rerunCommands, VIEWPORT } from './catalog.mjs'
import { collectFontDiffs, scoreCase } from './score.mjs'
import { attachFindings } from './classify.mjs'
import { writeReport } from './report.mjs'

const sdk = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

function flagValue(argv, name) {
  const index = argv.indexOf(name)
  return index >= 0 ? argv[index + 1] : ''
}

function parseArgs(argv) {
  const p0 = argv.includes('--p0')
  const amisDocs = argv.includes('--all')
  return {
    p0,
    amisDocs,
    bucket: flagValue(argv, '--bucket'),
    section: flagValue(argv, '--section'),
    page: flagValue(argv, '--page'),
    id: flagValue(argv, '--id'),
    type: flagValue(argv, '--type'),
    mobile: parseViewportArg(flagValue(argv, '--viewport') || (argv.includes('--mobile') ? 'mobile' : '')) === 'mobile',
    amisSdk: flagValue(argv, '--amis') || process.env.AMIS_SDK || 'https://unpkg.com/amis@6.13.0/sdk',
  }
}

function startStatic(root) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const url = new URL(req.url || '/', 'http://127.0.0.1')
      let file = path.join(root, decodeURIComponent(url.pathname))
      if (file.endsWith('/')) file = path.join(file, 'index.html')
      if (!file.startsWith(root)) {
        res.writeHead(403)
        res.end()
        return
      }
      fs.readFile(file, (err, buf) => {
        if (err) {
          res.writeHead(404)
          res.end('not found')
          return
        }
        const ext = path.extname(file)
        const types = {
          '.html': 'text/html; charset=utf-8',
          '.js': 'text/javascript; charset=utf-8',
          '.mjs': 'text/javascript; charset=utf-8',
          '.css': 'text/css; charset=utf-8',
          '.json': 'application/json; charset=utf-8',
        }
        res.writeHead(200, { 'content-type': types[ext] || 'application/octet-stream' })
        res.end(buf)
      })
    })
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address()
      resolve({ server, origin: `http://127.0.0.1:${port}` })
    })
  })
}

async function waitReady(page) {
  await page.waitForFunction(() => window.__vamisCompareReady === true, null, { timeout: 120000 })
}

async function runOnPage(page, item, runId) {
  await page.evaluate(
    ({ item, runId }) => {
      window.__vamisCompareLast = null
      window.postMessage(
        {
          type: 'vamis-compare-run',
          runId,
          schema: item.schema,
          measure: item.measure,
          labels: item.measure?.labels,
        },
        '*',
      )
    },
    { item, runId },
  )
  await page.waitForFunction((id) => window.__vamisCompareLast && window.__vamisCompareLast.runId === id, runId, {
    timeout: 20000,
  })
  return page.evaluate(() => window.__vamisCompareLast)
}

export async function runCompare(argv = process.argv.slice(2)) {
  const options = parseArgs(argv)
  const dist = path.join(sdk, 'dist')
  if (!fs.existsSync(path.join(dist, 'sdk.js'))) {
    throw new Error('缺少 packages/vamis-sdk/dist/sdk.js，先跑 pnpm sdk:build')
  }
  const { cases, count } = buildCases({
    amisDocs: options.amisDocs,
  })
  const list = cases.filter((row) => {
    if (options.p0 && row.layer !== 'p0') return false
    return matchCatalog(row, options)
  })
  if (!list.length) {
    throw new Error('没有匹配的对照用例（检查 --page / --bucket / --section / --id）')
  }
  fs.copyFileSync(path.join(sdk, 'embed-case.html'), path.join(dist, 'embed-case.html'))
  fs.copyFileSync(path.join(sdk, 'compare.html'), path.join(dist, 'compare.html'))
  const { server, origin } = await startStatic(dist)
  let browser
  try {
    const { chromium } = await import('playwright')
    browser = await chromium.launch({ headless: true })
    const vp = options.mobile ? VIEWPORT.mobile : VIEWPORT.desktop
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } })
    const amisPage = await context.newPage()
    const vamisPage = await context.newPage()
    const amisUrl = `${origin}/embed-case.html?engine=amis&amisSdk=${encodeURIComponent(options.amisSdk)}`
    const vamisUrl = `${origin}/embed-case.html?engine=vamis`
    await Promise.all([amisPage.goto(amisUrl, { waitUntil: 'domcontentloaded' }), vamisPage.goto(vamisUrl)])
    await Promise.all([waitReady(amisPage), waitReady(vamisPage)])
    const rows = []
    for (let i = 0; i < list.length; i++) {
      const item = list[i]
      const runId = i + 1
      process.stdout.write(`[${runId}/${list.length}] ${item.id}\n`)
      const [amis, vamis] = await Promise.all([runOnPage(amisPage, item, runId), runOnPage(vamisPage, item, runId)])
      const parity = scoreCase(item, amis, vamis)
      rows.push({
        id: item.id,
        group: item.group,
        bucket: item.bucket,
        section: item.section,
        extra: item.extra,
        layer: item.layer,
        title: item.title,
        amis: { error: amis.error || null, measure: amis.measure },
        vamis: { error: vamis.error || null, measure: vamis.measure },
        parity,
        findings: attachFindings(item, [...(parity.diffs || []), ...collectFontDiffs(amis, vamis)]),
      })
    }
    const written = writeReport(rows, { mobile: options.mobile })
    const p0Failed = rows.filter((row) => row.layer === 'p0' && !row.parity?.pass).length
    console.log(
      `compare ${options.mobile ? 'mobile' : 'desktop'} ${list.length}/${count} · pass ${written.summary.passed} · fail ${written.summary.failed} · p0-fail ${p0Failed} → ${written.mdPath}`,
    )
    const rerun = rerunCommands(rows, { mobile: options.mobile })
    if (rerun.length) {
      console.log(
        options.mobile
          ? '重跑：全局修完 pnpm compare --mobile；组件修完只跑自身 --page … --mobile'
          : '重跑：全局修完 pnpm compare；组件修完只跑自身 --page',
      )
      for (const item of rerun) console.log(`  ${item.cmd}  # ${item.note}`)
    }
    if (p0Failed) process.exitCode = 1
    return { ...written, rows }
  } finally {
    if (browser) await browser.close()
    await new Promise((resolve) => server.close(resolve))
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  runCompare().catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
}
