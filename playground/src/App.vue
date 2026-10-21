<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { Button, Toaster } from '@vamis/ui'

const route = useRoute()

function navClass(prefix: string, exact = false) {
  const active = exact ? route.path === prefix : route.path === prefix || route.path.startsWith(`${prefix}/`)
  return active ? 'bg-primary text-primary-foreground hover:bg-primary' : ''
}

const THEME_KEY = 'vamis-theme'
const DENSITY_KEY = 'vamis-density'

const dark = ref(false)
const density = ref<'compact' | 'comfortable'>('compact')

function applyChrome() {
  document.documentElement.classList.toggle('dark', dark.value)
  document.documentElement.dataset.density = density.value
}

onMounted(() => {
  dark.value = localStorage.getItem(THEME_KEY) === 'dark'
  density.value = localStorage.getItem(DENSITY_KEY) === 'comfortable' ? 'comfortable' : 'compact'
  applyChrome()
})

watch([dark, density], () => {
  localStorage.setItem(THEME_KEY, dark.value ? 'dark' : 'light')
  localStorage.setItem(DENSITY_KEY, density.value)
  applyChrome()
})
</script>

<template>
  <div class="flex h-screen flex-col overflow-hidden bg-background text-foreground">
    <header class="shrink-0 border-b bg-card">
      <div class="mx-auto flex w-full max-w-[1800px] flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div>
          <p class="font-mono text-[11px] tracking-[0.22em] text-primary">VAMIS / lcdp.ir/v1</p>
          <h1 class="text-lg font-semibold tracking-tight">YAML 即页面</h1>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <div class="hidden items-center gap-1 sm:flex" aria-hidden="true" title="主题色板">
            <span class="size-2.5 rounded-full bg-primary" />
            <span class="size-2.5 rounded-full bg-success" />
            <span class="size-2.5 rounded-full bg-warning" />
            <span class="size-2.5 rounded-full bg-info" />
            <span class="size-2.5 rounded-full bg-destructive" />
          </div>
          <div class="flex rounded-md border p-0.5">
            <Button
              size="xs"
              :variant="density === 'compact' ? 'default' : 'ghost'"
              @click="density = 'compact'"
            >
              紧凑
            </Button>
            <Button
              size="xs"
              :variant="density === 'comfortable' ? 'default' : 'ghost'"
              @click="density = 'comfortable'"
            >
              舒适
            </Button>
          </div>
          <div class="flex rounded-md border p-0.5">
            <Button size="xs" :variant="!dark ? 'default' : 'ghost'" @click="dark = false">浅色</Button>
            <Button size="xs" :variant="dark ? 'default' : 'ghost'" @click="dark = true">深色</Button>
          </div>
          <nav class="flex gap-2 text-sm">
            <RouterLink to="/docs" class="rounded-md px-3 py-1.5 hover:bg-accent" :class="navClass('/docs')">
              文档
            </RouterLink>
            <RouterLink
              to="/components"
              class="rounded-md px-3 py-1.5 hover:bg-accent"
              :class="navClass('/components')"
            >
              组件
            </RouterLink>
            <RouterLink to="/" class="rounded-md px-3 py-1.5 hover:bg-accent" :class="navClass('/', true)">
              示例
            </RouterLink>
            <RouterLink
              to="/editor"
              class="rounded-md px-3 py-1.5 hover:bg-accent"
              :class="navClass('/editor', true)"
            >
              编辑器
            </RouterLink>
          </nav>
        </div>
      </div>
    </header>
    <main class="mx-auto flex min-h-0 w-full max-w-[1800px] flex-1 flex-col px-4 py-3">
      <RouterView v-slot="{ Component }">
        <component :is="Component" class="min-h-0 flex-1" />
      </RouterView>
    </main>
    <Toaster position="top-right" />
  </div>
</template>
