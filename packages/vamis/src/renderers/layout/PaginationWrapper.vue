<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  SchemaRenderer,
  asArray,
  paginationWrapperInputName,
  paginationWrapperItems,
  paginationWrapperLastPage,
  paginationWrapperLocals,
  paginationWrapperOutputName,
  paginationWrapperPagerSchema,
  paginationWrapperPerPage,
  paginationWrapperPosition,
  paginationWrapperSlice,
  useData,
  type SchemaObject,
} from '@vamis/core'
import Pagination from '../Pagination.vue'

const props = defineProps<{ schema: SchemaObject }>()
const data = useData()
const page = ref(1)
const perPage = ref(paginationWrapperPerPage(props.schema))

watch(
  () => paginationWrapperPerPage(props.schema),
  (value) => {
    perPage.value = value
  },
)

const inputName = computed(() => paginationWrapperInputName(props.schema))
const outputName = computed(() => paginationWrapperOutputName(props.schema))
const position = computed(() => paginationWrapperPosition(props.schema))
const body = computed(() => asArray(props.schema.body))
const source = computed(() => paginationWrapperItems(data.value, inputName.value))
const lastPage = computed(() => paginationWrapperLastPage(source.value.length, perPage.value))
const sliced = computed(() => paginationWrapperSlice(source.value, page.value, perPage.value))
const extraData = computed(() =>
  paginationWrapperLocals({
    page: page.value,
    lastPage: lastPage.value,
    outputName: outputName.value,
    items: sliced.value,
  }),
)
const pagerSchema = computed(() =>
  paginationWrapperPagerSchema(props.schema, {
    page: page.value,
    lastPage: lastPage.value,
    perPage: perPage.value,
  }),
)

watch(lastPage, (value) => {
  if (value > 0 && page.value > value) page.value = value
})

function onPageChange(next: number, nextPerPage?: number) {
  page.value = next
  if (typeof nextPerPage === 'number' && nextPerPage > 0) perPage.value = nextPerPage
}
</script>

<template>
  <div data-vamis-pagination-wrapper>
    <div v-if="position === 'top'" data-vamis-pagination-wrapper-pager>
      <Pagination :schema="pagerSchema" @page-change="onPageChange" />
    </div>
    <template v-if="body.length">
      <SchemaRenderer v-for="(node, i) in body" :key="i" :schema="node" :extra-data="extraData" />
    </template>
    <span v-else>请配置内容</span>
    <div v-if="position === 'bottom'" data-vamis-pagination-wrapper-pager>
      <Pagination :schema="pagerSchema" @page-change="onPageChange" />
    </div>
  </div>
</template>

<style scoped>
[data-vamis-pagination-wrapper-pager] {
  text-align: right;
}
[data-vamis-pagination-wrapper-pager]:first-child {
  margin-bottom: var(--gap-sm, 8px);
}
</style>
