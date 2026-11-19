<script setup lang="ts">
import { VamisIcon } from '@vamis/ui'
import { computed, ref, watch } from 'vue'
import {
  createVamisEvent,
  eventEvalData,
  isDisabled,
  paginationActivePage,
  paginationEllipsisGap,
  paginationLastPage,
  paginationLayout,
  paginationMaxButtons,
  paginationMode,
  paginationNum,
  paginationPagerItems,
  paginationPerPage,
  paginationPerPageAvailable,
  paginationSize,
  paginationTotalText,
  resolveValue,
  runOnEvent,
  useData,
  useEnv,
  useFormApi,
  useOverlay,
  useScope,
  useScoped,
  type SchemaObject,
} from '@vamis/core'
import { useFieldValue } from '../formContext'
import PaginationPerPage from './PaginationPerPage.vue'

const props = defineProps<{ schema: SchemaObject }>()
const emit = defineEmits<{
  pageChange: [page: number, perPage?: number, dir?: string]
}>()
const data = useData()
const env = useEnv()
const scoped = useScoped()
const overlay = useOverlay()
const formApi = useFormApi()
const scope = useScope()
const field = useFieldValue()

function resolvedNum(value: unknown, fallback: number): number {
  return paginationNum(resolveValue(value, data.value), fallback) ?? fallback
}

const mode = computed(() => paginationMode(props.schema))
const size = computed(() => paginationSize(props.schema))
const layout = computed(() => paginationLayout(props.schema))
const locked = computed(() => isDisabled(props.schema, data.value))
const hasNext = computed(() => Boolean(props.schema.hasNext))
const mobileUI = computed(() => props.schema.mobileUI ?? env.mobileUI === true)
const buttonType = computed(() => props.schema.buttonType === 'text' ? 'text' : 'icon')

const page = ref(1)
const perPage = ref(10)
const goInput = ref('')
const simpleInput = ref('1')

function syncFromSchema() {
  const named = props.schema.name ? field.getValue(props.schema.name) : undefined
  page.value = paginationNum(named, resolvedNum(props.schema.activePage ?? props.schema.value, paginationActivePage(props.schema))) ?? 1
  perPage.value = resolvedNum(props.schema.perPage, paginationPerPage(props.schema))
}

watch(() => [props.schema, data.value] as const, syncFromSchema, { immediate: true, deep: true })
watch(page, value => {
  simpleInput.value = String(value)
})

const lastPage = computed(() =>
  paginationLastPage(
    {
      total: resolveValue(props.schema.total, data.value),
      lastPage: resolveValue(props.schema.lastPage, data.value),
      hasNext: props.schema.hasNext,
    },
    perPage.value,
    page.value,
  ),
)
const pagerItems = computed(() =>
  paginationPagerItems({
    activePage: page.value,
    lastPage: lastPage.value,
    maxButtons: paginationMaxButtons(props.schema),
    ellipsisPageGap: paginationEllipsisGap(props.schema),
    hasNext: hasNext.value,
    mobileUI: mobileUI.value,
  }),
)
const perPageOptions = computed(() => paginationPerPageAvailable(props.schema))
const totalText = computed(() =>
  paginationTotalText(
    {
      total: resolveValue(props.schema.total, data.value),
      lastPage: resolveValue(props.schema.lastPage, data.value),
    },
    lastPage.value,
    env.translate,
  ),
)

async function emitChange(nextPage: number, nextPerPage = perPage.value, dir?: string) {
  if (locked.value) return
  const next = !Number.isFinite(nextPage) || nextPage < 1 ? 1 : nextPage
  const payload = { ...data.value, page: next, perPage: nextPerPage, dir }
  const event = createVamisEvent('change', payload)
  await runOnEvent(props.schema, 'change', {
    env,
    data: eventEvalData(payload, event),
    scoped,
    overlay,
    form: formApi,
    scope: scope.value,
    event,
  })
  if (event.prevented) return
  page.value = next
  perPage.value = nextPerPage
  if (props.schema.name) field.setValue(props.schema.name, next)
  emit('pageChange', next, nextPerPage, dir)
}

function onPrev() {
  if (page.value < 2) return
  void emitChange(page.value - 1, perPage.value, 'backward')
}

function onNext() {
  if (page.value >= lastPage.value && !hasNext.value) return
  void emitChange(page.value + 1, perPage.value, 'forward')
}

function onGo() {
  const n = paginationNum(goInput.value)
  if (!n) return
  goInput.value = ''
  void emitChange(Math.min(n, lastPage.value))
}

function onGoInput(event: Event) {
  const input = event.target as HTMLInputElement
  const value = input.value
  const n = paginationNum(value)
  goInput.value = /^\d+$/.test(value) && n ? String(Math.min(n, lastPage.value)) : value
}

function onGoKey(e: KeyboardEvent) {
  if (e.key !== 'Enter') return
  onGo()
}

function updateSimpleInput(raw: string) {
  const n = paginationNum(raw)
  simpleInput.value = /^\d+$/.test(raw) && n ? String(Math.min(n, lastPage.value)) : raw
}

