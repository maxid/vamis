<script setup lang="ts">
import { computed } from 'vue'
import {
  SchemaRenderer,
  cardActions,
  cardActionsCount,
  cardAvatar,
  cardAvatarText,
  cardAvatarTextBackground,
  cardBlank,
  cardBodyNodes,
  cardClickable,
  cardDescription,
  cardFieldLabel,
  cardFieldValueSchema,
  cardHeader,
  cardHighlight,
  cardHref,
  cardItemAction,
  cardMedia,
  cardMediaPosition,
  cardMediaType,
  cardMediaUrl,
  cardPadActions,
  cardSecondary,
  cardSubTitle,
  cardTitle,
  cardToolbar,
  cardUseCardLabel,
  popOverFieldSchema,
  resolveClassName,
  runAction,
  useEnv,
  useOverlay,
  useScoped,
  type ActionSchema,
  type SchemaObject,
} from '@vamis/core'

const props = defineProps<{ schema: SchemaObject; data: Record<string, any> }>()
const env = useEnv()
const overlay = useOverlay()
const scoped = useScoped()

const data = computed(() => props.data || {})
const header = computed(() => cardHeader(props.schema))
const title = computed(() => cardTitle(props.schema, data.value))
const subTitle = computed(() => cardSubTitle(props.schema, data.value))
const description = computed(() => cardDescription(props.schema, data.value))
const avatar = computed(() => cardAvatar(props.schema, data.value))
const avatarClass = computed(() => resolveClassName(header.value.avatarClassName, data.value))
const avatarText = computed(() => cardAvatarText(props.schema, data.value))
const avatarBg = computed(() =>
  cardAvatarTextBackground(avatarText.value, header.value.avatarTextBackground),
)
const highlight = computed(() => cardHighlight(props.schema))
const useLabel = computed(() => cardUseCardLabel(props.schema))
const clickable = computed(() => cardClickable(props.schema, data.value))
const secondary = computed(() => cardSecondary(props.schema, data.value))
const actionGroups = computed(() =>
  cardPadActions(cardActions(props.schema, data.value), cardActionsCount(props.schema)),
)
const toolbar = computed(() => cardToolbar(props.schema))
const media = computed(() => cardMedia(props.schema))
const mediaPos = computed(() => cardMediaPosition(props.schema))
const mediaKind = computed(() => cardMediaType(props.schema))
const mediaUrl = computed(() => cardMediaUrl(props.schema, data.value))
const mediaClass = computed(() => resolveClassName(media.value?.className, data.value))
const bodyNodes = computed(() => cardBodyNodes(props.schema))
const hasHeading = computed(
  () => !!(title.value || subTitle.value || description.value || avatar.value || avatarText.value || toolbar.value.length || highlight.value),
)
const hasFooter = computed(() => !!(secondary.value || actionGroups.value.length))

function fieldSchema(node: unknown) {
  const schema = popOverFieldSchema(cardFieldValueSchema(node))
  if (useLabel.value && cardFieldLabel(node)) return { ...schema, label: false }
  return schema
}

function actionSchema(action: SchemaObject): SchemaObject {
  return {
    level: 'link',
    type: 'button',
    size: action.size || 'sm',
    ...action,
  }
}

function isInteractive(target: EventTarget | null) {
  if (!(target instanceof Element)) return false
  return !!target.closest('button, a, input, textarea, select, [role=button], .vamis-card-actions, .vamis-card-toolbar')
}

async function onCardClick(event: MouseEvent) {
  if (isInteractive(event.target)) return
  const href = cardHref(props.schema, data.value)
  if (href) {
    if (cardBlank(props.schema)) window.open(href, '_blank')
    else env.jumpTo(href)
    return
  }
  const action = cardItemAction(props.schema)
  if (!action) return
  await runAction(action as ActionSchema, {
    env,
    data: data.value,
    overlay,
    scoped,
  })
}
</script>

