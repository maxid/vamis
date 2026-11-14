<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  SchemaRenderer,
  cardActionSchema,
  cardActions,
  cardActionsCount,
  cardAvatar,
  cardAvatarText,
  cardAvatarTextBackground,
  cardBlank,
  cardBodyNodes,
  cardBodyPlain,
  cardCheckable,
  cardChildIsLayout,
  cardClickable,
  cardDescription,
  cardDescriptionPlaceholder,
  cardDragging,
  cardFieldClassName,
  cardFieldLabel,
  cardFieldValueSchema,
  cardHeader,
  cardHideCheckToggler,
  cardHighlight,
  cardHref,
  cardItemAction,
  cardMedia,
  cardMediaPosition,
  cardMediaType,
  cardMediaUrl,
  cardPadActions,
  cardSecondary,
  cardSelectable,
  cardSelected,
  cardSubTitle,
  cardSubTitlePlaceholder,
  cardTitle,
  cardToolbar,
  cardToolbarItemSchema,
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
import { Checkbox } from '@vamis/ui'
import { useCardsSelect } from './cardsSelect'

const props = defineProps<{ schema: SchemaObject; data: Record<string, any> }>()
const env = useEnv()
const overlay = useOverlay()
const scoped = useScoped()
const select = useCardsSelect()
const localChecked = ref(cardSelected(props.schema))

const data = computed(() => props.data || {})
const header = computed(() => cardHeader(props.schema))
const title = computed(() => cardTitle(props.schema, data.value))
const subTitle = computed(() => cardSubTitle(props.schema, data.value))
const subTitlePlaceholder = computed(() => cardSubTitlePlaceholder(props.schema, data.value))
const description = computed(() => cardDescription(props.schema, data.value))
const descriptionPlaceholder = computed(() => cardDescriptionPlaceholder(props.schema, data.value))
const avatar = computed(() => cardAvatar(props.schema, data.value))
const avatarClass = computed(() => resolveClassName(header.value.avatarClassName, data.value))
const imageClass = computed(() =>
  resolveClassName(header.value.imageClassName ?? props.schema.imageClassName, data.value),
)
const avatarTextClass = computed(() =>
  resolveClassName(header.value.avatarTextClassName, data.value),
)
const headingClass = computed(() =>
  resolveClassName(header.value.className ?? props.schema.headerClassName, data.value),
)
const titleClass = computed(() =>
  resolveClassName(header.value.titleClassName ?? props.schema.titleClassName, data.value),
)
const subTitleClass = computed(() =>
  resolveClassName(header.value.subTitleClassName ?? props.schema.subTitleClassName, data.value),
)
const descClass = computed(() =>
  resolveClassName(
    header.value.descriptionClassName ??
      header.value.descClassName ??
      props.schema.descriptionClassName,
    data.value,
  ),
)
const bodyClass = computed(() => resolveClassName(props.schema.bodyClassName, data.value))
const footerClass = computed(() => resolveClassName(props.schema.footerClassName, data.value))
const secondaryClass = computed(() =>
  resolveClassName(props.schema.secondaryClassName, data.value),
)
const highlightClass = computed(() =>
  resolveClassName(header.value.highlightClassName, data.value),
)
const avatarText = computed(() => cardAvatarText(props.schema, data.value))
const avatarBg = computed(() =>
  cardAvatarTextBackground(avatarText.value, header.value.avatarTextBackground),
)
const highlight = computed(() => cardHighlight(props.schema, data.value))
const dragging = computed(() => !!(select?.dragging?.value || cardDragging(props.schema)))
const useLabel = computed(() => cardUseCardLabel(props.schema))
const clickable = computed(() => cardClickable(props.schema, data.value))
const secondary = computed(() => cardSecondary(props.schema, data.value))
const actionGroups = computed(() =>
  cardPadActions(cardActions(props.schema, data.value), cardActionsCount(props.schema)),
)
const toolbar = computed(() => cardToolbar(props.schema).map((item) => cardToolbarItemSchema(item)))
const media = computed(() => cardMedia(props.schema))
const mediaPos = computed(() => cardMediaPosition(props.schema))
const mediaKind = computed(() => cardMediaType(props.schema))
const mediaUrl = computed(() => cardMediaUrl(props.schema, data.value))
const mediaClass = computed(() => resolveClassName(media.value?.className, data.value))
const mediaPoster = computed(() =>
  media.value?.poster != null ? String(media.value.poster) : '',
)
const mediaAutoPlay = computed(() => media.value?.autoPlay === true)
const plainBody = computed(() => cardBodyPlain(props.schema))
const bodyNodes = computed(() => cardBodyNodes(props.schema))
const showCheck = computed(() => {
  if (select) return select.selectable.value && !select.hideCheckToggler.value
  return cardSelectable(props.schema) && !cardHideCheckToggler(props.schema)
})
const checkable = computed(() => cardCheckable(props.schema))
const selected = computed(() => (select ? !!select.isSelected(data.value) : localChecked.value))
const hasToolbar = computed(
  () => !!(toolbar.value.length || showCheck.value || highlight.value || dragging.value),
)
const hasHeading = computed(
  () =>
    !!(
      title.value ||
      subTitle.value ||
      subTitlePlaceholder.value ||
      description.value ||
      descriptionPlaceholder.value ||
      avatar.value ||
      avatarText.value ||
      hasToolbar.value
    ),
)
const hasFooter = computed(() => !!(secondary.value || actionGroups.value.length))
const hasBody = computed(() => plainBody.value != null || bodyNodes.value.length > 0)

