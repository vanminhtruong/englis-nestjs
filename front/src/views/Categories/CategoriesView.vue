<template>
  <div class="min-h-screen bg-white dark:bg-black p-4 md:p-8">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div ref="controlsRef">
        <CategoriesHeader
          :categories-count="categoriesCount"
          @open-create-modal="openCreateModal"
        />
      </div>

      <!-- Loading -->
      <CategoriesLoading v-if="loading" />

      <!-- Empty State -->
      <CategoriesEmpty v-else-if="!hasCategories" />

      <!-- Categories Grid -->
      <CategoriesGrid
        v-else
        :categories="categories"
        @toggle-pin="handleTogglePin"
        @open-edit-modal="openEditModal"
        @delete="handleDelete"
      />

      <!-- Sticky Add Button -->
      <CategoriesStickyButton
        :show-sticky-add-button="showStickyAddButton"
        @open-create-modal="openCreateModal"
      />

      <!-- Modal -->
      <CategoryModal
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
import { useCategoriesState } from "./composable/manager-state/useCategoriesState";
import { useCategoriesHandle } from "./composable/manager-handle/useCategoriesHandle";
import { useCategoriesMount } from "./composable/manager-mount/useCategoriesMount";
import enLang from "./language/en";
import viLang from "./language/vi";
import koLang from "./language/ko";

const CategoriesHeader = defineAsyncComponent(
  () => import("./component/CategoriesHeader.vue") as any
);
const CategoriesLoading = defineAsyncComponent(
  () => import("./component/CategoriesLoading.vue") as any
);
const CategoriesEmpty = defineAsyncComponent(
  () => import("./component/CategoriesEmpty.vue") as any
);
const CategoriesGrid = defineAsyncComponent(
  () => import("./component/CategoriesGrid.vue") as any
);
const CategoriesStickyButton = defineAsyncComponent(
  () => import("./component/CategoriesStickyButton.vue") as any
);
const CategoryModal = defineAsyncComponent(
  () => import("./component/CategoryModal.vue") as any
);

const { mergeLocaleMessage } = useI18n();

mergeLocaleMessage("en", { categories: enLang });
mergeLocaleMessage("vi", { categories: viLang });
mergeLocaleMessage("ko", { categories: koLang });

const {
  categories,
  loading,
  showModal,
  isEditing,
  editingId,
  form,
  categoriesCount,
  hasCategories,
  setCategories,
  addCategory,
  updateCategory,
  removeCategory,
  setLoading,
  openCreateModal,
  openEditModal,
  closeModal,
} = useCategoriesState();

const { handleSubmit, handleDelete, handleTogglePin } = useCategoriesHandle(
  form,
  isEditing,
  editingId,
  closeModal,
  addCategory,
  updateCategory,
  removeCategory
);

useCategoriesMount(
  setCategories,
  setLoading,
  addCategory,
  updateCategory,
  removeCategory
);

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
