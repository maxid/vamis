<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import {
  createObject,
  createVamisEvent,
  dataMapping,
  eventEvalData,
  fileAcceptOf,
  fileChunkSize,
  fileConcurrency,
  fileEventSnapshot,
  fileFieldName,
  fileGuid,
  fileItemName,
  fileItemUrl,
  fileJoinValues,
  fileMatchesAccept,
  fileShouldChunk,
  filesToFormValue,
  filterTpl,
  interpolateFileMsg,
  nativeFilesFromList,
  parseFileValue,
  prettyBytes,
  requestApi,
  runOnEvent,
  useData,
  useEnv,
  useFormApi,
  useOverlay,
  useScope,
  useScoped,
  type FileItem,
  type SchemaApi,
  type SchemaObject,
} from '@vamis/core'
import { Button, VamisClose } from '@vamis/ui'
import { useForm } from '../../formContext'
import FormItem from '../FormItem.vue'

const props = defineProps<{ schema: SchemaObject; disabled?: boolean }>()

const form = useForm()
const env = useEnv()
const scoped = useScoped()
const scope = useScope()
const overlay = useOverlay()
const formApi = useFormApi()
const viewData = useData()

const inputEl = ref<HTMLInputElement | null>(null)
const files = ref<FileItem[]>([])
const uploading = ref(false)
const dragging = ref(false)
const error = ref('')
const emitValue = ref<unknown>(undefined)
let currentId: string | null = null
let tickQueued = false
const pristine = ref<unknown>(undefined)

const name = computed(() => (props.schema.name ? String(props.schema.name) : ''))
const multiple = computed(() => props.schema.multiple === true)
const autoUpload = computed(() => props.schema.autoUpload !== false)
const hideUploadButton = computed(() => props.schema.hideUploadButton === true)
const drag = computed(() => props.schema.drag === true)
const asBase64 = computed(() => props.schema.asBase64 === true)
const asBlob = computed(() => props.schema.asBlob === true)
const accept = computed(() => fileAcceptOf(props.schema))
const maxSize = computed(() => {
  const n = Number(props.schema.maxSize)
  return Number.isFinite(n) && n > 0 ? n : 0
})
const maxLength = computed(() => {
  const n = Number(props.schema.maxLength)
  return Number.isFinite(n) && n > 0 ? n : 0
})
const receiver = computed(() => (props.schema.receiver == null ? '/api/upload/file' : (props.schema.receiver as SchemaApi)))
const startChunkApi = computed(() => (props.schema.startChunkApi == null ? '/api/upload/startChunk' : (props.schema.startChunkApi as SchemaApi)))
const chunkApi = computed(() => (props.schema.chunkApi == null ? '/api/upload/chunk' : (props.schema.chunkApi as SchemaApi)))
const finishChunkApi = computed(() => (props.schema.finishChunkApi == null ? '/api/upload/finishChunk' : (props.schema.finishChunkApi as SchemaApi)))
const btnLabel = computed(() => {
  const raw = props.schema.btnLabel
  if (raw != null && raw !== '') return filterTpl(String(raw), viewData.value)
  if (!multiple.value && files.value.length) return '重新选择'
  if (multiple.value && files.value.length) return '继续添加'
  return '文件上传'
})
const selectDisabled = computed(
  () =>
    props.disabled ||
    (multiple.value && !!maxLength.value && files.value.length >= maxLength.value),
)
const hasPending = computed(() => files.value.some((item) => item.state === 'pending'))
const failedCount = computed(() => files.value.filter((item) => item.state === 'error').length)
const uploadedCount = computed(() => files.value.filter((item) => item.state === 'uploaded').length)
const downloadUrl = computed(() => props.schema.downloadUrl)
const templateUrl = computed(() => props.schema.templateUrl)
const documentation = computed(() =>
  props.schema.documentation != null ? String(props.schema.documentation) : '帮助文档',
)
const initAutoFill = computed(() => props.schema.initAutoFill !== false)
const nameField = computed(() => fileFieldName(props.schema, 'name'))
const valueField = computed(() => fileFieldName(props.schema, 'value'))
const fileField = computed(() => fileFieldName(props.schema, 'file'))

