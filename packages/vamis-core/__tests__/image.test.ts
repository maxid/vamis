import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { schemaNodeDisplayClass } from '../src/style'
import {
  imageBoxSize,
  imageCaption,
  imageHref,
  imageMode,
  imageOriginalSrc,
  imageSrc,
  imageThumbMode,
  imageThumbRatio,
  imageTitle,
  imageZoomNext,
} from '../src/utils/image'

const here = dirname(fileURLToPath(import.meta.url))

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

describe('imageMode / ratio / href / caption', () => {
  it('defaults to thumb and 1:1', () => {
    expect(imageMode({})).toBe('thumb')
    expect(imageMode({ imageMode: 'original' })).toBe('original')
    expect(imageThumbRatio({})).toBe('1:1')
    expect(imageThumbRatio({ thumbRatio: '16:9' })).toBe('16:9')
  })

  it('keeps title and imageCaption as two fields', () => {
    expect(imageTitle({ title: '这是标题' }, {})).toBe('这是标题')
    expect(imageCaption({ imageCaption: '这是一段说明' }, {})).toBe('这是一段说明')
    expect(imageOriginalSrc({ originalSrc: '${full}' }, { full: 'a.jpg' }, 'b.jpg')).toBe('a.jpg')
    expect(imageHref({ href: '${imageHref}' }, { imageHref: 'https://github.com' })).toBe('https://github.com')
  })

  it('clamps zoom by minScale / maxScale percentages', () => {
    expect(imageZoomNext(1, 50, 50, 200)).toBe(1.5)
    expect(imageZoomNext(1.8, 50, 50, 200)).toBe(2)
    expect(imageZoomNext(1, -50, 50, 200)).toBe(0.5)
    expect(imageZoomNext(0.5, -50, 50, 200)).toBe(0.5)
  })
})

describe('image renderer / docs', () => {
  it('registers enlarge overlay, original mode, static-image, and gallery', () => {
    const image = readFileSync(resolve(here, '../../vamis/src/renderers/Image.vue'), 'utf8')
    const gallery = readFileSync(resolve(here, '../../vamis/src/overlay/ImageGallery.vue'), 'utf8')
    const register = readFileSync(resolve(here, '../../vamis/src/register.ts'), 'utf8')
    const host = readFileSync(resolve(here, '../src/SchemaRenderer.vue'), 'utf8')
    const css = readFileSync(resolve(here, '../../vamis-ui/src/styles.css'), 'utf8')
    const docs = readFileSync(resolve(here, '../../../website/src/components/image.md'), 'utf8')
    expect(image).toContain('enlargeAble')
    expect(image).toContain('ImageGallery')
    expect(image).toContain("actionType === 'preview'")
    expect(image).toContain("actionType === 'zoom'")
    expect(image).toContain('clickAction')
    expect(gallery).toContain('vamis-image-gallery')
    expect(gallery).toContain('rotateLeft')
    expect(gallery).toContain('data-tooltip="关闭"')
    expect(gallery).toContain('data-position="left"')
    expect(gallery).toContain('VamisGalleryToolIcon')
    expect(gallery).not.toContain('{{ action.label')
    expect(register).toContain("type: 'static-image'")
    expect(host).toContain("'image'")
    expect(host).toContain("'static-image'")
    expect(css).toContain('--image-thumb: 110px')
    expect(css).toContain('.vamis-image-gallery')
    expect(css).toContain('--image-gallery-max: 1010px')
    expect(css).toContain('--image-gallery-gutter: 30px')
    expect(css).toContain('--image-gallery-toolbar-bg: #ffffff')
    expect(css).toContain('--image-gallery-tool: 40px')
    expect(css).toContain('animation-name: tooltipIn')
    expect(gallery).toContain('vamis-image-gallery__title')
    expect(gallery).not.toContain('v-if="item?.title"')
    expect(schemaNodeDisplayClass({ type: 'image' })).toBe('inline-block')
    expect(schemaNodeDisplayClass({ type: 'static-image' })).toBe('')
    expect(schemaNodeDisplayClass({ type: 'image', imageMode: 'original' })).toBe('')
    expect(css).toContain('.vamis-form .vamis-node:has(> .vamis-form-item--horizontal)')
    expect(docs).toContain('## 放大功能')
    expect(docs).toContain('## 原图模式')
    expect(docs).toContain('## 属性表')
    expect(docs).toContain('## 事件表')
    expect(docs).toContain('## 动作表')
    expect(docs).toContain('enlargeAble: true')
    expect(docs).not.toContain('放大层工具栏目前用文字按钮')
    expect(docs).toContain('imageMode: original')
    expect(docs).not.toContain('github.com/baidu/amis')
  })
})
