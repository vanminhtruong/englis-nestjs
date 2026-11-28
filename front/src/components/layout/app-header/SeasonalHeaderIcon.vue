<template>
  <span
    class="seasonal-header-icon"
    :class="{ 'is-expanded': kind === 'chevron' && expanded }"
    :style="{ '--header-icon-size': (size ?? (compact ? 18 : 20)) + 'px' }"
    :data-seasonal-header-icon="kind"
    aria-hidden="true"
  >
    <slot v-if="!artworkReady" />
    <img
      v-if="artwork"
      :key="artwork"
      :src="artwork"
      :class="{ 'is-ready': artworkReady }"
      :style="{ objectPosition: position }"
      width="24"
      height="24"
      alt=""
      decoding="async"
      @load="rememberLoaded"
    />
  </span>
</template>

<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import { seasonalUiArtworkKey } from '../../../utils/seasonalDecor'

const navigationIcons = ['home', 'vocabulary', 'practice', 'about'] as const
const menuIcons = [
  'calendar', 'categories', 'review', 'tag', 'profile', 'voice', 'favorite', 'history',
  'progress', 'logout', 'sun', 'moon', 'language', 'menu', 'close', 'chevron', 'chevronUp',
] as const

const props = defineProps<{
  kind: (typeof navigationIcons)[number] | (typeof menuIcons)[number]
  compact?: boolean
  size?: number
  plain?: boolean
  expanded?: boolean
}>()

const theme = inject(seasonalUiArtworkKey)
const navigationIndex = computed(() => navigationIcons.findIndex(kind => kind === props.kind))
const artwork = computed(() => {
  if (props.plain) return undefined
  return navigationIndex.value >= 0 ? theme?.value?.navigation : theme?.value?.menu
})
// Object-fit clips each square cell without adding a wider box to the header.
const position = computed(() => {
  if (navigationIndex.value >= 0) {
    return `${navigationIndex.value * 100 / (navigationIcons.length - 1)}% center`
  }
  const kind = props.kind === 'chevron' && props.expanded ? 'chevronUp' : props.kind
  const index = menuIcons.findIndex(icon => icon === kind)
  return `${index * 100 / (menuIcons.length - 1)}% center`
})
const loadedSource = ref<string>()
const artworkReady = computed(() => !!artwork?.value && artwork.value === loadedSource.value)

function rememberLoaded(event: Event) {
  loadedSource.value = (event.currentTarget as HTMLImageElement).getAttribute('src') ?? undefined
}
</script>

<style scoped>
.seasonal-header-icon {
  position: relative;
  display: inline-grid;
  place-items: center;
  flex: none;
  width: var(--header-icon-size);
  height: var(--header-icon-size);
}

.seasonal-header-icon :slotted(svg) {
  transition: transform 150ms ease;
}

.seasonal-header-icon.is-expanded :slotted(svg) {
  transform: rotate(180deg);
}

.seasonal-header-icon img {
  position: absolute;
  inset: -2px;
  width: calc(100% + 4px);
  height: calc(100% + 4px);
  max-width: none;
  object-fit: cover;
  visibility: hidden;
  pointer-events: none;
}

.seasonal-header-icon img.is-ready {
  visibility: visible;
}
</style>
