<script setup lang="ts">
import { computed, ref } from 'vue'
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@vamis/ui'
import { resolveValue, type SchemaObject } from '@vamis/core'
import { readRaw } from './prop'

const WEEK = ['日', '一', '二', '三', '四', '五', '六']

const props = defineProps<{ schema: SchemaObject; data: Record<string, any> }>()

function parseDate(value: unknown) {
  if (value == null || value === '') return new Date()
  if (value instanceof Date) return value
  if (typeof value === 'number') return new Date(value < 1e12 ? value * 1000 : value)
  const text = String(value)
  if (/^\d+$/.test(text)) {
    const n = Number(text)
    return new Date(n < 1e12 ? n * 1000 : n)
  }
  const d = new Date(text)
  return Number.isNaN(d.getTime()) ? new Date() : d
}

const cursor = ref(parseDate(readRaw(props.schema, props.data)))
const selected = ref<string>(isoDay(cursor.value))

function isoDay(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const schedules = computed(() => {
  const raw = props.schema.schedules
  const list = typeof raw === 'string' ? resolveValue(raw, props.data) : raw
  return Array.isArray(list) ? list : []
})

const cells = computed(() => {
  const year = cursor.value.getFullYear()
  const month = cursor.value.getMonth()
  const first = new Date(year, month, 1)
  const start = first.getDay()
  const days = new Date(year, month + 1, 0).getDate()
  const today = isoDay(new Date())
  const out: { day: number | null; iso: string; today: boolean; count: number }[] = []
  for (let i = 0; i < start; i++) out.push({ day: null, iso: '', today: false, count: 0 })
  for (let day = 1; day <= days; day++) {
    const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    out.push({ day, iso, today: iso === today, count: eventsOn(iso).length })
  }
  while (out.length % 7) out.push({ day: null, iso: '', today: false, count: 0 })
  return out
})

function eventsOn(iso: string) {
  return schedules.value.filter((item: any) => {
    const start = isoDay(parseDate(item.startTime))
    const end = isoDay(parseDate(item.endTime || item.startTime))
    return iso >= start && iso <= end
  })
}

const dayEvents = computed(() => eventsOn(selected.value))
const title = computed(() => `${cursor.value.getFullYear()} 年 ${cursor.value.getMonth() + 1} 月`)
const large = computed(() => props.schema.largeMode === true)

function shift(delta: number) {
  const next = new Date(cursor.value)
  next.setMonth(next.getMonth() + delta)
  cursor.value = next
}
</script>

<template>
  <Card data-slot="calendar" class="py-4">
    <CardHeader class="px-4">
      <div class="flex items-center justify-between gap-2">
        <Button size="sm" variant="outline" @click="shift(-1)">上一月</Button>
        <CardTitle class="text-base">{{ title }}</CardTitle>
        <Button size="sm" variant="outline" @click="shift(1)">下一月</Button>
      </div>
    </CardHeader>
    <CardContent class="px-4">
      <div class="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
        <div v-for="w in WEEK" :key="w" class="py-1">{{ w }}</div>
      </div>
      <div class="grid grid-cols-7 gap-1">
        <button
          v-for="(cell, i) in cells"
          :key="i"
          type="button"
          class="rounded-md border text-sm"
          :class="[
            large ? 'min-h-16 p-2' : 'min-h-10 p-1',
            cell.day ? 'bg-background hover:bg-accent' : 'border-transparent',
            cell.iso === selected ? 'border-primary bg-accent' : '',
            cell.today ? 'font-semibold text-primary' : '',
          ]"
          :style="cell.today ? schema.todayActiveStyle : undefined"
          :disabled="!cell.day"
          @click="cell.iso && (selected = cell.iso)"
        >
          <span v-if="cell.day">{{ cell.day }}</span>
          <span v-if="cell.count" class="mt-1 block h-1.5 w-1.5 rounded-full bg-primary mx-auto" />
        </button>
      </div>
      <div v-if="dayEvents.length" class="mt-3 space-y-2">
        <p class="text-xs text-muted-foreground">{{ selected }} 日程</p>
        <div v-for="(item, i) in dayEvents" :key="i" class="flex items-start gap-2 text-sm">
          <Badge variant="secondary">日程</Badge>
          <span>{{ item.content }}</span>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
