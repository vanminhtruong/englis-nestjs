<template>
  <SeasonalIcon
    class="seasonal-header-icon"
    :class="{ 'is-expanded': kind === 'chevron' && expanded }"
    :source="artwork"
    :position="position"
    :size="size ?? (compact ? 18 : 20)"
    :bleed="2"
    :data-seasonal-header-icon="kind"
  >
    <slot />
  </SeasonalIcon>
</template>


<script setup lang="ts">
import { computed, inject } from 'vue'
import SeasonalIcon from '../../common/SeasonalIcon.vue'
import { seasonalUiArtworkKey } from '../../../utils/seasonalDecor'

const navigationIcons = ['home', 'vocabulary', 'practice', 'about'] as const
const menuIcons = [
  'calendar', 'categories', 'review', 'tag', 'profile', 'voice', 'favorite', 'history',
  'progress', 'logout', 'sun', 'moon', 'language', 'menu', 'close', 'chevron', 'chevronUp',
] as const

const props = defineProps<{
  kind: (typeof navigationIcons)[number] | (typeof menuIcons)[number] | 'languageSelected'
  compact?: boolean
  size?: number
  plain?: boolean
  expanded?: boolean
}>()

const theme = inject(seasonalUiArtworkKey)
const navigationIndex = computed(() => navigationIcons.findIndex(kind => kind === props.kind))
const artwork = computed(() => {
  if (props.plain) return undefined
  if (props.kind === 'languageSelected') return theme?.value?.languageSelection?.src
  return navigationIndex.value >= 0 ? theme?.value?.navigation : theme?.value?.menu
})
// Object-fit clips each square cell without adding a wider box to the header.
const position = computed(() => {
  if (props.kind === 'languageSelected') return theme?.value?.languageSelection?.position
  if (navigationIndex.value >= 0) {
    return `${navigationIndex.value * 100 / (navigationIcons.length - 1)}% center`
  }
  const kind = props.kind === 'chevron' && props.expanded ? 'chevronUp' : props.kind
  const index = menuIcons.findIndex(icon => icon === kind)
  return `${index * 100 / (menuIcons.length - 1)}% center`
})
</script>

<style scoped>
.seasonal-header-icon :slotted(svg) {
  transition: transform 150ms ease;
}

.seasonal-header-icon.is-expanded :slotted(svg) {
  transform: rotate(180deg);
}
</style>
