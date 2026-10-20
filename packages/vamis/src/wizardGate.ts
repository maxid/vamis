import { inject, onBeforeUnmount, provide, type InjectionKey } from 'vue'

export interface WizardGate {
  register: (validate: () => boolean) => void
  unregister: (validate: () => boolean) => void
  validateCurrent: () => boolean
}

export const WizardGateKey: InjectionKey<WizardGate> = Symbol('vamis-wizard-gate')

export function provideWizardGate(): WizardGate {
  const validators = new Set<() => boolean>()
  const api: WizardGate = {
    register(validate) {
      validators.add(validate)
    },
    unregister(validate) {
      validators.delete(validate)
    },
    validateCurrent() {
      let ok = true
      for (const validate of validators) {
        if (!validate()) ok = false
      }
      return ok
    },
  }
  provide(WizardGateKey, api)
  return api
}

export function useWizardGate(): WizardGate | undefined {
  return inject(WizardGateKey, undefined)
}

export function registerWizardValidate(validate: () => boolean) {
  const gate = useWizardGate()
  if (!gate) return
  gate.register(validate)
  onBeforeUnmount(() => gate.unregister(validate))
}
