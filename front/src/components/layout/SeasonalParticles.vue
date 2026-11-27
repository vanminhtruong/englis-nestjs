<template>
  <div class="seasonal-particles" :data-effect="effect.particles" :data-paused="paused || undefined" aria-hidden="true">
    <span
      v-for="(particle, index) in particles"
      :key="index"
      class="seasonal-particle"
      :style="particle.style"
    >{{ particle.glyph }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import type { SeasonalEvent } from '../../utils/seasonalCalendar'
import { seasonalDecor } from '../../utils/seasonalDecor'

const props = defineProps<{ eventId: SeasonalEvent['id'] }>()
const paused = ref(false)
const effect = computed(() => seasonalDecor[props.eventId])

// Paint each small glyph once and translate its own layer rather than repainting
// or blending full-screen textures behind the reading and practice surfaces.
const particles = computed(() => {
  const { glyphs, particles: motion } = effect.value
  const count = motion === 'snow' ? 48 : 30
  return Array.from({ length: count }, (_, index) => {
    const duration = (motion === 'snow' ? 12 : 15) + Math.random() * 14
    return {
      glyph: glyphs[index % glyphs.length],
      style: {
        left: `${(index + Math.random()) * 100 / count}%`,
        fontSize: `${(motion === 'snow' ? 6 : 9) + Math.random() * 11}px`,
        opacity: 0.36 + Math.random() * 0.38,
        animationDuration: `${duration}s`,
        animationDelay: `-${Math.random() * duration}s`,
        '--particle-drift': `${(Math.random() - 0.5) * (motion === 'bat' ? 116 : 64)}px`,
      },
    }
  })
})

function syncVisibility() {
  paused.value = document.hidden
}

onMounted(() => {
  syncVisibility()
  document.addEventListener('visibilitychange', syncVisibility)
})
onUnmounted(() => document.removeEventListener('visibilitychange', syncVisibility))
</script>
