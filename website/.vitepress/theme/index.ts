import { createPinia } from 'pinia'
import DefaultTheme from 'vitepress/theme'
import 'vamis'
import SchemaPreview from './components/SchemaPreview.vue'
import CodeFence from './components/CodeFence.vue'
import './style.css'
import type { Theme } from 'vitepress'

export default {
  extends: DefaultTheme,
  Layout: DefaultTheme.Layout,
  enhanceApp({ app }) {
    app.use(createPinia())
    app.component('SchemaPreview', SchemaPreview)
    app.component('CodeFence', CodeFence)
  },
} satisfies Theme
