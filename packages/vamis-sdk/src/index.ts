import 'vamis'
import './style.css'

export {
  embed,
  normalizeEmbedSchema,
  type EmbedEnv,
  type EmbedProps,
  type VamisScoped,
} from './embed'
export {
  registerRenderer,
  parseSchemaText,
  yamlFromUnknown,
  jsonToIr,
  parseToIr,
  registerSchemaIntellisense,
  registerSchemaTypeDoc,
  registerSchemaPropertyDoc,
  registerSchemaTypeCatalog,
  mountFormEditor,
} from 'vamis'
