import { ref, type ComputedRef } from 'vue'
import { usePagedSelection } from '../../../../composables/usePagedSelection'

export function useVocabularySelection(filteredVocabularies: ComputedRef<{ id: string }[]>) {
    const selection = usePagedSelection(filteredVocabularies)
    const showBulkAddToTabModal = ref(false)
    return {
        selectedVocabularyIds: selection.selectedIds,
        showBulkAddToTabModal,
        isAllVocabulariesSelected: selection.isAllSelected,
        toggleVocabularySelection: selection.toggleSelection,
        toggleSelectAll: selection.toggleSelectAll,
        clearSelection: selection.clearSelection,
        openBulkAddToTab: () => { showBulkAddToTabModal.value = true },
        closeBulkAddToTab: () => { showBulkAddToTabModal.value = false },
    }
}
