<template>
  <div class="min-w-0 space-y-3">
    <div class="grid grid-cols-2 gap-1 rounded-xl bg-black/5 p-1 dark:bg-white/5">
      <button v-for="mode in modes" :key="mode" type="button"
        class="app-choice-tab min-w-0 rounded-lg px-2 py-2.5 text-sm font-semibold transition-colors"
        :class="tab === mode ? 'bg-white text-black shadow-sm dark:bg-black dark:text-white' : 'text-black/60 hover:text-black dark:text-white/60 dark:hover:text-white'"
        :aria-pressed="tab === mode" :disabled="busy" @click="tab = mode">
        <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><template v-if="mode === 'preset'"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></template><template v-else><path d="M12 16V3m-5 5 5-5 5 5M4 15v5h16v-5"/></template></svg>
        <span>{{ t(mode === 'preset' ? 'categories.presetIcons' : 'categories.localIcon') }}</span>
      </button>
    </div>
    <div v-if="tab === 'preset'" class="space-y-2.5">
      <div class="relative">
        <svg class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/40 dark:text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m16 16 4 4"/></svg>
        <input v-model="searchQuery" type="search" :placeholder="t('categories.searchIcons')" :aria-label="t('categories.searchIcons')" class="w-full rounded-xl border border-black/10 bg-white py-2.5 pl-9 pr-3 text-sm text-black outline-none focus:ring-2 focus:ring-primary-500/30 dark:border-white/10 dark:bg-white/5 dark:text-white" />
      </div>
      <div class="grid max-h-48 grid-cols-5 gap-1.5 overflow-y-auto overscroll-contain p-0.5 scrollbar-custom xs:grid-cols-6 sm:grid-cols-8">
        <button v-for="icon in filteredIcons" :key="icon" type="button" :aria-label="icon" :title="icon" :aria-pressed="modelValue === icon" :disabled="busy"
          class="relative flex aspect-square min-h-10 min-w-0 items-center justify-center rounded-xl border transition-colors focus-visible:ring-2 focus-visible:ring-primary-500 disabled:opacity-50"
          :class="modelValue === icon ? 'border-primary-500 bg-primary-50 text-primary-600 dark:border-primary-400 dark:bg-primary-900/30 dark:text-primary-400' : 'border-black/10 text-black/60 hover:bg-black/5 dark:border-white/10 dark:text-white/70 dark:hover:bg-white/10'"
          @click="selectIcon(icon)">
          <component :is="getIconComponent(icon)" class="h-5 w-5" :color="modelValue === icon ? selectedColor : undefined" />
          <span v-if="modelValue === icon" class="absolute right-0.5 top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary-500 text-white"><svg class="h-2.5 w-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" aria-hidden="true"><path d="m5 12 4 4 10-10"/></svg></span>
        </button>
      </div>
      <p v-if="!filteredIcons.length" class="py-4 text-center text-xs text-black/50 dark:text-white/50">{{ t('categories.noIcons') }}</p>
    </div>
    <div v-else class="space-y-3" @paste="handlePaste">
      <div class="grid grid-cols-3 gap-1.5" role="group" :aria-label="t('categories.iconSource')">
        <button v-for="source in sources" :key="source.key" type="button" :disabled="busy" :aria-pressed="activeSource === source.key"
          class="flex min-h-[68px] min-w-0 flex-col items-center justify-center gap-1.5 rounded-xl border px-1.5 py-2 text-center transition-colors focus-visible:ring-2 focus-visible:ring-primary-500 disabled:opacity-50"
          :class="activeSource === source.key ? 'border-primary-500 bg-primary-50 text-primary-600 dark:border-primary-400 dark:bg-primary-900/30 dark:text-primary-400' : 'border-black/10 bg-white text-black/60 hover:bg-black/5 dark:border-white/10 dark:bg-white/5 dark:text-white/70 dark:hover:bg-white/10'"
          @click="changeSource(source.key)">
          <svg class="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path :d="source.path" />
          </svg>
          <span class="break-words text-xs font-semibold leading-4">{{ t(source.label) }}</span>
        </button>
      </div>

      <div v-if="activeSource === 'file'" class="space-y-2">
        <input ref="fileInput" type="file" accept="image/png,image/jpeg,image/webp,image/x-icon,image/vnd.microsoft.icon" class="hidden" @change="chooseFile" />
        <button type="button" :disabled="busy" class="flex min-h-24 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-black/15 bg-white px-3 py-4 text-center transition hover:border-primary-400 hover:bg-primary-50/50 disabled:opacity-50 dark:border-white/20 dark:bg-white/5 dark:hover:border-primary-400 dark:hover:bg-white/10" @click="fileInput?.click()">
          <svg class="h-6 w-6 text-primary-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 16V4m-5 5 5-5 5 5M4 16v4h16v-4"/></svg>
          <span class="text-sm font-semibold text-black dark:text-white">{{ t('categories.uploadIcon') }}</span>
          <span class="text-xs text-black/50 dark:text-white/50">PNG / JPG / WebP / ICO - 2 MB</span>
          <span class="text-xs font-medium text-primary-600 dark:text-primary-400">{{ t('categories.iconQualityHint') }}</span>
        </button>
      </div>

      <div v-else-if="activeSource === 'url'" class="space-y-2 rounded-xl border border-black/10 bg-black/[0.02] p-3 dark:border-white/10 dark:bg-white/5">
        <label :for="urlId" class="block text-xs font-semibold text-black/70 dark:text-white/70">{{ t('categories.imageUrl') }}</label>
        <div class="flex min-w-0 flex-col gap-2 sm:flex-row">
          <input :id="urlId" v-model.trim="urlDraft" type="text" inputmode="url" autocomplete="off" spellcheck="false" :disabled="busy" placeholder="https://.../icon.png"
            class="min-h-10 min-w-0 flex-1 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-black outline-none focus:ring-2 focus:ring-primary-500/30 dark:border-white/10 dark:bg-black dark:text-white"
            @keydown.enter.prevent="loadFromUrl" />
          <button type="button" :disabled="busy || !urlDraft" class="min-h-10 shrink-0 rounded-lg bg-primary-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50" @click="loadFromUrl">{{ t('categories.loadIconUrl') }}</button>
        </div>
        <p class="text-xs leading-5 text-black/50 dark:text-white/50">{{ t('categories.imageUrlHint') }}</p>
      </div>

      <div v-else class="space-y-2">
        <button type="button" :disabled="busy" data-icon-paste
          class="flex min-h-24 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-black/15 bg-white px-3 py-4 text-center transition hover:border-primary-400 hover:bg-primary-50/50 focus-visible:ring-2 focus-visible:ring-primary-500 disabled:opacity-50 dark:border-white/20 dark:bg-white/5 dark:hover:border-primary-400 dark:hover:bg-white/10"
          @click="readClipboard">
          <svg class="h-6 w-6 text-primary-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14H4V6a2 2 0 0 1 2-2h2m4 5v7m-3-3 3 3 3-3"/></svg>
          <span class="text-sm font-semibold text-black dark:text-white">{{ t('categories.pasteIcon') }}</span>
          <span class="text-xs leading-5 text-black/50 dark:text-white/50">{{ t('categories.clipboardHint') }}</span>
        </button>
      </div>

      <div v-if="busy" role="status" class="flex items-center gap-2 rounded-xl bg-primary-50 px-3 py-2.5 text-xs font-medium text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
        <span class="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true"></span>
        {{ t('categories.processingIcon') }}
      </div>
      <div v-if="isCustom" class="flex items-center gap-3 rounded-xl border border-black/10 p-2.5 dark:border-white/10">
        <component :is="getIconComponent(modelValue)" class="h-9 w-9 shrink-0" />
        <span class="min-w-0 flex-1 break-words text-xs font-medium text-black/70 dark:text-white/70">{{ t('categories.customIconSelected') }}</span>
        <button type="button" :disabled="busy" class="rounded-lg px-2 py-2 text-xs text-black/60 hover:bg-black/5 dark:text-white/60 dark:hover:bg-white/10" @click="selectIcon('book'); tab = 'preset'">{{ t('categories.resetIcon') }}</button>
      </div>
    </div>

    <p v-if="error" role="alert" class="rounded-lg bg-red-50 p-2.5 text-xs text-red-700 dark:bg-red-500/10 dark:text-red-300">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, useId } from 'vue'