<template>
  <div
    class="vamis-card"
    :class="{
      'is-link': clickable,
      'has-secondary': !!secondary,
      'is-media': !!media,
      [`is-media-${mediaPos}`]: !!media,
    }"
    @click="onCardClick"
  >
    <div v-if="media && (mediaPos === 'left' || mediaPos === 'top')" class="vamis-card-media">
      <img v-if="mediaKind === 'image' && mediaUrl" class="vamis-card-media-img" :class="mediaClass" :src="mediaUrl" alt="" />
      <video v-else-if="mediaKind === 'video' && mediaUrl" class="vamis-card-media-video" :class="mediaClass" :src="mediaUrl" controls />
      <iframe v-else-if="mediaKind === 'iframe' && mediaUrl" class="vamis-card-media-iframe" :class="mediaClass" :src="mediaUrl" />
    </div>
    <div class="vamis-card-main">
      <div v-if="hasHeading" class="vamis-card-heading">
        <span v-if="avatar" class="vamis-card-avatar" :class="avatarClass">
          <img :src="avatar" alt="" />
        </span>
        <span
          v-else-if="avatarText"
          class="vamis-card-avatar-text"
          :style="avatarBg ? { background: avatarBg } : undefined"
        >{{ avatarText }}</span>
        <div class="vamis-card-meta">
          <div v-if="title || highlight" class="vamis-card-title">
            <span v-if="highlight" class="vamis-card-highlight" />
            {{ title }}
          </div>
          <div v-if="subTitle" class="vamis-card-subTitle">{{ subTitle }}</div>
          <div v-if="description" class="vamis-card-desc">{{ description }}</div>
        </div>
        <div v-if="toolbar.length" class="vamis-card-toolbar">
          <SchemaRenderer v-for="(node, i) in toolbar" :key="i" :schema="node" :extra-data="data" />
        </div>
      </div>
      <div v-if="bodyNodes.length" class="vamis-card-body">
        <template v-for="(node, i) in bodyNodes" :key="i">
          <SchemaRenderer v-if="cardFieldValueSchema(node).type === 'divider'" :schema="fieldSchema(node)" />
          <div v-else class="vamis-card-field">
            <span v-if="useLabel && cardFieldLabel(node)" class="vamis-card-fieldLabel">{{ cardFieldLabel(node) }}</span>
            <div class="vamis-card-fieldValue">
              <SchemaRenderer :schema="fieldSchema(node)" />
            </div>
          </div>
        </template>
      </div>
      <div v-if="hasFooter" class="vamis-card-footer">
        <div v-if="secondary" class="vamis-card-secondary">{{ secondary }}</div>
        <div v-if="actionGroups.length" class="vamis-card-actions-wrap">
          <div v-for="(group, gi) in actionGroups" :key="gi" class="vamis-card-actions">
            <div v-for="(action, ai) in group" :key="ai" class="vamis-card-action">
              <SchemaRenderer :schema="actionSchema(action)" :extra-data="data" />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="media && (mediaPos === 'right' || mediaPos === 'bottom')" class="vamis-card-media">
      <img v-if="mediaKind === 'image' && mediaUrl" class="vamis-card-media-img" :class="mediaClass" :src="mediaUrl" alt="" />
      <video v-else-if="mediaKind === 'video' && mediaUrl" class="vamis-card-media-video" :class="mediaClass" :src="mediaUrl" controls />
      <iframe v-else-if="mediaKind === 'iframe' && mediaUrl" class="vamis-card-media-iframe" :class="mediaClass" :src="mediaUrl" />
    </div>
  </div>
</template>

