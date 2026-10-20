import './register'

export {
  VarmisRoot,
  SchemaRenderer,
  registerRenderer,
  resolveRenderer,
  getRenderers,
  parseToIr,
  parseSchemaText,
  jsonToIr,
  yamlFromIr,
  yamlFromUnknown,
  compileIrToWidget,
  documentToWidget,
  IR_API_VERSION,
  createDefaultEnv,
  useRendererHub,
} from '@varmis/core'