function currentFormValue(): unknown {
  return name.value ? form?.getValue(name.value) : props.schema.value
}

function hydrate(raw: unknown, prev = files.value) {
  files.value = parseFileValue(raw, props.schema, prev)
  emitValue.value = raw == null ? '' : raw
}

function formValueOf(list = files.value): unknown {
  return filesToFormValue(list, props.schema)
}

async function emitEvent(eventName: string, extra: Record<string, unknown> = {}): Promise<boolean> {
  const value = formValueOf()
  const fileKey = name.value || 'file'
  const payload = {
    ...viewData.value,
    ...extra,
    value,
    [fileKey]: value,
    file: extra.file ?? (multiple.value ? files.value.map(fileEventSnapshot) : fileEventSnapshot(files.value[0] || {})),
  }
  const event = createVamisEvent(eventName, payload)
  await runOnEvent(props.schema, eventName, {
    env,
    data: eventEvalData(payload, event),
    scoped,
    overlay,
    form: formApi,
    scope: scope.value,
    event,
  })
  return !event.prevented
}

function syncAutoFill() {
  const autoFill = props.schema.autoFill
  if (!autoFill || typeof autoFill !== 'object' || Array.isArray(autoFill)) return
  if (Object.prototype.hasOwnProperty.call(autoFill, 'api')) return
  const mapping = { ...(autoFill as Record<string, unknown>) }
  if (name.value) delete mapping[name.value]
  if (!Object.keys(mapping).length) return
  const kept = files.value.filter((item) => item.state === 'uploaded' || item.state === 'init' || item.state === 'ready')
  const ctx = createObject(viewData.value, multiple.value ? { items: kept } : kept[0] || {})
  const toSync = dataMapping(mapping, ctx) as Record<string, unknown>
  for (const [key, val] of Object.entries(toSync)) {
    form?.setValue(key, val)
  }
}

async function commitChange() {
  const next = formValueOf()
  if (!(await emitEvent('change'))) return
  emitValue.value = next
  if (name.value) form?.setValue(name.value, next)
  syncAutoFill()
}

function sizeLimitTip(file?: FileItem | File) {
  const tpl = String(props.schema.invalidSizeMessage || '文件大小不超过 {{maxSize}}')
  const size = file && 'size' in file ? Number(file.size) || 0 : 0
  return interpolateFileMsg(tpl, {
    filename: file && 'name' in file ? String((file as FileItem).name || (file as File).name || '') : '',
    actualSize: prettyBytes(size),
    maxSize: prettyBytes(maxSize.value),
  })
}

function rejectTypeAlert(rejected: File[]) {
  const tpl = String(props.schema.invalidTypeMessage || '{{files}} 不符合类型的 {{accept}} 的设定，请仔细检查')
  env.alert(
    interpolateFileMsg(tpl, {
      files: rejected.map((item) => `「${item.name}」`).join(' '),
      accept: accept.value,
    }),
  )
}

function addFiles(picked: File[]) {
  if (!picked.length || props.disabled) return
  const allowed = multiple.value && maxLength.value ? Math.max(0, maxLength.value - files.value.length) : picked.length
  const accepted: File[] = []
  const rejected: File[] = []
  for (const file of picked.slice(0, allowed)) {
    if (accept.value && !fileMatchesAccept(file, accept.value)) rejected.push(file)
    else accepted.push(file)
  }
  if (rejected.length) rejectTypeAlert(rejected)
  if (!accepted.length) return
  const incoming: FileItem[] = accepted.map((file) => {
    const oversize = maxSize.value > 0 && file.size > maxSize.value
    return {
      id: fileGuid(),
      name: file.name,
      [nameField.value]: file.name,
      filename: file.name,
      size: file.size,
      state: oversize ? 'invalid' : 'pending',
      error: oversize ? sizeLimitTip(file) : undefined,
      progress: 0,
      file,
    }
  })
  files.value = multiple.value ? files.value.concat(incoming) : incoming
  error.value = ''
  if (autoUpload.value) void startUpload()
}

function onNativeChange(event: Event) {
  const el = event.target as HTMLInputElement
  addFiles(nativeFilesFromList(el.files))
  el.value = ''
}

function openPicker() {
  if (selectDisabled.value) return
  inputEl.value?.click()
}

