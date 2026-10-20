import { Document, isScalar, parse, visit } from 'yaml'

/** YAML 1.2 Core Schema parse/stringify. Avoids YAML 1.1 bool/octal traps. */
export const YAML_VERSION = '1.2' as const
export const YAML_SCHEMA = 'core' as const

const YAML_1_1_BOOL = /^(y|yes|n|no|on|off)$/i
const CORE_KEYWORD = /^(true|false|null|~)$/i
const LOOKS_LIKE_NUMBER =
  /^-?(?:0o[0-7]+|0x[0-9a-fA-F]+|[0-9]+(?:\.[0-9]+)?(?:[eE][-+]?[0-9]+)?)$/
const CORE_SPECIAL = /^(?:[+-]?\.inf|\.nan)$/i

export function parseYaml(text: string): unknown {
  return parse(text, {
    prettyErrors: true,
    schema: YAML_SCHEMA,
    version: YAML_VERSION,
  })
}

/**
 * Dump with YAML 1.2 Core scalars:
 * - booleans/null/int/float stay unquoted
 * - strings that look like YAML 1.1 bools, numbers, or contain `:` / `#` are quoted
 */
export function stringifyYaml(value: unknown): string {
  const doc = new Document(value, { version: YAML_VERSION })
  visit(doc, {
    Scalar(_key, node) {
      if (!isScalar(node) || typeof node.value !== 'string') return
      const text = node.value
      if (
        YAML_1_1_BOOL.test(text) ||
        CORE_KEYWORD.test(text) ||
        LOOKS_LIKE_NUMBER.test(text) ||
        CORE_SPECIAL.test(text) ||
        text.includes(':') ||
        text.includes('#') ||
        text.includes('\n')
      ) {
        node.type = 'QUOTE_DOUBLE'
      }
    },
  })
  return `${doc.toString({ indent: 2, lineWidth: 0, nullStr: 'null' }).trimEnd()}\n`
}
