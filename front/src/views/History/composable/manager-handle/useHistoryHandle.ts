import { historyService } from '../../service/history.service'
import type { History, HistoryFilter } from '../../interface'
import apiService from '../../../../services/api.service'
import type { Ref } from 'vue'

export function useHistoryHandle(
  histories: any,
  statistics: any,
  loading: any,
  filter: any,
  t: any,
  setMeta: (meta: { page: number; limit: number; total: number; pageCount: number }) => void,
  page: { value: number },
  limit: { value: number },
) {
  const loadHistory = async (p?: number) => {
    loading.value = true
    try {
      const result = await historyService.loadHistory({
        page: p ?? page.value,
        limit: limit.value,
      })
      if (result.success && result.data) {
        histories.value = result.data
        if (result.meta) setMeta(result.meta)
      }
    } finally {
      loading.value = false
    }
  }

  const loadStatistics = async () => {
    const result = await historyService.loadStatistics()
    if (result.success && result.data) {
      statistics.value = result.data
    }
  }

  const handleNewHistory = (history: History) => {
    // Check duplicate trước khi thêm
    const existingIndex = histories.value.findIndex((h: History) => h.id === history.id)
    if (existingIndex === -1) {
      // Add new history to the beginning of the list
      histories.value.unshift(history)
      // Reload statistics to update counts
      loadStatistics()
    }
  }

  const handleHistoryDeleted = (historyId: string) => {
    // Remove history from the list
    const index = histories.value.findIndex((h: History) => h.id === historyId)
    if (index !== -1) {
      histories.value.splice(index, 1)
    }
    // Reload statistics to update counts
    loadStatistics()

    // Nếu sau khi xóa trang hiện tại không còn item nào
    // thì gọi lại API để load trang phù hợp (mô phỏng hành vi F5)
    if (histories.value.length === 0) {
      const targetPage = page.value > 1 ? page.value - 1 : 1
      // Không cần await, để tránh thay đổi kiểu trả về của callback
      loadHistory(targetPage)
    }
  }

  const deleteHistory = async (id: string) => {
    const result = await historyService.deleteHistory(id)
    if (result.success) {
      handleHistoryDeleted(id)
    }
    return result
  }

  const setFilter = (newFilter: Partial<HistoryFilter>) => {
    filter.value = { ...filter.value, ...newFilter }
  }

  const formatTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds}s`
    }
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  const formatDate = (date: string): string => {
    const d = new Date(date)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - d.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return 'Today'
    } else if (diffDays === 1) {
      return 'Yesterday'
    } else if (diffDays < 7) {
      return `${diffDays} days ago`
    } else {
      return d.toLocaleDateString()
    }
  }

  const handleDeleteVocabulary = async (vocabularyId: string, word?: string) => {
    if (!confirm(t('history.confirmDelete') + (word ? ` "${word}"?` : '?'))) {
      return
    }

    try {
      await apiService.vocabulary.delete(vocabularyId)
      await loadStatistics()
    } catch (error) {
      console.error('Failed to delete vocabulary:', error)
      alert('Failed to delete vocabulary')
    }
  }

  return {
    loadHistory,
    loadStatistics,
    handleNewHistory,
    handleHistoryDeleted,
    deleteHistory,
    setFilter,
    formatTime,
    formatDate,
    handleDeleteVocabulary,
  }
}
