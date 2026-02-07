<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
  >
    <div
      class="bg-white dark:bg-black rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh]"
    >
      <!-- Header -->
      <div
        class="p-6 border-b border-black/10 dark:border-white/10 flex items-center justify-between"
      >
        <h3 class="text-xl font-bold text-black dark:text-white">
          {{ title }}
        </h3>
        <button
          @click="$emit('close')"
          class="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="p-6 overflow-y-auto flex-1">
        <div v-if="loading" class="flex justify-center py-8">
          <div
            class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"
          ></div>
        </div>

        <div
          v-else-if="tabs.length === 0"
          class="text-center py-8 text-black/60 dark:text-white/60"
        >
          No tabs available. Create one first!
        </div>

        <div v-else class="space-y-2">
          <div
            v-for="tab in tabs"
            :key="tab.id"
            class="flex items-center justify-between p-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors"
            @click="toggleTab(tab.id)"
          >
            <span class="font-medium text-black dark:text-white">{{
              tab.name
            }}</span>
            <div
              class="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors"
              :class="
                isTabSelected(tab.id)
                  ? 'bg-primary-500 border-primary-500'
                  : 'border-gray-300 dark:border-white/30'
              "
            >
              <svg
                v-if="isTabSelected(tab.id)"
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
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div
        class="p-6 border-t border-black/10 dark:border-white/10 flex justify-end gap-3"
      >
        <button
          @click="$emit('close')"
          class="px-4 py-2 font-medium text-black/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-colors"
        >
          Cancel
        </button>
        <button
          @click="saveChanges"
          :disabled="saving"
          class="px-6 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold rounded-xl hover:shadow-lg disabled:opacity-50 transition-all flex items-center gap-2"
        >
          <span
            v-if="saving"
            class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"
          ></span>
          Save Changes
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, defineEmits } from "vue";
import apiService from "../../../services/api.service";

const props = defineProps<{
  show: boolean;
  vocabulary: any;
  title: string;
}>();

const emit = defineEmits<{
  close: [];
  saved: [];
}>();

const tabs = ref<any[]>([]);
const selectedTabIds = ref<Set<string>>(new Set());
const loading = ref(false);
const saving = ref(false);

// Load tabs and check which ones contain the vocabulary
const loadData = async () => {
  if (!props.vocabulary) return;

  loading.value = true;
  try {
    const response = await apiService.tab.getAll();
    tabs.value = response.data;

    // Check membership for each tab
    const currentMemberTabs = tabs.value
      .filter((t) =>
        t.vocabularies?.some((v: any) => v.id === props.vocabulary.id)
      )
      .map((t) => t.id);

    selectedTabIds.value = new Set(currentMemberTabs);
  } catch (error) {
    console.error("Failed to load tabs:", error);
  } finally {
    loading.value = false;
  }
};

watch(
  () => props.show,
  (newVal) => {
    if (newVal) {
      loadData();
    } else {
      selectedTabIds.value = new Set();
      tabs.value = [];
    }
  }
);

const isTabSelected = (id: string) => selectedTabIds.value.has(id);

const toggleTab = (id: string) => {
  const newSet = new Set(selectedTabIds.value);
  if (newSet.has(id)) {
    newSet.delete(id);
  } else {
    newSet.add(id);
  }
  selectedTabIds.value = newSet;
};

const saveChanges = async () => {
  if (!props.vocabulary) return;

  saving.value = true;
  try {
    // Determine changes
    const originalMemberTabs = tabs.value
      .filter((t) =>
        t.vocabularies?.some((v: any) => v.id === props.vocabulary.id)
      )
      .map((t) => t.id);
    const originalSet = new Set(originalMemberTabs);

    const toAdd = [...selectedTabIds.value].filter(
      (id) => !originalSet.has(id)
    );
    const toRemove = [...originalSet].filter(
      (id) => !selectedTabIds.value.has(id)
    );

    // Execute updates
    const promises = [
      ...toAdd.map((tabId) =>
        apiService.tab.addVocabulary(tabId, props.vocabulary.id)
      ),
      ...toRemove.map((tabId) =>
        apiService.tab.removeVocabulary(tabId, props.vocabulary.id)
      ),
    ];

    await Promise.all(promises);
    emit("saved");
    emit("close");
  } catch (error) {
    console.error("Failed to save tab changes:", error);
  } finally {
    saving.value = false;
  }
};
</script>
