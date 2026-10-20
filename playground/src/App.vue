<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { Toaster } from '@vamis/ui'
</script>

<template>
  <div class="min-h-screen">
    <header class="border-b bg-card">
      <div class="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-6 py-3">
        <div>
          <p class="font-mono text-[11px] tracking-[0.22em] text-primary">VAMIS / lcdp.ir/v1</p>
          <h1 class="text-lg font-semibold tracking-tight">YAML 即页面</h1>
        </div>
        <nav class="flex gap-2 text-sm">
          <RouterLink
            to="/"
            class="rounded-md px-3 py-1.5 hover:bg-accent"
            active-class="bg-primary text-primary-foreground hover:bg-primary"
          >
            Playground
          </RouterLink>
          <RouterLink
            to="/editor"
            class="rounded-md px-3 py-1.5 hover:bg-accent"
            active-class="bg-primary text-primary-foreground hover:bg-primary"
          >
            编辑器
          </RouterLink>
        </nav>
      </div>
    </header>
    <main class="mx-auto max-w-[1600px] px-6 py-5">
      <RouterView />
    </main>
    <Toaster position="top-right" />
  </div>
</template>
