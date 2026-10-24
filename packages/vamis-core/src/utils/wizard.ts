/** Wizard。对齐 Amis：mode 默认 horizontal、startStep 从 1 计、按钮 上一步/下一步/完成。 */

import { evalExpression, filterTpl } from '../formula'
import type { PlainObject } from '../types'

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {}
}

export type WizardMode = 'horizontal' | 'vertical'

export type WizardStep = {
  title?: unknown
  label?: unknown
  body?: unknown
  api?: unknown
  actions?: unknown
  jumpable?: unknown
  jumpableOn?: unknown
  mode?: unknown
}

function labelField(schema: unknown, key: string, fallback: string): string {
  const value = asRecord(schema)[key]
  if (typeof value === 'string' && value) return value
  return fallback
}

export function wizardSteps(schema: unknown): WizardStep[] {
  const steps = asRecord(schema).steps
  if (!Array.isArray(steps)) return []
  return steps.filter((item) => item && typeof item === 'object' && !Array.isArray(item)) as WizardStep[]
}

export function wizardMode(schema: unknown): WizardMode {
  return asRecord(schema).mode === 'vertical' ? 'vertical' : 'horizontal'
}

export function wizardStartIndex(schema: unknown, data: PlainObject = {}): number {
  const steps = wizardSteps(schema)
  if (!steps.length) return 0
  const raw = asRecord(schema).startStep
  const text = raw == null || raw === false ? '1' : filterTpl(raw, data)
  const value = Number(text)
  const oneBased = Number.isFinite(value) && value >= 1 ? Math.floor(value) : 1
  return Math.min(steps.length - 1, Math.max(0, oneBased - 1))
}

export function wizardPrevLabel(schema: unknown): string {
  return labelField(schema, 'actionPrevLabel', '上一步')
}

export function wizardNextLabel(schema: unknown): string {
  return labelField(schema, 'actionNextLabel', '下一步')
}

export function wizardNextSaveLabel(schema: unknown): string {
  return labelField(schema, 'actionNextSaveLabel', '保存并下一步')
}

export function wizardFinishLabel(schema: unknown): string {
  return labelField(schema, 'actionFinishLabel', '完成')
}

export function wizardShowPrev(index: number): boolean {
  return index > 0
}

export function wizardStepTitle(step: unknown, index: number): string {
  const rec = asRecord(step)
  const title = rec.title ?? rec.label
  if (title == null || title === false) return `步骤 ${index + 1}`
  return String(title)
}

export function wizardNextButtonLabel(schema: unknown, index: number, steps: WizardStep[] = wizardSteps(schema)): string {
  const next = steps[index + 1]
  if (!next) return wizardFinishLabel(schema)
  if (asRecord(steps[index]).api) return wizardNextSaveLabel(schema)
  return wizardNextLabel(schema)
}

export function wizardHasCustomActions(step: unknown): boolean {
  return Array.isArray(asRecord(step).actions)
}

export function wizardJumpable(step: unknown, index: number, currentStep: number, data: PlainObject = {}): boolean {
  const rec = asRecord(step)
  if (Object.prototype.hasOwnProperty.call(rec, 'jumpable')) return rec.jumpable === true
  if (typeof rec.jumpableOn === 'string' && rec.jumpableOn) {
    return evalExpression(rec.jumpableOn, { ...data, currentStep })
  }
  return index + 1 < currentStep
}
