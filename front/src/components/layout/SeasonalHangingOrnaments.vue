<template>
  <div
    v-if="artwork"
    :key="eventId"
    class="seasonal-hanging-ornaments"
    :data-hanging-event="eventId"
    aria-hidden="true"
  >
    <div
      v-for="side in sides"
      :key="side"
      class="seasonal-hanging-ornament"
      :class="'seasonal-hanging-ornament--' + side"
      :data-hanging-side="side"
    >
      <img :src="artwork" alt="" width="88" height="64" decoding="async" draggable="false" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SeasonalEvent } from '../../utils/seasonalCalendar'
import { seasonalHangingArtwork } from '../../utils/seasonalDecor'

const props = defineProps<{ eventId: SeasonalEvent['id'] }>()
const sides = ['left', 'right'] as const
const artwork = computed(() => seasonalHangingArtwork(props.eventId))
</script>

<style scoped>
.seasonal-hanging-ornaments {
  position: absolute;
  top: 100%;
  inset-inline: 0;
  height: 0;
  pointer-events: none;
  z-index: 0;
  --hanging-width: clamp(30px, 4vw, 44px);
  --hanging-inset: calc(var(--frame-side, 14px) + 6px);
}
.seasonal-hanging-ornament {
  position: absolute;
  top: 0;
  width: var(--hanging-width);
  aspect-ratio: 44 / 64;
  overflow: hidden;
  contain: layout paint;
  transform-origin: center top;
  will-change: transform;
  pointer-events: none;
  animation: hanging-sway 4.8s ease-in-out infinite alternate;
}
.seasonal-hanging-ornament--left {
  left: var(--hanging-inset);
}
.seasonal-hanging-ornament--right {
  right: var(--hanging-inset);
  animation-duration: 5.6s;
  animation-delay: -2.1s;
}
.seasonal-hanging-ornament img {
  display: block;
  width: 100%;
  height: 100%;
  max-width: none;
  object-fit: cover;
  object-position: left center;
  pointer-events: none;
}
.seasonal-hanging-ornament--right img { object-position: right center; }
@keyframes hanging-sway {
  from { transform: rotate(-5deg); }
  to { transform: rotate(5deg); }
}
@media (max-width: 639px) {
  .seasonal-hanging-ornaments {
    --hanging-width: clamp(23px, 6.5vw, 30px);
    --hanging-inset: calc(var(--frame-side, 7px) + 4px);
  }
}
@media (prefers-reduced-motion: reduce) {
  .seasonal-hanging-ornament { animation: none; will-change: auto; }
}
</style>
