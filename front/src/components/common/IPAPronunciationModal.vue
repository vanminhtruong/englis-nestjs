<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="visible"
        class="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        @click.self="close"
      >
        <div class="w-full h-[90vh] max-w-5xl bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-black/5 dark:border-white/10 flex-shrink-0">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 text-white flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                  <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-900 dark:text-white">{{ t('vocabulary.ipaBuilder') }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">{{ t('vocabulary.buildPronunciation') }}</p>
              </div>
            </div>
            <button
              class="w-9 h-9 rounded-full bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white flex items-center justify-center hover:bg-gray-200 dark:hover:bg-white/20"
              @click.stop="close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <!-- Preview Section (Fixed) -->
          <div class="px-6 py-4 border-b border-black/5 dark:border-white/10 flex-shrink-0 bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20">
            <p class="text-xs font-semibold text-primary-600 dark:text-primary-300 mb-2 uppercase tracking-wide">
              {{ t('vocabulary.preview') }}
            </p>
            <div class="flex items-center gap-3">
              <div class="text-3xl font-bold text-gray-900 dark:text-white font-mono tracking-wider">
                {{ currentPronunciation || '/' }}
              </div>
              <button
                v-if="currentPronunciation"
                @click="playPreview"
                class="p-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-all"
                :disabled="isPlaying"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Content with Scrollable IPA Symbols -->
          <div class="flex-1 overflow-y-auto p-6">
            <!-- Grid Layout for IPA Categories -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

              <!-- IPA Consonants -->
              <div class="bg-white dark:bg-neutral-900 p-4 rounded-lg border border-gray-200 dark:border-white/10">
                <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-primary-500"></span>
                  {{ t('vocabulary.consonants') }}
                </h3>
                <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                  <button
                    v-for="consonant in consonants"
                    :key="consonant"
                    @click="addSymbol(consonant)"
                    :class="[
                      'px-3 py-2 rounded-lg text-sm font-medium transition-all border',
                      currentPronunciation.includes(consonant)
                        ? 'bg-primary-500 text-white border-primary-600 dark:border-primary-400'
                        : 'bg-white dark:bg-white/5 text-gray-900 dark:text-white border-gray-200 dark:border-white/10 hover:border-primary-500 dark:hover:border-primary-400'
                    ]"
                  >
                    {{ consonant }}
                  </button>
                </div>
              </div>

              <!-- IPA Vowels -->
              <div class="bg-white dark:bg-neutral-900 p-4 rounded-lg border border-gray-200 dark:border-white/10">
                <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-secondary-500"></span>
                  {{ t('vocabulary.vowels') }}
                </h3>
                <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                  <button
                    v-for="vowel in vowels"
                    :key="vowel"
                    @click="addSymbol(vowel)"
                    :class="[
                      'px-3 py-2 rounded-lg text-sm font-medium transition-all border',
                      currentPronunciation.includes(vowel)
                        ? 'bg-secondary-500 text-white border-secondary-600 dark:border-secondary-400'
                        : 'bg-white dark:bg-white/5 text-gray-900 dark:text-white border-gray-200 dark:border-white/10 hover:border-secondary-500 dark:hover:border-secondary-400'
                    ]"
                  >
                    {{ vowel }}
                  </button>
                </div>
              </div>

              <!-- Diacritics -->
              <div class="bg-white dark:bg-neutral-900 p-4 rounded-lg border border-gray-200 dark:border-white/10">
                <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-amber-500"></span>
                  {{ t('vocabulary.diacritics') }}
                </h3>
                <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                  <button
                    v-for="diacritic in diacritics"
                    :key="diacritic"
                    @click="addSymbol(diacritic)"
                    :class="[
                      'px-3 py-2 rounded-lg text-sm font-medium transition-all border',
                      currentPronunciation.includes(diacritic)
                        ? 'bg-amber-500 text-white border-amber-600 dark:border-amber-400'
                        : 'bg-white dark:bg-white/5 text-gray-900 dark:text-white border-gray-200 dark:border-white/10 hover:border-amber-500 dark:hover:border-amber-400'
                    ]"
                  >
                    {{ diacritic }}
                  </button>
                </div>
              </div>

              <!-- Stress Marks -->
              <div class="bg-white dark:bg-neutral-900 p-4 rounded-lg border border-gray-200 dark:border-white/10">
                <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-rose-500"></span>
                  {{ t('vocabulary.stressMarks') }}
                </h3>
                <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                  <button
                    v-for="stress in stressMarks"
                    :key="stress"
                    @click="addSymbol(stress)"
                    :class="[
                      'px-3 py-2 rounded-lg text-sm font-medium transition-all border',
                      currentPronunciation.includes(stress)
                        ? 'bg-rose-500 text-white border-rose-600 dark:border-rose-400'
                        : 'bg-white dark:bg-white/5 text-gray-900 dark:text-white border-gray-200 dark:border-white/10 hover:border-rose-500 dark:hover:border-rose-400'
                    ]"
                  >
                    {{ stress }}
                  </button>
                </div>
              </div>

              <!-- Other Symbols -->
              <div class="bg-white dark:bg-neutral-900 p-4 rounded-lg border border-gray-200 dark:border-white/10">
                <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-cyan-500"></span>
                  {{ t('vocabulary.otherSymbols') }}
                </h3>
                <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                  <button
                    v-for="symbol in otherSymbols"
                    :key="symbol"
                    @click="addSymbol(symbol)"
                    :class="[
                      'px-3 py-2 rounded-lg text-sm font-medium transition-all border',
                      currentPronunciation.includes(symbol)
                        ? 'bg-cyan-500 text-white border-cyan-600 dark:border-cyan-400'
                        : 'bg-white dark:bg-white/5 text-gray-900 dark:text-white border-gray-200 dark:border-white/10 hover:border-cyan-500 dark:hover:border-cyan-400'
                    ]"
                  >
                    {{ symbol }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Manual Input -->
            <div class="mt-6">
              <label class="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                {{ t('vocabulary.manualInput') }}
              </label>
              <input
                v-model="currentPronunciation"
                type="text"
                class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono text-lg"
                :placeholder="`/ˈeksəmpəl/`"
              />
            </div>
          </div>

          <!-- Footer -->
          <div class="p-6 border-t border-black/5 dark:border-white/10 flex gap-3 flex-shrink-0 bg-gray-50 dark:bg-white/5">
            <button
              type="button"
              @click="clearPronunciation"
              class="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 bg-white dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
            >
              {{ t('vocabulary.clear') }}
            </button>
            <button
              type="button"
              @click="removeLastSymbol"
              class="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 bg-white dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
            >
              {{ t('vocabulary.backspace') }}
            </button>
            <div class="flex-1"></div>
            <button
              type="button"
              @click="close"
              class="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 bg-white dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
            >
              {{ t('vocabulary.cancel') }}
            </button>
            <button
              type="button"
              @click="confirm"
              class="px-6 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-primary-500 to-secondary-500 text-white hover:shadow-lg hover:shadow-primary-500/30 transition-all"
            >
              {{ t('vocabulary.confirm') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
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

const playPreview = async () => {
  if (!currentPronunciation.value || isPlaying.value) return
  
  isPlaying.value = true
  try {
    const utterance = new SpeechSynthesisUtterance(currentPronunciation.value)
    
    // Get preferred voice from localStorage
    const preferredVoiceURI = localStorage.getItem('preferredVoiceURI')
    if (preferredVoiceURI && 'speechSynthesis' in window) {
      const voices = window.speechSynthesis.getVoices()
      const preferredVoice = voices.find(v => v.voiceURI === preferredVoiceURI)
      if (preferredVoice) {
        utterance.voice = preferredVoice
        utterance.lang = preferredVoice.lang
      }
    }
    
    utterance.rate = 0.8
    utterance.pitch = 1
    utterance.volume = 1
    
    utterance.onend = () => {
      isPlaying.value = false
    }
    
    window.speechSynthesis.speak(utterance)
  } catch (error) {
    console.error('Failed to play pronunciation:', error)
    isPlaying.value = false
  }
}

const close = () => {
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
