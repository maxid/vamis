import { IR_API_VERSION, yamlFromIr, type SchemaObject } from '@vamis/core'

function slug(input: string): string {
  return (
    input
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'untitled'
  )
}

export function toPageYaml(opts: {
  name: string
  title: string
  subTitle?: string
  data?: Record<string, unknown>
  spec?: SchemaObject
  body?: SchemaObject[]
}): string {
  const spec =
    opts.spec ??
    ({
      type: 'page',
      title: opts.title,
      ...(opts.subTitle ? { subTitle: opts.subTitle } : {}),
      ...(opts.data ? { data: opts.data } : {}),
      body: opts.body ?? [],
    } as SchemaObject)

  return yamlFromIr({
    apiVersion: IR_API_VERSION,
    kind: 'UiPage',
    metadata: {
      name: slug(opts.name),
      description: opts.title,
      labels: { source: 'playground' },
    },
    spec,
  })
}
