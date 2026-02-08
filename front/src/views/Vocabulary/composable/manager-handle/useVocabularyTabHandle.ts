import { ref, watch, type Ref } from 'vue'
import apiService from '../../../../services/api.service'
import { useToast } from '../../../../composables/useToast'

interface Tab {
    id: string
    name: string
    [key: string]: any
}

interface VocabularyFilter {
    tabId?: string | null
    [key: string]: any
}

export function useVocabularyTabHandle(
    vocabularyFilter: VocabularyFilter,
    onPageChange: (page: number) => void,
    getCurrentPage: () => number
) {
    const toast = useToast()

    const tabs = ref<Tab[]>([])
    const activeTabId = ref<string | null>(localStorage.getItem('activeTabId'))
    const isAllTabHidden = ref(localStorage.getItem('isAllTabHidden') === 'true')

    // Tab name modal state
    const showTabNameModal = ref(false)
    const isEditingTab = ref(false)
    const editingTabName = ref('')
    const editingTabId = ref<string | null>(null)

    // Tab manager modal state
    const showTabManagerModal = ref(false)
    const selectedVocabForTabs = ref<any>(null)

    // Apply initial tab to filter
    if (activeTabId.value) {
        vocabularyFilter.tabId = activeTabId.value
    }

    // Watch for tabs loading to handle initial selection if All is hidden or if current tab is invalid
    watch(
        [tabs, isAllTabHidden, activeTabId],
        ([newTabs, allHidden, currentTab]) => {
            // Case 1: All Vocabularies is hidden and no custom tab selected
            if (allHidden && currentTab === null && newTabs && newTabs.length > 0) {
                const firstTab = newTabs[0]
                if (firstTab) {
                    handleTabSelect(firstTab.id)
                }
                return
            }

            // Case 2: Current tab ID is not in the list of tabs (e.g. was deleted)
            if (currentTab !== null && newTabs && newTabs.length > 0) {
                const exists = newTabs.some((t) => t.id === currentTab)
                if (!exists) {
                    if (allHidden) {
                        const firstTab = newTabs[0]
                        if (firstTab) {
                            handleTabSelect(firstTab.id)
                        }
                    } else {
                        handleTabSelect(null)
                    }
                }
            }
        },
        { immediate: true }
    )

    async function loadTabs() {
        try {
            const response = await apiService.tab.getAll()
            tabs.value = response.data
        } catch (error) {
            console.error('Failed to load tabs:', error)
        }
    }

    function handleTabSelect(tabId: string | null) {
        activeTabId.value = tabId
        if (tabId) {
            localStorage.setItem('activeTabId', tabId)
        } else {
            localStorage.removeItem('activeTabId')
        }
        vocabularyFilter.tabId = tabId
    }

    async function handleAllTabToggle(value: boolean) {
        isAllTabHidden.value = value
        localStorage.setItem('isAllTabHidden', String(value))

        try {
            await apiService.vocabulary.updateAllTabHiddenState(value)
        } catch (error) {
            console.error('Failed to update all tab hidden state', error)
        }

        // If hiding All tab, immediately switch to the first custom tab if available
        if (value && tabs.value.length > 0) {
            const firstTab = tabs.value[0]
            if (firstTab) {
                handleTabSelect(firstTab.id)
            }
        }
    }

    function handleCreateTab() {
        isEditingTab.value = false
        editingTabName.value = ''
        editingTabId.value = null
        showTabNameModal.value = true
    }

    function handleEditTab(tab: Tab) {
        isEditingTab.value = true
        editingTabName.value = tab.name
        editingTabId.value = tab.id
        showTabNameModal.value = true
    }

    function closeTabNameModal() {
        showTabNameModal.value = false
        editingTabName.value = ''
        editingTabId.value = null
    }

    async function handleTabNameSubmit(name: string) {
        try {
            if (isEditingTab.value && editingTabId.value) {
                await apiService.tab.update(editingTabId.value, { name })
                toast.showSuccess('Tab updated successfully!')
            } else {
                await apiService.tab.create({ name })
                toast.showSuccess('Tab created successfully!')
            }
            await loadTabs()
            closeTabNameModal()
        } catch (error) {
            console.error('Failed to save tab:', error)
            toast.showError('Failed to save tab. Please try again.')
        }
    }

    function handleDeleteTab(tab: Tab) {
        toast.confirm(
            `Are you sure you want to delete tab "${tab.name}"?`,
            async () => {
                try {
                    await apiService.tab.delete(tab.id)
                    if (activeTabId.value === tab.id) {
                        activeTabId.value = null
                        localStorage.removeItem('activeTabId')
                        vocabularyFilter.tabId = null
                    }
                    await loadTabs()
                    onPageChange(getCurrentPage())
                    toast.showSuccess('Tab deleted successfully!')
                } catch (error) {
                    console.error('Failed to delete tab:', error)
                    toast.showError('Failed to delete tab. Please try again.')
                }
            },
            { label: 'Delete', type: 'error' }
        )
    }

    function openTabManager(vocab: any) {
        selectedVocabForTabs.value = vocab
        showTabManagerModal.value = true
    }

    function closeTabManager() {
        showTabManagerModal.value = false
        selectedVocabForTabs.value = null
    }

    async function handleTabSaved() {
        await loadTabs()
        // Reload vocabularies to reflect changes (e.g., if item removed from current active tab)
        onPageChange(getCurrentPage())
    }

    return {
        tabs,
        activeTabId,
        isAllTabHidden,
        showTabNameModal,
        isEditingTab,
        editingTabName,
        showTabManagerModal,
        selectedVocabForTabs,
        loadTabs,
        handleTabSelect,
        handleAllTabToggle,
        handleCreateTab,
        handleEditTab,
        closeTabNameModal,
        handleTabNameSubmit,
        handleDeleteTab,
        openTabManager,
        closeTabManager,
        handleTabSaved,
    }
}
