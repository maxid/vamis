import { lookupPriority, parsePriorityTable, stageFromRank } from './component-priority'

const files = import.meta.glob(
  '../../../docs/superpowers/specs/2026-10-20-vamis-component-todo.md',
  { query: '?raw', import: 'default', eager: true },
) as Record<string, string>

const table = parsePriorityTable(Object.values(files)[0] || '')

export function rankForType(type: string | undefined): number | undefined {
  return lookupPriority(table, type)
}

/** 侧栏档：P0 / P1 / P2。 */
export function priorityForType(type: string | undefined): number | undefined {
  const rank = rankForType(type)
  return rank == null ? undefined : stageFromRank(rank)
}
