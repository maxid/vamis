import { createPinia } from 'pinia'
import { createApp } from 'vue'
import PreviewFrame from './views/PreviewFrame.vue'
import './preview-frame.css'

if (import.meta.env.PROD) {
  void import('./mock/install').then((m) => m.installMockFetch())
}

document.documentElement.classList.add('is-preview-frame')
document.documentElement.dataset.density ||= 'compact'

createApp(PreviewFrame).use(createPinia()).mount('#app')
