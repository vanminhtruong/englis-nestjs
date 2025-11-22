<template>
  <div class="min-h-screen bg-white dark:bg-black p-4 md:p-8">
    <div class="max-w-7xl mx-auto">
      <!-- Loading -->
      <CategoryDetailLoading v-if="detailState.loading.value" />

      <!-- Content -->
      <div v-else-if="detailState.category.value">
        <!-- Header -->
        <CategoryDetailHeader :category="detailState.category.value" />

        <!-- Vocabularies (flat list, no date grouping) -->
        <div
          v-if="detailState.vocabulariesByDate.value.length > 0"
          class="space-y-8"
        >
          <CategoryDetailGrid
            :vocabularies="detailState.vocabulariesByDate.value"
            :get-video-thumbnail="detailHandle.getVideoThumbnail"
            @open-image-preview="detailHandle.openImagePreview"
            @open-video-preview="detailHandle.openVideoPreview"
            @speak="detailHandle.handleSpeak"
            @open-detail-modal="detailHandle.openDetailModal"
          />
        </div>

        <!-- Empty State -->
        <CategoryDetailEmpty v-else />
      </div>
    </div>

    <!-- Detail Modal -->
    <VocabularyDetailModal
      :show="detailState.showDetailModal.value"
      :vocabulary="detailState.selectedVocabulary.value"
      @close="detailHandle.closeDetailModal"
      @open-image="detailHandle.openImagePreview"
    />

    <!-- Image Preview Modal -->
    <VocabularyImageViewer
      :visible="detailState.imagePreview.value.visible"
      :src="detailState.imagePreview.value.src"
      :alt="detailState.imagePreview.value.alt"
      :title="detailState.imagePreview.value.alt"
      @close="detailHandle.closeImagePreview"
    />

    <!-- Video Preview Modal -->
    <VideoZoomModal
      :visible="detailState.videoPreview.value.visible"
      :src="detailState.videoPreview.value.src"
      :title="detailState.videoPreview.value.title"
      @close="detailHandle.closeVideoPreview"
    />
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from "vue";
import { useI18n } from "vue-i18n";
import { useCategoryDetailState } from "./composable/manager-state/useCategoryDetailState";
import { useCategoryDetailHandle } from "./composable/manager-handle/useCategoryDetailHandle";
import { useCategoryDetailMount } from "./composable/manager-mount/useCategoryDetailMount";
import enLang from "./language/en";
import viLang from "./language/vi";
import koLang from "./language/ko";

const CategoryDetailLoading = defineAsyncComponent(
  () => import("./component/CategoryDetailLoading.vue") as any
);
const CategoryDetailHeader = defineAsyncComponent(
  () => import("./component/CategoryDetailHeader.vue") as any
);
const CategoryDetailGrid = defineAsyncComponent(
  () => import("./component/CategoryDetailGrid.vue") as any
);
const CategoryDetailEmpty = defineAsyncComponent(
  () => import("./component/CategoryDetailEmpty.vue") as any
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

const { mergeLocaleMessage } = useI18n();
mergeLocaleMessage("en", { categories: enLang });
mergeLocaleMessage("vi", { categories: viLang });
mergeLocaleMessage("ko", { categories: koLang });

const detailState = useCategoryDetailState();

const detailHandle = useCategoryDetailHandle(
  detailState.showDetailModal,
  detailState.selectedVocabulary,
  detailState.imagePreview,
  detailState.videoPreview
);

useCategoryDetailMount(detailState.category, detailState.loading);
</script>
