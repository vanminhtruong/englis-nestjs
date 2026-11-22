<template>
  <details
    class="mt-4 rounded-2xl border border-black/10 bg-white p-3 text-black dark:border-white/10 dark:bg-white/5 dark:text-white"
    :open="!hasEndpoint || undefined"
  >
    <summary
      class="flex min-h-9 cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-2 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-black/30 dark:focus-visible:ring-white/30"
    >
      <span class="flex items-center gap-2">
        <svg
          class="h-4 w-4 shrink-0 text-black/60 dark:text-white/60"
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
        >
          <path d="M4 7h16v10H4zM8 20h8M12 17v3M7 11h.01" />
        </svg>
        {{ t("serverConnection.title") }}
      </span>
      <span class="text-xs font-medium text-black/50 dark:text-white/60">
        {{ hasEndpoint ? t("serverConnection.configured") : t("serverConnection.required") }}
      </span>
    </summary>

    <form class="space-y-3 px-2 pb-2 pt-3" @submit.prevent="saveEndpoint">
      <p class="text-xs leading-5 text-black/60 dark:text-white/60">
        {{ t("serverConnection.description") }}
      </p>

      <label
        for="tailscale-server-url"
        class="block text-xs font-semibold text-black/80 dark:text-white/85"
      >
        {{ t("serverConnection.addressLabel") }}
      </label>
      <input
        id="tailscale-server-url"
        v-model.trim="draft"
        type="url"
        autocomplete="url"
        inputmode="url"
        spellcheck="false"
        :placeholder="t('serverConnection.placeholder')"
        class="h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm text-black outline-none placeholder:text-black/40 focus:border-black/40 focus:ring-2 focus:ring-black/10 dark:border-white/15 dark:bg-black dark:text-white dark:placeholder:text-white/40 dark:focus:border-white/40 dark:focus:ring-white/10"
      />

      <p v-if="error" role="alert" class="text-xs text-red-600 dark:text-red-300">{{ error }}</p>
      <div class="flex flex-wrap items-center gap-2">
        <button
          type="submit"
          class="inline-flex min-h-10 flex-1 items-center justify-center rounded-xl bg-black px-4 text-xs font-bold text-white transition hover:bg-black/85 dark:bg-white/20 dark:text-white dark:hover:bg-white/30"
        >
          {{ t("serverConnection.save") }}
        </button>
        <button
          v-if="savedOverride"
          type="button"
          class="inline-flex min-h-10 items-center justify-center rounded-xl border border-black/10 bg-black/5 px-3 text-xs font-semibold text-black/70 transition hover:bg-black/10 dark:border-white/10 dark:bg-white/10 dark:text-white/75 dark:hover:bg-white/20"
          @click="resetEndpoint"
        >
          {{ t("serverConnection.reset") }}
        </button>
      </div>
      <p class="text-[11px] leading-5 text-black/50 dark:text-white/50">
        {{ t("serverConnection.privacy") }}
      </p>
    </form>
  </details>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { API_URL } from "../../services/api.service";
import {
  BACKEND_URL_STORAGE_KEY,
  normalizeTailscaleBackendUrl,
  readConfiguredBackendUrl,
} from "../../utils/backendUrl";

const { t } = useI18n();
const savedOverride = ref(!!readConfiguredBackendUrl());
const hasEndpoint = ref(!!API_URL);
const draft = ref("");
const error = ref("");

function saveEndpoint() {
  const normalized = normalizeTailscaleBackendUrl(draft.value);
  if (!normalized) {
    error.value = t("serverConnection.invalid");
    return;
  }
  try {
    window.localStorage.setItem(BACKEND_URL_STORAGE_KEY, normalized);
    // Reinitializes API and WebSocket clients with the new endpoint.
    window.location.reload();
  } catch {
    error.value = t("serverConnection.storageFailed");
  }
}

function resetEndpoint() {
  window.localStorage.removeItem(BACKEND_URL_STORAGE_KEY);
  window.location.reload();
}
</script>