function onDrop(event: DragEvent) {
  event.preventDefault()
  dragging.value = false
  if (selectDisabled.value) return
  addFiles(nativeFilesFromList(event.dataTransfer?.files))
}

async function removeFile(index: number) {
  const item = files.value[index]
  if (!item) return
  if (
    !(await emitEvent('remove', {
      ...item,
      item,
      path: fileItemName(item, props.schema),
    }))
  ) {
    return
  }
  if (currentId === item.id) currentId = null
  files.value = files.value.filter((_, i) => i !== index)
  if (uploading.value && !currentId) queueTick()
  else await commitChange()
}

async function clearFiles() {
  files.value = []
  currentId = null
  uploading.value = false
  emitValue.value = ''
  if (name.value) form?.setValue(name.value, '')
}

function readAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error(reader.error?.message || '文件读取失败'))
    reader.readAsDataURL(file)
  })
}

function asPostApi(api: SchemaApi, data: Record<string, unknown>, dataType?: 'json' | 'form-data'): SchemaApi {
  if (typeof api === 'string') return { url: api, method: 'post', data, dataType }
  const extra = api.data && typeof api.data === 'object' && !Array.isArray(api.data) ? (api.data as Record<string, unknown>) : {}
  return { method: 'post', dataType, ...api, data: { ...extra, ...data } }
}

async function uploadFile(file: File): Promise<Record<string, unknown>> {
  const result = await requestApi(
    asPostApi(receiver.value, { [fileField.value]: file }, 'form-data'),
    { env, data: viewData.value, reason: 'action' },
    { defaultMethod: 'post' },
  )
  if (!result.ok || result.data == null) {
    throw new Error(result.payload.msg || '文件上传失败，请重试')
  }
  return (result.data && typeof result.data === 'object' ? result.data : { value: result.data }) as Record<string, unknown>
}

async function uploadBigFile(file: File, onProgress: (n: number) => void): Promise<Record<string, unknown>> {
  const chunkSize = fileChunkSize(props.schema)
  const concurrency = fileConcurrency(props.schema)
  const start = await requestApi(
    startChunkApi.value,
    {
      env,
      data: { ...viewData.value, filename: file.name, [nameField.value]: file.name },
      reason: 'action',
    },
    { defaultMethod: 'post', autoAppend: true },
  )
  if (!start.ok || !start.data) throw new Error(start.payload.msg || '接口返回错误，请仔细检查')
  const uploadId = String((start.data as { uploadId?: unknown }).uploadId || '')
  const key = String((start.data as { key?: unknown }).key || '')
  onProgress(0.2)
  const tasks: { partNumber: number; start: number; stop: number; partSize: number }[] = []
  let left = file.size
  let offset = 0
  let partNumber = 1
  while (left > 0) {
    const partSize = Math.min(left, chunkSize)
    tasks.push({ partNumber, start: offset, stop: offset + partSize - 1, partSize })
    left -= partSize
    offset += partSize
    partNumber += 1
  }
  const partList: { partNumber: number; eTag: string }[] = []
  const progressArr = tasks.map(() => 0)
  const bump = () => {
    const avg = progressArr.reduce((sum, n) => sum + n, 0) / (progressArr.length || 1)
    onProgress(0.2 + 0.7 * avg)
  }
  let cursor = 0
  async function runOne(task: (typeof tasks)[number]) {
    const blob = file.slice(task.start, task.stop + 1)
    const part = new File([blob], file.name, { type: file.type })
    const result = await requestApi(
      asPostApi(
        chunkApi.value,
        {
          key,
          uploadId,
          partNumber: String(task.partNumber),
          partSize: String(task.partSize),
          [fileField.value]: part,
        },
        'form-data',
      ),
      { env, data: viewData.value, reason: 'action' },
      { defaultMethod: 'post' },
    )
    if (!result.ok) throw new Error(result.payload.msg || '文件上传失败，请重试')
    progressArr[task.partNumber - 1] = 1
    bump()
    partList.push({
      partNumber: task.partNumber,
      eTag: String((result.data as { eTag?: unknown } | undefined)?.eTag || ''),
    })
  }
  const workers: Promise<void>[] = []
  const launch = async () => {
    while (cursor < tasks.length) {
      const task = tasks[cursor]
      cursor += 1
      await runOne(task)
    }
  }
  for (let i = 0; i < Math.min(concurrency, tasks.length); i++) workers.push(launch())
  await Promise.all(workers)
  onProgress(0.9)
  const finish = await requestApi(
    finishChunkApi.value,
    {
      env,
      data: {
        ...viewData.value,
        filename: file.name,
        [nameField.value]: file.name,
        key,
        uploadId,
        partList,
      },
      reason: 'action',
    },
    { defaultMethod: 'post', autoAppend: true },
  )
  if (!finish.ok || finish.data == null) throw new Error(finish.payload.msg || '文件上传失败，请重试')
  return (finish.data && typeof finish.data === 'object' ? finish.data : { value: finish.data }) as Record<string, unknown>
}

