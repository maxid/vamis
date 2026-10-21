import { createPinia } from 'pinia'
import DefaultTheme from 'vitepress/theme'
import { h } from 'vue'
import { Toaster } from '@vamis/ui'
import 'vamis'
import SchemaPreview from './components/SchemaPreview.vue'
import './style.css'
import type { Theme } from 'vitepress'

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'layout-bottom': () => h(Toaster),
    })
  },
  enhanceApp({ app }) {
    app.use(createPinia())
    app.component('SchemaPreview', SchemaPreview)
  },
} satisfies Theme
