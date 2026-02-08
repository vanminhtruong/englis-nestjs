import { ref, computed, type Ref, type ComputedRef } from 'vue'

interface Vocabulary {
    id: string
    [key: string]: any
}

export function useVocabularySelection(filteredVocabularies: ComputedRef<Vocabulary[]>) {
    const selectedVocabularyIds = ref<string[]>([])
    const showBulkAddToTabModal = ref(false)

    const isAllVocabulariesSelected = computed(() => {
        const vocabs = filteredVocabularies.value
        return (
            vocabs.length > 0 &&
            vocabs.every((v) => selectedVocabularyIds.value.includes(v.id))
        )
    })

    function toggleVocabularySelection(id: string) {
        const index = selectedVocabularyIds.value.indexOf(id)
        if (index === -1) {
            selectedVocabularyIds.value.push(id)
        } else {
            selectedVocabularyIds.value.splice(index, 1)
        }
    }

    function toggleSelectAll() {
        const vocabs = filteredVocabularies.value
        if (isAllVocabulariesSelected.value) {
            // Deselect all current page items
            vocabs.forEach((v) => {
                const index = selectedVocabularyIds.value.indexOf(v.id)
                if (index !== -1) {
                    selectedVocabularyIds.value.splice(index, 1)
                }
            })
        } else {
            // Select all current page items
            vocabs.forEach((v) => {
                if (!selectedVocabularyIds.value.includes(v.id)) {
                    selectedVocabularyIds.value.push(v.id)
                }
            })
        }
    }

    function clearSelection() {
        selectedVocabularyIds.value = []
    }

    function openBulkAddToTab() {
        showBulkAddToTabModal.value = true
    }

    function closeBulkAddToTab() {
        showBulkAddToTabModal.value = false
    }

    return {
        selectedVocabularyIds,
        showBulkAddToTabModal,
        isAllVocabulariesSelected,
        toggleVocabularySelection,
        toggleSelectAll,
        clearSelection,
        openBulkAddToTab,
        closeBulkAddToTab,
    }
}