async function sendFile(item: FileItem): Promise<FileItem> {
  const raw = item.file
  if (!raw) throw new Error('文件上传失败，请重试')
  if (asBase64.value) {
    const encoded = await readAsBase64(raw)
    return {
      ...item,
      state: 'ready',
      [valueField.value]: encoded,
      value: encoded,
      [nameField.value]: raw.name,
      name: raw.name,
    }
  }
  if (asBlob.value) {
    return {
      ...item,
      state: 'ready',
      [valueField.value]: raw,
      value: raw,
      [nameField.value]: raw.name,
      name: raw.name,
    }
  }
  const onProgress = (n: number) => {
    const idx = files.value.findIndex((row) => row.id === item.id)
    if (idx < 0) return
    const next = files.value.slice()
    next[idx] = { ...next[idx], progress: n }
    files.value = next
  }
  const ret = fileShouldChunk(raw.size, props.schema) ? await uploadBigFile(raw, onProgress) : await uploadFile(raw)
  onProgress(1)
  const value = ret.value ?? ret.url ?? ret
  const next: FileItem = {
    ...item,
    ...ret,
    value,
    state: 'uploaded',
    id: item.id,
    [valueField.value]: value,
    [nameField.value]: ret[nameField.value] ?? item.name ?? raw.name,
    name: String(ret[nameField.value] ?? item.name ?? raw.name),
    progress: 1,
  }
  if (
    !(await emitEvent('success', {
      ...next,
      item: next,
      result: ret,
      value,
      path: next.name,
    }))
  ) {
    throw new Error('prevented')
  }
  return next
}

function queueTick() {
  if (tickQueued) return
  tickQueued = true
  void nextTick(() => {
    tickQueued = false
    void tick()
  })
}

async function tick() {
  if (currentId || !uploading.value) return
  const pending = files.value.find((item) => item.state === 'pending')
  if (!pending) {
    uploading.value = false
    await commitChange()
    return
  }
  currentId = pending.id
  const idx = files.value.findIndex((item) => item.id === pending.id)
  if (idx >= 0) {
    const next = files.value.slice()
    next[idx] = { ...next[idx], state: 'uploading', progress: 0 }
    files.value = next
  }
  try {
    const uploaded = await sendFile(pending)
    const at = files.value.findIndex((item) => item.id === pending.id)
    if (at >= 0) {
      const next = files.value.slice()
      next[at] = uploaded
      files.value = next
    }
    error.value = ''
  } catch (err) {
    if ((err as Error).message === 'prevented') {
      currentId = null
      queueTick()
      return
    }
    const message = err instanceof Error ? err.message : '文件上传失败，请重试'
    const failItem = { ...pending, state: 'error' as const, error: message }
    await emitEvent('fail', { item: failItem, error: err, path: failItem.name })
    const at = files.value.findIndex((item) => item.id === pending.id)
    if (at >= 0) {
      const next = files.value.slice()
      next[at] = failItem
      files.value = next
    }
    error.value = message
  }
  currentId = null
  queueTick()
}

async function startUpload(retry = false) {
  if (uploading.value) return
  if (retry) {
    files.value = files.value.map((item) =>
      item.state === 'error' ? { ...item, state: 'pending', progress: 0, error: undefined } : item,
    )
  }
  if (!files.value.some((item) => item.state === 'pending')) return
  uploading.value = true
  queueTick()
}

