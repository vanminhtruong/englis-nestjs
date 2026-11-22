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
      :aria-label="title"
    >
      <div
        class="flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-white/10 dark:bg-black"
      >
        <div
          class="flex shrink-0 items-start justify-between gap-3 border-b border-gray-200 px-5 py-4 dark:border-white/10 sm:px-6"
        >
          <div class="min-w-0">
            <h2 class="text-lg font-bold text-gray-900 dark:text-white">{{ title }}</h2>
            <p class="mt-1 truncate text-sm text-gray-500 dark:text-gray-400">
              {{ vocabulary?.word }} · {{ t("vocabulary.selectMultipleTabs") }}
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
            v-else-if="tabs.length === 0"
            class="rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500 dark:border-white/15 dark:text-gray-400"
          >
            {{ t("vocabulary.noTabsToAssign") }}
          </div>
          <div v-else class="space-y-2">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              type="button"
              :disabled="
                saving || (selectedTabIds.size >= MAX_TABS_PER_WORD && !selectedTabIds.has(tab.id))
              "
              :aria-pressed="selectedTabIds.has(tab.id)"
              class="flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:opacity-60"
              :class="
                selectedTabIds.has(tab.id)
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
                  selectedTabIds.has(tab.id)
                    ? 'border-primary-600 bg-primary-600 text-white'
                    : 'border-gray-300 dark:border-gray-600'
                "
              >
                <svg
                  v-if="selectedTabIds.has(tab.id)"
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
            class="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500 dark:text-gray-400"
          >
            <span>{{ t("vocabulary.selectedTabCount", { count: selectedTabIds.size }) }}</span>
            <span
              class="font-semibold"
              :class="
                selectedTabIds.size >= MAX_TABS_PER_WORD ? 'text-gray-900 dark:text-white' : ''
              "
              >{{ selectedTabIds.size }}/{{ MAX_TABS_PER_WORD }}</span
            >
          </div>
          <p class="mb-3 text-xs text-gray-500 dark:text-gray-400" role="status">
            {{ t("vocabulary.maxTabsPerWord", { count: MAX_TABS_PER_WORD }) }}
          </p>
          <div class="grid grid-cols-2 items-stretch gap-3">
            <button
              type="button"
              :disabled="saving || loading || !hasChanges"
              class="inline-flex h-12 min-h-12 w-full min-w-0 shrink-0 items-center justify-center whitespace-nowrap rounded-xl border border-gray-200 bg-white px-4 py-0 text-sm font-semibold leading-none text-gray-700 shadow-sm transition-colors hover:bg-gray-100 disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-gray-200 dark:hover:bg-white/10"
              @click="resetSelection"
            >
              {{ t("vocabulary.undo") }}
            </button>
            <button
              type="button"
              :disabled="saving || loading || !vocabulary || !hasChanges"
              class="inline-flex h-12 min-h-12 w-full min-w-0 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 px-4 py-0 text-sm font-semibold leading-none text-white shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              @click="saveChanges"
            >
              <span
                v-if="saving"
                class="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
              ></span>
              {{ saving ? t("vocabulary.processingSelection") : t("vocabulary.save") }}
            </button>
          </div>
          <p class="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
            {{ t("vocabulary.keepWordsInAll") }}
          </p>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
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

const props = defineProps<{
  show: boolean;
  vocabulary: { id: string; word: string } | null;
  title: string;
}>();
const emit = defineEmits<{ close: []; saved: [] }>();
const { t } = useI18n();
const { showSuccess, showError } = useToast();
const { lockScroll, unlockScroll } = useModalScrollLock();

const tabs = ref<TabOption[]>([]);
const selectedTabIds = ref(new Set<string>());
const originalTabIds = ref(new Set<string>());
const loading = ref(false);
const saving = ref(false);
let loadVersion = 0;

const hasChanges = computed(
  () =>
    selectedTabIds.value.size !== originalTabIds.value.size ||
    [...selectedTabIds.value].some((id) => !originalTabIds.value.has(id)),
);

watch(
  () => [props.show, props.vocabulary?.id] as const,
  ([open]) => {
    if (open) {
      lockScroll();
      void loadData();
    } else {
      unlockScroll();
      ++loadVersion;
    }
  },
  { immediate: true, flush: "sync" },
);

async function loadData() {
  if (!props.vocabulary) return;
  const version = ++loadVersion;
  loading.value = true;
  tabs.value = [];
  selectedTabIds.value = new Set();
  originalTabIds.value = new Set();
  try {
    const response = await apiService.tab.getAll();
    if (version !== loadVersion) return;
    tabs.value = response.data;
    const memberIds = tabs.value
      .filter((tab) => tab.vocabularies?.some((word) => word.id === props.vocabulary?.id))
      .map((tab) => tab.id);
    originalTabIds.value = new Set(memberIds);
    selectedTabIds.value = new Set(memberIds);
  } catch (error) {
    if (version === loadVersion) {
      console.error("Could not load vocabulary tabs:", error);
      showError(t("vocabulary.tabLoadFailed"));
    }
  } finally {
    if (version === loadVersion) loading.value = false;
  }
}

function toggleTab(id: string) {
  if (saving.value) return;
  if (!selectedTabIds.value.has(id) && selectedTabIds.value.size >= MAX_TABS_PER_WORD) {
    showError(t("vocabulary.maxTabsPerWord", { count: MAX_TABS_PER_WORD }));
    return;
  }
  const updated = new Set(selectedTabIds.value);
  if (updated.has(id)) updated.delete(id);
  else updated.add(id);
  selectedTabIds.value = updated;
}

function resetSelection() {
  if (!saving.value) selectedTabIds.value = new Set(originalTabIds.value);
}

function closeModal() {
  if (!saving.value) emit("close");
}

async function saveChanges() {
  if (saving.value || !props.vocabulary || !hasChanges.value) return;
  saving.value = true;
  const vocabId = props.vocabulary.id;
  try {
    // Replace the complete selection atomically. Swapping a tab at the limit
    // must not temporarily create a fourth membership or partially save.
    await apiService.tab.replaceForVocabulary(vocabId, [...selectedTabIds.value]);
    showSuccess(t("vocabulary.tabsUpdated"));
    emit("saved");
    emit("close");
  } catch (error) {
    console.error("Failed to update vocabulary tabs:", error);
    showError(
      axios.isAxiosError(error) && error.response?.status === 409
        ? t("vocabulary.maxTabsPerWord", { count: MAX_TABS_PER_WORD })
        : t("vocabulary.assignmentFailed"),
    );
    await loadData();
  } finally {
    saving.value = false;
  }
}
</script>
