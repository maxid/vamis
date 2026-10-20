import { createRouter, createWebHistory } from 'vue-router'
import PlaygroundView from './views/PlaygroundView.vue'
import EditorView from './views/EditorView.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'playground', component: PlaygroundView },
    { path: '/editor', name: 'editor', component: EditorView },
  ],
})
