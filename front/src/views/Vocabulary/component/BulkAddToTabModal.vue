<template>
  <Transition
    enter-active-class="transition-opacity duration-200"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-150"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="show"
      class="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm sm:p-5"
      role="dialog"
      aria-modal="true"
      :aria-label="t('vocabulary.assignTabs')"
    >
      <div
        class="flex max-h-[calc(100dvh-1.5rem)] w-full min-w-0 max-w-md flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-white/10 dark:bg-black"
      >
        <div
          class="flex shrink-0 items-start justify-between gap-3 border-b border-gray-200 px-5 py-4 dark:border-white/10 sm:px-6"
        >
          <div class="min-w-0">
            <h2 class="text-lg font-bold text-gray-900 dark:text-white">
              {{ t("vocabulary.assignTabs") }}
            </h2>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {{ t("vocabulary.selectedItems", { count: vocabularyIds.length }) }}
              · {{ t("vocabulary.selectMultipleTabs") }}
            </p>
          </div>
          <button
            type="button"
            :disabled="saving"
            class="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/10"
            :aria-label="t('vocabulary.close')"
            @click="closeModal"
          >
            <svg
              class="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6">
          <div v-if="loading" class="flex justify-center py-10" role="status">
            <span
              class="h-8 w-8 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600 dark:border-primary-500/30 dark:border-t-primary-400"
            ></span>
          </div>
          <div
            v-else-if="!tabs.length"
            class="rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500 dark:border-white/15 dark:text-gray-400"
          >
            {{ t("vocabulary.noTabsToAssign") }}
          </div>
          <div v-else class="space-y-2">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              type="button"
              :aria-pressed="selectedTabIds.includes(tab.id)"
              :disabled="saving || !canSelectTab(tab.id)"
              class="flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-50"
              :class="
                selectedTabIds.includes(tab.id)
                  ? 'border-primary-300 bg-primary-50 dark:border-primary-500/50 dark:bg-primary-500/10'
                  : 'border-gray-200 bg-gray-50/60 hover:border-primary-200 hover:bg-primary-50/50 dark:border-white/10 dark:bg-white/5 dark:hover:border-primary-500/30'
              "
              @click="toggleTab(tab.id)"
            >
              <TabIcon :icon="tab.icon" size="md" />
              <span class="min-w-0 flex-1">
                <span class="block truncate text-sm font-semibold text-gray-900 dark:text-white">{{
                  tab.name
                }}</span>
                <span class="text-xs text-gray-500 dark:text-gray-400">{{
                  t("vocabulary.tabWordCount", { count: tab.vocabularies?.length ?? 0 })
                }}</span>
              </span>
              <span
                class="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2"
                :class="
                  selectedTabIds.includes(tab.id)
                    ? 'border-primary-600 bg-primary-600 text-white'
                    : 'border-gray-300 dark:border-gray-600'
                "
              >
                <svg
                  v-if="selectedTabIds.includes(tab.id)"
                  class="h-3.5 w-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="3"
                  aria-hidden="true"
                >
                  <path d="m5 12 4 4L19 6" />
                </svg>
              </span>
            </button>
          </div>
        </div>

        <div
          class="shrink-0 border-t border-gray-200 bg-gray-50 px-5 py-4 dark:border-white/10 dark:bg-white/5 sm:px-6"
        >
          <div
            class="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs font-medium text-gray-500 dark:text-gray-400"
          >
            <span>{{ t("vocabulary.selectedTabCount", { count: selectedTabIds.length }) }}</span>
            <span>{{ t("vocabulary.maxTabsPerWord", { count: MAX_TABS_PER_WORD }) }}</span>
          </div>
          <div class="grid grid-cols-2 items-stretch gap-2">
            <button
              type="button"
              :disabled="saving || !selectedTabIds.length"
              class="min-h-11 min-w-0 rounded-xl border border-gray-200 bg-white px-2 py-2 text-sm leading-tight break-words font-semibold text-gray-700 transition-colors hover:bg-gray-100 disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-gray-200 dark:hover:bg-white/10"
              @click="selectedTabIds = []"
            >
              {{ t("vocabulary.clear") }}
            </button>
            <button
              type="button"
              :disabled="loading || saving || !selectedTabIds.length || !vocabularyIds.length"
              class="inline-flex min-h-11 min-w-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 px-2 py-2 text-sm leading-tight break-words font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              @click="handleConfirm"
            >
              <span
                v-if="saving"
                class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
              ></span>
              {{ saving ? t("vocabulary.processingSelection") : t("vocabulary.assignTabs") }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import axios from "axios";
import { useI18n } from "vue-i18n";
import apiService from "../../../services/api.service";
import TabIcon from "../../../components/common/TabIcon.vue";
import { useToast } from "../../../composables/useToast";
import { useModalScrollLock } from "../../../composables/useModalScrollLock";
import { MAX_TABS_PER_WORD } from "../constants/tabLimits";

interface TabOption {
  id: string;
  name: string;
  icon?: string | null;
  vocabularies?: { id: string }[];
}

const props = defineProps<{ show: boolean; vocabularyIds: string[] }>();
const emit = defineEmits<{ close: []; saved: [] }>();
const { t } = useI18n();
const { showSuccess, showError } = useToast();
const { lockScroll, unlockScroll } = useModalScrollLock();
const tabs = ref<TabOption[]>([]);
const selectedTabIds = ref<string[]>([]);
const loading = ref(false);
const saving = ref(false);
let loadVersion = 0;

watch(
  () => props.show,
  (open) => {
    if (open) {
      lockScroll();
      selectedTabIds.value = [];
      void loadTabs();
    } else {
      unlockScroll();
      ++loadVersion;
    }
  },
  { immediate: true, flush: "sync" },
);

async function loadTabs() {
  const version = ++loadVersion;
  loading.value = true;
  try {
    const response = await apiService.tab.getAll();
    if (version === loadVersion) tabs.value = response.data;
  } catch (error) {
    if (version === loadVersion) {
      console.error("Could not load vocabulary tabs:", error);
      tabs.value = [];
      showError(t("vocabulary.tabLoadFailed"));
    }
  } finally {
    if (version === loadVersion) loading.value = false;
  }
}

function canSelectTab(tabId: string): boolean {
  if (selectedTabIds.value.includes(tabId)) return true;
  const selected = [...new Set(props.vocabularyIds)];
  return selected.every((vocabularyId) => {
    const current = new Set(
      tabs.value
        .filter((tab) => tab.vocabularies?.some((word) => word.id === vocabularyId))
        .map((tab) => tab.id),
    );
    const proposed = new Set([...current, ...selectedTabIds.value, tabId]);
    return proposed.size <= MAX_TABS_PER_WORD;
  });
}

function toggleTab(id: string) {
  if (saving.value) return;
  if (!canSelectTab(id)) {
    showError(t("vocabulary.maxTabsPerWord", { count: MAX_TABS_PER_WORD }));
    return;
  }
  selectedTabIds.value = selectedTabIds.value.includes(id)
    ? selectedTabIds.value.filter((value) => value !== id)
    : [...selectedTabIds.value, id];
}

function closeModal() {
  if (!saving.value) emit("close");
}

async function handleConfirm() {
  if (saving.value || !selectedTabIds.value.length || !props.vocabularyIds.length) return;
  saving.value = true;
  try {
    const result = await apiService.tab.assignMany(selectedTabIds.value, [
      ...new Set(props.vocabularyIds),
    ]);
    showSuccess(t("vocabulary.assignmentSuccess", { count: result.data.assignedCount }));
    emit("saved");
    emit("close");
  } catch (error) {
    console.error("Failed to assign vocabulary to tabs:", error);
    showError(
      axios.isAxiosError(error) && error.response?.status === 409
        ? t("vocabulary.maxTabsPerWord", { count: MAX_TABS_PER_WORD })
        : t("vocabulary.assignmentFailed"),
    );
  } finally {
    saving.value = false;
  }
}
</script>
