<template>
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
    <CategoryCard v-for="category in categories" :key="category.id" :category="category"
      :selected="selectionMode && selectedIds.has(category.id)" :selection-mode="selectionMode"
      :selection-busy="selectionBusy" :smart-mode="smartMode"
      @toggle-pin="$emit('toggle-pin', $event)" @open-edit-modal="$emit('open-edit-modal', $event)"
      @toggle-selection="$emit('toggle-selection', $event)" @delete="$emit('delete', $event)" />
  </div>
</template>

<script setup lang="ts">
import CategoryCard from './CategoryCard.vue'
import type { Category, CategorySmartMode } from '../interface/category.interface'

defineProps<{
  categories: Category[]
  selectedIds: ReadonlySet<string>
  selectionBusy: boolean
  selectionMode: boolean
  smartMode: CategorySmartMode
}>()

defineEmits<{
  'toggle-pin': [id: string]
  'open-edit-modal': [category: Category]
  'toggle-selection': [id: string]
  delete: [id: string]
}>()
</script>
