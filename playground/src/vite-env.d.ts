/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>
  export default component
}

declare module '*.yaml?raw' {
  const content: string
  export default content
}

declare module '*.json?raw' {
  const content: string
  export default content
}
