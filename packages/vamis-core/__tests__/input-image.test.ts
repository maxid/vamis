import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const here = dirname(fileURLToPath(import.meta.url))
const read = (rel: string) => readFileSync(resolve(here, rel), 'utf8')

describe('input-image', () => {
  it('reuses InputFile upload pipeline instead of a stub renderer', () => {
    const register = read('../../vamis/src/register.ts')
    expect(register).toMatch(/type: 'input-image'[^\n]*component: InputFile/)
    expect(existsSync(resolve(here, '../../vamis/src/renderers/form/InputImage.vue'))).toBe(false)
    const vue = read('../../vamis/src/renderers/form/InputFile.vue')
    expect(vue).toContain("imageMode = computed(() => String(props.schema.type || '') === 'input-image')")
    expect(vue).toContain("imageMode.value ? '/api/upload' : '/api/upload/file'")
    expect(vue).toContain('image/jpeg, image/jpg, image/png, image/gif')
    expect(vue).toContain('validateImageLimit')
    expect(vue).toContain('frameImage')
    expect(vue).toContain('imageDraggable')
    expect(vue).toContain('vamis-image-control__add')
  })

  it('image defaults match Amis source: initAutoFill true / joinValues true', () => {
    const vue = read('../../vamis/src/renderers/form/InputFile.vue')
    expect(vue).toContain('props.schema.initAutoFill !== false')
    const file = read('../src/utils/input-file.ts')
    expect(file).toContain('export function fileJoinValues')
  })

  it('doc covers the Amis input-image chapters and the crop gap', () => {
    const doc = read('../../../website/src/components/form/input-image.md')
    for (const heading of [
      '## 基本用法',
      '## 限制文件类型',
      '## 限制文件宽度',
      '## 限制文件大小',
      '## 支持裁剪（未接）',
      '## 手动上传',
      '### 隐藏上传按钮',
      '## 自动填充',
      '### 多选模式',
      '### 其他表单项填充',
      '### initAutoFill 初始化时自动同步',
      '## 拖拽排序',
      '## 属性表',
      '### Limit 属性表',
      '## 事件表',
      '## 动作表',
      '## 和 Amis 文档的差异',
    ]) {
      expect(doc).toContain(heading)
    }
    expect(doc).toContain('receiver')
    expect(doc).toContain('**未接**')
  })
})
