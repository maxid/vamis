import 'vamis'
import './style.css'
import {
  embed,
  normalizeEmbedSchema,
  type EmbedEnv,
  type EmbedProps,
  type VamisScoped,
} from './embed'
import {
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

export {
  embed,
  normalizeEmbedSchema,
  type EmbedEnv,
  type EmbedProps,
  type VamisScoped,
}
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
}

const api = {
  embed,
  normalizeEmbedSchema,
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
}

declare global {
  interface Window {
    vamis?: typeof api
    __VAMIS_SDK_READY?: (next: typeof api) => void
    __vamisSdkReady?: boolean
  }
}

if (typeof window !== 'undefined') {
  const ready = window.__VAMIS_SDK_READY
  if (typeof ready === 'function') ready(api)
  else {
    window.vamis = api
    window.__vamisSdkReady = true
    window.dispatchEvent(new Event('vamis-sdk-ready'))
  }
}
