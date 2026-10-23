import { createRouter, createWebHistory } from 'vue-router'
import PlaygroundView from './views/PlaygroundView.vue'
import EditorView from './views/EditorView.vue'
import DocView from './views/DocView.vue'

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior() {
    return false
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
    { path: '/docs/style', redirect: '/style/' },
    {
      path: '/docs/style/:path(.*)*',
      redirect: (to) => {
        const rest = ([] as string[]).concat((to.params.path as string | string[]) || []).filter(Boolean).join('/')
        return rest ? `/style/${rest}` : '/style/'
      },
    },
    { path: '/docs/:path(.*)*', name: 'docs-page', component: DocView },
    { path: '/components', name: 'components', component: DocView },
    { path: '/components/:path(.*)*', name: 'component-page', component: DocView },
    { path: '/style', name: 'style', component: DocView },
    { path: '/style/:path(.*)*', name: 'style-page', component: DocView },
  ],
})
