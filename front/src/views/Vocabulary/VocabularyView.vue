<template>
  <div class="min-h-screen bg-white dark:bg-black p-4 md:p-8">
    <div class="max-w-7xl mx-auto">
      <div class="mb-8">
        <VocabularyHeader
          :title="t('vocabulary.title')"
          :grid-label="t('vocabulary.gridView')"
          :list-label="t('vocabulary.listView')"
          :is-grid-layout="vocabularyState.isGridLayout"
          :is-persisting-layout="vocabularyState.isPersistingLayout"
          @change:layout="vocabularyLayoutHandle.handleLayoutModeChange"
        />

        <div class="mb-6">
          <VocabularyAppTabs
            :tabs="tabHandle.tabs.value"
            :active-tab-id="tabHandle.activeTabId.value"
            :is-all-tab-hidden="tabHandle.isAllTabHidden.value"
            @select="tabHandle.handleTabSelect"
            @create="tabHandle.handleCreateTab"
            @edit="tabHandle.handleEditTab"
            @delete="tabHandle.handleDeleteTab"
            @update:is-all-tab-hidden="tabHandle.handleAllTabToggle"
          />
        </div>

        <div ref="controlsRef">
          <VocabularyControls
            :search="vocabularyState.filter.search"
            :labels="{
              searchPlaceholder: t('vocabulary.search'),
              addNew: t('vocabulary.addNew'),
            }"
            @update:search="(value) => (vocabularyState.filter.search = value)"
            @create="vocabularyState.openCreateModal"
          />

          <VocabularyAdvancedFilters
            :selected-categories="vocabularyState.filter.categoryIds || []"
            :selected-tags="vocabularyState.filter.tags || []"
            :current-difficulty="vocabularyState.filter.difficulty"
            :labels="{
              advancedFilters: t('vocabulary.advancedFilters'),
              categories: t('vocabulary.categories'),
              tags: t('vocabulary.tags'),
              difficulty: t('vocabulary.difficulty'),
              clear: t('vocabulary.clear'),
              clearAll: t('vocabulary.clearAll'),
              activeFilters: t('vocabulary.activeFilters'),
              noCategories: t('vocabulary.noCategories'),
              noTags: t('vocabulary.noTags'),
              all: t('vocabulary.all'),
              easy: t('vocabulary.easy'),
              medium: t('vocabulary.medium'),
              hard: t('vocabulary.hard'),
            }"
            @update:selected-categories="
              advancedFilterHandle.handleCategoryFilterChange
            "
            @update:selected-tags="advancedFilterHandle.handleTagFilterChange"
            @set-difficulty="vocabularyState.setDifficultyFilter"
          />
        </div>
      </div>

      <div
        v-if="vocabularyState.store.loading"
        class="flex items-center justify-center py-24"
      >
        <div class="relative">
          <div
            class="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"
          ></div>
          <div
            class="absolute inset-0 flex items-center justify-center font-bold text-xs text-primary-600"
          >
            ...
          </div>
        </div>
      </div>

      <div
        v-else-if="vocabularyState.filteredVocabularies.length === 0"
        class="text-center py-12"
      >
        <div class="text-6xl mb-4">📚</div>
        <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {{ t("vocabulary.noVocabulary") }}
        </h3>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          {{ t("vocabulary.addFirstVocabulary") }}
        </p>
        <button
          @click="vocabularyState.openCreateModal"
          class="px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary-500/25 transition-all"
        >
          {{ t("vocabulary.addNew") }}
        </button>
      </div>

      <div v-else>
        <VocabularyGrid
          v-if="vocabularyState.isGridLayout"
          :vocabularies="vocabularyState.filteredVocabularies"
          :t="t"
          :format-date="dateFormat.formatDate"
          :selected-ids="selectionHandle.selectedVocabularyIds.value"
          @speak="vocabularyHandle.handleSpeak"
          @toggle-pin="vocabularyHandle.handleTogglePin"
          @toggle-favorite="vocabularyHandle.handleToggleFavorite"
          @open-detail="vocabularyState.openDetailModal"
          @open-edit="vocabularyState.openEditModal"
          @delete="vocabularyHandle.handleDelete"
          @open-image="mediaPreview.openImagePreview"
          @open-video="mediaPreview.openVideoPreview"
          @toggle-selection="selectionHandle.toggleVocabularySelection"
        />

        <VocabularyList
          v-else
          :vocabularies="vocabularyState.filteredVocabularies"
          :t="t"
          :format-date="dateFormat.formatDate"
          :selected-ids="selectionHandle.selectedVocabularyIds.value"
          @speak="vocabularyHandle.handleSpeak"
          @toggle-pin="vocabularyHandle.handleTogglePin"
          @toggle-favorite="vocabularyHandle.handleToggleFavorite"
          @open-detail="vocabularyState.openDetailModal"
          @open-edit="vocabularyState.openEditModal"
          @delete="vocabularyHandle.handleDelete"
          @open-image="mediaPreview.openImagePreview"
          @open-video="mediaPreview.openVideoPreview"
          @toggle-selection="selectionHandle.toggleVocabularySelection"
        />
      </div>

      <Pagination
        v-if="
          vocabularyState.filteredVocabularies.length > 0 &&
          vocabularyState.store.pageCount > 1
        "
        :page="vocabularyState.store.page"
        :page-count="vocabularyState.store.pageCount"
        @update:page="vocabularyFilterHandle.handlePageChange"
        @page-change="vocabularyFilterHandle.handlePageChange"
      />
    </div>

    <!-- Sticky Add Button -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="translate-y-20 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-20 opacity-0"
    >
      <button
        v-if="stickyButton.showStickyAddButton.value"
        @click="vocabularyState.openCreateModal"
        class="fixed bottom-6 left-6 md:bottom-8 md:left-8 z-40 px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-bold rounded-full shadow-2xl hover:shadow-primary-500/50 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 backdrop-blur-sm"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4v16m8-8H4"
          />
        </svg>
        <span class="hidden md:inline">{{ t("vocabulary.addNew") }}</span>
      </button>
    </Transition>

    <VocabularyModal
      :show="vocabularyState.showModal"
      :isEditing="vocabularyState.isEditing"
      :form="vocabularyState.form"
      :t="t"
      @submit="vocabularyHandle.handleSubmit"
      @close="vocabularyState.closeModal"
    />

    <VocabularyDetailModal
      :show="vocabularyState.showDetailModal"
      :vocabulary="vocabularyState.selectedVocabulary"
      @close="vocabularyState.closeDetailModal"
      @edit="vocabularyState.handleEditFromDetail"
      @open-image="mediaPreview.openImagePreview"
    />

    <VocabularyImageViewer
      :visible="mediaPreview.imagePreview.visible"
      :src="mediaPreview.imagePreview.src"
      :alt="mediaPreview.imagePreview.alt"
      :title="mediaPreview.imagePreview.title"
      @close="mediaPreview.closeImagePreview"
    />

    <VideoZoomModal
      :visible="mediaPreview.videoPreview.visible"
      :src="mediaPreview.videoPreview.src"
      :title="mediaPreview.videoPreview.title"
      @close="mediaPreview.closeVideoPreview"
    />

    <VocabularyTabManagerModal
      :show="tabHandle.showTabManagerModal.value"
      :vocabulary="tabHandle.selectedVocabForTabs.value"
      title="Manage Vocabulary Tabs"
      @close="tabHandle.showTabManagerModal.value = false"
      @saved="tabHandle.handleTabSaved"
    />

    <TabNameModal
      :show="tabHandle.showTabNameModal.value"
      :is-editing="tabHandle.isEditingTab.value"
      :initial-name="tabHandle.editingTabName.value"
      @close="tabHandle.closeTabNameModal"
      @submit="tabHandle.handleTabNameSubmit"
    />

    <VocabularyBulkActionBar
      :selected-count="selectionHandle.selectedVocabularyIds.value.length"
      :is-all-selected="selectionHandle.isAllVocabulariesSelected.value"
      @add-to-tab="selectionHandle.openBulkAddToTab"
      @toggle-select-all="selectionHandle.toggleSelectAll"
      @clear-selection="selectionHandle.clearSelection"
    />

    <BulkAddToTabModal
      :show="selectionHandle.showBulkAddToTabModal.value"
      :vocabulary-ids="selectionHandle.selectedVocabularyIds.value"
      @close="selectionHandle.showBulkAddToTabModal.value = false"
      @saved="advancedFilterHandle.handleBulkAddSaved"
    />
  </div>
