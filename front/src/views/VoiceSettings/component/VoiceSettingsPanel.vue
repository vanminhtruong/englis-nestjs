<template>
  <div class="space-y-6">
    <div class="bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ t('voiceSettings.defaultVoiceTitle') }}
          </h2>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            {{ t('voiceSettings.defaultVoiceDescription') }}
          </p>
        </div>
      </div>

      <div class="space-y-4">
        <div class="flex flex-col gap-3">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
            {{ t('voiceSettings.language') }}
          </label>
          <select
            v-model="selectedLanguage"
            class="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/40 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option v-for="lang in languages" :key="lang.code" :value="lang.code">
              {{ lang.label }}
            </option>
          </select>
        </div>

        <div class="flex flex-col gap-3">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
            {{ t('voiceSettings.voice') }}
          </label>
          <select
            v-model="selectedVoiceKey"
            class="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/40 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option v-for="voice in filteredVoices" :key="voice.key" :value="voice.key">
              {{ voice.displayName }}
            </option>
          </select>
        </div>

        <div class="flex items-center gap-3">
          <button
            type="button"
            @click="handlePreview"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-medium text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
            {{ t('voiceSettings.preview') }}
          </button>

          <button
            type="button"
            @click="handleSave"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 text-sm font-semibold text-white shadow-sm hover:shadow-md transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 13l4 4L19 7"></path>
            </svg>
            {{ t('voiceSettings.save') }}
          </button>
        </div>
      </div>
    </div>

    <div class="bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {{ t('voiceSettings.browserVoicesTitle') }}
      </h2>
      <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
        {{ t('voiceSettings.browserVoicesDescription') }}
      </p>

      <div v-if="!browserVoices.length" class="text-sm text-gray-500 dark:text-gray-400">
        {{ t('voiceSettings.noVoices') }}
      </div>

      <ul v-else class="space-y-2 max-h-60 overflow-auto pr-1">
        <li
          v-for="voice in browserVoices"
          :key="voice.voiceURI"
          class="flex items-center justify-between text-sm text-gray-800 dark:text-gray-100"
        >
          <div>
            <div class="font-medium">{{ voice.name }}</div>
            <div class="text-xs text-gray-500 dark:text-gray-400">
              {{ voice.lang }} · {{ voice.localService ? 'local' : 'remote' }}
            </div>
          </div>
          <button
            type="button"
            @click="previewBrowserVoice(voice)"
            class="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10"
          >
            {{ t('voiceSettings.preview') }}
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useVoiceSettingsMount } from '../composable/manager-mount/useVoiceSettingsMount'
import { useVoiceSettingsState } from '../composable/manager-state/useVoiceSettingsState'
import { useVoiceSettingsHandle } from '../composable/manager-handle/useVoiceSettingsHandle'

const { t } = useI18n()

const { state, setVoices, setSelectedVoiceKey, setSelectedLanguage, setLanguages } = useVoiceSettingsState()
const { loadVoices } = useVoiceSettingsMount(setVoices, setSelectedVoiceKey, setSelectedLanguage, setLanguages)
const { handlePreviewVoice, handleSavePreferredVoice } = useVoiceSettingsHandle()

const selectedLanguage = computed({
  get: () => state.selectedLanguage,
  set: (val: string) => setSelectedLanguage(val),
})

const selectedVoiceKey = computed({
  get: () => state.selectedVoiceKey,
  set: (val: string) => setSelectedVoiceKey(val),
})

const languages = computed(() => state.languages)
const filteredVoices = computed(() =>
  state.voices.filter((v) => !state.selectedLanguage || v.languageCode === state.selectedLanguage),
)

const browserVoices = ref<SpeechSynthesisVoice[]>([])

function loadBrowserVoices() {
  if (!('speechSynthesis' in window)) {
    return
  }
  const voices = window.speechSynthesis.getVoices()
  browserVoices.value = voices
}

// Đồng bộ danh sách ngôn ngữ + voice mặc định từ Browser voices
watch(
  browserVoices,
  (voices) => {
    if (!voices || !voices.length) return

    const languagesMap = new Map<string, { code: string; label: string }>()

    const viewModels = voices.map((v) => {
      const code = v.lang
      if (!languagesMap.has(code)) {
        const baseCode = code.split('.')[0]
        const labelMap: Record<string, string> = {
          'en-US': 'English (US)',
          'en-GB': 'English (UK)',
          'vi-VN': 'Tiếng Việt',
          'ko-KR': '한국어',
        }
        languagesMap.set(code, {
          code,
          label: labelMap[baseCode as keyof typeof labelMap] ?? code,
        })
      }

      return {
        id: v.voiceURI,
        key: v.voiceURI,
        displayName: `${v.name} · ${v.lang}`,
        languageCode: v.lang,
        provider: v.localService ? 'local' : 'remote',
      }
    })

    setVoices(viewModels)

    const languages = Array.from(languagesMap.values())
    setLanguages(languages)

    if (!state.selectedLanguage && languages.length) {
      setSelectedLanguage(languages[0].code)
    }

    if (!state.selectedVoiceKey && viewModels.length) {
      const firstForLang =
        viewModels.find((v) => v.languageCode === state.selectedLanguage) ?? viewModels[0]
      setSelectedVoiceKey(firstForLang.key)
    }
  },
  { immediate: true },
)

onMounted(() => {
  loadVoices().catch((error) => {
    console.error('Failed to load voices', error)
    // error will be handled by toast in composable if needed
  })

  loadBrowserVoices()
  if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = () => {
      loadBrowserVoices()
    }
  }
})

function handlePreview() {
  const voice = state.voices.find((v) => v.key === state.selectedVoiceKey)
  if (!voice) return
  handlePreviewVoice(voice)
}

async function handleSave() {
  if (!state.selectedVoiceKey) return
  await handleSavePreferredVoice(state.selectedVoiceKey)
}

async function previewBrowserVoice(voice: SpeechSynthesisVoice) {
  if (!('speechSynthesis' in window)) return

  try {
    localStorage.setItem('preferredVoiceURI', voice.voiceURI)
    await handleSavePreferredVoice(voice.voiceURI)
  } catch {
    // ignore storage error
  }

  const utterance = new SpeechSynthesisUtterance(t('voiceSettings.previewSample'))
  utterance.voice = voice
  utterance.lang = voice.lang
  utterance.rate = 0.9
  window.speechSynthesis.speak(utterance)
}
</script>


