<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import {
  audioAutoPlay,
  audioFormatTime,
  audioHasControl,
  audioInline,
  audioLoop,
  audioRateLabel,
  audioRates,
  audioSrc,
  useData,
  type SchemaObject,
} from '@vamis/core'
import { PauseIcon, PlayIcon, Volume2Icon, VolumeXIcon } from '@vamis/ui'

const props = defineProps<{
  schema: SchemaObject
  data?: Record<string, unknown>
}>()
const parentData = useData()
const src = computed(() => audioSrc(props.schema, parentData.value))
const inline = computed(() => audioInline(props.schema))
const loop = computed(() => audioLoop(props.schema))
const autoPlay = computed(() => audioAutoPlay(props.schema))
const rates = computed(() => audioRates(props.schema))
const showRates = computed(() => audioHasControl(props.schema, 'rates') && rates.value.length > 0)
const showPlay = computed(() => audioHasControl(props.schema, 'play'))
const showTime = computed(() => audioHasControl(props.schema, 'time'))
const showProcess = computed(() => audioHasControl(props.schema, 'process'))
const showVolume = computed(() => audioHasControl(props.schema, 'volume'))

const el = ref<HTMLAudioElement | null>(null)
const playing = ref(false)
const muted = ref(false)
const played = ref(0)
const duration = ref(0)
const volume = ref(0.8)
const rate = ref(1)
const pickRate = ref(false)
const pickVolume = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined

function tick() {
  clearTimeout(timer)
  const audio = el.value
  if (audio && src.value) {
    duration.value = Number.isFinite(audio.duration) ? audio.duration : 0
    const current = audio.currentTime || 0
    played.value = duration.value ? current / duration.value : 0
    if (played.value >= 1 && !loop.value) playing.value = false
  }
  timer = setTimeout(tick, 1000 / rate.value)
}

onMounted(() => {
  if (autoPlay.value && src.value) {
    playing.value = true
    void el.value?.play()
  }
  tick()
})
onBeforeUnmount(() => clearTimeout(timer))

const currentLabel = computed(() => audioFormatTime(duration.value * played.value))
const durationLabel = computed(() => audioFormatTime(duration.value))

function togglePlay() {
  const audio = el.value
  if (!audio || !src.value) return
  if (playing.value) audio.pause()
  else void audio.play()
  playing.value = !playing.value
}

function setRate(value: number) {
  rate.value = value
  if (el.value) el.value.playbackRate = value
  pickRate.value = false
}

function seek(event: Event) {
  const audio = el.value
  if (!audio || !src.value) return
  const value = Number((event.target as HTMLInputElement).value)
  played.value = value
  audio.currentTime = duration.value * value
}

function setVolume(event: Event) {
  const audio = el.value
  if (!audio || !src.value) return
  const value = Number((event.target as HTMLInputElement).value)
  volume.value = value
  audio.volume = value
  muted.value = value === 0
}

function toggleMute() {
  const audio = el.value
  if (!audio || !src.value) return
  muted.value = !muted.value
  audio.muted = muted.value
}
</script>

<template>
  <div
    data-vamis-audio
    class="relative items-center gap-2 text-sm"
    :class="inline ? 'inline-flex' : 'flex w-full'"
  >
    <audio
      ref="el"
      class="pointer-events-none absolute h-0 w-0 overflow-hidden opacity-0"
      :src="src || undefined"
      :loop="loop"
      :autoplay="autoPlay"
      preload="metadata"
    />
    <button
      v-if="showRates"
      type="button"
      class="min-w-10 rounded px-1 py-0.5 text-xs"
      @click="src ? (pickRate = !pickRate) : undefined"
    >
      <span v-if="!pickRate">{{ audioRateLabel(rate) }}</span>
      <span v-else class="flex gap-1">
        <span v-for="item in rates" :key="item" class="cursor-pointer" @click.stop="setRate(item)">{{
          audioRateLabel(item)
        }}</span>
      </span>
    </button>
    <button v-if="showPlay" type="button" class="inline-flex size-7 items-center justify-center" @click="togglePlay">
      <PauseIcon v-if="playing" class="size-4" />
      <PlayIcon v-else class="size-4" />
    </button>
    <span v-if="showTime" class="tabular-nums text-muted-foreground">{{ currentLabel }} / {{ durationLabel }}</span>
    <input
      v-if="showProcess"
      type="range"
      min="0"
      max="1"
      step="any"
      class="h-1 min-w-16 flex-1 accent-primary"
      :value="played"
      @change="seek"
    />
    <button
      v-if="showVolume"
      type="button"
      class="inline-flex size-7 items-center justify-center"
      @mouseenter="src ? (pickVolume = true) : undefined"
      @mouseleave="pickVolume = false"
      @click="toggleMute"
    >
      <VolumeXIcon v-if="muted || volume === 0" class="size-4" />
      <Volume2Icon v-else class="size-4" />
      <input
        v-if="pickVolume"
        type="range"
        min="0"
        max="1"
        step="any"
        class="ml-1 h-1 w-16 accent-primary"
        :value="volume"
        @click.stop
        @change="setVolume"
      />
    </button>
  </div>
</template>