<style>
.vamis-card {
  display: flex;
  flex-direction: column;
  width: 100%;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  position: relative;
}
.vamis-card.is-link {
  cursor: pointer;
}
.vamis-card.is-media-left,
.vamis-card.is-media-right {
  flex-direction: row;
  align-items: stretch;
}
.vamis-card.is-media-right {
  flex-direction: row-reverse;
}
.vamis-card.is-media-bottom {
  flex-direction: column-reverse;
}
.vamis-card-main {
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.vamis-card.is-media .vamis-card-main {
  justify-content: center;
}
.vamis-card-heading {
  display: flex;
  padding: 16px;
}
.vamis-card-avatar {
  flex-shrink: 0;
  margin-right: 12px;
  max-width: 200px;
}
.vamis-card-avatar img {
  display: block;
  max-width: 100%;
  height: auto;
}
.vamis-card-avatar-text {
  flex-shrink: 0;
  width: 50px;
  height: 50px;
  margin-right: 16px;
  border-radius: 500px;
  background: var(--primary);
  color: var(--primary-foreground);
  line-height: 50px;
  text-align: center;
  font-size: 18px;
  overflow: hidden;
}
.vamis-card-meta {
  flex: 1;
  min-width: 0;
}
.vamis-card-title {
  color: var(--foreground);
  font-size: 14px;
  font-weight: 500;
  line-height: 21px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.vamis-card-subTitle,
.vamis-card-desc {
  margin-top: 4px;
  max-height: calc(14px * 1.5 * 2);
  overflow: hidden;
  color: var(--muted-foreground);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.vamis-card-highlight {
  display: inline-block;
  width: 8px;
  height: 8px;
  margin-right: 8px;
  border-radius: 100%;
  background: var(--success, #30bf13);
  vertical-align: middle;
}
.vamis-card-toolbar {
  margin-left: 16px;
  text-align: right;
  line-height: normal;
}
.vamis-card-body {
  padding: 16px;
  flex: 1 0 auto;
}
.vamis-card-heading + .vamis-card-body {
  padding-top: 0;
}
.vamis-card-field {
  display: flex;
  flex-wrap: nowrap;
  min-width: 0;
}
.vamis-card-fieldLabel {
  flex: 0 0 40%;
  color: var(--muted-foreground);
  overflow: hidden;
  text-overflow: ellipsis;
}
.vamis-card-fieldValue {
  flex: 1 1 0;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}
.vamis-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.vamis-card-secondary {
  max-width: 200px;
  padding: 0 16px;
  color: var(--muted-foreground);
  font-size: 14px;
  line-height: 21px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.vamis-card-actions-wrap {
  flex: 1;
  min-width: 0;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}
.vamis-card-actions {
  display: flex;
  width: 100%;
  border-top: 1px solid var(--border);
  align-items: center;
}
.vamis-card.has-secondary .vamis-card-footer,
.vamis-card.is-media .vamis-card-footer {
  gap: 12px;
  padding: 0 8px 8px;
}
.vamis-card.has-secondary .vamis-card-actions-wrap,
.vamis-card.is-media .vamis-card-actions-wrap {
  flex: 0 0 auto;
  flex-wrap: nowrap;
  gap: 12px;
}
.vamis-card.has-secondary .vamis-card-actions,
.vamis-card.is-media .vamis-card-actions {
  border-top: none;
  width: auto;
  flex-wrap: nowrap;
  gap: 12px;
  justify-content: flex-end;
}
.vamis-card-action {
  flex: 1 1 0;
  min-width: 0;
  text-align: center;
  border-right: 1px solid var(--border);
  line-height: 40px;
  cursor: pointer;
}
.vamis-card-action:last-child {
  border-right: none;
}
.vamis-card.has-secondary .vamis-card-action,
.vamis-card.is-media .vamis-card-action {
  flex: none;
  border-right: none;
}
.vamis-card.has-secondary .vamis-card-action .vamis-node,
.vamis-card.is-media .vamis-card-action .vamis-node {
  height: auto;
}
.vamis-card.has-secondary .vamis-card-action [data-slot='button'],
.vamis-card.is-media .vamis-card-action [data-slot='button'],
.vamis-card.has-secondary .vamis-card-action button,
.vamis-card.is-media .vamis-card-action button {
  width: auto;
  min-width: 48px;
  padding: 0 12px;
}
.vamis-card-action .vamis-node {
  display: block;
  height: 40px;
}
.vamis-card-action [data-slot='button'],
.vamis-card-action button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width: 100%;
  height: 40px;
  min-height: 40px;
  padding: 0;
  margin: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
  color: var(--foreground);
  font-size: 12px;
  font-weight: 400;
  line-height: 1;
  text-decoration: none;
}
.vamis-card-action:hover {
  background: #f7f8fa;
}
.vamis-card-action:hover [data-slot='button'],
.vamis-card-action:hover button {
  background: transparent;
  box-shadow: none;
  border: 0;
  color: var(--primary);
  text-decoration: none;
}
.vamis-card-media {
  flex-shrink: 0;
}
.vamis-card-media-img {
  display: block;
  object-fit: cover;
  border-radius: var(--radius);
}
.vamis-card.is-media-left .vamis-card-media-img,
.vamis-card.is-media-left .vamis-card-media-video {
  margin: 16px 0 16px 16px;
}
.vamis-card.is-media-right .vamis-card-media-img,
.vamis-card.is-media-right .vamis-card-media-video {
  margin: 16px 16px 16px 0;
}
.vamis-card-media-video,
.vamis-card-media-iframe {
  width: 180px;
  height: 120px;
  border: 0;
  border-radius: var(--radius);
}
</style>
