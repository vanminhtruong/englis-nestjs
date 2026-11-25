<template>
  <div data-tags-grid class="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
    <TagCard v-for="tag in tags" :key="tag.id" :tag="tag" @edit="$emit('open-edit-modal', $event)" @delete="$emit('delete', $event)" />
  </div>
</template>
<script setup lang="ts">
import type { Tag } from '../interface/tag.interface'
import TagCard from './TagCard.vue'
defineProps<{ tags: Tag[] }>()
defineEmits<{ 'open-edit-modal': [tag: Tag]; delete: [id: string] }>()
</script>
