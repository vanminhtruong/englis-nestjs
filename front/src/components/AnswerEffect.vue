<template>
  <div
    class="pointer-events-none fixed inset-0 z-50 flex items-center justify-center"
  >
    <!-- Canvas for confetti (always visible for confetti to work) -->
    <canvas ref="canvasRef" class="w-full h-full"></canvas>

    <!-- Wrong answer overlay (simple red flash) -->
    <div
      v-if="type === 'wrong' && visible"
      class="absolute inset-0 bg-red-500/10 dark:bg-red-500/10 animate-pulse"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch, nextTick } from "vue";
import confetti from "canvas-confetti";

const props = defineProps<{
  type: "correct" | "wrong" | null;
  triggerKey: number;
}>();

const canvasRef = ref<HTMLCanvasElement | null>(null);
const visible = ref(false);
let myConfetti: any = null;
let timeoutId: number | null = null;
let pendingLaunch: boolean = false;
let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
  }
  return audioContext;
}

// Correct sound: Cheerful ascending melody (C5 -> E5 -> G5)
function playCorrectSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    const duration = 0.12;

    notes.forEach((freq, i) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(freq, now + i * duration);

      gainNode.gain.setValueAtTime(0, now + i * duration);
      gainNode.gain.linearRampToValueAtTime(0.3, now + i * duration + 0.02);
      gainNode.gain.linearRampToValueAtTime(
        0.2,
        now + i * duration + duration * 0.5
      );
      gainNode.gain.linearRampToValueAtTime(0, now + i * duration + duration);

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start(now + i * duration);
      oscillator.stop(now + i * duration + duration + 0.05);
    });

    // Add a final chord
    const chordNotes = [523.25, 659.25, 783.99]; // C5, E5, G5 chord
    const chordStart = now + notes.length * duration;

    chordNotes.forEach((freq) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(freq, chordStart);

      gainNode.gain.setValueAtTime(0, chordStart);
      gainNode.gain.linearRampToValueAtTime(0.15, chordStart + 0.03);
      gainNode.gain.exponentialRampToValueAtTime(0.001, chordStart + 0.4);

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start(chordStart);
      oscillator.stop(chordStart + 0.5);
    });
  } catch (e) {
    console.warn("Could not play correct sound:", e);
  }
}

// Wrong sound: Descending low buzz tone
function playWrongSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Two descending notes
    const notes = [311.13, 233.08]; // Eb4, Bb3

    notes.forEach((freq, i) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.type = "sawtooth";
      oscillator.frequency.setValueAtTime(freq, now + i * 0.15);

      gainNode.gain.setValueAtTime(0, now + i * 0.15);
      gainNode.gain.linearRampToValueAtTime(0.15, now + i * 0.15 + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.2);

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start(now + i * 0.15);
      oscillator.stop(now + i * 0.15 + 0.25);
    });
  } catch (e) {
    console.warn("Could not play wrong sound:", e);
  }
}

function clearTimer() {
  if (timeoutId !== null) {
    window.clearTimeout(timeoutId);
    timeoutId = null;
  }
}

function initConfetti() {
  if (!myConfetti && canvasRef.value) {
    myConfetti = confetti.create(canvasRef.value, {
      resize: true,
      useWorker: false,
    });
    // If there was a pending launch, execute it now
    if (pendingLaunch) {
      pendingLaunch = false;
      doLaunchEffect();
    }
  }
}

function launchEffect() {
  clearTimer();

  if (!props.type) {
    visible.value = false;
    return;
  }

  // Try to initialize myConfetti if not yet done
  initConfetti();

  // If still no myConfetti, mark as pending and wait for canvas to be available
  if (!myConfetti) {
    pendingLaunch = true;
    // Also try with nextTick in case canvas is about to be rendered
    nextTick(() => {
      initConfetti();
    });
    return;
  }

  doLaunchEffect();
}

function doLaunchEffect() {
  if (!props.type || !myConfetti) {
    visible.value = false;
    return;
  }

  visible.value = true;

  if (props.type === "correct") {
    // Play correct sound
    playCorrectSound();

    myConfetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#4ade80", "#22c55e", "#22d3ee", "#a855f7"],
    });
  } else if (props.type === "wrong") {
    // Play wrong sound
    playWrongSound();

    myConfetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 },
      colors: ["#f97373", "#ef4444", "#b91c1c"],
    });
  }

  timeoutId = window.setTimeout(() => {
    visible.value = false;
  }, 1200);
}

// Watch for canvas ref becoming available
watch(canvasRef, (newCanvas) => {
  if (newCanvas && !myConfetti) {
    initConfetti();
  }
});

// Watch for triggerKey changes to launch effect
watch(
  () => props.triggerKey,
  () => {
    launchEffect();
  }
);

onMounted(() => {
  // Initialize confetti when component is mounted
  nextTick(() => {
    initConfetti();
  });
});

onBeforeUnmount(() => {
  clearTimer();
  // Close audio context when component is unmounted
  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }
});
</script>

<style scoped>
canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
</style>
