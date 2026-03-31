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

      <Transition
        enter-active-class="transition duration-500 ease-out"
        enter-from-class="opacity-0 translate-y-4"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-300 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-y-4"
        mode="out-in"
      >
        <!-- Loading -->
        <AppLoading v-if="loading" />

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
      </Transition>

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
import zhCNLang from "./language/zh-CN";

const CategoriesHeader = defineAsyncComponent(
  () => import("./component/CategoriesHeader.vue") as any
);
const AppLoading = defineAsyncComponent(
  () => import("../../components/common/AppLoading.vue") as any
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
mergeLocaleMessage("zh-CN", { categories: zhCNLang });

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
