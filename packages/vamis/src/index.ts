import './register'

export { default as VamisRoot } from './VamisApp.vue'
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
} from '@vamis/core'
