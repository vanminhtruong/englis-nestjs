import { historyService } from '../../service/history.service'
import type { History, HistoryFilter } from '../../interface'
import apiService from '../../../../services/api.service'
import type { Ref } from 'vue'

import { useToast } from '../../../../composables/useToast'

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
  const toast = useToast()

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
    console.log('=== Received new history via WebSocket ===');
    console.log('History:', history);

    // Check duplicate trước khi thêm
    const existingIndex = histories.value.findIndex((h: History) => h.id === history.id)
    console.log('Existing index:', existingIndex);

    if (existingIndex === -1) {
      // Add new history to the beginning of the list
      histories.value.unshift(history)
      console.log('History added to list, total:', histories.value.length);

      // Reload statistics to update counts
      loadStatistics()
    } else {
      console.log('History already exists, skipping');
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
    toast.confirm(t('history.confirmDelete'), async () => {
      const result = await historyService.deleteHistory(id)
      if (result.success) {
        handleHistoryDeleted(id)
        toast.showSuccess(t('history.deleteSuccess'))
      } else {
        toast.showError(result.error || 'Failed to delete history')
      }
    }, { type: 'error', label: t('history.actions.delete') })
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
    toast.confirm(t('history.confirmDelete') + (word ? ` "${word}"?` : '?'), async () => {
      try {
        await apiService.vocabulary.delete(vocabularyId)
        await loadStatistics()
        toast.showSuccess(t('history.deleteSuccess'))
      } catch (error: any) {
        console.error('Failed to delete vocabulary:', error)
        toast.showError(error.response?.data?.message || 'Failed to delete vocabulary')
      }
    }, { type: 'error', label: t('history.actions.delete') })
  }

  const deleteManyHistories = (ids: string[], onSuccess?: () => void) => {
    toast.confirm(t('history.confirmDeleteMany', { count: ids.length }), async () => {
      const result = await historyService.deleteMany(ids)
      if (result.success) {
        // Remove deleted histories from list
        ids.forEach(id => handleHistoryDeleted(id))
        if (onSuccess) onSuccess()
        toast.showSuccess(t('history.deleteSuccess'))
      } else {
        toast.showError(result.error || 'Failed to delete histories')
      }
    }, { type: 'error', label: t('history.actions.delete') })
  }

  const deleteAllHistories = (onSuccess?: () => void) => {
    toast.confirm(t('history.confirmDeleteAll'), async () => {
      const result = await historyService.deleteAll()
      if (result.success) {
        // Clear all histories and reload
        histories.value = []
        await loadHistory()
        await loadStatistics()
        if (onSuccess) onSuccess()
        toast.showSuccess(t('history.deleteSuccess'))
      } else {
        toast.showError(result.error || 'Failed to delete all histories')
      }
    }, { type: 'error', label: t('history.actions.delete') })
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
    deleteManyHistories,
    deleteAllHistories,
  }
}
