<template>
  <div class="voice-settings-container">
    <!-- Header Section with Gradient -->
    <div class="settings-header">
      <div class="header-icon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="23" />
          <line x1="8" y1="23" x2="16" y2="23" />
        </svg>
      </div>
      <div class="header-text">
        <h2>{{ t("voiceSettings.defaultVoiceTitle") }}</h2>
        <p>{{ t("voiceSettings.defaultVoiceDescription") }}</p>
      </div>
    </div>

    <!-- Main Settings Card -->
    <div class="settings-card">
      <!-- Language Selection -->
      <div class="form-group">
        <label class="form-label">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path
              d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
            />
          </svg>
          {{ t("voiceSettings.language") }}
        </label>
        <div class="select-wrapper">
          <select v-model="selectedLanguage" class="custom-select">
            <option
              v-for="lang in languages"
              :key="lang.code"
              :value="lang.code"
            >
              {{ lang.label }}
            </option>
          </select>
          <div class="select-arrow">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Voice Selection -->
      <div class="form-group">
        <label class="form-label">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          </svg>
          {{ t("voiceSettings.voice") }}
        </label>
        <div class="select-wrapper">
          <select v-model="selectedVoiceKey" class="custom-select">
            <option
              v-for="voice in filteredVoices"
              :key="voice.key"
              :value="voice.key"
            >
              {{ voice.displayName }}
            </option>
          </select>
          <div class="select-arrow">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons">
        <button
          type="button"
          @click="handlePreview"
          class="btn btn-preview"
          :class="{ 'is-playing': isPlaying }"
        >
          <svg
            v-if="!isPlaying"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <rect x="6" y="4" width="4" height="16" />
            <rect x="14" y="4" width="4" height="16" />
          </svg>
          <span>{{ t("voiceSettings.preview") }}</span>
        </button>

        <button type="button" @click="handleSave" class="btn btn-save">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"
            />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
          </svg>
          <span>{{ t("voiceSettings.save") }}</span>
        </button>
      </div>
    </div>

    <!-- Browser Voices Section -->
    <div class="browser-voices-section">
      <div class="section-header">
        <div class="section-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
          </svg>
        </div>
        <div>
          <h3>{{ t("voiceSettings.browserVoicesTitle") }}</h3>
          <p>{{ t("voiceSettings.browserVoicesDescription") }}</p>
        </div>
      </div>

      <div v-if="!browserVoices.length" class="empty-state">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M8 15h8" />
          <circle cx="9" cy="9" r="1" fill="currentColor" />
          <circle cx="15" cy="9" r="1" fill="currentColor" />
        </svg>
        <span>{{ t("voiceSettings.noVoices") }}</span>
      </div>

      <div v-else class="voices-grid">
        <div
          v-for="voice in browserVoices"
          :key="voice.voiceURI"
          class="voice-card"
          :class="{ 'is-selected': selectedVoiceKey === voice.voiceURI }"
          @click="selectAndPreviewVoice(voice)"
        >
          <div class="voice-info">
            <div class="voice-name">{{ voice.name }}</div>
            <div class="voice-meta">
              <span class="voice-lang">{{ voice.lang }}</span>
              <span
                class="voice-type"
                :class="voice.localService ? 'local' : 'remote'"
              >
                {{ voice.localService ? "Local" : "Cloud" }}
              </span>
            </div>
          </div>
          <button
            type="button"
            @click.stop="previewBrowserVoice(voice)"
            class="voice-preview-btn"
            :title="t('voiceSettings.preview')"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useVoiceSettingsMount } from "../composable/manager-mount/useVoiceSettingsMount";
import { useVoiceSettingsState } from "../composable/manager-state/useVoiceSettingsState";
import { useVoiceSettingsHandle } from "../composable/manager-handle/useVoiceSettingsHandle";

const { t } = useI18n();

const {
  state,
  setVoices,
  setSelectedVoiceKey,
  setSelectedLanguage,
  setLanguages,
} = useVoiceSettingsState();
const { loadVoices } = useVoiceSettingsMount(
  setVoices,
  setSelectedVoiceKey,
  setSelectedLanguage,
  setLanguages
);
const { handlePreviewVoice, handleSavePreferredVoice } =
  useVoiceSettingsHandle();

const isPlaying = ref(false);

const selectedLanguage = computed({
  get: () => state.selectedLanguage,
  set: (val: string) => setSelectedLanguage(val),
});

const selectedVoiceKey = computed({
  get: () => state.selectedVoiceKey,
  set: (val: string) => setSelectedVoiceKey(val),
});

const languages = computed(() => state.languages);
const filteredVoices = computed(() =>
  state.voices.filter(
    (v) => !state.selectedLanguage || v.languageCode === state.selectedLanguage
  )
);

