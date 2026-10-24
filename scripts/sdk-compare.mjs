#!/usr/bin/env node
import { runCompare } from '../packages/vamis-sdk/compare/run.mjs'

runCompare(process.argv.slice(2)).catch((err) => {
  console.error(err)
  process.exitCode = 1
})
