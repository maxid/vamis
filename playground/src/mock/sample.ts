/** Amis `/api/mock2/sample` 同源字段（engine/browser/platform/grade），给文档 CRUD 真数据。 */
import sampleSeed from './sample-seed.json'

export type SampleRow = {
  id: number
  engine: string
  browser: string
  platform: string
  version: string
  grade: string
  badgeText?: string
  name: string
  status: string
}

type SeedRow = Omit<SampleRow, 'id' | 'name' | 'status'>

const SEED = sampleSeed.rows as SeedRow[]
const SAMPLE_BLOCK = [...SEED, ...SEED, ...SEED]

function decorate(item: Omit<SampleRow, 'id' | 'name' | 'status'>, id: number): SampleRow {
  return {
    ...item,
    id,
    name: item.engine,
    status: item.grade === 'A' ? 'online' : item.grade === 'C' ? 'offline' : 'repair',
  }
}

/** 对齐 Amis `sample.db.js`：57 条基础记录 × 3 × 10，共 1710 条 / 171 页。 */
const SAMPLE_TOTAL = 1710

export function createSampleRows(): SampleRow[] {
  const rows: SampleRow[] = []
  while (rows.length < SAMPLE_TOTAL) {
    for (const item of SAMPLE_BLOCK) {
      rows.push(decorate(item, rows.length + 1))
      if (rows.length >= SAMPLE_TOTAL) break
    }
  }
  return rows
}

export function cloneRows(rows: SampleRow[]): SampleRow[] {
  return rows.map((row) => ({ ...row }))
}
