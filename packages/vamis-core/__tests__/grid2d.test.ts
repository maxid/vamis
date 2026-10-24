import { describe, expect, it } from 'vitest'
import {
  grid2dCellStyle,
  grid2dCols,
  grid2dGap,
  grid2dTemplate,
} from '../src/utils/grid2d'

describe('grid2dCols', () => {
  it('defaults to 12', () => {
    expect(grid2dCols({})).toBe(12)
  })

  it('keeps a positive cols', () => {
    expect(grid2dCols({ cols: 3 })).toBe(3)
  })
})

describe('grid2dGap', () => {
  it('defaults to 0', () => {
    expect(grid2dGap({})).toEqual({ columnGap: 0, rowGap: 0 })
  })

  it('uses gap for both axes, gapRow/rowGap for rows', () => {
    expect(grid2dGap({ gap: 10, gapRow: 5 })).toEqual({ columnGap: '10px', rowGap: '5px' })
    expect(grid2dGap({ gap: 10, rowGap: 5 })).toEqual({ columnGap: '10px', rowGap: '5px' })
  })
})

describe('grid2dCellStyle', () => {
  it('places a cell with 1-based x/y and exclusive end', () => {
    expect(grid2dCellStyle({ x: 1, y: 1, w: 6, h: 1 })).toEqual({
      gridColumnStart: 1,
      gridColumnEnd: 7,
      gridRowStart: 1,
      gridRowEnd: 2,
      justifySelf: 'stretch',
      alignSelf: 'stretch',
    })
  })

  it('maps align/valign onto justifySelf/alignSelf', () => {
    expect(grid2dCellStyle({ x: 2, y: 1, w: 1, h: 1, align: 'center', valign: 'middle' })).toMatchObject({
      justifySelf: 'center',
      alignSelf: 'center',
    })
  })
})

describe('grid2dTemplate', () => {
  it('fills 1fr columns and default row height', () => {
    const tpl = grid2dTemplate({ cols: 3 }, [{ x: 1, y: 1, w: 1, h: 1 }])
    expect(tpl.columns).toEqual(['1fr', '1fr', '1fr'])
    expect(tpl.rows).toEqual(['3.125rem'])
  })

  it('lets cell width/height pin a whole column/row', () => {
    const tpl = grid2dTemplate({ cols: 3 }, [
      { x: 1, y: 1, w: 1, h: 1, width: 100 },
      { x: 2, y: 1, w: 1, h: 1, height: 100 },
    ])
    expect(tpl.columns).toEqual(['100px', '1fr', '1fr'])
    expect(tpl.rows).toEqual(['100px'])
  })

  it('keeps height auto', () => {
    const tpl = grid2dTemplate({ cols: 1 }, [{ x: 1, y: 1, w: 1, h: 1, height: 'auto' }])
    expect(tpl.rows).toEqual(['auto'])
  })
})
