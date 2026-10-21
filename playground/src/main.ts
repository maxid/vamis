import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router'
import './style.css'
import 'vamis'

document.documentElement.dataset.density ||= 'compact'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
