import { describe, expect, it } from 'vitest'
import {
  audioAutoPlay,
  audioControls,
  audioFormatTime,
  audioHasControl,
  audioInline,
  audioLoop,
  audioRateLabel,
  audioRates,
  audioSrc,
} from '../src/utils/audio'

describe('audio defaults', () => {
  it('defaults inline true / loop false / autoPlay false / empty rates', () => {
    expect(audioInline({})).toBe(true)
    expect(audioInline({ inline: false })).toBe(false)
    expect(audioLoop({})).toBe(false)
    expect(audioLoop({ loop: true })).toBe(true)
    expect(audioAutoPlay({})).toBe(false)
    expect(audioAutoPlay({ autoPlay: true })).toBe(true)
    expect(audioRates({})).toEqual([])
    expect(audioRates({ rates: [1, 1.5, 2] })).toEqual([1, 1.5, 2])
    expect(audioControls({})).toEqual(['rates', 'play', 'time', 'process', 'volume'])
    expect(audioControls({ controls: ['play', 'time'] })).toEqual(['play', 'time'])
    expect(audioHasControl({}, 'time')).toBe(true)
    expect(audioHasControl({ controls: ['play'] }, 'time')).toBe(false)
  })

  it('filters src and formats time / rate like Amis', () => {
    expect(audioSrc({})).toBe('')
    expect(audioSrc({ src: 'https://x/${file}.mp3' }, { file: 'a' })).toBe('https://x/a.mp3')
    expect(audioFormatTime(0)).toBe('0:00')
    expect(audioFormatTime(65)).toBe('1:05')
    expect(audioFormatTime(3600)).toBe('1:00:00')
    expect(audioRateLabel(1)).toBe('x1.0')
    expect(audioRateLabel(1.5)).toBe('x1.5')
  })
})
