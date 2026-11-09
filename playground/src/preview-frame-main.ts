import { createPinia } from 'pinia'
import { createApp } from 'vue'
import PreviewFrame from './views/PreviewFrame.vue'
import { installMockFetch } from './mock/install'
import './style.css'

if (import.meta.env.PROD) installMockFetch()

document.documentElement.classList.add('is-preview-frame')
document.documentElement.dataset.density ||= 'compact'

createApp(PreviewFrame).use(createPinia()).mount('#app')
