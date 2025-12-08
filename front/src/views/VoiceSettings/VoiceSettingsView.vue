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
import { useI18n } from "vue-i18n";
import en from "./language/en";
import vi from "./language/vi";
import ko from "./language/ko";

const { t, mergeLocaleMessage } = useI18n();

mergeLocaleMessage("en", { voiceSettings: en });
mergeLocaleMessage("vi", { voiceSettings: vi });
mergeLocaleMessage("ko", { voiceSettings: ko });

const VoiceSettingsPanel = defineAsyncComponent(
  () => import("./component/VoiceSettingsPanel.vue") as any
);
</script>

<style scoped>
.voice-settings-page {
  min-height: 100vh;
  position: relative;
  background: #000;
  padding: 0;
}

/* Background Effects */
.page-background {
  position: fixed;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}

.bg-gradient-1 {
  position: absolute;
  top: -20%;
  right: -10%;
  width: 600px;
  height: 600px;
  background: radial-gradient(
    circle,
    rgba(99, 102, 241, 0.15) 0%,
    transparent 70%
  );
  filter: blur(60px);
  animation: floatGradient 15s ease-in-out infinite;
}

.bg-gradient-2 {
  position: absolute;
  bottom: -20%;
  left: -10%;
  width: 500px;
  height: 500px;
  background: radial-gradient(
    circle,
    rgba(139, 92, 246, 0.12) 0%,
    transparent 70%
  );
  filter: blur(60px);
  animation: floatGradient 20s ease-in-out infinite reverse;
}

@keyframes floatGradient {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  50% {
    transform: translate(30px, -30px) scale(1.1);
  }
}

/* Page Content */
.page-content {
  position: relative;
  z-index: 1;
  max-width: 56rem;
  margin: 0 auto;
  padding: 48px 24px;
}

/* Page Header */
.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.header-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: 24px;
  color: white;
  margin-bottom: 20px;
  box-shadow: 0 8px 32px rgba(99, 102, 241, 0.3);
  animation: badgePulse 3s ease-in-out infinite;
}

.header-badge svg {
  width: 36px;
  height: 36px;
}

@keyframes badgePulse {
  0%,
  100% {
    transform: scale(1);
    box-shadow: 0 8px 32px rgba(99, 102, 241, 0.3);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 12px 48px rgba(99, 102, 241, 0.4);
  }
}

.page-title {
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #f3f4f6 0%, #d1d5db 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 12px 0;
  letter-spacing: -0.02em;
}

.page-subtitle {
  font-size: 1.125rem;
  color: #9ca3af;
  margin: 0;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

/* Light mode */
:root:not(.dark) .voice-settings-page,
html:not(.dark) .voice-settings-page {
  background: linear-gradient(180deg, #f9fafb 0%, #f3f4f6 100%);
}

:root:not(.dark) .page-title,
html:not(.dark) .page-title {
  background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

:root:not(.dark) .page-subtitle,
html:not(.dark) .page-subtitle {
  color: #6b7280;
}

/* Responsive */
@media (max-width: 640px) {
  .page-content {
    padding: 32px 16px;
  }

  .page-title {
    font-size: 1.875rem;
  }

  .header-badge {
    width: 56px;
    height: 56px;
    border-radius: 18px;
  }

  .header-badge svg {
    width: 28px;
    height: 28px;
  }
}
</style>
