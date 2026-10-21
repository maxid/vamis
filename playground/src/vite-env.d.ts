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

declare module '*.md' {
  const content: string
  export default content
}

declare module '../../../website/nav.mjs' {
  export const startNav: { text: string; link: string }[]
  export const conceptNav: { text: string; link: string }[]
  export const styleNav: { text: string; link: string }[]
  export const typeNav: { text: string; link: string }[]
  export const extendNav: { text: string; link: string }[]
  export const componentNav: {
    text: string
    collapsed?: boolean
    items: { text: string; link: string }[]
  }[]
}
