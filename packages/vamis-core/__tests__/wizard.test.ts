import { describe, expect, it } from 'vitest'
import {
  wizardFinishLabel,
  wizardJumpable,
  wizardMode,
  wizardNextButtonLabel,
  wizardNextLabel,
  wizardPrevLabel,
  wizardShowPrev,
  wizardStartIndex,
  wizardStepTitle,
  wizardSteps,
} from '../src/utils/wizard'

describe('wizard defaults', () => {
  it('defaults mode horizontal / start 0 / button labels', () => {
    expect(wizardMode({})).toBe('horizontal')
    expect(wizardMode({ mode: 'vertical' })).toBe('vertical')
    expect(wizardStartIndex({})).toBe(0)
    expect(wizardStartIndex({ startStep: 2, steps: [{}, {}, {}] })).toBe(1)
    expect(wizardStartIndex({ startStep: '3', steps: [{}, {}, {}] })).toBe(2)
    expect(wizardPrevLabel({})).toBe('上一步')
    expect(wizardNextLabel({})).toBe('下一步')
    expect(wizardFinishLabel({})).toBe('完成')
    expect(wizardPrevLabel({ actionPrevLabel: 'Prev甲' })).toBe('Prev甲')
    expect(wizardShowPrev(0)).toBe(false)
    expect(wizardShowPrev(1)).toBe(true)
  })

  it('picks next vs finish vs saveAndNext, and jumpable previous only', () => {
    const steps = wizardSteps({
      steps: [{ title: '一' }, { title: '二', api: '/save' }, { title: '三' }],
    })
    expect(steps).toHaveLength(3)
    expect(wizardStepTitle(steps[0], 0)).toBe('一')
    expect(wizardNextButtonLabel({}, 0, steps)).toBe('下一步')
    expect(wizardNextButtonLabel({}, 1, steps)).toBe('保存并下一步')
    expect(wizardNextButtonLabel({}, 2, steps)).toBe('完成')
    expect(wizardJumpable(steps[0], 0, 1, {})).toBe(false)
    expect(wizardJumpable(steps[0], 0, 2, {})).toBe(true)
    expect(wizardJumpable({ jumpableOn: '${true}' }, 2, 1, {})).toBe(true)
    expect(wizardJumpable({ jumpable: false }, 0, 2, {})).toBe(false)
  })
})