const browserVoices = ref<SpeechSynthesisVoice[]>([]);

function loadBrowserVoices() {
  if (!("speechSynthesis" in window)) {
    return;
  }
  const voices = window.speechSynthesis.getVoices();
  browserVoices.value = voices;
}

// Đồng bộ danh sách ngôn ngữ + voice mặc định từ Browser voices
watch(
  browserVoices,
  (voices) => {
    if (!voices || !voices.length) return;

    const languagesMap = new Map<string, { code: string; label: string }>();

    const viewModels = voices.map((v) => {
      const code = v.lang;
      if (!languagesMap.has(code)) {
        const baseCode = code.split(".")[0];
        const labelMap: Record<string, string> = {
          "en-US": "English (US)",
          "en-GB": "English (UK)",
          "vi-VN": "Tiếng Việt",
          "ko-KR": "한국어",
        };
        languagesMap.set(code, {
          code,
          label: labelMap[baseCode as keyof typeof labelMap] ?? code,
        });
      }

      return {
        id: v.voiceURI,
        key: v.voiceURI,
        displayName: `${v.name} · ${v.lang}`,
        languageCode: v.lang,
        provider: v.localService ? "local" : "remote",
      };
    });

    setVoices(viewModels);

    const languages = Array.from(languagesMap.values());
    setLanguages(languages);

    if (!state.selectedLanguage && languages.length) {
      setSelectedLanguage(languages[0].code);
    }

    if (!state.selectedVoiceKey && viewModels.length) {
      const firstForLang =
        viewModels.find((v) => v.languageCode === state.selectedLanguage) ??
        viewModels[0];
      setSelectedVoiceKey(firstForLang.key);
    }
  },
  { immediate: true }
);

onMounted(() => {
  loadVoices().catch((error) => {
    console.error("Failed to load voices", error);
  });

  loadBrowserVoices();
  if ("speechSynthesis" in window) {
    window.speechSynthesis.onvoiceschanged = () => {
      loadBrowserVoices();
    };
  }
});

function handlePreview() {
  const voice = state.voices.find((v) => v.key === state.selectedVoiceKey);
  if (!voice) return;

  isPlaying.value = true;
  handlePreviewVoice(voice);

  // Reset playing state after speech ends
  setTimeout(() => {
    isPlaying.value = false;
  }, 3000);
}

async function handleSave() {
  if (!state.selectedVoiceKey) return;
  await handleSavePreferredVoice(state.selectedVoiceKey);
}

function selectAndPreviewVoice(voice: SpeechSynthesisVoice) {
  setSelectedVoiceKey(voice.voiceURI);
  previewBrowserVoice(voice);
}

async function previewBrowserVoice(voice: SpeechSynthesisVoice) {
  if (!("speechSynthesis" in window)) return;

  try {
    localStorage.setItem("preferredVoiceURI", voice.voiceURI);
    await handleSavePreferredVoice(voice.voiceURI);
  } catch {
    // ignore storage error
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(
    t("voiceSettings.previewSample")
  );
  utterance.voice = voice;
  utterance.lang = voice.lang;
  utterance.rate = 0.9;
  window.speechSynthesis.speak(utterance);
}
</script>

<style scoped>
.voice-settings-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Header Styles */
.settings-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: linear-gradient(
    135deg,
    rgba(99, 102, 241, 0.1) 0%,
    rgba(139, 92, 246, 0.1) 100%
  );
  border-radius: 20px;
  border: 1px solid rgba(99, 102, 241, 0.2);
}

.header-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: 16px;
  color: white;
  flex-shrink: 0;
}

.header-icon svg {
  width: 28px;
  height: 28px;
}

.header-text h2 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #f3f4f6;
  margin: 0 0 4px 0;
}

.header-text p {
  font-size: 0.875rem;
  color: #9ca3af;
  margin: 0;
}

/* Settings Card */
.settings-card {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Form Group */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #d1d5db;
}

.form-label svg {
  width: 16px;
  height: 16px;
  color: #8b5cf6;
}

/* Custom Select */
.select-wrapper {
  position: relative;
}

