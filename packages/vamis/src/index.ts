import './register'

export { default as VamisRoot } from './VamisApp.vue'
export { default as OverlayHost } from './OverlayHost.vue'
export { default as Code } from './renderers/display/Code.vue'
export { mountCodeEditor } from './renderers/display/code-highlight'

export {
  SchemaRenderer,
  LazyComponent,
  registerRenderer,
  resolveRenderer,
  getRenderers,
  parseToIr,
  parseSchemaText,
  formatSchemaAs,
  syncAuthoringText,
  jsonToIr,
  yamlFromIr,
  yamlFromUnknown,
  compileIrToWidget,
  documentToWidget,
  IR_API_VERSION,
  createDefaultEnv,
  useRendererHub,
  evaluate,
  parse as parseFormula,
  registerFilter,
  registerFunction,
  runActions,
} from '@vamis/core'
