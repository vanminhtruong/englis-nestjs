<template>
  <div class="min-h-screen bg-white dark:bg-black p-4 md:p-8">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div ref="controlsRef">
        <TagsHeader
          :tags-count="tagsState.tagsCount.value"
          @open-create-modal="tagsState.openCreateModal"
        />
      </div>

      <!-- Loading -->
      <TagsLoading v-if="tagsState.loading.value" />

      <!-- Empty State -->
      <TagsEmpty v-else-if="!tagsState.hasTags.value" />

      <!-- Tags Grid -->
      <TagsGrid
        v-else
        :tags="tagsState.tags.value"
        @open-edit-modal="tagsState.openEditModal"
        @delete="tagsHandle.handleDelete"
      />

      <!-- Sticky Add Button -->
      <TagsStickyButton
        :show-sticky-add-button="stickyObserver.showStickyButton.value"
        @open-create-modal="tagsState.openCreateModal"
      />

      <!-- Modal -->
      <TagModal
        :show="tagsState.showModal.value"
        :isEditing="tagsState.isEditing.value"
        :form="tagsState.form"
        @submit="tagsHandle.handleSubmit"
        @close="tagsState.closeModal"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useTagsState } from "./composable/manager-state/useTagsState";
import { useTagsHandle } from "./composable/manager-handle/useTagsHandle";
import { useTagsMount } from "./composable/manager-mount/useTagsMount";
import { useStickyButtonObserver } from "./composable/manager-handle/useStickyButtonObserver";
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

const i18n = useI18n();

i18n.mergeLocaleMessage("en", { tags: enLang });
i18n.mergeLocaleMessage("vi", { tags: viLang });
i18n.mergeLocaleMessage("ko", { tags: koLang });
i18n.mergeLocaleMessage("zh-CN", { tags: zhCNLang });

// State Management (không destructuring)
const tagsState = useTagsState();

// Handle (không destructuring)
const tagsHandle = useTagsHandle(
  tagsState.form,
  tagsState.isEditing,
  tagsState.editingId,
  tagsState.closeModal,
  tagsState.addTag,
  tagsState.updateTag,
  tagsState.removeTag
);

// Mount
useTagsMount(
  tagsState.setTags,
  tagsState.setLoading,
  tagsState.addTag,
  tagsState.updateTag,
  tagsState.removeTag
);

// Sticky Button Observer
const controlsRef = ref<HTMLElement | null>(null);
const stickyObserver = useStickyButtonObserver(controlsRef);
</script>
