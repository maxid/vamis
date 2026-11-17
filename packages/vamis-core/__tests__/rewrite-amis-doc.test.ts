import { describe, expect, it } from 'vitest'
import {
  dropVersionColumns,
  rewriteProse,
  stripProductVersions,
} from '../../../website/scripts/rewrite-amis-doc.mjs'

describe('strip Amis product versions', () => {
  it('drops a 版本 column and version-only callouts', () => {
    const md = [
      '| 属性 | 说明 | 版本 |',
      '| --- | --- | --- |',
      '| foo | bar | 1.4.0 |',
      '',
      '> 1.1.6 版本',
      '',
      '> 2.8.0 及以上版本',
      '',
      '> 6.13.0 起支持',
      '',
      '> 1.1.6',
      '',
      '> 6.9.0 以上版本, 若设置固定高度会出滚动条',
      '',
      'addConfirm (3.6.4 及以上版本) 用于确认。',
      '',
      '属性 / 事件 / 动作表按 Amis 6.13.0 主路径列出。',
      '',
      '```schema',
      '{ "label": "版本号" }',
      '```',
    ].join('\n')
    const out = stripProductVersions(md)
    expect(out).not.toMatch(/1\.4\.0/)
    expect(out).not.toMatch(/版本 \|/)
    expect(out).not.toMatch(/1\.1\.6 版本/)
    expect(out).not.toMatch(/2\.8\.0/)
    expect(out).not.toMatch(/6\.13\.0 起支持/)
    expect(out).not.toMatch(/^> 1\.1\.6$/m)
    expect(out).toMatch(/若设置固定高度会出滚动条/)
    expect(out).toMatch(/addConfirm 用于确认/)
    expect(out).toMatch(/按 Amis 主路径列出/)
    expect(out).not.toMatch(/6\.13\.0/)
    expect(out).toMatch(/"label": "版本号"/)
  })

  it('keeps Mini 版本 feature titles', () => {
    expect(rewriteProse('## Mini 版本')).toBe('## Mini 版本')
  })

  it('dropVersionColumns only removes 版本 header', () => {
    const md = '| 属性 | 版本 |\n| --- | --- |\n| a | 2.2.0 |\n'
    expect(dropVersionColumns(md)).toBe('| 属性 |\n| --- |\n| a |\n')
  })
})
