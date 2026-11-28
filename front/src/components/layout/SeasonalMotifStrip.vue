<template>
  <div class="seasonal-motif-strip" :data-motif-count="motifs.length" aria-hidden="true">
    <span v-for="(motif, index) in motifs" :key="index" class="seasonal-motif">
      <img
        v-if="artwork && artwork !== failedArtwork"
        :key="artwork"
        :src="artwork"
        :style="{ objectPosition: `${index * 100 / Math.max(1, motifs.length - 1)}% center` }"
        :width="96 * motifs.length"
        height="96"
        class="seasonal-motif-art"
        alt=""
        :loading="lazy ? 'lazy' : 'eager'"
        decoding="async"
        draggable="false"
        @error="markUnavailable"
      />
      <template v-else>{{ motif }}</template>
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { seasonalDecor, seasonalMotifArtwork } from '../../utils/seasonalDecor'
import type { SeasonalEvent } from '../../utils/seasonalCalendar'

const props = defineProps<{ eventId: SeasonalEvent['id']; lazy?: boolean }>()
const motifs = computed(() => seasonalDecor[props.eventId].motifs)
const artwork = computed(() => seasonalMotifArtwork(props.eventId))
const failedArtwork = ref<string>()

function markUnavailable(event: Event) {
  failedArtwork.value = (event.currentTarget as HTMLImageElement).getAttribute('src') ?? undefined
}
</script>