function asSchema(node: unknown): SchemaObject {
  if (typeof node === 'string' || typeof node === 'number') return { type: 'tpl', tpl: String(node) }
  return node as SchemaObject
}

function fieldSchema(node: unknown) {
  const schema = popOverFieldSchema(cardFieldValueSchema(node))
  const withLabel = useLabel.value && cardFieldLabel(node) ? { ...schema, label: false } : schema
  const { className: _className, ...rest } = withLabel
  return rest
}

function fieldValueClass(node: unknown) {
  return resolveClassName(cardFieldClassName(node), data.value)
}

function actionSchema(action: SchemaObject): SchemaObject {
  return cardActionSchema(action)
}

function isInteractive(target: EventTarget | null) {
  if (!(target instanceof Element)) return false
  return !!target.closest(
    'button, a, input, textarea, select, [role=button], .vamis-card-actions, .vamis-card-toolbar',
  )
}

function onCheck(checked: boolean) {
  if (select) {
    select.toggle(data.value, checked)
    return
  }
  localChecked.value = checked
}

async function onCardClick(event: MouseEvent) {
  if (isInteractive(event.target)) return
  if (select?.selectable.value && select.checkOnItemClick.value) {
    await select.toggle(data.value)
  }
  if (select?.onItemClick) await select.onItemClick(data.value, event)
  if (select?.selectable.value && select.checkOnItemClick.value) return
  if (!select && cardSelectable(props.schema) && props.schema.checkOnItemClick === true) {
    localChecked.value = !localChecked.value
    return
  }
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
      'is-link': clickable || (select?.selectable.value && select.checkOnItemClick.value),
      'is-checked': selected,
      'is-modified': !!select?.isModified?.(data),
      'has-secondary': !!secondary,
      'is-media': !!media,
      [`is-media-${mediaPos}`]: !!media,
    }"
    @click="onCardClick"
  >
    <div v-if="media && (mediaPos === 'left' || mediaPos === 'top')" class="vamis-card-media">
      <img v-if="mediaKind === 'image' && mediaUrl" class="vamis-card-media-img" :class="mediaClass" :src="mediaUrl" alt="" />
      <video
        v-else-if="mediaKind === 'video' && mediaUrl"
        class="vamis-card-media-video"
        :class="mediaClass"
        :src="mediaUrl"
        :poster="mediaPoster || undefined"
        :autoplay="mediaAutoPlay"
        controls
      />
      <iframe v-else-if="mediaKind === 'iframe' && mediaUrl" class="vamis-card-media-iframe" :class="mediaClass" :src="mediaUrl" />
    </div>
    <div class="vamis-card-main">
      <div v-if="hasHeading" class="vamis-card-heading" :class="headingClass">
        <span v-if="avatar" class="vamis-card-avatar" :class="avatarClass">
          <img :class="imageClass" :src="avatar" alt="" />
        </span>
        <span
          v-else-if="avatarText"
          class="vamis-card-avatar-text"
          :class="avatarTextClass"
          :style="avatarBg ? { background: avatarBg } : undefined"
        >{{ avatarText }}</span>
        <div class="vamis-card-meta">
          <div v-if="title" class="vamis-card-title" :class="titleClass">{{ title }}</div>
          <div
            v-if="subTitle || subTitlePlaceholder"
            class="vamis-card-subTitle"
            :class="[subTitleClass, { 'vamis-card-placeholder': !subTitle && !!subTitlePlaceholder }]"
          >{{ subTitle || subTitlePlaceholder }}</div>
          <div
            v-if="description || descriptionPlaceholder"
            class="vamis-card-desc"
            :class="[descClass, { 'vamis-card-placeholder': !description && !!descriptionPlaceholder }]"
          >{{ description || descriptionPlaceholder }}</div>
        </div>
        <div v-if="hasToolbar" class="vamis-card-toolbar">
          <i v-if="highlight" class="vamis-card-highlight" :class="highlightClass" />
          <Checkbox
            v-if="showCheck"
            class="vamis-card-checkbox"
            :model-value="selected"
            :disabled="!checkable"
            @update:model-value="onCheck($event === true)"
            @click.stop
          />
          <SchemaRenderer v-for="(node, i) in toolbar" :key="i" :schema="node" :extra-data="data" />
          <span v-if="dragging" class="vamis-card-drag" title="拖动排序" @click.stop>
            <svg class="icon" viewBox="0 0 16 16" aria-hidden="true">
              <g transform="translate(5 1)" stroke="currentColor">
                <circle cx="1" cy="1" r="1" />
                <circle cx="5" cy="1" r="1" />
                <circle cx="1" cy="5" r="1" />
                <circle cx="5" cy="5" r="1" />
                <circle cx="1" cy="9" r="1" />
                <circle cx="5" cy="9" r="1" />
                <circle cx="1" cy="13" r="1" />
                <circle cx="5" cy="13" r="1" />
              </g>
            </svg>
          </span>
        </div>
      </div>
      <div v-if="hasBody" class="vamis-card-body" :class="bodyClass">
        <SchemaRenderer v-if="plainBody != null" :schema="asSchema(plainBody)" :extra-data="data" />
        <template v-else v-for="(node, i) in bodyNodes" :key="i">
          <SchemaRenderer v-if="cardChildIsLayout(node)" :schema="asSchema(node)" :extra-data="data" />
          <div v-else class="vamis-card-field">
            <span v-if="useLabel && cardFieldLabel(node)" class="vamis-card-fieldLabel">{{ cardFieldLabel(node) }}</span>
            <div class="vamis-card-fieldValue" :class="fieldValueClass(node)">
              <SchemaRenderer :schema="fieldSchema(node)" :extra-data="data" />
            </div>
          </div>
        </template>
      </div>
      <div v-if="hasFooter" class="vamis-card-footer" :class="footerClass">
        <div v-if="secondary" class="vamis-card-secondary" :class="secondaryClass">{{ secondary }}</div>
        <div v-if="actionGroups.length" class="vamis-card-actions-wrap">
          <div v-for="(group, gi) in actionGroups" :key="gi" class="vamis-card-actions">
            <SchemaRenderer
              v-for="(action, ai) in group"
              :key="ai"
              :schema="actionSchema(action)"
              :extra-data="data"
            />
          </div>
        </div>
      </div>
    </div>
    <div v-if="media && (mediaPos === 'right' || mediaPos === 'bottom')" class="vamis-card-media">
      <img v-if="mediaKind === 'image' && mediaUrl" class="vamis-card-media-img" :class="mediaClass" :src="mediaUrl" alt="" />
      <video
        v-else-if="mediaKind === 'video' && mediaUrl"
        class="vamis-card-media-video"
        :class="mediaClass"
        :src="mediaUrl"
        :poster="mediaPoster || undefined"
        :autoplay="mediaAutoPlay"
        controls
      />
      <iframe v-else-if="mediaKind === 'iframe' && mediaUrl" class="vamis-card-media-iframe" :class="mediaClass" :src="mediaUrl" />
    </div>
  </div>
