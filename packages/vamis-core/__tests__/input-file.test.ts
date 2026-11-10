import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { dataMapping } from '../src/utils/data-mapping'
import { filterTpl } from '../src/formula'
import {
  fileMatchesAccept,
  fileShouldChunk,
  filesToFormValue,
  getNameFromUrl,
  interpolateFileMsg,
  parseFileValue,
  prettyBytes,
  type FileItem,
} from '../src/utils/input-file'

const here = dirname(fileURLToPath(import.meta.url))

function item(over: Partial<FileItem> = {}): FileItem {
  return { id: '1', name: 'a.md', value: '/a.md', state: 'uploaded', ...over }
}

describe('input-file values', () => {
  it('prettyBytes uses 1024 units', () => {
    expect(prettyBytes(0)).toBe('0 B')
    expect(prettyBytes(1024)).toBe('1.0 KB')
    expect(prettyBytes(1048576)).toBe('1.0 MB')
  })

  it('parses joinValues strings and file objects', () => {
    expect(parseFileValue('a.md,b.md', { joinValues: true }).map((row) => row.value)).toEqual(['a.md', 'b.md'])
    expect(parseFileValue({ name: 'x.md', value: '/x', state: 'uploaded' }, {}).map((row) => row.name)).toEqual(['x.md'])
    expect(getNameFromUrl('https://x/y/fis3-react.md')).toBe('fis3-react.md')
  })

  it('writes joinValues / extractValue / object', () => {
    const files = [item(), item({ id: '2', name: 'b.md', value: '/b.md' })]
    expect(filesToFormValue(files, { multiple: true })).toBe('/a.md,/b.md')
    expect(filesToFormValue(files, { multiple: true, joinValues: false, extractValue: true })).toEqual(['/a.md', '/b.md'])
    expect(filesToFormValue(files, { multiple: true, joinValues: false })).toEqual(files)
    expect(filesToFormValue([], {})).toBe('')
  })

  it('drops pending/error from the form value', () => {
    expect(filesToFormValue([item({ state: 'pending' }), item()], {})).toBe('/a.md')
  })

  it('matches accept by suffix and mime', () => {
    const csv = new File(['a'], 'a.csv', { type: 'text/csv' })
    expect(fileMatchesAccept(csv, '.csv')).toBe(true)
    expect(fileMatchesAccept(csv, '.md')).toBe(false)
    expect(fileMatchesAccept(csv, '')).toBe(true)
    expect(fileShouldChunk(6 * 1024 * 1024, { useChunk: 'auto' })).toBe(true)
    expect(fileShouldChunk(100, { useChunk: 'auto' })).toBe(false)
    expect(fileShouldChunk(100, { useChunk: true })).toBe(true)
  })

  it('interpolates {{accept}} style messages', () => {
    expect(interpolateFileMsg('{{files}} / {{accept}}', { files: '「a」', accept: '.csv' })).toBe('「a」 / .csv')
  })
})

describe('input-file mapping', () => {
  it('keeps File instances in dataMapping so receiver FormData survives', () => {
    const file = new File(['hi'], 'a.txt', { type: 'text/plain' })
    const mapped = dataMapping({ file }, {})
    expect(mapped.file).toBe(file)
  })

  it('supports |last|pick for autoFill items', () => {
    expect(filterTpl('${items|last|pick:url}', { items: [{ url: 'a' }, { url: 'b' }] })).toBe('b')
  })
})

describe('input-file chrome', () => {
  it('tokens follow Amis FileControl 144 list / 180 drag', () => {
    const css = readFileSync(resolve(here, '../../vamis-ui/src/styles.css'), 'utf8')
    expect(css).toContain('--file-list-max-h: 144px')
    expect(css).toContain('--file-drag-h: 180px')
    expect(css).toContain('.vamis-file__select')
    expect(css).toContain('.vamis-file__tip')
    expect(css).not.toContain('.vamis-file-drop')
  })
})
