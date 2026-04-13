<template>
  <div class="voice-settings-page">
    <!-- Background Effects -->
    <div class="page-background">
      <div class="bg-gradient-1"></div>
      <div class="bg-gradient-2"></div>
    </div>

    <div class="page-content">
      <!-- Page Header -->
      <div class="page-header">
        <div class="header-badge">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </svg>
        </div>
        <h1 class="page-title">{{ t("voiceSettings.title") }}</h1>
        <p class="page-subtitle">{{ t("voiceSettings.subtitle") }}</p>
      </div>

      <VoiceSettingsPanel />
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from "vue";
import { useVoiceSettingsI18n } from "./composable/manager-i18n/useVoiceSettingsI18n";
import "./styles/VoiceSettingsView.css";

const { t } = useVoiceSettingsI18n();

const VoiceSettingsPanel = defineAsyncComponent(
  () => import("./component/VoiceSettingsPanel.vue") as any
);
</script>