function stopUpload() {
  uploading.value = false
}

function toggleUpload() {
  if (uploading.value) stopUpload()
  else void startUpload()
}

function fileHref(item: FileItem): string | undefined {
  const url = fileItemUrl(item, props.schema)
  if (typeof downloadUrl.value === 'boolean' && !downloadUrl.value) return undefined
  if (typeof url !== 'string' || !url) return undefined
  if (typeof downloadUrl.value === 'string' && downloadUrl.value && !downloadUrl.value.includes('$')) {
    return `${downloadUrl.value}${url}`
  }
  return url
}

function onClickFile(item: FileItem, event: Event) {
  event.preventDefault()
  event.stopPropagation()
  const href = fileHref(item)
  if (href && typeof window !== 'undefined') window.open(href, '_blank', 'noopener')
}

function downloadTpl(event: Event) {
  event.preventDefault()
  event.stopPropagation()
  const api = templateUrl.value
  if (!api) return
  const url = typeof api === 'string' ? filterTpl(api, viewData.value) : filterTpl(String(api.url || ''), viewData.value)
  if (url && typeof window !== 'undefined') window.open(url, '_blank', 'noopener')
}

function setData(values: Record<string, unknown>) {
  const next = name.value && Object.prototype.hasOwnProperty.call(values, name.value) ? values[name.value] : values.value
  if (next === undefined) return
  hydrate(next)
}

async function doAction(action: { actionType?: string; value?: unknown; args?: { value?: unknown } }) {
  const type = action?.actionType
  if (type === 'clear') {
    await clearFiles()
    return
  }
  if (type === 'setValue') {
    hydrate(action.args?.value ?? action.value)
  }
}

function makeApi(apiName: string) {
  return {
    name: apiName,
    setData,
    doAction,
    getValue: () => currentFormValue(),
    getData: () => (name.value ? { value: currentFormValue(), [name.value]: currentFormValue() } : { value: currentFormValue() }),
  }
}

const scopedId = String(props.schema.id || '')
const apis = [
  scopedId ? makeApi(scopedId) : null,
  name.value && name.value !== scopedId ? makeApi(name.value) : null,
].filter(Boolean) as ReturnType<typeof makeApi>[]
for (const api of apis) scoped?.register(api)
onBeforeUnmount(() => {
  for (const api of apis) scoped?.unregister(api)
})

watch(
  () => currentFormValue(),
  (raw) => {
    if (raw === emitValue.value) return
    hydrate(raw)
  },
)

onMounted(() => {
  pristine.value = currentFormValue()
  hydrate(pristine.value)
  if (initAutoFill.value) syncAutoFill()
})
</script>

