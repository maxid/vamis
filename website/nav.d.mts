export const startNav: { text: string; link: string }[]
export const conceptNav: { text: string; link: string }[]
export const styleStartNav: { text: string; link: string }[]
export const typeNav: { text: string; link: string }[]
export const extendNav: { text: string; link: string }[]

export type CompItem = {
  text: string
  link: string
  type?: string
  role?: string
}

export type CompGroup = {
  text: string
  collapsed?: boolean
  items: CompItem[]
}

export type CompNavEntry = CompGroup | CompItem

export function isCompGroup(entry: CompNavEntry): entry is CompGroup

export const styleNav: CompNavEntry[]
export const componentNav: CompNavEntry[]
