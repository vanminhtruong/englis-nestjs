<template>
  <div class="pointer-events-none fixed inset-0 z-50 flex items-center justify-center" v-show="visible">
    <!-- Canvas for confetti (always mounted) -->
    <canvas ref="canvasRef" class="w-full h-full"></canvas>

    <!-- Wrong answer overlay (simple red flash) -->
    <div
      v-if="type === 'wrong'"
      class="absolute inset-0 bg-red-500/10 dark:bg-red-500/10 animate-pulse"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import confetti from 'canvas-confetti'

const props = defineProps<{
  type: 'correct' | 'wrong' | null
  triggerKey: number
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const visible = ref(false)
let myConfetti: any = null
let timeoutId: number | null = null

function clearTimer() {
  if (timeoutId !== null) {
    window.clearTimeout(timeoutId)
    timeoutId = null
  }
}

function launchEffect() {
  clearTimer()

  if (!props.type || !myConfetti) {
    visible.value = false
    return
  }

  visible.value = true

  if (props.type === 'correct') {
    myConfetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#4ade80', '#22c55e', '#22d3ee', '#a855f7'],
    })
  } else if (props.type === 'wrong') {
    myConfetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#f97373', '#ef4444', '#b91c1c'],
    })
  }

  timeoutId = window.setTimeout(() => {
    visible.value = false
  }, 1200)
}

watch(
  () => props.triggerKey,
  () => {
    launchEffect()
  }
)

onMounted(() => {
  if (canvasRef.value) {
    // Disable worker to avoid issues in some dev setups
    myConfetti = confetti.create(canvasRef.value, { resize: true, useWorker: false })
  }
})

onBeforeUnmount(() => {
  clearTimer()
})
</script>

<style scoped>
canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
</style>