</template>

<style>
.vamis-card {
  display: flex;
  flex-direction: column;
  width: 100%;
  background: var(--card-bg);
  border: var(--card-border-width) solid var(--card-border);
  border-radius: var(--card-radius);
  margin-bottom: var(--gap-base);
  position: relative;
}
.vamis-node.border-0 > .vamis-card,
.vamis-node.border-none > .vamis-card {
  border-width: 0;
}
.vamis-card.is-link {
  cursor: pointer;
}
.vamis-card.is-checked {
  border-color: var(--card-checked-border);
  background: var(--card-checked-bg);
  color: var(--card-checked-color);
}
.vamis-card.is-checked .vamis-card-actions,
.vamis-card.is-checked .vamis-card-action {
  border-color: var(--card-checked-border);
  color: var(--card-checked-color);
}
.vamis-card.is-modified {
  border-color: var(--card-modified-border);
  background: var(--card-modified-bg);
  color: var(--card-modified-color);
}
.vamis-card.is-modified .vamis-card-actions,
.vamis-card.is-modified .vamis-card-action {
  border-color: var(--card-modified-border);
  color: var(--card-modified-color);
}
.vamis-card-checkbox {
  margin: 0 8px;
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
  padding: var(--gap-md);
}
.vamis-card-heading.p-0,
.vamis-card-heading.p-none {
  padding: 0;
}
.vamis-card-heading.pb-2 {
  padding-bottom: 8px;
}
.vamis-card-heading.items-center {
  align-items: center;
}
.vamis-card-avatar {
  flex-shrink: 0;
  margin-right: 12px;
  max-width: 200px;
}
.vamis-card-avatar img {
  max-width: 100%;
}
.vamis-card-avatar-text {
  flex-shrink: 0;
  width: 50px;
  height: 50px;
  margin-right: var(--gap-base);
  border-radius: 500px;
  background: var(--primary);
  color: var(--primary-foreground);
  line-height: 50px;
  text-align: center;
  font-size: 18px;
  overflow: hidden;
  text-transform: uppercase;
}
.vamis-card-meta {
  flex: 1;
  min-width: 0;
}
.vamis-card-title {
  color: var(--text-loud);
  font-size: var(--fontSizeBase);
  font-weight: 500;
  line-height: 21px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.vamis-card-title + .vamis-card-subTitle,
.vamis-card-title + .vamis-card-placeholder {
  margin-top: var(--gap-xs);
}
.vamis-card-subTitle,
.vamis-card-placeholder {
  max-height: calc(var(--fontSizeBase) * var(--lineHeightBase) * 2);
  overflow: hidden;
  color: var(--card-muted);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.vamis-card-desc {
  color: var(--text-loud);
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
  margin-left: var(--gap-md);
  text-align: right;
  line-height: normal;
}
.vamis-card-drag {
  display: inline-block;
  cursor: grab;
  padding: 0 var(--gap-sm);
  color: var(--card-muted);
}
.vamis-card-drag svg.icon {
  display: inline;
  width: 1em;
  height: 1em;
  vertical-align: -0.125em;
}
.vamis-card-body {
  padding: var(--gap-md);
  flex: 1 0 auto;
}
.vamis-card-body.p-0,
.vamis-card-body.p-none {
  padding: 0;
}
.vamis-card-heading + .vamis-card-body {
  padding-top: 0;
}
.vamis-card-heading + .vamis-card-body.p-0,
.vamis-card-heading + .vamis-card-body.p-none {
  padding-top: 0;
}
.vamis-card-field {
  display: flex;
  flex-wrap: nowrap;
  min-width: 0;
}
.vamis-card-fieldLabel {
  flex: 0 0 40%;
  color: var(--card-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  word-wrap: break-word;
}
.vamis-card.is-checked .vamis-card-fieldLabel {
  color: var(--card-checked-fieldLabel);
}
.vamis-card.is-modified .vamis-card-fieldLabel {
  color: var(--card-modified-fieldLabel);
}
.vamis-card-fieldValue {
  flex: 1 1 0;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--text-loud);
}
.vamis-card-fieldValue .vamis-form-item {
  margin-bottom: 0;
}
.vamis-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.vamis-card-secondary {
  max-width: 200px;
  padding: 0 var(--gap-md);
  color: var(--card-secondary);
  font-size: var(--fontSizeBase);
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
}
.vamis-card-actions {
  display: flex;
  flex-direction: row;
  width: 100%;
  border-top: 1px solid var(--card-action-border);
  align-items: center;
  white-space: nowrap;
}
.vamis-card.is-media-left .vamis-card-actions {
  margin-left: var(--gap-md);
  border-left: 1px solid var(--card-action-border);
}
.vamis-card.has-secondary .vamis-card-secondary + .vamis-card-actions-wrap .vamis-card-actions,
.vamis-card.is-media .vamis-card-actions-wrap .vamis-card-actions {
  margin-left: unset;
  border: none;
  width: auto;
}
.vamis-card-actions > .vamis-node:has(.vamis-card-action) {
  flex: 1 1 0;
  min-width: 0;
  text-align: center;
  border-right: 1px solid var(--card-action-border);
  line-height: 40px;
}
.vamis-card-actions > .vamis-node:has(.vamis-card-action):last-child {
  border-right: none;
}
.vamis-card.has-secondary .vamis-card-actions > .vamis-node:has(.vamis-card-action),
.vamis-card.is-media .vamis-card-actions > .vamis-node:has(.vamis-card-action) {
  flex: none;
  border: none;
}
a.vamis-card-action {
  display: block;
  background: transparent;
  color: var(--card-action-color);
  font-size: var(--card-action-font-size);
  font-weight: 400;
  line-height: 40px;
  text-align: center;
  text-decoration: none;
  cursor: pointer;
}
a.vamis-card-action.is-disabled {
  color: var(--card-muted);
  cursor: not-allowed;
}
a.vamis-card-action:not(.is-disabled):hover {
  background: var(--card-action-hover-bg);
  color: var(--card-action-hover-color);
  text-decoration: none;
}
a.vamis-card-action > i:first-child:not(:last-child),
a.vamis-card-action > .vamis-icon-svg:first-child:not(:last-child) {
  margin-right: 4px;
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
