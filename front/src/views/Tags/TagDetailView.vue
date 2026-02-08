<template>
  <div class="min-h-screen bg-white dark:bg-black p-4 md:p-8">
    <div class="max-w-7xl mx-auto">
      <!-- Loading -->
      <TagDetailLoading v-if="detailState.loading.value" />

      <!-- Error -->
      <div v-else-if="detailState.error.value" class="text-center py-20">
        <h3 class="text-xl font-bold text-red-500 mb-2">Error Loading Tag</h3>
        <p class="text-gray-500 dark:text-gray-400 mb-8">
          {{ detailState.error.value }}
        </p>
        <button
          @click="$router.push('/tags')"
          class="px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-xl transition-colors font-medium"
        >
          Go Back
        </button>
      </div>

      <!-- Content -->
      <div v-else-if="detailState.tag.value">
        <TagDetailHeader :tag="detailState.tag.value" />

        <TagDetailGrid
          v-if="detailState.vocabularies.value.length > 0"
          :vocabularies="detailState.vocabularies.value"
          :get-video-thumbnail="detailHandle.getVideoThumbnail"
          @open-image-preview="modalState.openImagePreview"
          @open-video-preview="modalState.openVideoPreview"
          @speak="detailHandle.handleSpeak"
          @open-detail-modal="modalState.openDetailModal"
        />

        <TagDetailEmpty v-else />
      </div>
    </div>

    <!-- Detail Modal -->
    <VocabularyDetailModal
      :show="modalState.detailModal.value.show"
      :vocabulary="modalState.detailModal.value.vocabulary"
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
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from "vue";
import { useTagDetailState } from "./composable/manager-state/useTagDetailState";
import { useTagDetailModalState } from "./composable/manager-state/useTagDetailModalState";
import { useTagDetailHandle } from "./composable/manager-handle/useTagDetailHandle";
import { useTagDetailMount } from "./composable/manager-mount/useTagDetailMount";

// Components
const TagDetailLoading = defineAsyncComponent(
  () => import("./component/TagDetailLoading.vue") as any
);
const TagDetailHeader = defineAsyncComponent(
  () => import("./component/TagDetailHeader.vue") as any
);
const TagDetailGrid = defineAsyncComponent(
  () => import("./component/TagDetailGrid.vue") as any
);
const TagDetailEmpty = defineAsyncComponent(
  () => import("./component/TagDetailEmpty.vue") as any
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

// State Management (không destructuring)
const detailState = useTagDetailState();

// Modal State (không destructuring)
const modalState = useTagDetailModalState();

// Handle (không destructuring)
const detailHandle = useTagDetailHandle();

// Mount
useTagDetailMount({
  setTag: detailState.setTag,
  setVocabularies: detailState.setVocabularies,
  setLoading: detailState.setLoading,
  setError: detailState.setError,
});
</script>
