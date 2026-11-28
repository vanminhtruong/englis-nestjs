<template>
  <canvas v-show="ready" ref="surface" class="stars-layer" aria-hidden="true" />
  <div v-if="!ready" class="stars-layer" aria-hidden="true">
    <span v-for="(style, index) in fallbackStyles" :key="index" class="star" :style="style" />
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from "vue";

const props = defineProps<{ paused: boolean }>();
const surface = ref<HTMLCanvasElement | null>(null);
const ready = ref(false);
const spriteSize = 36;
const diameters = [1, 1.5, 2, 2.5, 3, 3.5, 4];
const stars = Array.from({ length: 50 }, () => ({
  x: Math.random(),
  y: Math.random() * 0.6,
  delay: Math.random() * 5000,
  duration: 1500 + Math.random() * 3000,
  sizeIndex: Math.floor(Math.random() * diameters.length),
}));

const fallbackStyles = stars.map(({ x, y, delay, duration, sizeIndex }) => ({
  left: x * 100 + "%",
  top: y * 100 + "%",
  width: diameters[sizeIndex] + "px",
  height: diameters[sizeIndex] + "px",
  animationDelay: delay + "ms",
  animationDuration: duration + "ms",
}));

let sprites: HTMLCanvasElement[] = [];
let context: CanvasRenderingContext2D | null = null;
let observer: ResizeObserver | undefined;
let width = 0;
let height = 0;
let frame = 0;
let elapsed = 0;
let previousTime: number | undefined;

function buildSprites() {
  // Cache the original white center and two halos at higher than CSS pixel density.
  return diameters.map(diameter => {
    const sprite = document.createElement("canvas");
    sprite.width = sprite.height = spriteSize * 2;
    const paint = sprite.getContext("2d")!;
    paint.scale(2, 2);
    const center = spriteSize / 2;
    const radius = diameter / 2;
    const halo = paint.createRadialGradient(center, center, radius, center, center, radius + 15);
    halo.addColorStop(0, "rgba(255,255,255,.63)");
    halo.addColorStop(.23, "rgba(255,255,255,.48)");
    halo.addColorStop(.5, "rgba(222,233,255,.25)");
    halo.addColorStop(1, "rgba(200,220,255,0)");
    paint.fillStyle = halo;
    paint.fillRect(0, 0, spriteSize, spriteSize);
    paint.fillStyle = "white";
    paint.beginPath();
    paint.arc(center, center, radius, 0, Math.PI * 2);
    paint.fill();
    return sprite;
  });
}

function draw() {
  if (!context || !width || !height) return;
  context.clearRect(0, 0, width, height);
  for (const star of stars) {
    const cycle = (Math.max(0, elapsed - star.delay) % star.duration) / star.duration;
    const pulse = 1 - Math.abs(2 * cycle - 1);
    const eased = pulse * pulse * (3 - 2 * pulse);
    const extent = spriteSize * (1 + 0.3 * eased);
    context.globalAlpha = 0.5 + eased * 0.5;
    context.drawImage(sprites[star.sizeIndex]!, star.x * width - extent / 2,
      star.y * height - extent / 2, extent, extent);
  }
  context.globalAlpha = 1;
}

function tick(time: number) {
  if (previousTime !== undefined) elapsed += time - previousTime;
  previousTime = time;
  draw();
  frame = requestAnimationFrame(tick);
}

function syncMotion() {
  cancelAnimationFrame(frame);
  previousTime = undefined;
  if (!props.paused && ready.value) frame = requestAnimationFrame(tick);
}

function resize() {
  const canvas = surface.value;
  if (!canvas || !context) return;
  width = canvas.clientWidth;
  height = canvas.clientHeight;
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  draw();
}

onMounted(() => {
  context = surface.value?.getContext("2d") ?? null;
  if (!context || !surface.value) return;
  sprites = buildSprites();
  ready.value = true;
  if (typeof ResizeObserver !== "undefined") {
    observer = new ResizeObserver(resize);
    observer.observe(surface.value);
  }
  window.addEventListener("resize", resize, { passive: true });
});

watch(() => [ready.value, props.paused], () => {
  if (ready.value && !width) resize();
  syncMotion();
}, { flush: "post" });

onBeforeUnmount(() => {
  cancelAnimationFrame(frame);
  observer?.disconnect();
  window.removeEventListener("resize", resize);
});
</script>

<style scoped>
.stars-layer {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.star {
  position: absolute;
  background: white;
  border-radius: 50%;
  box-shadow: 0 0 6px 2px rgba(255, 255, 255, .6), 0 0 12px 4px rgba(200, 220, 255, .3);
  animation: twinkle 2s ease-in-out infinite;
}

@keyframes twinkle {
  0%, 100% { opacity: .5; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.3); }
}
</style>
