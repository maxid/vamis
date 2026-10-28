import { describe, expect, it } from 'vitest'
import { imageBoxSize, imageSrc, imageThumbMode } from '../src/utils/image'

describe('imageBoxSize', () => {
  it('interpolates ${imageHeight} so masonry can fill the card', () => {
    expect(imageBoxSize('${imageHeight}', { imageHeight: '200px' })).toBe('200px')
    expect(imageBoxSize('${imageHeight}', { imageHeight: 180 })).toBe('180px')
    expect(imageBoxSize(200, {})).toBe('200px')
    expect(imageBoxSize('110px', {})).toBe('110px')
  })

  it('drops empty or still-templated values', () => {
    expect(imageBoxSize('${missing}', {})).toBe('')
    expect(imageBoxSize('', {})).toBe('')
    expect(imageBoxSize(undefined, {})).toBe('')
  })
})

describe('imageThumbMode', () => {
  it('accepts Amis thumbMode values and defaults to contain', () => {
    expect(imageThumbMode({})).toBe('contain')
    expect(imageThumbMode({ thumbMode: 'cover' })).toBe('cover')
    expect(imageThumbMode({ thumbMode: 'w-full' })).toBe('w-full')
    expect(imageThumbMode({ thumbMode: 'h-full' })).toBe('h-full')
    expect(imageThumbMode({ thumbMode: 'h-stretch' })).toBe('h-stretch')
  })

  it('interpolates thumbMode so a ternary can switch cover / h-stretch', () => {
    const schema = { thumbMode: "${index % 2 === 0 ? 'h-stretch' : 'cover'}" }
    expect(imageThumbMode(schema, { index: 0 })).toBe('h-stretch')
    expect(imageThumbMode(schema, { index: 1 })).toBe('cover')
  })
})

describe('imageSrc', () => {
  it('reads src then name from data', () => {
    expect(imageSrc({ src: '${image}' }, { image: 'a.jpg' })).toBe('a.jpg')
    expect(imageSrc({ name: 'imageUrl' }, { imageUrl: 'b.jpg' })).toBe('b.jpg')
  })
})