import { useI18n } from 'vue-i18n'
import { getIconComponent, isCustomCategoryIcon } from '../../../utils/iconRenderer'
import { MAX_ICON_BYTES, isSupportedIconImage, normalizeCategoryIcon } from '../../../utils/categoryIconImage'
import { TAB_ICON_PRESETS } from '../../Vocabulary/constants/tabIcons'

const props = defineProps<{ modelValue: string; selectedColor?: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string]; busy: [value: boolean] }>()
const { t } = useI18n()
const modes = ['preset', 'local'] as const
const tab = ref<(typeof modes)[number]>(isCustomCategoryIcon(props.modelValue) ? 'local' : 'preset')
const searchQuery = ref('')
const busy = ref(false)
const error = ref('')
const fileInput = ref<HTMLInputElement | null>(null)
let version = 0
const isCustom = computed(() => isCustomCategoryIcon(props.modelValue))
const iconList = [...new Set([...TAB_ICON_PRESETS, 'dollar-sign', 'tablet', 'feather', 'trash', 'scissors', 'lotus', 'bar-chart', 'disc', 'wrench', 'paw-print'])]
const filteredIcons = computed(() => iconList.filter(icon => icon.replace(/-/g, ' ').includes(searchQuery.value.trim().toLowerCase()) || icon.includes(searchQuery.value.trim().toLowerCase())))

