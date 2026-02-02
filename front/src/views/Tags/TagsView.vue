<template>
  <div class="min-h-screen bg-white dark:bg-black p-4 md:p-8">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div ref="controlsRef">
        <TagsHeader
          :tags-count="tagsCount"
          @open-create-modal="openCreateModal"
        />
      </div>

      <!-- Loading -->
      <TagsLoading v-if="loading" />

      <!-- Empty State -->
      <TagsEmpty v-else-if="!hasTags" />

      <!-- Tags Grid -->
      <TagsGrid
        v-else
        :tags="tags"
        @open-edit-modal="openEditModal"
        @delete="handleDelete"
      />

      <!-- Sticky Add Button -->
      <TagsStickyButton
        :show-sticky-add-button="showStickyAddButton"
        @open-create-modal="openCreateModal"
      />

      <!-- Modal -->
      <TagModal
        :show="showModal"
        :isEditing="isEditing"
        :form="form"
        @submit="handleSubmit"
        @close="closeModal"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent, ref, onMounted, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import { useTagsState } from "./composable/manager-state/useTagsState";
import { useTagsHandle } from "./composable/manager-handle/useTagsHandle";
import { useTagsMount } from "./composable/manager-mount/useTagsMount";
import enLang from "./language/en";
import viLang from "./language/vi";
import koLang from "./language/ko";
import zhCNLang from "./language/zh-CN";

const TagsHeader = defineAsyncComponent(
  () => import("./component/TagsHeader.vue") as any
);
const TagsLoading = defineAsyncComponent(
  () => import("./component/TagsLoading.vue") as any
);
const TagsEmpty = defineAsyncComponent(
  () => import("./component/TagsEmpty.vue") as any
);
const TagsGrid = defineAsyncComponent(
  () => import("./component/TagsGrid.vue") as any
);
const TagsStickyButton = defineAsyncComponent(
  () => import("./component/TagsStickyButton.vue") as any
);
const TagModal = defineAsyncComponent(
  () => import("./component/TagModal.vue") as any
);

const { t, mergeLocaleMessage } = useI18n();

mergeLocaleMessage("en", { tags: enLang });
mergeLocaleMessage("vi", { tags: viLang });
mergeLocaleMessage("ko", { tags: koLang });
mergeLocaleMessage("zh-CN", { tags: zhCNLang });

const {
  tags,
  loading,
  showModal,
  isEditing,
  editingId,
  form,
  tagsCount,
  hasTags,
  setTags,
  addTag,
  updateTag,
  removeTag,
  setLoading,
  openCreateModal,
  openEditModal,
  closeModal,
} = useTagsState();

const { handleSubmit, handleDelete } = useTagsHandle(
  form,
  isEditing,
  editingId,
  closeModal,
  addTag,
  updateTag,
  removeTag
);

useTagsMount(setTags, setLoading, addTag, updateTag, removeTag);

const controlsRef = ref<HTMLElement | null>(null);
const showStickyAddButton = ref(false);
let observer: IntersectionObserver | null = null;

onMounted(() => {
  observer = new IntersectionObserver(
    ([entry]) => {
      showStickyAddButton.value =
        !entry.isIntersecting && entry.boundingClientRect.top < 0;
    },
    {
      threshold: 0,
      rootMargin: "-20px 0px 0px 0px",
    }
  );

  if (controlsRef.value) {
    observer.observe(controlsRef.value);
  }
});

onUnmounted(() => {
  if (observer) {
    observer.disconnect();
  }
});
</script>
