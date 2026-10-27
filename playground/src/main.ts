import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import { vAutoHideScroll } from './directives/autoHideScroll'
import { router } from './router'
import { installMockFetch } from './mock/install'
import './style.css'

if (import.meta.env.PROD) installMockFetch()

document.documentElement.dataset.density ||= 'compact'

const app = createApp(App)
app.directive('auto-hide-scroll', vAutoHideScroll)
app.use(createPinia())
app.use(router)
app.mount('#app')
