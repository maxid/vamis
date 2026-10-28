<script setup lang="ts">
import { computed } from 'vue'
import {
  filterTpl,
  imageBoxSize,
  imageFillsParent,
  imageSrc,
  imageThumbMode,
  type SchemaObject,
} from '@vamis/core'

const props = defineProps<{ schema: SchemaObject; data: Record<string, any> }>()

const src = computed(() => imageSrc(props.schema, props.data))
const title = computed(() => filterTpl(props.schema.title || props.schema.caption || '', props.data))
const width = computed(() => imageBoxSize(props.schema.width, props.data))
const height = computed(() => imageBoxSize(props.schema.height, props.data))
const thumbMode = computed(() => imageThumbMode(props.schema, props.data))
const fillParent = computed(() => imageFillsParent(thumbMode.value))
const boxStyle = computed(() => {
  const style: Record<string, string> = {}
  if (width.value) style.width = width.value
  else if (fillParent.value) style.width = '100%'
  if (height.value) style.height = height.value
  return Object.keys(style).length ? style : undefined
})
</script>

<template>
  <span class="vamis-image" :class="{ 'is-fill': fillParent }">
    <span class="vamis-image-thumb" :class="'is-' + thumbMode" :style="boxStyle">
      <img v-if="src" :src="src" :alt="title || schema.name || 'image'" />
      <span v-else class="vamis-image-empty">未配置图片 src</span>
    </span>
    <span v-if="title" class="vamis-image-caption">{{ title }}</span>
  </span>
</template>

<style>
.vamis-image {
  display: inline-block;
  padding: 4px;
  border: 1px solid var(--border);
  overflow: hidden;
  max-width: 100%;
  vertical-align: top;
}
.vamis-image.is-fill {
  display: block;
  width: 100%;
  padding: 0;
  border: 0;
}
.vamis-image-thumb {
  display: block;
  width: 110px;
  height: 110px;
  position: relative;
  overflow: hidden;
}
.vamis-image.is-fill .vamis-image-thumb {
  width: 100%;
}
.vamis-image-thumb img {
  position: absolute;
  left: 50%;
  top: 50%;
  max-height: 100%;
  width: auto;
  transform: translate(-50%, -50%);
}
.vamis-image-thumb.is-cover img,
.vamis-image-thumb.is-contain img,
.vamis-image-thumb.is-h-stretch img {
  position: static;
  width: 100%;
  height: 100%;
  transform: none;
  object-fit: cover;
}
.vamis-image-thumb.is-contain img {
  object-fit: contain;
}
.vamis-image-thumb.is-h-stretch img {
  object-fit: fill;
}
.vamis-image-thumb.is-w-full img {
  position: static;
  width: 100%;
  height: auto;
  transform: none;
}
.vamis-image-thumb.is-h-full img {
  position: static;
  width: auto;
  height: 100%;
  transform: none;
}
.vamis-image-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-size: 12px;
  color: var(--muted-foreground);
  text-align: center;
  padding: 8px;
}
.vamis-image-caption {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: var(--muted-foreground);
}
</style>