function selectIcon(icon: string) {
  error.value = ''
  emit('update:modelValue', icon)
}


const sources = [
  { key: 'file', label: 'categories.sourceFile', path: 'M12 16V4m-5 5 5-5 5 5M4 16v4h16v-4' },
  { key: 'url', label: 'categories.sourceUrl', path: 'M10 13a5 5 0 0 0 7 0l4-4a5 5 0 0 0-7-7l-2 2m2 7a5 5 0 0 0-7 0l-4 4a5 5 0 0 0 7 7l2-2' },
  { key: 'clipboard', label: 'categories.sourceClipboard', path: 'M8 4H6a2 2 0 0 0-2 2v14h16V6a2 2 0 0 0-2-2h-2M8 2h8v4H8zM8 11h8m-8 4h8' },
] as const
type Source = (typeof sources)[number]['key']
const activeSource = ref<Source>('file')
const urlDraft = ref('')
const urlId = 'category-icon-url-' + useId()
let controller: AbortController | null = null

function changeSource(source: Source) {
  if (busy.value) return
  activeSource.value = source
  error.value = ''
}

async function processSource(source: () => Promise<Blob>, sourceError: string) {
  if (busy.value) return
  const current = ++version
  error.value = ''
  busy.value = true
  emit('busy', true)
  try {
    const blob = await source()
    if (current !== version) return
    const data = await normalizeCategoryIcon(blob)
    if (!isCustomCategoryIcon(data)) throw new Error('invalid')
    if (current === version) emit('update:modelValue', data)
  } catch (cause) {
    if (current === version) error.value = t(cause instanceof Error && cause.message === 'invalid' ? 'categories.invalidIcon' : sourceError)
  } finally {
    if (current === version) { busy.value = false; emit('busy', false) }
  }
}

function chooseFile(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (file) void processSource(async () => file, 'categories.invalidIcon')
}

async function loadFromUrl() {
  if (busy.value || !urlDraft.value) return
  let url: URL
  try {
    url = new URL(urlDraft.value)
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw new Error('invalid URL')
  } catch {
    error.value = t('categories.invalidIconUrl')
    return
  }
  await processSource(async () => {
    const request = new AbortController()
    controller = request
    const timeout = setTimeout(() => request.abort(), 12000)
    try {
      const response = await fetch(url.href, { mode: 'cors', credentials: 'omit', referrerPolicy: 'no-referrer', signal: request.signal })
      if (!response.ok) throw new Error('download failed')
      const mime = (response.headers.get('content-type') || '').split(';')[0]?.trim() || ''
      if (!isSupportedIconImage(new Blob([], { type: mime }))) throw new Error('invalid')
      if (Number(response.headers.get('content-length')) > MAX_ICON_BYTES) throw new Error('invalid')
      if (!response.body) throw new Error('download failed')
      const reader = response.body.getReader()
      const chunks: ArrayBuffer[] = []
      let total = 0
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          total += value.byteLength
          if (total > MAX_ICON_BYTES) { request.abort(); throw new Error('invalid') }
          chunks.push(Uint8Array.from(value).buffer)
        }
      } finally {
        reader.releaseLock()
      }
      return new Blob(chunks, { type: mime })
    } finally {
      request.abort()
      clearTimeout(timeout)
      if (controller === request) controller = null
    }
  }, 'categories.iconUrlFailed')
}

function handlePaste(event: ClipboardEvent) {
  if (busy.value) return
  const clipboard = event.clipboardData
  if (!clipboard) return
  const image = Array.from(clipboard.files).find(file => file.type.startsWith('image/'))
    || Array.from(clipboard.items).find(item => item.kind === 'file' && item.type.startsWith('image/'))?.getAsFile()
  if (!image) return
  event.preventDefault()
  activeSource.value = 'clipboard'
  void processSource(async () => image, 'categories.clipboardFailed')
}

function readClipboard() {
  if (busy.value) return
  void processSource(async () => {
    if (!navigator.clipboard?.read) throw new Error('clipboard unavailable')
    const items = await navigator.clipboard.read()
    for (const item of items) {
      const type = item.types.find(type => /^(image\/(png|jpeg|webp|x-icon|vnd\.microsoft\.icon))$/i.test(type))
      if (type) return item.getType(type)
    }
    throw new Error('no image')
  }, 'categories.clipboardFailed')
}

onBeforeUnmount(() => {
  version++
  controller?.abort()
  emit('busy', false)
})

</script>
