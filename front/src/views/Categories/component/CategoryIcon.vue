<template>
  <div class="category-icon relative flex shrink-0 items-center justify-center overflow-hidden border border-black/10 dark:border-white/15"
    :class="[size === 'hero' ? 'h-[80px] w-[80px] rounded-2xl sm:h-[112px] sm:w-[112px] sm:rounded-3xl' : size === 'small' ? 'h-7 w-7 rounded-lg' : 'h-[76px] w-[76px] rounded-[20px]', customIcon && !imageFailed ? 'category-icon--image' : 'category-icon--preset']"
    :style="style" aria-hidden="true">
    <img v-if="customIcon && !imageFailed" :src="displaySrc || icon" alt="" decoding="async"
      class="h-full w-full object-contain [image-rendering:auto]" :class="size === 'small' ? 'p-0.5' : 'p-1'" @error="handleImageError" />
    <component v-else :is="presetIcon" class="shrink-0" :class="size === 'hero' ? 'h-[48px] w-[48px] sm:h-[68px] sm:w-[68px]' : size === 'small' ? 'h-[18px] w-[18px]' : 'h-[46px] w-[46px]'" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { getIconComponent, isCustomCategoryIcon } from '../../../utils/iconRenderer'
import { enhanceCategoryIconForDisplay } from '../../../utils/categoryIconImage'
import { useCategoryAppearance } from '../composable/useCategoryAppearance'
const props = withDefaults(defineProps<{ icon?: string; color?: string; size?: 'card' | 'hero' | 'small' }>(), { size: 'card' })
const { style } = useCategoryAppearance(() => props.color)
const customIcon = computed(() => isCustomCategoryIcon(props.icon))
const imageFailed = ref(false)
const displaySrc = ref('')
watch(() => [props.icon, props.size] as const, async ([icon, size], _, onCleanup) => {
  let active = true
  onCleanup(() => { active = false })
  imageFailed.value = false
  displaySrc.value = ''
  if (!icon || !isCustomCategoryIcon(icon) || size === 'small') return
  const result = await enhanceCategoryIconForDisplay(icon)
  if (active) { displaySrc.value = result; imageFailed.value = false }
}, { immediate: true })
function handleImageError() {
  if (displaySrc.value && displaySrc.value !== props.icon) displaySrc.value = ''
  else imageFailed.value = true
}
const presetIcon = computed(() => getIconComponent(customIcon.value ? 'book' : props.icon || 'book'))
</script>

<style scoped lang="postcss">
.category-icon--preset {
  background: var(--category-accent);
  color: var(--category-ink);
  box-shadow: 0 4px 12px color-mix(in srgb, var(--category-accent) 25%, transparent);
}
.category-icon--image { @apply bg-gray-100 dark:bg-white/10; }
.category-icon--image img { filter: drop-shadow(0 0 1px rgba(0, 0, 0, .3)); }
:global(.dark) .category-icon--image img { filter: drop-shadow(0 0 1px rgba(255, 255, 255, .45)); }
</style>
