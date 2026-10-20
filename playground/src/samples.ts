const yamlFiles = import.meta.glob('./examples/*.yaml', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>

const PREFERRED: { file: string; label: string }[] = [
  { file: 'form-page.yaml', label: '黄金表单' },
  { file: 'crud-page.yaml', label: 'CRUD' },
  { file: 'wizard-page.yaml', label: '向导' },
  { file: 'combo-form.yaml', label: '组合录入' },
  { file: 'events-page.yaml', label: '事件/筛选' },
  { file: 'validation-page.yaml', label: '表单校验' },
  { file: 'widgets-page.yaml', label: '展示控件' },
  { file: 'pickers-page.yaml', label: '选择器' },
]

export interface YamlSample {
  id: string
  file: string
  label: string
  yaml: string
}

function fileName(path: string): string {
  return path.split('/').pop() || path
}

function labelFromYaml(yaml: string): string {
  const desc = yaml.match(/^\s*description:\s*(.+)$/m)?.[1]?.trim()
  const name = yaml.match(/^\s*name:\s*(.+)$/m)?.[1]?.trim()
  const raw = (desc || name || '').replace(/^["']|["']$/g, '')
  return raw
}

const preferredByFile = new Map(PREFERRED.map((item) => [item.file, item.label]))

export const yamlSamples: YamlSample[] = Object.entries(yamlFiles)
  .map(([path, yaml]) => {
    const file = fileName(path)
    return {
      id: file.replace(/\.ya?ml$/i, ''),
      file,
      label: preferredByFile.get(file) || labelFromYaml(yaml) || file.replace(/\.ya?ml$/i, ''),
      yaml,
    }
  })
  .sort((a, b) => {
    const ai = PREFERRED.findIndex((item) => item.file === a.file)
    const bi = PREFERRED.findIndex((item) => item.file === b.file)
    if (ai >= 0 && bi >= 0) return ai - bi
    if (ai >= 0) return -1
    if (bi >= 0) return 1
    return a.file.localeCompare(b.file)
  })

export const defaultYaml = yamlSamples.find((item) => item.file === 'form-page.yaml')?.yaml || yamlSamples[0]?.yaml || ''
