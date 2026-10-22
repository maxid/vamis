import './register'

export { default as VamisRoot } from './VamisApp.vue'
export { default as OverlayHost } from './OverlayHost.vue'
export { default as Code } from './renderers/display/Code.vue'
export { default as Editor } from './renderers/form/Editor.vue'
export { mountCodeEditor, mountFormEditor, mountDiffEditor } from './renderers/display/code-highlight'
export { registerSchemaIntellisense, rendererTypeNames } from './renderers/display/schema-intellisense'

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
  SCHEMA_PROPERTY_DOCS,
  SCHEMA_TYPE_DOCS,
  registerSchemaTypeDoc,
  registerSchemaPropertyDoc,
  yamlCompletionsForLine,
  jsonCompletionsForLine,
  schemaHoverForLine,
  schemaCompletionsAt,
  schemaHoverAt,
  catalogFor,
  registerSchemaFieldDoc,
  registerSchemaTypeCatalog,
  publishRendererIntellisense,
} from '@vamis/core'
