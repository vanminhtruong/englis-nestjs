<template>
  <div class="min-h-screen bg-white dark:bg-black p-4 md:p-8">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1
          class="text-4xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent mb-2"
        >
          {{ t("history.title") }}
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          {{ t("history.subtitle") }}
        </p>
      </div>

      <!-- Statistics Cards -->
      <StatisticsCards :statistics="statistics" />

      <!-- Bulk Actions -->
      <div
        v-if="filteredHistories.length > 0"
        class="bg-gradient-to-br from-white to-gray-50 dark:from-white/5 dark:to-white/[0.02] border border-gray-200 dark:border-white/10 rounded-2xl p-4 mb-6"
      >
        <div class="flex flex-wrap items-center gap-3">
          <!-- Select All Checkbox -->
          <label class="flex items-center gap-2 cursor-pointer">
            <CustomCheckbox
              :checked="isAllSelected"
              @change="toggleSelectAll"
            />
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
              {{ t("history.selectAll") }}
            </span>
          </label>

          <!-- Selected Count -->
          <span
            v-if="hasSelected"
            class="text-sm text-gray-600 dark:text-gray-400"
          >
            {{ t("history.selected", { count: selectedIds.size }) }}
          </span>

          <div class="flex-1"></div>

          <!-- Action Buttons -->
          <button
            v-if="hasSelected"
            @click="handleDeleteSelected"
            class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium transition-all flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <polyline points="3 6 5 6 21 6"></polyline>
              <path
                d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
              ></path>
            </svg>
            {{ t("history.deleteSelected") }}
          </button>

          <button
            @click="handleDeleteAll"
            class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-all flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <polyline points="3 6 5 6 21 6"></polyline>
              <path
                d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
              ></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
            {{ t("history.deleteAll") }}
          </button>
        </div>
      </div>

      <!-- Filters -->
      <HistoryFilters v-model="filter" />

      <!-- Loading -->
      <div v-if="loading" class="flex items-center justify-center py-24">
        <div class="relative">
          <div
            class="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"
          ></div>
          <div
            class="absolute inset-0 flex items-center justify-center font-bold text-xs text-primary-600"
          >
            ...
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <EmptyState v-else-if="filteredHistories.length === 0" />

      <!-- History List -->
      <HistoryList
        v-else
        :histories="filteredHistories"
        :format-time="formatTime"
        :format-date="formatDate"
        :selected-ids="selectedIds"
        @delete-history="deleteHistory"
        @toggle-selection="toggleSelection"
      />
      <Pagination
        v-if="filteredHistories.length > 0 && pageCount > 1"
        :page="page"
        :page-count="pageCount"
        @update:page="handlePageChange"
        @page-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useHistoryState } from "./composable/manager-state/useHistoryState";
import { useHistoryHandle } from "./composable/manager-handle/useHistoryHandle";
import { useHistoryMount } from "./composable/manager-mount/useHistoryMount";

// Components
const StatisticsCards = defineAsyncComponent(
  () => import("./component/StatisticsCards.vue") as any
);
const HistoryFilters = defineAsyncComponent(
  () => import("./component/HistoryFilters.vue") as any
);
const EmptyState = defineAsyncComponent(
  () => import("./component/EmptyState.vue") as any
);
const HistoryList = defineAsyncComponent(
  () => import("./component/HistoryList.vue") as any
);
const Pagination = defineAsyncComponent(
  () => import("../../components/Pagination.vue") as any
);
import CustomCheckbox from "../../components/CustomCheckbox.vue";

const { t } = useI18n();

// State
const {
  histories,
  statistics,
  loading,
  filter,
  filteredHistories,
  page,
  limit,
  pageCount,
  setMeta,
  setPage,
  selectedIds,
  isAllSelected,
  hasSelected,
  toggleSelectAll,
  toggleSelection,
  clearSelection,
} = useHistoryState();

// Handles
const {
  loadHistory,
  loadStatistics,
  handleNewHistory,
  handleHistoryDeleted,
  formatTime,
  formatDate,
  handleDeleteVocabulary,
  deleteHistory,
  deleteManyHistories,
  deleteAllHistories,
} = useHistoryHandle(
  histories,
  statistics,
  loading,
  filter,
  t,
  setMeta,
  page,
  limit
);

// Mount
useHistoryMount(
  loadHistory,
  loadStatistics,
  handleNewHistory,
  handleHistoryDeleted
);

function handlePageChange(p: number) {
  setPage(p);
  loadHistory(p);
}

async function handleDeleteSelected() {
  deleteManyHistories(Array.from(selectedIds.value), () => {
    clearSelection();
  });
}

async function handleDeleteAll() {
  deleteAllHistories(() => {
    clearSelection();
  });
}
</script>

<script lang="ts">
export default {
  name: "HistoryView",
};
</script>
