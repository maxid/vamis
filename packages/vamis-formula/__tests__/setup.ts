import moment from 'moment'
import 'moment-timezone'

moment.tz.setDefault('Asia/Shanghai')

const memory = new Map<string, string>()
const localStorageMock: Storage = {
  get length() {
    return memory.size
  },
  clear() {
    memory.clear()
  },
  getItem(key) {
    return memory.has(key) ? memory.get(key)! : null
  },
  key(index) {
    return [...memory.keys()][index] ?? null
  },
  removeItem(key) {
    memory.delete(key)
  },
  setItem(key, value) {
    memory.set(String(key), String(value))
  },
}

Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: localStorageMock,
})
