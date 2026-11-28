<template>
  <span
    class="seasonal-icon"
    :style="{ '--icon-size': size + 'px', '--icon-bleed': bleed + 'px' }"
    aria-hidden="true"
  >
    <slot v-if="!artworkReady" />
    <img
      v-if="source"
      :key="source"
      :src="source"
      :class="{ 'is-ready': artworkReady }"
      :style="{ objectPosition: position }"
      :width="size"
      :height="size"
      alt=""
      decoding="async"
      draggable="false"
      @load="rememberLoaded"
    />
  </span>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const props = withDefaults(defineProps<{
  source?: string
  position?: string
  size: number
  bleed?: number
}>(), { bleed: 0 })

const loadedSource = ref<string>()
const artworkReady = computed(() => !!props.source && props.source === loadedSource.value)

function rememberLoaded(event: Event) {
  loadedSource.value = (event.currentTarget as HTMLImageElement).getAttribute('src') ?? undefined
}
</script>

<style scoped>
.seasonal-icon {
  position: relative;
  display: inline-grid;
  place-items: center;
  flex: none;
  width: var(--icon-size);
  height: var(--icon-size);
}

.seasonal-icon img {
  position: absolute;
  inset: calc(-1 * var(--icon-bleed));
  width: calc(100% + 2 * var(--icon-bleed));
  height: calc(100% + 2 * var(--icon-bleed));
  max-width: none;
  object-fit: cover;
  visibility: hidden;
  pointer-events: none;
}

.seasonal-icon img.is-ready {
  visibility: visible;
}
</style>
