import './register'

export { default as VarmisRoot } from './VarmisApp.vue'
export { default as OverlayHost } from './OverlayHost.vue'

export {
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
