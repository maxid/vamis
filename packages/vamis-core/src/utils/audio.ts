/** Audio。对齐 Amis：inline 默认 true、loop/autoPlay 默认 false、controls 默认 rates/play/time/process/volume。 */

import { filterTpl } from '../formula'
import type { PlainObject } from '../types'

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {}
}

export type AudioControl = 'rates' | 'play' | 'time' | 'process' | 'volume'

const DEFAULT_CONTROLS: AudioControl[] = ['rates', 'play', 'time', 'process', 'volume']
const CONTROLS = new Set<AudioControl>(DEFAULT_CONTROLS)

function truthyFlag(value: unknown, fallback: boolean): boolean {
  if (value === true) return true
  if (value === false) return false
  return fallback
}

export function audioInline(schema: unknown): boolean {
  return truthyFlag(asRecord(schema).inline, true)
}

export function audioLoop(schema: unknown): boolean {
  return truthyFlag(asRecord(schema).loop, false)
}

export function audioAutoPlay(schema: unknown): boolean {
  return truthyFlag(asRecord(schema).autoPlay, false)
}

export function audioSrc(schema: unknown, data: PlainObject = {}): string {
  const src = asRecord(schema).src
  if (src == null || src === false) return ''
  return filterTpl(src, data)
}

export function audioRates(schema: unknown): number[] {
  const rates = asRecord(schema).rates
  if (!Array.isArray(rates)) return []
  return rates.map((item) => Number(item)).filter((item) => Number.isFinite(item) && item > 0)
}

export function audioControls(schema: unknown): AudioControl[] {
  const controls = asRecord(schema).controls
  if (!Array.isArray(controls) || !controls.length) return DEFAULT_CONTROLS.slice()
  return controls
    .map((item) => String(item || '') as AudioControl)
    .filter((item) => CONTROLS.has(item))
}

export function audioHasControl(schema: unknown, name: AudioControl): boolean {
  return audioControls(schema).includes(name)
}

export function audioRateLabel(rate: number): string {
  return `x${Number(rate).toFixed(1)}`
}

export function audioFormatTime(seconds: number): string {
  const value = Number(seconds)
  if (!Number.isFinite(value) || value <= 0) return '0:00'
  const date = new Date(value * 1000)
  const hh = date.getUTCHours()
  const mm = date.getUTCMinutes()
  const ss = String(date.getUTCSeconds()).padStart(2, '0')
  if (hh) return `${hh}:${String(mm).padStart(2, '0')}:${ss}`
  return `${mm}:${ss}`
}
