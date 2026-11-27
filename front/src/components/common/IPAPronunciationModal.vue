<template>
  <Teleport to="body">
    <Transition enter-active-class="transition-opacity duration-200" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition-opacity duration-150" leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div v-if="visible" data-ipa-modal class="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 p-2 backdrop-blur-sm sm:p-4">
        <div role="dialog" aria-modal="true" :aria-label="t('vocabulary.ipaBuilder')" data-learning-modal-shell class="flex h-[94dvh] max-h-[calc(100dvh-1rem)] w-full min-w-0 max-w-4xl flex-col overflow-hidden rounded-2xl border border-black/10 bg-white shadow-2xl dark:border-white/10 dark:bg-black sm:h-[88dvh] sm:rounded-3xl">
          <header class="flex shrink-0 items-center gap-3 border-b border-black/10 p-3 dark:border-white/10 sm:px-6 sm:py-4">
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3m-4 0h8"/></svg>
            </div>
            <div class="min-w-0 flex-1">
              <h2 class="text-base font-bold leading-tight text-black dark:text-white sm:text-xl">{{ t('vocabulary.ipaBuilder') }}</h2>
              <p class="mt-1 text-xs text-black/50 dark:text-white/50">{{ t('vocabulary.buildPronunciation') }}</p>
            </div>
            <button type="button" :aria-label="t('vocabulary.cancel')" class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-black/50 transition hover:bg-black/5 dark:text-white/50 dark:hover:bg-white/10" @click.stop="close">
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 6 12 12M18 6 6 18"/></svg>
            </button>
          </header>
          <div class="shrink-0 border-b border-black/10 px-3 py-3 dark:border-white/10 sm:px-6">
            <div class="rounded-2xl border border-primary-500/20 bg-gradient-to-br from-primary-50 to-secondary-50 p-3 dark:from-primary-500/10 dark:to-secondary-500/5 sm:p-4">
              <div class="mb-2 flex flex-wrap items-center justify-between gap-2">
                <label for="ipa-builder-input" class="text-xs font-semibold text-primary-700 dark:text-primary-300">{{ t('vocabulary.preview') }} · {{ t('vocabulary.manualInput') }}</label>
                <button type="button" :disabled="!currentPronunciation || isPlaying" @click="playPreview" class="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary-500 text-white transition hover:bg-primary-600 disabled:opacity-40" :aria-label="t('vocabulary.preview')">
                  <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 5 6 9H3v6h3l5 4V5Zm4 3a5 5 0 0 1 0 8m3-11a9 9 0 0 1 0 14"/></svg>
                </button>
              </div>
              <input id="ipa-builder-input" data-ipa-input v-model="currentPronunciation" type="text" autocomplete="off" spellcheck="false" placeholder="/.../" class="w-full min-w-0 rounded-xl border border-black/10 bg-white px-3 py-2.5 font-mono text-xl font-semibold text-black outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-white/10 dark:bg-black dark:text-white sm:text-3xl"/>
              <div class="mt-2 flex flex-wrap items-center gap-2">
                <button type="button" data-ipa-backspace :disabled="!currentPronunciation" @click="removeLastSymbol" class="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold text-black/70 hover:border-primary-500 disabled:opacity-40 dark:border-white/10 dark:bg-white/5 dark:text-white/80"><svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 5H9l-7 7 7 7h12zM12 9l6 6m0-6-6 6"/></svg>{{ t('vocabulary.backspace') }}</button>
                <button type="button" data-ipa-clear :disabled="!currentPronunciation" @click="clearPronunciation" class="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-black/60 hover:bg-black/5 disabled:opacity-40 dark:text-white/60 dark:hover:bg-white/10">{{ t('vocabulary.clear') }}</button>
              </div>
            </div>
          </div>
          <div data-ipa-scroll class="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3 scrollbar-custom sm:p-6">
            <div class="grid grid-cols-1 gap-3 md:grid-cols-2 sm:gap-4">
              <section v-for="group in symbolGroups" :key="group.key" :class="group.key==='otherSymbols'?'md:col-span-2':''" class="min-w-0 rounded-2xl border border-black/10 bg-black/[0.02] p-3 dark:border-white/10 dark:bg-white/[0.035] sm:p-4">
                <div class="mb-3 flex items-center justify-between gap-2">
                  <h3 class="flex min-w-0 items-center gap-2 text-sm font-semibold text-black dark:text-white"><span class="h-2 w-2 shrink-0 rounded-full bg-primary-500"></span>{{ t('vocabulary.'+group.key) }}</h3>
                  <span class="rounded-md bg-black/5 px-2 py-0.5 text-xs tabular-nums text-black/50 dark:bg-white/10 dark:text-white/50">{{ group.symbols.length }}</span>
                </div>
                <div class="grid grid-cols-4 gap-1.5 xs:grid-cols-5 sm:grid-cols-6 sm:gap-2">
                  <button v-for="(symbol,index) in group.symbols" :key="index" type="button" data-ipa-symbol @click="addSymbol(symbol)" class="min-h-[44px] min-w-0 rounded-xl border border-black/10 bg-white px-1 py-2 text-center font-mono text-lg font-medium text-black transition hover:border-primary-400 hover:bg-primary-50 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:border-primary-400/60 dark:hover:bg-primary-500/10 sm:text-xl">{{ symbol }}</button>
                </div>
              </section>
            </div>
          </div>
          <footer class="grid shrink-0 grid-cols-2 gap-2.5 border-t border-black/10 bg-white p-3 dark:border-white/10 dark:bg-black sm:px-6 sm:py-4">
            <button type="button" @click="close" class="min-h-11 min-w-0 break-words rounded-xl bg-black/5 px-3 py-2 text-sm font-semibold text-black transition hover:bg-black/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/20">{{ t('vocabulary.cancel') }}</button>
            <button type="button" data-ipa-confirm @click="confirm" class="min-h-11 min-w-0 break-words rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 px-3 py-2 text-sm font-semibold text-white transition hover:shadow-lg hover:shadow-primary-500/25">{{ t('vocabulary.confirm') }}</button>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue'
