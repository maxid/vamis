<script lang="ts" setup>
import type { ToasterProps } from "vue-sonner"
import { CircleCheckIcon, InfoIcon, Loader2Icon, OctagonXIcon, TriangleAlertIcon, XIcon } from "@lucide/vue"
import { Toaster as Sonner } from "vue-sonner"
import "vue-sonner/style.css"
import { cn } from "@vamis/ui/lib/utils"

const props = defineProps<ToasterProps>()
</script>

<template>
  <Sonner
    :class="cn('toaster group', props.class)"
    :style="{
      '--normal-bg': 'var(--popover)',
      '--normal-text': 'var(--popover-foreground)',
      '--normal-border': 'var(--border)',
      '--border-radius': 'var(--radius)',
      '--success-bg': 'var(--success-bg)',
      '--success-text': 'var(--success)',
      '--success-border': 'var(--success-border)',
      '--error-bg': 'var(--error-bg)',
      '--error-text': 'var(--destructive)',
      '--error-border': 'var(--error-border)',
      '--warning-bg': 'var(--warning-bg)',
      '--warning-text': 'var(--warning-foreground)',
      '--warning-border': 'var(--warning-border)',
      '--info-bg': 'var(--info-bg)',
      '--info-text': 'var(--info)',
      '--info-border': 'var(--info-border)',
    }"
    v-bind="props"
  >
    <template #success-icon>
      <CircleCheckIcon class="size-4" />
    </template>
    <template #info-icon>
      <InfoIcon class="size-4" />
    </template>
    <template #warning-icon>
      <TriangleAlertIcon class="size-4" />
    </template>
    <template #error-icon>
      <OctagonXIcon class="size-4" />
    </template>
    <template #loading-icon>
      <div>
        <Loader2Icon class="size-4 animate-spin" />
      </div>
    </template>
    <template #close-icon>
      <XIcon class="size-4" />
    </template>
  </Sonner>
</template>