</template>

<script setup lang="ts">
import { proxyRefs, ref } from "vue";
import { defineAsyncComponent } from "vue";
import { useI18n } from "vue-i18n";
import { useVocabularyState } from "./composable/manager-state/useVocabularyState";
import { useVocabularyHandle } from "./composable/manager-handle/useVocabularyHandle";
import { useVocabularyMount } from "./composable/manager-mount/useVocabularyMount";
import { useVocabularyFilterHandle } from "./composable/manager-handle/useVocabularyFilterHandle";
import { useVocabularyLayoutHandle } from "./composable/manager-handle/useVocabularyLayoutHandle";
import { useMediaPreview } from "./composable/manager-handle/useMediaPreview";
import { useVocabularySelection } from "./composable/manager-handle/useVocabularySelection";
import { useVocabularyTabHandle } from "./composable/manager-handle/useVocabularyTabHandle";
import { useStickyButtonObserver } from "./composable/manager-handle/useStickyButtonObserver";
import { useDateFormat } from "./composable/utils/useDateFormat";
import { useVocabularyAdvancedFilterHandle } from "./composable/manager-handle/useVocabularyAdvancedFilterHandle";
import enLang from "./language/en";
import viLang from "./language/vi";
import koLang from "./language/ko";
import zhCNLang from "./language/zh-CN";

