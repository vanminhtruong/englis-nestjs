<template>
  <SeasonalIcon
    :source="artwork?.actions"
    :position="position"
    :size="size"
    :data-seasonal-action-icon="kind"
  >
    <slot />
  </SeasonalIcon>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'
import { seasonalUiArtworkKey } from '../../utils/seasonalDecor'
import SeasonalIcon from './SeasonalIcon.vue'

// This order matches the seven cells in each seasonal action image strip.
const icons = ['backToTop', 'add', 'facebook', 'x', 'instagram', 'discord', 'youtube'] as const

const props = withDefaults(defineProps<{
  kind: (typeof icons)[number]
  size?: number
}>(), { size: 24 })

const artwork = inject(seasonalUiArtworkKey)
const position = computed(() => `${icons.indexOf(props.kind) * 100 / (icons.length - 1)}% center`)
</script>
