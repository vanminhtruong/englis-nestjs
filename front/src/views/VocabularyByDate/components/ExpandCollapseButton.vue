<template>
  <button
    @click="$emit('click')"
    class="px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold hover:shadow-lg hover:shadow-primary-500/25 transition-all flex items-center gap-2"
  >
    <svg v-if="!expandAll" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polyline points="7 13 12 18 17 13"></polyline>
      <polyline points="7 6 12 11 17 6"></polyline>
    </svg>
    <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polyline points="17 11 12 6 7 11"></polyline>
      <polyline points="17 18 12 13 7 18"></polyline>
    </svg>
    {{ expandAll ? collapseText : expandText }}
  </button>
</template>

<script setup lang="ts">
defineProps<{
  expandAll: boolean
  expandText: string
  collapseText: string
}>()

defineEmits<{
  click: []
}>()
</script>