import { speakPreferred, stopSpeech } from '../../composables/usePreferredVoice'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  visible: boolean
  pronunciation: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'confirm', pronunciation: string): void
}>()

const { t } = useI18n()

const currentPronunciation = ref('')
const isPlaying = ref(false)

// IPA Symbols
const consonants = [
  'p', 'b', 't', 'd', 'k', 'g',
  'f', 'v', 'θ', 'ð', 's', 'z',
  'ʃ', 'ʒ', 'h', 'm', 'n', 'ŋ',
  'l', 'r', 'j', 'w', 'ʧ', 'ʤ'
]

const vowels = [
  'i', 'ɪ', 'e', 'ɛ', 'æ', 'ə',
  'ʌ', 'ɔ', 'o', 'ʊ', 'u', 'ɑ',
  'ɒ', 'ɜ', 'ɐ', 'ɞ'
]

const diacritics = [
  'ː', 'ˑ', '̃', '̆', '̌', '̂',
  '̀', '́', '̄', '̥', '̬', '̪'
]

const stressMarks = [
  'ˈ', 'ˌ', '|', '‖'
]

const otherSymbols = [
  '/', '.', '-', 'ʰ', 'ʷ', 'ʲ'
]

const symbolGroups = [
  { key: 'consonants', symbols: consonants },
  { key: 'vowels', symbols: vowels },
  { key: 'diacritics', symbols: diacritics },
  { key: 'stressMarks', symbols: stressMarks },
  { key: 'otherSymbols', symbols: otherSymbols },
]

watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      currentPronunciation.value = props.pronunciation
    }
  }
)

const addSymbol = (symbol: string) => {
  currentPronunciation.value += symbol
}

const removeLastSymbol = () => {
  currentPronunciation.value = currentPronunciation.value.slice(0, -1)
}

const clearPronunciation = () => {
  currentPronunciation.value = ''
}

const playPreview = () => {
  if (!currentPronunciation.value) return
  if (isPlaying.value) { stopSpeech(); isPlaying.value = false; return }
  isPlaying.value = true
  void speakPreferred(currentPronunciation.value, {
    rate: 0.8,
    onDone: () => { isPlaying.value = false },
  })
}
onBeforeUnmount(() => { if (isPlaying.value) stopSpeech() })

const close = () => {
  if (isPlaying.value) stopSpeech()
  emit('close')
}

const confirm = () => {
  emit('confirm', currentPronunciation.value)
  close()
}
</script>

<style scoped>
button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
