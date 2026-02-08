import { ref, watch } from 'vue'
import apiService from '../../../../services/api.service'
import { useToast } from '../../../../composables/useToast'

interface VocabularyFilter {
    categoryIds?: string[]
    tags?: string[]
    search?: string
    difficulty?: 'all' | 'easy' | 'medium' | 'hard'
    tabId?: string | null
    [key: string]: any
}

interface VocabularyStore {
    vocabularies: any[]
    page: number
    [key: string]: any
}

interface TabHandle {
    isAllTabHidden: { value: boolean }
    loadTabs: () => Promise<void>
}

interface SelectionHandle {
    clearSelection: () => void
}

interface FilterHandle {
    handlePageChange: (page: number) => void
}

export function useVocabularyAdvancedFilterHandle(
    filter: VocabularyFilter,
    store: VocabularyStore,
    tabHandle: TabHandle,
    selectionHandle: SelectionHandle,
    filterHandle: FilterHandle
) {
    const toast = useToast()

    // Settings state
    const isFiltersExpanded = ref(true)
    const isInitialized = ref(false)

    // Watch to initialize settings from DB
    watch(
        () => store.vocabularies,
        (newVal) => {
            if (newVal && newVal.length > 0 && !isInitialized.value) {
                // Check if settings are in DB
                const dbFilter = (newVal[0] as any).isFilterExpanded
                if (dbFilter !== undefined) {
                    isFiltersExpanded.value = dbFilter
                }

                const dbAllTab = (newVal[0] as any).isAllTabHidden
                if (dbAllTab !== undefined) {
                    tabHandle.isAllTabHidden.value = dbAllTab
                }

                isInitialized.value = true
            }
        },
        { deep: true, immediate: true }
    )

    // Handle filter toggle
    async function handleFilterToggle(value: boolean) {
        isFiltersExpanded.value = value
        try {
            await apiService.vocabulary.updateFilterState(value)
        } catch (error) {
            console.error('Failed to update filter state', error)
        }
    }

    // Handle category filter change
    function handleCategoryFilterChange(categoryIds: string[]) {
        filter.categoryIds = categoryIds
    }

    // Handle tag filter change
    function handleTagFilterChange(tags: string[]) {
        filter.tags = tags
    }

    // Handle bulk add saved
    async function handleBulkAddSaved() {
        selectionHandle.clearSelection()
        toast.showSuccess('Vocabularies added to tab successfully!')
        await tabHandle.loadTabs()
        filterHandle.handlePageChange(store.page)
    }

    return {
        isFiltersExpanded,
        isInitialized,
        handleFilterToggle,
        handleCategoryFilterChange,
        handleTagFilterChange,
        handleBulkAddSaved,
    }
}
