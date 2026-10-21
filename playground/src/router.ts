import { createRouter, createWebHistory } from 'vue-router'
import PlaygroundView from './views/PlaygroundView.vue'
import EditorView from './views/EditorView.vue'
import DocView from './views/DocView.vue'

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior() {
    return { top: 0 }
  },
  routes: [
    {
      path: '/',
      name: 'home',
      component: DocView,
      beforeEnter(to) {
        if (typeof to.query.example === 'string' && to.query.example) {
          return { path: '/examples', query: to.query }
        }
      },
    },
    { path: '/examples', name: 'examples', component: PlaygroundView },
    { path: '/editor', name: 'editor', component: EditorView },
    { path: '/docs', redirect: '/' },
    { path: '/docs/:path(.*)*', name: 'docs-page', component: DocView },
    { path: '/components', name: 'components', component: DocView },
    { path: '/components/:path(.*)*', name: 'component-page', component: DocView },
  ],
})
