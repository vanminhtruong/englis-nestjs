<template>
  <div class="min-h-screen bg-white dark:bg-black p-4 md:p-8">
    <div class="max-w-7xl mx-auto">
      <!-- Loading -->
      <TagDetailLoading v-if="loading" />

      <!-- Error -->
      <div v-else-if="error" class="text-center py-20">
        <h3 class="text-xl font-bold text-red-500 mb-2">Error Loading Tag</h3>
        <p class="text-gray-500 dark:text-gray-400 mb-8">{{ error }}</p>
        <button
          @click="$router.push('/tags')"
          class="px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-xl transition-colors font-medium"
        >
          Go Back
        </button>
      </div>

      <!-- Content -->
      <div v-else-if="tag">
        <TagDetailHeader :tag="tag" />

        <TagDetailGrid
          v-if="vocabularies.length > 0"
          :vocabularies="vocabularies"
          :get-video-thumbnail="getVideoThumbnail"
          @open-image-preview="openImagePreview"
          @open-video-preview="openVideoPreview"
          @speak="handleSpeak"
          @open-detail-modal="openDetailModal"
        />

        <TagDetailEmpty v-else />
      </div>
    </div>

    <!-- Detail Modal -->
    <VocabularyDetailModal
      :show="detailModal.show"
      :vocabulary="detailModal.vocabulary"
      @close="closeDetailModal"
      @open-image="openImagePreview"
    />

    <!-- Image Preview Modal -->
    <VocabularyImageViewer
      :visible="imagePreview.visible"
      :src="imagePreview.src"
      :alt="imagePreview.alt"
      :title="imagePreview.alt"
      @close="closeImagePreview"
    />

    <!-- Video Preview Modal -->
    <VideoZoomModal
      :visible="videoPreview.visible"
      :src="videoPreview.src"
      :title="videoPreview.title"
      @close="closeVideoPreview"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, defineAsyncComponent } from "vue";
import { useRoute, useRouter } from "vue-router";
import apiService from "../../services/api.service";

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

// State
const route = useRoute();
const router = useRouter();
const tag = ref<any>(null);
const vocabularies = ref<any[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

// Modals State
const detailModal = ref({
  show: false,
  vocabulary: null,
});

const imagePreview = ref({
  visible: false,
  src: "",
  alt: "",
});

const videoPreview = ref({
  visible: false,
  src: "",
  title: "",
});

// Methods
const fetchTagAndVocabularies = async () => {
  loading.value = true;
  error.value = null;
  const tagId = route.params.id as string;

  try {
    // 1. Fetch Tag Details
    const tagResponse = await apiService.tag.getById(tagId);
    tag.value = tagResponse.data;

    if (!tag.value) {
      error.value = "Tag not found";
      return;
    }

    // 2. Fetch Vocabularies by Tag Name
    // Note: The API likely expects the exact tag string as stored in `vocabulary.tags`
    const vocabResponse = await apiService.vocabulary.getByTags([
      tag.value.name,
    ]);
    vocabularies.value = vocabResponse.data || [];
  } catch (err: any) {
    console.error("Error fetching tag details:", err);
    error.value =
      err.response?.data?.message || "An error occurred while loading the tag.";
  } finally {
    loading.value = false;
  }
};

const getVideoThumbnail = (url: string) => {
  if (!url) return "";
  // YouTube
  const youtubeRegex =
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const youtubeMatch = url.match(youtubeRegex);
  if (youtubeMatch) {
    return `https://img.youtube.com/vi/${youtubeMatch[1]}/maxresdefault.jpg`;
  }
  return ""; // Or a default placeholder
};

const handleSpeak = (word: string) => {
  if ("speechSynthesis" in window) {
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = "en-US"; // Default to English, can be adjusted
    window.speechSynthesis.speak(utterance);
  }
};

// Modal Handlers
const openDetailModal = (vocab: any) => {
  detailModal.value.vocabulary = vocab;
  detailModal.value.show = true;
};

const closeDetailModal = () => {
  detailModal.value.show = false;
  detailModal.value.vocabulary = null;
};

const openImagePreview = (payload: { src: string; alt: string }) => {
  imagePreview.value.src = payload.src;
  imagePreview.value.alt = payload.alt;
  imagePreview.value.visible = true;
};

const closeImagePreview = () => {
  imagePreview.value.visible = false;
  imagePreview.value.src = "";
  imagePreview.value.alt = "";
};

const openVideoPreview = (payload: { src: string; title: string }) => {
  videoPreview.value.src = payload.src;
  videoPreview.value.title = payload.title;
  videoPreview.value.visible = true;
};

const closeVideoPreview = () => {
  videoPreview.value.visible = false;
  videoPreview.value.src = "";
  videoPreview.value.title = "";
};

// Lifecycle
onMounted(() => {
  fetchTagAndVocabularies();
});
</script>
