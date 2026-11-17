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
import { Checkbox, VamisIcon } from '@vamis/ui'
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
  const withLabel = useLabel.value && cardFieldLabel(node) ? { ...schema, label: false as const } : schema
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
            <VamisIcon name="drag-bar" class="icon" />
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
