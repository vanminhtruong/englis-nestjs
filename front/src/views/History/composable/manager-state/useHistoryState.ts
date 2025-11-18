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

  function setMeta(meta: { page: number; limit: number; total: number; pageCount: number }) {
    page.value = meta.page
    limit.value = meta.limit
    total.value = meta.total
    pageCount.value = meta.pageCount
  }

  function setPage(p: number) { page.value = p }
  function setLimit(l: number) { limit.value = l }

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
    setMeta,
    setPage,
    setLimit,
  }
}
