<template>
  <div class="min-h-screen py-8 bg-white dark:bg-black">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <h1
          class="text-4xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent mb-2"
        >
          {{ tr("title") }}
        </h1>
        <p class="text-lg text-black/60 dark:text-white/70">
          {{ tr("subtitle") }}
        </p>
      </div>

      <!-- Actions Bar -->
      <div
        class="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
      >
        <VocabularySearchBar
          v-model="state.searchQuery.value"
          :placeholder="'Search vocabularies...'"
        />

        <ExpandCollapseButton
          :expand-all="state.expandAll.value"
          :expand-text="tr('expandAll')"
          :collapse-text="tr('collapseAll')"
          @click="handle.toggleExpandAll"
        />
      </div>

      <!-- Loading State -->
      <div
        v-if="state.loading.value"
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

      <!-- No Data State -->
      <div
        v-else-if="handle.filteredVocabularies.value.length === 0"
        class="text-center py-20"
      >
        <div class="text-6xl mb-4">📅</div>
        <h3 class="text-2xl font-bold text-black dark:text-white mb-2">
          {{ tr("noData") }}
        </h3>
        <p class="text-black/60 dark:text-white/70">{{ tr("subtitle") }}</p>
      </div>

      <!-- Date Groups -->
      <div v-else class="space-y-6">
        <DateGroupCard
          v-for="group in handle.filteredVocabularies.value"
          :key="group.date"
          :item-id="group.date"
          :class="{ 'z-50 relative': currentEditingDate === group.date }"
        >
          <!-- Date Header Slot -->
          <template #header="{ hasBackground }">
            <DateGroupHeader
              :day-number="new Date(group.date).getDate()"
              :formatted-date="handle.formatDate(group.date)"
              :count="group.count"
              :words-count-text="tr('wordsCount')"
              :is-expanded="handle.isDateExpanded(group.date)"
              :topic="group.topic"
              :icon="group.icon"
              :color="group.color"
              :has-background="hasBackground"
              @toggle="handle.toggleDate(group.date)"
              @update-topic="
                (topic, icon, color) =>
                  handle.updateTopic(group.date, topic, icon, color)
              "
              @editing-change="(val) => setEditingDate(group.date, val)"
            />
          </template>

          <!-- Vocabularies List -->
          <Transition
            enter-active-class="transition-all duration-300 ease-out"
            enter-from-class="opacity-0 max-h-0"
            enter-to-class="opacity-100 max-h-[10000px]"
            leave-active-class="transition-all duration-300 ease-in"
            leave-from-class="opacity-100 max-h-[10000px]"
            leave-to-class="opacity-0 max-h-0"
          >
            <div
              v-if="handle.isDateExpanded(group.date)"
              class="border-t border-black/10 dark:border-white/10 p-4 space-y-4"
            >
              <div
                v-for="catGroup in group.categories"
                :key="catGroup.category.id"
              >
                <CategoryHeader
                  :category="catGroup.category"
                  :vocabulary-count="catGroup.vocabularies.length"
                  :icon-component="getIconComponent(catGroup.category.icon)"
                  :is-expanded="
                    handle.isCategoryExpanded(group.date, catGroup.category.id)
                  "
                  :move-to-date-text="tr('moveToDate')"
                  @toggle="
                    handle.toggleCategory(group.date, catGroup.category.id)
                  "
                  @move="
                    moveModalState.openMoveModal(
                      group.date,
                      catGroup.category.id,
                      catGroup.category.name
                    )
                  "
                />
                <div
                  v-if="
                    handle.isCategoryExpanded(group.date, catGroup.category.id)
                  "
                  class="pl-8 pt-2 space-y-2"
                >
                  <VocabularyCard
                    v-for="vocab in catGroup.vocabularies"
                    :key="vocab.id"
                    :vocabulary="vocab"
                    :difficulty-text="tr(vocab.difficulty)"
                    :speak-text="tr('speak')"
                    @open-image="modalState.openImagePreview"
                    @open-video="modalState.openVideoPreview"
                    @speak="handle.handleSpeak"
                    @view-detail="modalState.openDetailModal(vocab)"
                  />
                </div>
              </div>
            </div>
          </Transition>
        </DateGroupCard>
      </div>
    </div>

    <!-- Detail Modal -->
    <VocabularyDetailModal
      :show="modalState.showDetailModal.value"
      :vocabulary="modalState.selectedVocabulary.value"
      @close="modalState.closeDetailModal"
      @open-image="modalState.openImagePreview"
    />

    <!-- Image Preview Modal -->
    <VocabularyImageViewer
      :visible="modalState.imagePreview.value.visible"
      :src="modalState.imagePreview.value.src"
      :alt="modalState.imagePreview.value.alt"
      :title="modalState.imagePreview.value.alt"
      @close="modalState.closeImagePreview"
    />

    <!-- Video Preview Modal -->
    <VideoZoomModal
      :visible="modalState.videoPreview.value.visible"
      :src="modalState.videoPreview.value.src"
      :title="modalState.videoPreview.value.title"
      @close="modalState.closeVideoPreview"
    />

    <!-- Move Category Modal -->
    <MoveCategoryModal
      :show="moveModalState.showMoveModal.value"
      :title="tr('moveModalTitle')"
      :description="tr('moveModalDescription')"
      :from-date-label="tr('fromDate')"
      :to-date-label="tr('toDate')"
      :from-date-display="handle.formatDate(moveModalState.moveFromDate.value)"
      :category-name="moveModalState.moveCategoryName.value"
      :selected-date-label="selectedTargetDateLabel"
      :placeholder="tr('selectDatePlaceholder')"
      :available-dates="moveModalState.availableDatesFormatted.value"
      :selected-date="moveModalState.selectedTargetDate.value"
      :show-dropdown="moveModalState.showTargetDateDropdown.value"
      :cancel-text="tr('cancel')"
      :confirm-text="tr('confirmMove')"
      :no-dates-text="tr('noDatesAvailable')"
      @toggle-dropdown="moveModalState.toggleDropdown"
      @select-date="moveModalState.selectTargetDate"
      @cancel="moveModalState.closeMoveModal"
      @confirm="moveModalState.confirmMove"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useVocabularyByDateState } from "./composable/manager-state/useVocabularyByDateState";
