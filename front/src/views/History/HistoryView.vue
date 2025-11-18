<template>
  <div class="min-h-screen bg-white dark:bg-black p-4 md:p-8">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent mb-2">
          {{ t('history.title') }}
        </h1>
        <p class="text-gray-600 dark:text-gray-400">{{ t('history.subtitle') }}</p>
      </div>

      <!-- Statistics Cards -->
      <StatisticsCards :statistics="statistics" />

      <!-- Filters -->
      <HistoryFilters v-model="filter" />

      <!-- Loading -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>

      <!-- Empty State -->
      <EmptyState v-else-if="filteredHistories.length === 0" />

      <!-- History List -->
      <HistoryList
        v-else
        :histories="filteredHistories"
        :format-time="formatTime"
        :format-date="formatDate"
        @delete-history="deleteHistory"
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
import { defineAsyncComponent, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useHistoryState } from './composable/manager-state/useHistoryState'
import { useHistoryHandle } from './composable/manager-handle/useHistoryHandle'
import { useHistoryMount } from './composable/manager-mount/useHistoryMount'

// Components
const StatisticsCards = defineAsyncComponent(() => import('./component/StatisticsCards.vue') as any)
const HistoryFilters = defineAsyncComponent(() => import('./component/HistoryFilters.vue') as any)
const EmptyState = defineAsyncComponent(() => import('./component/EmptyState.vue') as any)
const HistoryList = defineAsyncComponent(() => import('./component/HistoryList.vue') as any)
const Pagination = defineAsyncComponent(() => import('../../components/Pagination.vue') as any)

const { t } = useI18n()

// State
const { histories, statistics, loading, filter, filteredHistories, page, limit, pageCount, setMeta, setPage } = useHistoryState()

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
} = useHistoryHandle(
  histories,
  statistics,
  loading,
  filter,
  t,
  setMeta,
  page,
  limit
)

// Mount
useHistoryMount(loadHistory, loadStatistics, handleNewHistory, handleHistoryDeleted)

function handlePageChange(p: number) {
  setPage(p)
  loadHistory(p)
}
</script>

<script lang="ts">
export default {
  name: 'HistoryView'
}
</script>
