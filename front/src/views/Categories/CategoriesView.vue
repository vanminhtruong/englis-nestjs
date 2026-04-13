<template>
  <div class="min-h-screen bg-white dark:bg-black p-4 md:p-8">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div ref="controlsRef">
        <CategoriesHeader
          :categories-count="categoriesState.categoriesCount.value"
          @open-create-modal="categoriesState.openCreateModal"
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
        <AppLoading v-if="categoriesState.loading.value" />

        <!-- Empty State -->
        <CategoriesEmpty v-else-if="!categoriesState.hasCategories.value" />

        <!-- Categories Grid -->
        <CategoriesGrid
          v-else
          :categories="categoriesState.categories.value"
          @toggle-pin="categoriesHandle.handleTogglePin"
          @open-edit-modal="categoriesState.openEditModal"
          @delete="categoriesHandle.handleDelete"
        />
      </Transition>

      <!-- Sticky Add Button -->
      <CategoriesStickyButton
        :show-sticky-add-button="showStickyAddButton"
        @open-create-modal="categoriesState.openCreateModal"
      />

      <!-- Modal -->
      <CategoryModal
        :show="categoriesState.showModal.value"
        :isEditing="categoriesState.isEditing.value"
        :form="categoriesState.form"
        @submit="categoriesHandle.handleSubmit"
        @close="categoriesState.closeModal"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useCategoriesState } from "./composable/manager-state/useCategoriesState";
import { useCategoriesHandle } from "./composable/manager-handle/useCategoriesHandle";
import { useCategoriesMount } from "./composable/manager-mount/useCategoriesMount";
import { useCategoriesI18n } from "./composable/manager-handle/useCategoriesI18n";
import { useCategoriesComponents } from "./composable/manager-handle/useCategoriesComponents";
import { useIntersectionObserver } from "./composable/manager-handle/useIntersectionObserver";

const { i18n } = useCategoriesI18n();

const {
  CategoriesHeader,
  AppLoading,
  CategoriesEmpty,
  CategoriesGrid,
  CategoriesStickyButton,
  CategoryModal,
} = useCategoriesComponents();

const categoriesState = useCategoriesState();

const categoriesHandle = useCategoriesHandle(
  categoriesState.form,
  categoriesState.isEditing,
  categoriesState.editingId,
  categoriesState.closeModal,
  categoriesState.addCategory,
  categoriesState.updateCategory,
  categoriesState.removeCategory
);

useCategoriesMount(
  categoriesState.setCategories,
  categoriesState.setLoading,
  categoriesState.addCategory,
  categoriesState.updateCategory,
  categoriesState.removeCategory
);

const controlsRef = ref<HTMLElement | null>(null);
const { showStickyAddButton } = useIntersectionObserver(controlsRef);
</script>