import { useVocabularyByDateHandle } from "./composable/manager-handle/useVocabularyByDateHandle";
import { useVocabularyByDateMount } from "./composable/manager-mount/useVocabularyByDateMount";
import { useModalState } from "./composable/manager-state/useModalState";
import { useMoveModal } from "./composable/manager-state/useMoveModal";
import { getIconComponent } from "../../utils/iconRenderer";

// Local Components
const VocabularySearchBar = defineAsyncComponent(
  () => import("./components/VocabularySearchBar.vue")
);
const ExpandCollapseButton = defineAsyncComponent(
  () => import("./components/ExpandCollapseButton.vue")
);
const DateGroupHeader = defineAsyncComponent(
  () => import("./components/DateGroupHeader.vue")
);
const DateGroupCard = defineAsyncComponent(
  () => import("./components/DateGroupCard.vue")
);
const CategoryHeader = defineAsyncComponent(
  () => import("./components/CategoryHeader.vue")
);
const VocabularyCard = defineAsyncComponent(
  () => import("./components/VocabularyCard.vue")
);
const MoveCategoryModal = defineAsyncComponent(
  () => import("./components/MoveCategoryModal.vue")
);

// Global Components
const VocabularyDetailModal = defineAsyncComponent(
  () => import("../../components/VocabularyDetailModal.vue") as any
);
const VocabularyImageViewer = defineAsyncComponent(
  () => import("../../components/common/VocabularyImageViewer.vue") as any
);
const VideoZoomModal = defineAsyncComponent(
  () => import("../../components/common/VideoZoomModal.vue") as any
);

const i18n = useI18n({ useScope: "global" });

function tr(key: string) {
  return i18n.t(`vocabularyByDate.${key}`);
}

const state = useVocabularyByDateState();

const handle = useVocabularyByDateHandle(
  state.vocabulariesByDate,
  state.loading,
  state.searchQuery,
  state.expandedDates,
  state.expandedCategories,
  state.expandAll
);

useVocabularyByDateMount(handle.loadData);

// Modal States
const modalState = useModalState();
const moveModalState = useMoveModal(
  state.vocabulariesByDate,
  handle.formatDate,
  handle.moveCategoryToDate
);

const selectedTargetDateLabel = computed(() => {
  if (!moveModalState.selectedTargetDate.value)
    return tr("selectDatePlaceholder");
  const group = state.vocabulariesByDate.value.find(
    (g: any) => g.date === moveModalState.selectedTargetDate.value
  );
  return group ? handle.formatDate(group.date) : tr("selectDatePlaceholder");
});

const currentEditingDate = ref<string | null>(null);
function setEditingDate(date: string, isEditing: boolean) {
  if (isEditing) {
    currentEditingDate.value = date;
  } else if (currentEditingDate.value === date) {
    currentEditingDate.value = null;
  }
}
</script>