const VocabularyHeader = defineAsyncComponent(
  () => import("./component/VocabularyHeader.vue") as any
);
const VocabularyControls = defineAsyncComponent(
  () => import("./component/VocabularyControls.vue") as any
);
const VocabularyGrid = defineAsyncComponent(
  () => import("./component/VocabularyGrid.vue") as any
);
const VocabularyList = defineAsyncComponent(
  () => import("./component/VocabularyList.vue") as any
);
const VocabularyModal = defineAsyncComponent(
  () => import("./component/VocabularyModal.vue") as any
);
const VocabularyDetailModal = defineAsyncComponent(
  () => import("../../components/VocabularyDetailModal.vue") as any
);
const VocabularyImageViewer = defineAsyncComponent(
  () => import("../../components/common/VocabularyImageViewer.vue") as any
);
const VideoZoomModal = defineAsyncComponent(
  () => import("../../components/common/VideoZoomModal.vue") as any
);
const Pagination = defineAsyncComponent(
  () => import("../../components/Pagination.vue") as any
);
const VocabularyAppTabs = defineAsyncComponent(
  () => import("./component/VocabularyAppTabs.vue") as any
);
const VocabularyTabManagerModal = defineAsyncComponent(
  () => import("./component/VocabularyTabManagerModal.vue") as any
);
const TabNameModal = defineAsyncComponent(
  () => import("./component/TabNameModal.vue") as any
);
const VocabularyBulkActionBar = defineAsyncComponent(
  () => import("./component/VocabularyBulkActionBar.vue") as any
);
const BulkAddToTabModal = defineAsyncComponent(
  () => import("./component/BulkAddToTabModal.vue") as any
);
const VocabularyAdvancedFilters = defineAsyncComponent(
  () => import("./component/VocabularyAdvancedFilters.vue") as any
);

const { t, locale, mergeLocaleMessage } = useI18n();

mergeLocaleMessage("en", { vocabulary: enLang });
mergeLocaleMessage("vi", { vocabulary: viLang });
mergeLocaleMessage("ko", { vocabulary: koLang });
mergeLocaleMessage("zh-CN", { vocabulary: zhCNLang });

const vocabularyStateStore = useVocabularyState();
const vocabularyState = proxyRefs(vocabularyStateStore);

const vocabularyHandle = useVocabularyHandle(
  vocabularyStateStore.form,
  vocabularyStateStore.isEditing,
  vocabularyStateStore.editingId,
  vocabularyStateStore.closeModal,
  vocabularyStateStore.filter
);

const vocabularyFilterHandle = useVocabularyFilterHandle(
  vocabularyStateStore.filter,
  vocabularyStateStore.store
);

const vocabularyLayoutHandle = useVocabularyLayoutHandle(
  vocabularyStateStore.layoutMode,
  vocabularyStateStore.filter,
  vocabularyStateStore.store,
  vocabularyStateStore.isPersistingLayout
);

// Media Preview
const mediaPreview = useMediaPreview();

// Date Formatting
const dateFormat = useDateFormat(locale);

// Sticky Button Observer
const controlsRef = ref<HTMLElement | null>(null);
const stickyButton = useStickyButtonObserver(controlsRef);

// Tab Management
const tabHandle = useVocabularyTabHandle(
  vocabularyStateStore.filter as any,
  vocabularyFilterHandle.handlePageChange,
  () => vocabularyStateStore.store.page
);

// Selection Management
const selectionHandle = useVocabularySelection(
  vocabularyStateStore.filteredVocabularies
);

// Advanced Filter Handle (includes category, tag filters, bulk add, etc.)
const advancedFilterHandle = useVocabularyAdvancedFilterHandle(
  vocabularyStateStore.filter,
  vocabularyStateStore.store,
  tabHandle,
  selectionHandle,
  vocabularyFilterHandle
);

// Mount with tab loading
useVocabularyMount({
  onMounted: () => tabHandle.loadTabs(),
});
</script>

