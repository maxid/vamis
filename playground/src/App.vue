<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { Button } from '@vamis/ui'
import ChromeSwitch from './components/ChromeSwitch.vue'
import SiteSearch from './components/SiteSearch.vue'
import { withBase } from './docs/base'
import { hydrateDocProgress, setShowDocProgress, showDocProgress } from './docs/doc-progress-pref'
import { docViewport, hydrateDocViewport, setDocViewport } from './docs/doc-viewport'
import { publishPreviewChrome, withoutThemeTransition } from './docs/preview-frame'

const GITHUB_REPO = 'https://github.com/maxid/vamis'
const compareHref = withBase('/sdk/compare.html')

const route = useRoute()

function navClass(prefix: string, exact = false) {
  const active = exact ? route.path === prefix : route.path === prefix || route.path.startsWith(`${prefix}/`)
  return active ? 'bg-primary text-primary-foreground hover:bg-primary' : ''
}

function docsNavClass() {
  const path = route.path
  const active =
    path === '/' ||
    path === '/docs' ||
    (path.startsWith('/docs/') && !path.startsWith('/docs/style'))
  return active ? 'bg-primary text-primary-foreground hover:bg-primary' : ''
}

const THEME_KEY = 'vamis-theme'
const DENSITY_KEY = 'vamis-density'
const PACK_KEY = 'vamis-theme-pack'

type ThemePack = 'cxd' | 'antd' | 'ang' | 'green' | 'amber' | 'gold'

const packs: { id: ThemePack; label: string; color: string }[] = [
  { id: 'cxd', label: '云舍', color: '#2468f2' },
  { id: 'antd', label: '仿 AntD', color: '#1677ff' },
  { id: 'ang', label: 'ang', color: '#7266ba' },
  { id: 'green', label: '翠绿', color: '#007617' },
  { id: 'amber', label: '琥珀', color: '#9b4500' },
  { id: 'gold', label: '金色', color: '#8f6a00' },
]

const ACCENT_BY_PACK: Record<ThemePack, string> = {
  cxd: 'blue',
  antd: 'blue',
  ang: 'blue',
  green: 'green',
  amber: 'amber',
  gold: 'gold',
}

const dark = ref(false)
const density = ref<'compact' | 'comfortable'>('compact')
const pack = ref<ThemePack>('cxd')

function parsePack(value: string | null): ThemePack {
  if (value === 'blue') return 'cxd'
  return packs.some((item) => item.id === value) ? (value as ThemePack) : 'cxd'
}

function applyChrome() {
  withoutThemeTransition(() => {
    document.documentElement.classList.toggle('dark', dark.value)
    document.documentElement.dataset.density = density.value
    document.documentElement.dataset.accent = ACCENT_BY_PACK[pack.value]
    document.documentElement.dataset.theme = pack.value
  })
  publishPreviewChrome()
}

onMounted(() => {
  dark.value = localStorage.getItem(THEME_KEY) === 'dark'
  density.value = localStorage.getItem(DENSITY_KEY) === 'comfortable' ? 'comfortable' : 'compact'
  pack.value = parsePack(localStorage.getItem(PACK_KEY))
  hydrateDocViewport()
  hydrateDocProgress()
  applyChrome()
})

watch([dark, density, pack], () => {
  localStorage.setItem(THEME_KEY, dark.value ? 'dark' : 'light')
  localStorage.setItem(DENSITY_KEY, density.value)
  localStorage.setItem(PACK_KEY, pack.value)
})

watch(density, () => {
  document.documentElement.dataset.density = density.value
  publishPreviewChrome()
})

/** 等 switch 先画出滑块过渡，再关色/边动画。否则 theme-changing 会把密度/外观开关掐成瞬切。 */
watch(
  [dark, pack],
  () => {
    requestAnimationFrame(() => applyChrome())
  },
  { flush: 'post' },
)
</script>

<template>
  <div class="flex h-full flex-col overflow-hidden bg-background text-foreground">
    <header class="shrink-0 border-b bg-card">
      <div class="mx-auto flex w-full max-w-[1800px] flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div class="flex min-w-0 items-center gap-4">
          <div>
            <p class="font-mono text-[11px] tracking-[0.22em] text-primary">VAMIS / lcdp.ir/v1</p>
            <h1 class="text-lg font-semibold tracking-tight">Schema 即页面</h1>
          </div>
          <SiteSearch />
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <div class="flex items-center gap-0.5" role="radiogroup" aria-label="主题">
            <button
              v-for="item in packs"
              :key="item.id"
              type="button"
              role="radio"
              class="doc-theme-dot flex size-5 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
              :aria-label="item.label"
              :aria-checked="pack === item.id"
              :data-label="item.label"
              @click="pack = item.id"
            >
              <span
                class="size-2.5 rounded-full transition"
                :class="pack === item.id ? 'ring-2 ring-foreground ring-offset-1 ring-offset-card' : ''"
                :style="{ background: item.color }"
              />
            </button>
          </div>
          <div class="flex items-center gap-2">
            <ChromeSwitch
              :model-value="density === 'comfortable'"
              off-text="紧凑"
              on-text="舒适"
              aria-label="密度"
              @update:model-value="density = $event ? 'comfortable' : 'compact'"
            />
            <ChromeSwitch
              :model-value="dark"
              off-text="浅色"
              on-text="深色"
              aria-label="外观"
              @update:model-value="dark = $event"
            />
            <ChromeSwitch
              :model-value="docViewport === 'mobile'"
              off-text="桌面"
              on-text="移动"
              aria-label="预览视口"
              @update:model-value="setDocViewport($event ? 'mobile' : 'desktop')"
            />
            <ChromeSwitch
              :model-value="showDocProgress"
              off-text="隐藏"
              on-text="进度"
              aria-label="侧栏进度"
              @update:model-value="setShowDocProgress($event)"
            />
          </div>
          <nav class="flex gap-2 text-sm">
            <RouterLink to="/" class="rounded-md px-3 py-1.5 hover:bg-accent" :class="docsNavClass()">
              文档
            </RouterLink>
            <RouterLink
              to="/components"
              class="rounded-md px-3 py-1.5 hover:bg-accent"
              :class="navClass('/components')"
            >
              组件
            </RouterLink>
            <RouterLink to="/style" class="rounded-md px-3 py-1.5 hover:bg-accent" :class="navClass('/style')">
              样式
            </RouterLink>
            <RouterLink to="/examples" class="rounded-md px-3 py-1.5 hover:bg-accent" :class="navClass('/examples')">
              示例
            </RouterLink>
            <RouterLink
              to="/editor"
              class="rounded-md px-3 py-1.5 hover:bg-accent"
              :class="navClass('/editor', true)"
            >
              编辑器
            </RouterLink>
            <a :href="compareHref" class="rounded-md px-3 py-1.5 hover:bg-accent">对照</a>
          </nav>
          <Button
            as="a"
            variant="ghost"
            size="icon-xs"
            :href="GITHUB_REPO"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub 仓库"
            title="GitHub"
          >
            <svg class="size-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path
                d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
              />
            </svg>
          </Button>
        </div>
      </div>
    </header>
    <main class="mx-auto flex min-h-0 w-full max-w-[1800px] flex-1 flex-col px-4 py-3">
      <RouterView v-slot="{ Component }">
        <component :is="Component" class="min-h-0 flex-1" />
      </RouterView>
    </main>
  </div>
</template>
