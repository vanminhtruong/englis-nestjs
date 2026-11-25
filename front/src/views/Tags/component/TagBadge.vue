<template>
  <span :style="style" class="tag-badge flex shrink-0 items-center justify-center border border-black/10 dark:border-white/15"
    :class="size === 'small' ? 'h-10 w-10 rounded-xl' : 'h-[60px] w-[60px] rounded-2xl'" aria-hidden="true">
    <svg :class="size === 'small' ? 'h-5 w-5' : 'h-9 w-9'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13 13 20a2 2 0 0 1-2.8 0L3 12.8V4h8.8L20 12a.7.7 0 0 1 0 1Z"/><circle cx="7.5" cy="7.5" r="1.3"/></svg>
  </span>
</template>

<script setup lang="ts">
import { useAccentAppearance } from '../../../composables/useAccentAppearance'
const props = withDefaults(defineProps<{ color?: string; size?: 'card' | 'small' }>(), { size: 'card' })
const { style } = useAccentAppearance(() => props.color, '#A855F7')
</script>

<style scoped>
.tag-badge {
  background: var(--accent-color);
  color: var(--accent-ink);
  box-shadow: 0 4px 12px color-mix(in srgb, var(--accent-color) 25%, transparent);
}
</style>
