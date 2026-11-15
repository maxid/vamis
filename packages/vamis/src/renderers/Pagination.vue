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
import { useForm } from '../formContext'

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
const form = useForm()

function resolvedNum(value: unknown, fallback: number): number {
  return paginationNum(resolveValue(value, data.value), fallback) ?? fallback
}

const mode = computed(() => paginationMode(props.schema))
const size = computed(() => paginationSize(props.schema))
const layout = computed(() => paginationLayout(props.schema))
const locked = computed(() => isDisabled(props.schema, data.value))
const hasNext = computed(() => Boolean(props.schema.hasNext))

const page = ref(1)
const perPage = ref(10)
const goInput = ref('')

function syncFromSchema() {
  const named = props.schema.name ? form?.getValue(props.schema.name) : undefined
  page.value = paginationNum(named, resolvedNum(props.schema.activePage ?? props.schema.value, paginationActivePage(props.schema))) ?? 1
  perPage.value = resolvedNum(props.schema.perPage, paginationPerPage(props.schema))
}

watch(() => [props.schema, data.value] as const, syncFromSchema, { immediate: true, deep: true })

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
  if (props.schema.name) form?.setValue(props.schema.name, next)
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
  void emitChange(n)
}

function onGoKey(e: KeyboardEvent) {
  if (e.key !== 'Enter') return
  onGo()
}

function onPerPage(e: Event) {
  const n = paginationNum((e.target as HTMLSelectElement).value, perPage.value) ?? 10
  void emitChange(1, n)
}
</script>

<template>
  <div
    data-vamis-pagination
    :data-mode="mode"
    :data-size="size"
    :class="{ disabled: locked }"
  >
    <template v-if="mode === 'simple'">
      <ul data-pagination="pager">
        <li data-pager="prev" :class="{ 'is-disabled': page < 2 }" @click="onPrev">
          <span aria-label="上一页">
            <VamisIcon name="page-prev" width="12" height="12" />
          </span>
        </li>
        <li data-pager="simple">
          <span>{{ page }}</span>
        </li>
        <li
          data-pager="next"
          :class="{ 'is-disabled': page >= lastPage && !hasNext }"
          @click="onNext"
        >
          <span aria-label="下一页">
            <VamisIcon name="page-next" width="12" height="12" />
          </span>
        </li>
      </ul>
    </template>
    <template v-else>
      <template v-for="widget in layout" :key="widget">
        <div v-if="widget === 'total' && totalText" data-pagination="total">{{ totalText }}</div>
        <select
          v-else-if="widget === 'perpage'"
          data-pagination="perpage"
          :disabled="locked"
          :value="perPage"
          @change="onPerPage"
        >
          <option v-for="n in perPageOptions" :key="n" :value="n">{{ n }}条/页</option>
        </select>
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
              item.kind === 'prev'
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
            <span v-else-if="item.kind === 'prev'" aria-label="上一页">
              <VamisIcon name="page-prev" width="12" height="12" />
            </span>
            <span v-else aria-label="下一页">
              <VamisIcon name="page-next" width="12" height="12" />
            </span>
          </li>
        </ul>
        <div v-else-if="widget === 'go'" data-pagination="go">
          <span data-pagination="go-left">跳转至</span>
          <input
            :disabled="locked"
            :value="goInput"
            @input="goInput = ($event.target as HTMLInputElement).value"
            @keyup="onGoKey"
            @focus="($event.target as HTMLInputElement).select()"
          />
          <span data-pagination="go-btn" @click="onGo">前往</span>
        </div>
      </template>
    </template>
  </div>
</template>