.custom-select {
  width: 100%;
  padding: 14px 44px 14px 16px;
  font-size: 0.9375rem;
  font-weight: 500;
  color: #f3f4f6;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  outline: none;
  appearance: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.custom-select:hover {
  border-color: rgba(139, 92, 246, 0.5);
}

.custom-select:focus {
  border-color: #8b5cf6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.2);
}

.custom-select option {
  background: #1a1a1a;
  color: #f3f4f6;
  padding: 12px;
}

.select-arrow {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: #9ca3af;
}

.select-arrow svg {
  width: 18px;
  height: 18px;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 24px;
  font-size: 0.9375rem;
  font-weight: 600;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn svg {
  width: 18px;
  height: 18px;
}

.btn-preview {
  flex: 1;
  background: rgba(255, 255, 255, 0.08);
  color: #f3f4f6;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-preview:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(139, 92, 246, 0.5);
  transform: translateY(-2px);
}

.btn-preview.is-playing {
  background: rgba(139, 92, 246, 0.2);
  border-color: #8b5cf6;
}

.btn-save {
  flex: 1;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.3);
}

.btn-save:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(99, 102, 241, 0.4);
}

/* Browser Voices Section */
.browser-voices-section {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 24px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.section-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: rgba(139, 92, 246, 0.15);
  border-radius: 12px;
  color: #a78bfa;
  flex-shrink: 0;
}

.section-icon svg {
  width: 22px;
  height: 22px;
}

.section-header h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #f3f4f6;
  margin: 0 0 4px 0;
}

.section-header p {
  font-size: 0.8125rem;
  color: #9ca3af;
  margin: 0;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #6b7280;
  gap: 12px;
}

.empty-state svg {
  width: 48px;
  height: 48px;
  opacity: 0.5;
}

/* Voices Grid */
.voices-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
  padding-right: 8px;
}

.voices-grid::-webkit-scrollbar {
  width: 6px;
}

.voices-grid::-webkit-scrollbar-track {
  background: transparent;
}

.voices-grid::-webkit-scrollbar-thumb {
  background: rgba(139, 92, 246, 0.3);
  border-radius: 3px;
}

.voices-grid::-webkit-scrollbar-thumb:hover {
  background: rgba(139, 92, 246, 0.5);
}

/* Voice Card */
.voice-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.25s ease;
}

.voice-card:hover {
  background: rgba(139, 92, 246, 0.1);
  border-color: rgba(139, 92, 246, 0.3);
  transform: translateX(4px);
}

.voice-card.is-selected {
  background: rgba(139, 92, 246, 0.15);
  border-color: #8b5cf6;
}

.voice-info {
  flex: 1;
  min-width: 0;
}

.voice-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #e5e7eb;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.voice-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.voice-lang {
  font-size: 0.75rem;
  color: #9ca3af;
}

.voice-type {
  font-size: 0.625rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 2px 6px;
  border-radius: 4px;
}

.voice-type.local {
  background: rgba(16, 185, 129, 0.2);
  color: #34d399;
}

.voice-type.remote {
  background: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
}

.voice-preview-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: rgba(139, 92, 246, 0.2);
  border: none;
  border-radius: 10px;
  color: #a78bfa;
  cursor: pointer;
  transition: all 0.25s ease;
  flex-shrink: 0;
  margin-left: 12px;
}

.voice-preview-btn:hover {
  background: #8b5cf6;
  color: white;
  transform: scale(1.1);
}

.voice-preview-btn svg {
  width: 16px;
  height: 16px;
}

/* Light mode */
:root:not(.dark) .header-text h2,
html:not(.dark) .header-text h2 {
  color: #1f2937;
}

:root:not(.dark) .header-text p,
html:not(.dark) .header-text p,
:root:not(.dark) .section-header p,
html:not(.dark) .section-header p {
  color: #6b7280;
}

:root:not(.dark) .settings-card,
html:not(.dark) .settings-card,
:root:not(.dark) .browser-voices-section,
html:not(.dark) .browser-voices-section {
  background: rgba(255, 255, 255, 0.8);
  border-color: rgba(0, 0, 0, 0.1);
}

:root:not(.dark) .custom-select,
html:not(.dark) .custom-select {
  background: rgba(255, 255, 255, 0.9);
  color: #1f2937;
  border-color: rgba(0, 0, 0, 0.15);
}

:root:not(.dark) .voice-card,
html:not(.dark) .voice-card {
  background: rgba(0, 0, 0, 0.03);
}

:root:not(.dark) .voice-name,
html:not(.dark) .voice-name {
  color: #374151;
}

:root:not(.dark) .form-label,
html:not(.dark) .form-label {
  color: #374151;
}

:root:not(.dark) .section-header h3,
html:not(.dark) .section-header h3 {
  color: #1f2937;
}

:root:not(.dark) .btn-preview,
html:not(.dark) .btn-preview {
  background: rgba(0, 0, 0, 0.05);
  color: #374151;
  border-color: rgba(0, 0, 0, 0.1);
}

/* Responsive */
@media (max-width: 640px) {
  .action-buttons {
    flex-direction: column;
  }

  .voices-grid {
    grid-template-columns: 1fr;
  }

  .settings-header {
    flex-direction: column;
    text-align: center;
  }
}
</style>
