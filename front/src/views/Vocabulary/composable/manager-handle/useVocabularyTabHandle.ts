import { ref, watch, type Ref } from "vue";
import apiService from "../../../../services/api.service";
import { useToast } from "../../../../composables/useToast";
import { useI18n } from "vue-i18n";

interface Tab {
  id: string;
  name: string;
  [key: string]: any;
}

interface VocabularyFilter {
  tabId?: string | null;
  [key: string]: any;
}

export function useVocabularyTabHandle(
  vocabularyFilter: VocabularyFilter,
  onPageChange: (page: number) => void,
  getCurrentPage: () => number,
) {
  const { t } = useI18n();
  const toast = useToast();

  const tabs = ref<Tab[]>([]);
  const activeTabId = ref<string | null>(null);
  const isAllTabHidden = ref(false);
  const isPromotingHiddenTab = ref(false);

  // Tab name modal state
  const showTabNameModal = ref(false);
  const isEditingTab = ref(false);
  const editingTabName = ref("");
  const editingTabIcon = ref<string | null>(null);
  const isSavingTab = ref(false);
  const editingTabId = ref<string | null>(null);

  // Tab manager modal state
  const showTabManagerModal = ref(false);
  const selectedVocabForTabs = ref<any>(null);

  // Apply initial tab to filter
  if (activeTabId.value) {
    vocabularyFilter.tabId = activeTabId.value;
  }

  // Watch for tabs loading to handle initial selection if All is hidden or if current tab is invalid
  watch(
    [tabs, isAllTabHidden, activeTabId],
    ([newTabs, allHidden, currentTab]) => {
      // Case 1: All Vocabularies is hidden and no custom tab selected
      if (allHidden && currentTab === null && newTabs && newTabs.length > 0) {
        const firstTab = newTabs[0];
        if (firstTab) {
          handleTabSelect(firstTab.id);
        }
        return;
      }

      // Case 2: Current tab ID is not in the list of tabs (e.g. was deleted)
      if (currentTab !== null && newTabs && newTabs.length > 0) {
        const exists = newTabs.some((t) => t.id === currentTab);
        if (!exists) {
          if (allHidden) {
            const firstTab = newTabs[0];
            if (firstTab) {
              handleTabSelect(firstTab.id);
            }
          } else {
            handleTabSelect(null);
          }
        }
      }
    },
    { immediate: true },
  );

  async function loadTabs() {
    try {
      // Load tabs and settings in parallel
      const [tabsResponse, settingsResponse] = await Promise.all([
        apiService.tab.getAll(),
        apiService.vocabulary.getSettings(),
      ]);

      tabs.value = tabsResponse.data;

      // Apply settings from backend
      if (settingsResponse.data) {
        const { activeTabId: backendTabId, isAllTabHidden: backendAllHidden } =
          settingsResponse.data;
        activeTabId.value = backendTabId;
        isAllTabHidden.value = backendAllHidden;

        // Sync to filter
        vocabularyFilter.tabId = backendTabId;
      }
    } catch (error) {
      console.error("Failed to load tabs or settings:", error);
    }
  }

  async function handleTabSelect(tabId: string | null) {
    activeTabId.value = tabId;
    vocabularyFilter.tabId = tabId;

    try {
      await apiService.vocabulary.updateActiveTabState(tabId);
    } catch (error) {
      console.error("Failed to update active tab state on backend", error);
    }
  }

  // Only tabs picked from the overflow menu are promoted. Visible tab clicks
  // continue to use handleTabSelect and do not change the persisted order.
  async function handleHiddenTabSelect(tabId: string) {
    if (isPromotingHiddenTab.value) return;
    const selected = tabs.value.find((tab) => tab.id === tabId);
    if (!selected) return;

    const previousTabId = activeTabId.value;
    if (tabId === previousTabId) return;

    const before = [...tabs.value];
    const previous = before.find((tab) => tab.id === previousTabId);
    const pinnedIds = new Set([tabId, previousTabId]);
    tabs.value = [
      selected,
      ...(previous ? [previous] : []),
      ...before.filter((tab) => !pinnedIds.has(tab.id)),
    ];

    // Update the selection and order together, without rendering the old list
    // again while the request is in flight (which caused visible flicker).
    activeTabId.value = tabId;
    vocabularyFilter.tabId = tabId;
    isPromotingHiddenTab.value = true;
    try {
      await apiService.vocabulary.updateActiveTabState(tabId, { previousTabId });
    } catch (error) {
      // Older running servers may not support the ordering payload yet.
      // Keep the user's selection and the stable UI instead of flashing the
      // old order and displaying a misleading toast on every tab click.
      console.error("Unable to persist selected overflow tab:", error);
    } finally {
      isPromotingHiddenTab.value = false;
    }
  }

  async function handleAllTabToggle(value: boolean) {
    const actionLabel = t("vocabulary.confirm");
    const message = value ? t("vocabulary.allTabHideConfirm") : t("vocabulary.allTabShowConfirm");

    toast.confirm(
      message,
      async () => {
        isAllTabHidden.value = value;

        try {
          await apiService.vocabulary.updateAllTabHiddenState(value);
        } catch (error) {
          console.error("Failed to update all tab hidden state", error);
          toast.showError(t("vocabulary.allTabUpdateError"));
          return;
        }

        // If hiding All tab, immediately switch to the first custom tab if available
        if (value && tabs.value.length > 0) {
          const firstTab = tabs.value[0];
          if (firstTab) {
            handleTabSelect(firstTab.id);
          }
        }
      },
      {
        label: actionLabel,
        type: value ? "warning" : "info",
      },
    );
  }

  function handleCreateTab() {
    isEditingTab.value = false;
    editingTabName.value = "";
    editingTabIcon.value = "book";
    editingTabId.value = null;
    showTabNameModal.value = true;
  }

  function handleEditTab(tab: Tab) {
    isEditingTab.value = true;
    editingTabName.value = tab.name;
    editingTabIcon.value = tab.icon ?? "book";
    editingTabId.value = tab.id;
    showTabNameModal.value = true;
  }

  function closeTabNameModal() {
    showTabNameModal.value = false;
    editingTabName.value = "";
    editingTabIcon.value = null;
    editingTabId.value = null;
  }

  async function handleTabNameSubmit(payload: {
    name: string;
    icon: string | null;
    file?: File | null;
  }) {
    if (isSavingTab.value) return;
    isSavingTab.value = true;
    try {
      let icon = payload.icon;
      if (payload.file) {
        const uploaded = await apiService.tab.uploadIcon(payload.file);
        icon = uploaded.data.url;
      }
      if (isEditingTab.value && editingTabId.value) {
        await apiService.tab.update(editingTabId.value, { name: payload.name, icon });
        toast.showSuccess(t("vocabulary.tabUpdatedSuccess"));
      } else {
        await apiService.tab.create({ name: payload.name, icon });
        toast.showSuccess(t("vocabulary.tabCreatedSuccess"));
      }
      await loadTabs();
      closeTabNameModal();
    } catch (error) {
      console.error("Failed to save tab:", error);
      toast.showError(t("vocabulary.tabSaveFailed"));
    } finally {
      isSavingTab.value = false;
    }
  }

  function handleDeleteTab(tab: Tab) {
    toast.confirm(
      t("vocabularyTabs.deleteConfirm", { name: tab.name }),
      async () => {
        try {
          await apiService.tab.delete(tab.id);
          if (activeTabId.value === tab.id) {
            activeTabId.value = null;
            vocabularyFilter.tabId = null;
          }
          await loadTabs();
          onPageChange(getCurrentPage());
          toast.showSuccess(t("vocabularyTabs.deleteSuccess"));
        } catch (error) {
          console.error("Failed to delete tab:", error);
          toast.showError(t("vocabularyTabs.deleteFailed"));
        }
      },
      { label: t("vocabularyTabs.deleteTab"), type: "error" },
    );
  }

  function openTabManager(vocab: any) {
    selectedVocabForTabs.value = vocab;
    showTabManagerModal.value = true;
  }

  function closeTabManager() {
    showTabManagerModal.value = false;
    selectedVocabForTabs.value = null;
  }

  async function handleTabSaved() {
    await loadTabs();
    // Reload vocabularies to reflect changes (e.g., if item removed from current active tab)
    onPageChange(getCurrentPage());
  }

  return {
    tabs,
    activeTabId,
    isAllTabHidden,
    showTabNameModal,
    isEditingTab,
    editingTabName,
    editingTabIcon,
    isSavingTab,
    showTabManagerModal,
    selectedVocabForTabs,
    loadTabs,
    handleTabSelect,
    handleHiddenTabSelect,
    handleAllTabToggle,
    handleCreateTab,
    handleEditTab,
    closeTabNameModal,
    handleTabNameSubmit,
    handleDeleteTab,
    openTabManager,
    closeTabManager,
    handleTabSaved,
  };
}