function onSimpleKey(event: KeyboardEvent) {
  if (!['ArrowUp', 'ArrowDown', 'Enter'].includes(event.key)) return
  const input = event.target as HTMLInputElement
  let value = paginationNum(input.value) ?? 0
  if (event.key === 'ArrowUp') value += 1
  if (event.key === 'ArrowDown') value = value < 2 ? 1 : value - 1
  if (!value) {
    simpleInput.value = ''
    return
  }
  value = Math.min(value, lastPage.value)
  simpleInput.value = String(value)
  void emitChange(value, perPage.value)
}

function onSimpleBlur() {
  simpleInput.value = String(page.value)
}

function onPerPage(value: number) {
  void emitChange(1, value)
}
</script>

<template>
  <div
    data-vamis-pagination
    :data-mode="mode"
    :data-size="size"
    :data-mobile="mobileUI || undefined"
    :data-button-type="buttonType"
    :class="{ disabled: locked }"
  >
    <template v-if="mode === 'simple'">
      <ul data-pagination="pager">
        <li data-pager="prev" :class="{ 'is-disabled': page < 2 }" @click="onPrev">
          <span aria-label="上一页">
            <span v-if="buttonType === 'text'">上一页</span>
            <VamisIcon v-else name="page-prev" width="12" height="12" />
          </span>
        </li>
        <li data-pager="simple">
          <span v-if="!mobileUI" class="vamis-pagination__simple-number">{{ page }}</span>
          <template v-else>
            <input
              data-pagination="simple-input"
              type="text"
              :disabled="locked"
              :value="simpleInput"
              @input="updateSimpleInput(($event.target as HTMLInputElement).value)"
              @keyup="onSimpleKey"
              @blur="onSimpleBlur"
            />
            <span class="vamis-pagination__simple-last">/ {{ lastPage }}</span>
          </template>
        </li>
        <li
          data-pager="next"
          :class="{ 'is-disabled': page >= lastPage && !hasNext }"
          @click="onNext"
        >
          <span aria-label="下一页">
            <span v-if="buttonType === 'text'">下一页</span>
            <VamisIcon v-else name="page-next" width="12" height="12" />
          </span>
        </li>
      </ul>
    </template>
    <template v-else>
      <template v-for="widget in layout" :key="widget">
        <div v-if="widget === 'total' && totalText && !mobileUI" data-pagination="total">{{ totalText }}</div>
        <PaginationPerPage
          v-else-if="widget === 'perpage' && !mobileUI"
          :value="perPage"
          :options="perPageOptions"
          :disabled="locked"
          :pop-over-container-selector="schema.popOverContainerSelector"
          @change="onPerPage"
        />
        <ul v-else-if="widget === 'pager'" data-pagination="pager">
          <li
            v-for="(item, i) in pagerItems"
            :key="item.kind === 'page' ? `p-${item.page}` : item.kind === 'ellipsis' ? `${item.dir}-ellipsis` : `${item.kind}-${i}`"
            :data-pager="item.kind"
            :class="{
              'is-active': item.kind === 'page' && item.active,
              'is-disabled': (item.kind === 'prev' || item.kind === 'next') && item.disabled,
            }"
            @click="
              item.kind === 'simple'
                ? undefined
                : item.kind === 'prev'
                ? onPrev()
                : item.kind === 'next'
                  ? onNext()
                  : item.kind === 'page'
                    ? emitChange(item.page)
                    : emitChange(item.page, perPage, item.dir)
            "
          >
            <a v-if="item.kind === 'page'" role="button">{{ item.page }}</a>
            <template v-else-if="item.kind === 'ellipsis'">
              <a role="button">...</a>
              <span class="icon">
                <VamisIcon name="page-backward" v-if="item.dir === 'backward'" width="12" height="12" />
                <VamisIcon name="page-forward" v-else width="12" height="12" />
              </span>
            </template>
            <span v-else-if="item.kind === 'simple'" class="vamis-pagination__simple-editor">
              <input
                data-pagination="simple-input"
                type="text"
                :disabled="locked"
                :value="simpleInput"
                @input="updateSimpleInput(($event.target as HTMLInputElement).value)"
                @keyup="onSimpleKey"
                @blur="onSimpleBlur"
              />
              <span class="vamis-pagination__simple-last">/ {{ lastPage }}</span>
            </span>
            <span v-else-if="item.kind === 'prev'" aria-label="上一页">
              <span v-if="buttonType === 'text'">上一页</span>
            <VamisIcon v-else name="page-prev" width="12" height="12" />
            </span>
            <span v-else aria-label="下一页">
              <span v-if="buttonType === 'text'">下一页</span>
            <VamisIcon v-else name="page-next" width="12" height="12" />
            </span>
          </li>
        </ul>
        <div v-else-if="widget === 'go' && !mobileUI" data-pagination="go">
          <span data-pagination="go-left">{{ env.translate('Pagination.goto') }}</span>
          <input
            :disabled="locked"
            :value="goInput"
            @input="onGoInput"
            @keyup="onGoKey"
            @focus="($event.target as HTMLInputElement).select()"
          />
          <span data-pagination="go-btn" @click="onGo">{{ env.translate('Pagination.go') }}</span>
        </div>
      </template>
    </template>
  </div>
</template>