<template>
  <FormItem :schema="schema">
    <div class="vamis-file" :class="{ 'is-disabled': disabled }">
      <a
        v-if="templateUrl"
        class="vamis-file__tpl"
        href="#"
        @click="downloadTpl"
      >
        下载模板
      </a>
      <div
        class="vamis-file__dropzone"
        :class="{
          'is-empty': !files.length,
          'is-active': dragging,
          disabled: selectDisabled,
        }"
        @dragover.prevent="!selectDisabled && (dragging = true)"
        @dragleave="dragging = false"
        @drop="onDrop"
      >
        <input
          ref="inputEl"
          class="sr-only"
          type="file"
          :accept="accept"
          :capture="schema.capture != null ? String(schema.capture) : undefined"
          :disabled="disabled"
          :multiple="multiple"
          @change="onNativeChange"
          @click.stop
        >
        <div
          v-if="drag || dragging"
          class="vamis-file__tip"
          @click="openPicker"
        >
          <svg class="vamis-file__cloud" viewBox="0 0 42 31" aria-hidden="true" focusable="false">
            <path
              fill="currentColor"
              fill-rule="evenodd"
              d="m20.872 15.498 4.512 6.003h-3.012v9h-3v-9H16.38l4.49-6.003Zm0-14.999c6.47 0 11.946 4.143 14.046 9.897 3.957.945 6.918 4.491 6.918 8.733 0 4.962-4.038 9-9 9-1.044 0-2.034-.213-2.964-.546v-3.315c.738.426 1.55.732 2.445.81.174.012.342.051.519.051 3.309 0 6-2.691 6-6 0-2.262-1.272-4.212-3.126-5.235-.858-.471-1.827-.765-2.874-.765-.07 0-.132.018-.201.021-.207-1.026-.576-1.983-1.023-2.898-1.953-3.981-6.012-6.753-10.74-6.753-4.725 0-8.778 2.769-10.737 6.744-.45.915-.82 1.872-1.026 2.898L9 13.129c-1.086 0-2.094.315-2.973.822C4.228 14.986 3 16.909 3 19.129c0 3.309 2.69 6 6 6 .147 0 .285-.033.432-.045.888-.063 1.698-.357 2.439-.759v3.285c-.906.315-1.86.519-2.871.519-4.962 0-9-4.038-9-9 0-4.203 2.91-7.716 6.813-8.7C8.904 4.66 14.389.499 20.872.499Z"
            />
          </svg>
          <span>将文件拖到此处，或<span class="vamis-file__tip-click">点击上传</span></span>
          <div v-if="schema.documentLink" class="vamis-file__help">
            <a :href="String(schema.documentLink)" @click.stop>{{ documentation }}</a>
          </div>
          <div v-if="maxSize" class="vamis-file__size">{{ sizeLimitTip() }}</div>
        </div>
        <Button
          v-else
          type="button"
          variant="enhance"
          class="vamis-file__select"
          :disabled="selectDisabled"
          @click="openPicker"
        >
          <svg class="vamis-file__upload" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
            <path
              fill="currentColor"
              d="M3 10v2.995h10V10h1v4h-1v-.005H3V14H2v-4h1Zm5.026-8 3.814 3.815-.707.707-2.616-2.617V11h-1V3.923L4.89 6.548l-.707-.706L8.026 2Z"
            />
          </svg>
          <span>{{ btnLabel }}</span>
        </Button>
      </div>
      <div v-if="maxSize && !drag" class="vamis-file__size">{{ sizeLimitTip() }}</div>
      <ul v-if="files.length" class="vamis-file__list">
        <li v-for="(item, index) in files" :key="item.id">
          <div
            class="vamis-file__item"
            :class="{ 'is-invalid': item.state === 'invalid' || item.state === 'error' }"
            :title="item.state === 'invalid' || item.state === 'error' ? item.error : fileItemName(item, schema)"
          >
            <span class="vamis-file__icon">
              <svg viewBox="0 0 14 16" aria-hidden="true" focusable="false">
                <path d="M0 0v16h14V4.001L9.939 0H0Zm1 1h8v4h4v10H1V1Zm9 .464 2.575 2.537H10V1.464Z" fill="currentColor" />
                <path d="M4 12h6v-1H4zm0-3h6V8H4z" fill="currentColor" />
              </svg>
            </span>
            <a
              v-if="fileHref(item)"
              class="vamis-file__name"
              href="#"
              @click="onClickFile(item, $event)"
            >{{ fileItemName(item, schema) }}</a>
            <span v-else class="vamis-file__name">{{ fileItemName(item, schema) }}</span>
            <a
              v-if="!disabled"
              class="vamis-file__clear"
              href="#"
              data-tooltip="移除"
              data-position="left"
              @click.prevent="removeFile(index)"
            >
              <VamisClose />
            </a>
          </div>
          <div v-if="item.state === 'uploading'" class="vamis-file__progress">
            <div class="vamis-file__bar"><span :style="{ width: `${Math.round((item.progress || 0) * 100)}%` }" /></div>
            <span>{{ Math.round((item.progress || 0) * 100) }}%</span>
          </div>
        </li>
      </ul>
      <div v-if="failedCount" class="vamis-file__sum">
        已成功上传 {{ uploadedCount }} 个文件，{{ failedCount }} 个文件上传失败，
        <a href="#" @click.prevent="startUpload(true)">重试上传</a>
        失败文件
      </div>
      <Button
        v-if="!autoUpload && !hideUploadButton && files.length"
        type="button"
        variant="outline"
        class="vamis-file__upload-btn"
        :disabled="!hasPending && !uploading"
        @click="toggleUpload"
      >
        {{ uploading ? '暂停上传' : '开始上传' }}
      </Button>
    </div>
  </FormItem>
</template>
