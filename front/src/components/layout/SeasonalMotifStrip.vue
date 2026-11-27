<template>
  <div class="seasonal-motif-strip" aria-hidden="true">
    <span v-for="(motif, index) in motifs" :key="index" class="seasonal-motif">{{ motif }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { seasonalDecor } from '../../utils/seasonalDecor'
import type { SeasonalEvent } from '../../utils/seasonalCalendar'
const props = defineProps<{ eventId: SeasonalEvent['id'] }>()
const motifs = computed(() => seasonalDecor[props.eventId].motifs)
</script>
