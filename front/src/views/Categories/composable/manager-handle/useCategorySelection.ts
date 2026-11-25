import { ref, watch, type Ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePagedSelection } from '../../../../composables/usePagedSelection'
import { useToast } from '../../../../composables/useToast'
import { websocketService } from '../../../../services/websocket.service'
import { useAuthStore } from '../../../../stores/auth.store'
import { onMounted, onUnmounted } from 'vue'
import { categoriesService } from '../../service/categories.service'
import type { Category, CategoryBulkAction, CategoryFilters } from '../../interface/category.interface'

export function useCategorySelection(items: Ref<Category[]>, filters: CategoryFilters, refresh: () => void) {
  const selection = usePagedSelection(items)
  const busy = ref(false)
  const mode = ref(false)
  let selectionSession = 0
  function exitMode() {
    if (busy.value) return
    selectionSession++
    selection.clearSelection()
    mode.value = false
  }
  function toggleMode() {
    if (busy.value) return
    if (mode.value) exitMode()
    else { selectionSession++; mode.value = true }
  }
  function toggleSelection(id: string) {
    if (mode.value && !busy.value) selection.toggleSelection(id)
  }
  function toggleSelectAll() {
    if (mode.value && !busy.value) selection.toggleSelectAll()
  }
  const { t } = useI18n()
  const { confirm, showSuccess, showError } = useToast()
  const auth = useAuthStore()
  // Never carry hidden selections into a different filter/search result.
  watch(() => JSON.stringify(filters), () => { selectionSession++; selection.clearSelection() }, { flush: 'sync' })
  const onDelete = (data: { id?: string }) => { if (data?.id) selection.removeIds([data.id]) }
  const onBulkChanged = (data: { action?: string; ids?: string[]; userId?: string }) => {
    if (data?.userId === auth.user?.id && data.action === 'delete' && Array.isArray(data.ids)) selection.removeIds(data.ids)
  }
  onMounted(() => {
    websocketService.on('category:deleted', onDelete)
    websocketService.on('category:bulk-changed', onBulkChanged)
  })
  onUnmounted(() => {
    websocketService.off('category:deleted', onDelete)
    websocketService.off('category:bulk-changed', onBulkChanged)
  })
  async function execute(action: CategoryBulkAction, ids: string[]) {
    if (busy.value || !ids.length) return
    busy.value = true
    try {
      const result = await categoriesService.bulk(action, ids)
      selection.removeIds(result.processedIds)
      if (result.processedIds.length) showSuccess(t('categories.bulkSuccess', { count: result.processedIds.length }))
      if (result.failedIds.length) showError(t('categories.bulkFailed', { count: result.failedIds.length }))
      refresh()
    } catch {
      showError(t('categories.bulkFailed', { count: ids.length }))
      refresh()
    } finally { busy.value = false }
  }
  function run(action: CategoryBulkAction) {
    if (busy.value) return
    const ids = [...selection.selectedIds.value]
    if (!ids.length) return
    if (action === 'delete') {
      const session = selectionSession
      confirm(t('categories.bulkDeleteConfirm', { count: ids.length }), async () => {
        // If filters or selection changed while the confirmation was open, do not delete unseen items.
        if (!mode.value || session !== selectionSession) return
        const current = new Set(selection.selectedIds.value)
        await execute(action, ids.filter(id => current.has(id)))
      }, { label: t('categories.delete'), type: 'error' })
    } else void execute(action, ids)
  }
  return { ...selection, mode, busy, run, exitMode, toggleMode, toggleSelection, toggleSelectAll }
}
