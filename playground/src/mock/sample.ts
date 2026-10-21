/** Amis `/api/mock2/sample` 同源字段（engine/browser/platform/grade），给文档 CRUD 真数据。 */

export type SampleRow = {
  id: number
  engine: string
  browser: string
  platform: string
  version: string
  grade: string
  name: string
  status: string
}

const SEED: Omit<SampleRow, 'id' | 'name' | 'status'>[] = [
  { engine: 'Trident', browser: 'Internet Explorer 4.0', platform: 'Win 95+', version: '4', grade: 'X' },
  { engine: 'Trident', browser: 'Internet Explorer 5.0', platform: 'Win 95+', version: '5', grade: 'C' },
  { engine: 'Trident', browser: 'Internet Explorer 5.5', platform: 'Win 95+', version: '5.5', grade: 'A' },
  { engine: 'Trident', browser: 'Internet Explorer 6', platform: 'Win 98+', version: '6', grade: 'A' },
  { engine: 'Trident', browser: 'Internet Explorer 7', platform: 'Win XP SP2+', version: '7', grade: 'A' },
  { engine: 'Trident', browser: 'AOL browser (AOL desktop)', platform: 'Win XP', version: '6', grade: 'A' },
  { engine: 'Gecko', browser: 'Firefox 1.0', platform: 'Win 98+ / OSX.2+', version: '1.7', grade: 'A' },
  { engine: 'Gecko', browser: 'Firefox 1.5', platform: 'Win 98+ / OSX.2+', version: '1.8', grade: 'A' },
  { engine: 'Gecko', browser: 'Firefox 2.0', platform: 'Win 98+ / OSX.2+', version: '1.8', grade: 'A' },
  { engine: 'Gecko', browser: 'Firefox 3.0', platform: 'Win 2k+ / OSX.3+', version: '1.9', grade: 'A' },
  { engine: 'Webkit', browser: 'Safari 1.2', platform: 'OSX.3', version: '125.5', grade: 'A' },
  { engine: 'Webkit', browser: 'Safari 1.3', platform: 'OSX.3', version: '312.8', grade: 'A' },
  { engine: 'Webkit', browser: 'Safari 2.0', platform: 'OSX.4+', version: '419.3', grade: 'A' },
  { engine: 'Webkit', browser: 'Safari 3.0', platform: 'OSX.4+', version: '522.1', grade: 'A' },
  { engine: 'Presto', browser: 'Opera 7.0', platform: 'Win 95+ / OSX.1+', version: '-', grade: 'A' },
  { engine: 'Presto', browser: 'Opera 8.0', platform: 'Win 95+ / OSX.2+', version: '-', grade: 'A' },
  { engine: 'Presto', browser: 'Opera 9.0', platform: 'Win 95+ / OSX.3+', version: '-', grade: 'A' },
  { engine: 'Misc', browser: 'NetFront 3.1', platform: 'Embedded devices', version: '-', grade: 'C' },
  { engine: 'Misc', browser: 'IE Mobile', platform: 'Windows Mobile 6', version: '-', grade: 'C' },
  { engine: 'Other browsers', browser: 'All others', platform: '-', version: '-', grade: 'U' },
]

function decorate(item: Omit<SampleRow, 'id' | 'name' | 'status'>, id: number): SampleRow {
  return {
    ...item,
    id,
    name: item.engine,
    status: item.grade === 'A' ? 'online' : item.grade === 'C' ? 'offline' : 'repair',
  }
}

export function createSampleRows(): SampleRow[] {
  return SEED.concat(SEED, SEED).map((item, index) => decorate(item, index + 1))
}

export function cloneRows(rows: SampleRow[]): SampleRow[] {
  return rows.map((row) => ({ ...row }))
}
