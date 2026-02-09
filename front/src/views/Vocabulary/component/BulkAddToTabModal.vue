<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <!-- Backdrop -->
      <div
        class="absolute inset-0 bg-black/50 backdrop-blur-sm"
        @click="$emit('close')"
      ></div>

      <!-- Modal -->
      <div
        class="relative bg-white dark:bg-black rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200 dark:border-white/10"
      >
        <!-- Header -->
        <div
          class="p-6 border-b border-gray-200 dark:border-white/10 bg-gradient-to-r from-primary-500/10 to-secondary-500/10"
        >
          <div class="flex items-center justify-between">
            <div>
              <h2
                class="text-xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent"
              >
                Add to Tab
              </h2>
              <p class="text-sm text-gray-500 dark:text-white/50 mt-1">
                {{ vocabularyCount }} item{{ vocabularyCount > 1 ? "s" : "" }}
                selected
              </p>
            </div>
            <button
              @click="$emit('close')"
              class="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="text-gray-500 dark:text-white/60"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        <!-- Tab List -->
        <div class="p-4 max-h-[300px] overflow-y-auto">
          <div v-if="loading" class="flex items-center justify-center py-8">
            <div
              class="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"
            ></div>
          </div>

          <div v-else-if="tabs.length === 0" class="text-center py-8">
            <div class="text-4xl mb-3">📁</div>
            <p class="text-gray-500 dark:text-white/50">No tabs available</p>
            <p class="text-sm text-gray-400 dark:text-white/30 mt-1">
              Create a tab first to organize your vocabularies
            </p>
          </div>

          <div v-else class="space-y-2">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="selectTab(tab)"
              class="w-full flex items-center gap-3 p-4 rounded-xl transition-all text-left group"
              :class="
                selectedTabId === tab.id
                  ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg shadow-primary-500/25'
                  : 'bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10'
              "
            >
              <div
                class="w-10 h-10 rounded-xl flex items-center justify-center"
                :class="
                  selectedTabId === tab.id
                    ? 'bg-white/20'
                    : 'bg-gradient-to-r from-primary-500/20 to-secondary-500/20'
                "
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  :class="
                    selectedTabId === tab.id ? 'text-white' : 'text-primary-500'
                  "
                >
                  <path
                    d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"
                  ></path>
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <p
                  class="font-medium truncate"
                  :class="
                    selectedTabId === tab.id
                      ? 'text-white'
                      : 'text-black dark:text-white'
                  "
                >
                  {{ tab.name }}
                </p>
                <p
                  class="text-xs truncate"
                  :class="
                    selectedTabId === tab.id
                      ? 'text-white/70'
                      : 'text-gray-500 dark:text-white/50'
                  "
                >
                  {{ tab.vocabularies?.length || 0 }} items
                </p>
              </div>
              <div
                v-if="selectedTabId === tab.id"
                class="w-6 h-6 rounded-full bg-white/30 flex items-center justify-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="3"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="text-white"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
            </button>
          </div>
        </div>

        <!-- Footer -->
        <div
          class="p-4 border-t border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5"
        >
          <div class="flex gap-3">
            <button
              @click="$emit('close')"
              class="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 text-gray-600 dark:text-white/60 font-medium hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
            >
              Cancel
            </button>
            <button
              @click="handleConfirm"
              :disabled="!selectedTabId || saving"
              class="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-medium hover:shadow-lg hover:shadow-primary-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <div
                v-if="saving"
                class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
              ></div>
              <span>{{ saving ? "Adding..." : "Add to Tab" }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import apiService from "../../../services/api.service";
import { useToast } from "../../../composables/useToast";

const props = defineProps<{
  show: boolean;
  vocabularyIds: string[];
}>();

const emit = defineEmits<{
  close: [];
  saved: [];
}>();

const { t } = useI18n();
const { showSuccess, showWarning, showError } = useToast();

const tabs = ref<any[]>([]);
const loading = ref(false);
const saving = ref(false);
const selectedTabId = ref<string | null>(null);

const vocabularyCount = ref(0);

watch(
  () => props.vocabularyIds,
  (ids) => {
    vocabularyCount.value = ids.length;
  },
  { immediate: true }
);

watch(
  () => props.show,
  async (newVal) => {
    if (newVal) {
      selectedTabId.value = null;
      await loadTabs();
    }
  }
);

async function loadTabs() {
  loading.value = true;
  try {
    const response = await apiService.tab.getAll();
    tabs.value = response.data;
  } catch (error) {
    console.error("Failed to load tabs:", error);
  } finally {
    loading.value = false;
  }
}

function selectTab(tab: any) {
  selectedTabId.value = tab.id;
}

async function handleConfirm() {
  if (!selectedTabId.value || props.vocabularyIds.length === 0) return;

  saving.value = true;
  try {
    const promises = props.vocabularyIds.map((vocabId) =>
      apiService.tab
        .addVocabulary(selectedTabId.value!, vocabId)
        .then((value) => ({ status: "fulfilled", value }))
        .catch((reason) => ({ status: "rejected", reason }))
    );

    const results = await Promise.all(promises);

    const successful = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected");
    const duplicates = failed.filter(
      (r: any) => r.reason?.response?.status === 409
    ).length;

    if (successful > 0) {
      showSuccess(t("vocabulary.addedToTabSuccess", { count: successful }));
    }

    if (duplicates > 0) {
      showWarning(
        t("vocabulary.addToTabDuplicateWarning", { count: duplicates })
      );
    } else if (failed.length > 0) {
      showError(t("vocabulary.addToTabPartialError"));
    }

    emit("saved");
    emit("close");
  } catch (error) {
    console.error("Failed to add vocabularies to tab:", error);
    showError(t("vocabulary.unknownError"));
  } finally {
    saving.value = false;
  }
}

onMounted(() => {
  if (props.show) {
    loadTabs();
  }
});
</script>
