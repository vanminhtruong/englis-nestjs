import { ref, computed } from 'vue'
import type { History, HistoryStatistics, HistoryFilter } from '../../interface'

export function useHistoryState() {
  const histories = ref<History[]>([])
  const statistics = ref<HistoryStatistics | null>(null)
  const loading = ref(false)
  const page = ref(1)
  const limit = ref(6)
  const total = ref(0)
  const pageCount = ref(1)
  const filter = ref<HistoryFilter>({
    action: 'all',
    dateRange: 'all',
  })

  const filteredHistories = computed(() => {
    let result = [...histories.value]

    // Filter by action
    if (filter.value.action && filter.value.action !== 'all') {
      result = result.filter(h => h.action === filter.value.action)
    }

    // Filter by date range
    if (filter.value.dateRange && filter.value.dateRange !== 'all') {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

      result = result.filter(h => {
        const historyDate = new Date(h.createdAt)

        switch (filter.value.dateRange) {
          case 'today':
            return historyDate >= today
          case 'week':
            const weekAgo = new Date(today)
            weekAgo.setDate(weekAgo.getDate() - 7)
            return historyDate >= weekAgo
          case 'month':
            const monthAgo = new Date(today)
            monthAgo.setMonth(monthAgo.getMonth() - 1)
            return historyDate >= monthAgo
          default:
            return true
        }
      })
    }

    return result
  })

  const selectedIds = ref<Set<string>>(new Set())

  const isAllSelected = computed(() => {
    return filteredHistories.value.length > 0 &&
      filteredHistories.value.every(h => selectedIds.value.has(h.id))
  })

  const hasSelected = computed(() => selectedIds.value.size > 0)

  function setMeta(meta: { page: number; limit: number; total: number; pageCount: number }) {
    page.value = meta.page
    limit.value = meta.limit
    total.value = meta.total
    pageCount.value = meta.pageCount
  }

  function setPage(p: number) { page.value = p }
  function setLimit(l: number) { limit.value = l }

  function toggleSelection(id: string) {
    if (selectedIds.value.has(id)) {
      selectedIds.value.delete(id)
    } else {
      selectedIds.value.add(id)
    }
  }

  function toggleSelectAll() {
    if (isAllSelected.value) {
      selectedIds.value.clear()
    } else {
      filteredHistories.value.forEach(h => selectedIds.value.add(h.id))
    }
  }

  function clearSelection() {
    selectedIds.value.clear()
  }

  return {
    histories,
    statistics,
    loading,
    page,
    limit,
    total,
    pageCount,
    filter,
    filteredHistories,
    selectedIds,
    isAllSelected,
    hasSelected,
    setMeta,
    setPage,
    setLimit,
    toggleSelection,
    toggleSelectAll,
    clearSelection,
  }
}
