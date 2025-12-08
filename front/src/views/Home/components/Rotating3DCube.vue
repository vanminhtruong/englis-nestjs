<template>
  <div
    class="cube-container"
    :style="containerStyle"
    @contextmenu.prevent
    @mousedown="handleMouseDown"
    @touchstart="handleTouchStart"
  >
    <div class="cube-wrapper">
      <div
        ref="cubeRef"
        class="cube"
        :class="{
          'reduce-motion': prefersReducedMotion,
          'is-dragging': isDragging,
        }"
        :style="cubeStyle"
      >
        <!-- Front face -->
        <div class="cube-face front">
          <div class="face-content">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
        </div>
        <!-- Back face -->
        <div class="cube-face back">
          <div class="face-content">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
          </div>
        </div>
        <!-- Right face -->
        <div class="cube-face right">
          <div class="face-content">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <path
                d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
              />
            </svg>
          </div>
        </div>
        <!-- Left face -->
        <div class="cube-face left">
          <div class="face-content">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path
                d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
              />
            </svg>
          </div>
        </div>
        <!-- Top face -->
        <div class="cube-face top">
          <div class="face-content">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <polygon
                points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
              />
            </svg>
          </div>
        </div>
        <!-- Bottom face -->
        <div class="cube-face bottom">
          <div class="face-content">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Shadow -->
      <div class="cube-shadow"></div>
    </div>

    <!-- Glow effect -->
    <div class="cube-glow"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";

const props = withDefaults(
  defineProps<{
    size?: number;
  }>(),
  {
    size: 120,
  }
);

const prefersReducedMotion = ref(false);
const cubeRef = ref<HTMLElement | null>(null);

// Drag rotation state
const isDragging = ref(false);
const rotationX = ref(-20);
const rotationY = ref(0);
const lastMouseX = ref(0);
const lastMouseY = ref(0);
const autoRotateOffset = ref(0);
let animationPausedAt = 0;

const containerStyle = computed(() => ({
  "--cube-size": `${props.size}px`,
}));

const cubeStyle = computed(() => {
  if (isDragging.value) {
    return {
      transform: `rotateX(${rotationX.value}deg) rotateY(${rotationY.value}deg)`,
      animationPlayState: "paused",
    };
  }
  return {
    "--rotation-offset": `${autoRotateOffset.value}deg`,
  };
});

// Mouse handlers
function handleMouseDown(e: MouseEvent) {
  // Respond to left-click (button 0) or right-click (button 2)
  if (e.button !== 0 && e.button !== 2) return;

  e.preventDefault();
  e.stopPropagation();
  startDragging(e.clientX, e.clientY);

  window.addEventListener("mousemove", handleMouseMove);
  window.addEventListener("mouseup", handleMouseUp);
}

function handleMouseMove(e: MouseEvent) {
  if (!isDragging.value) return;

  const deltaX = e.clientX - lastMouseX.value;
  const deltaY = e.clientY - lastMouseY.value;

  // Update rotation based on mouse movement
  rotationY.value += deltaX * 0.5;
  rotationX.value -= deltaY * 0.5;

  // Clamp X rotation to prevent flipping
  rotationX.value = Math.max(-60, Math.min(60, rotationX.value));

  lastMouseX.value = e.clientX;
  lastMouseY.value = e.clientY;
}

function handleMouseUp() {
  stopDragging();
  window.removeEventListener("mousemove", handleMouseMove);
  window.removeEventListener("mouseup", handleMouseUp);
}

// Touch handlers for mobile
function handleTouchStart(e: TouchEvent) {
  if (e.touches.length !== 2) return; // Two finger touch

  e.preventDefault();
  const touch = e.touches[0];
  startDragging(touch.clientX, touch.clientY);

  window.addEventListener("touchmove", handleTouchMove, { passive: false });
  window.addEventListener("touchend", handleTouchEnd);
}

function handleTouchMove(e: TouchEvent) {
  if (!isDragging.value || e.touches.length < 1) return;
  e.preventDefault();

  const touch = e.touches[0];
  const deltaX = touch.clientX - lastMouseX.value;
  const deltaY = touch.clientY - lastMouseY.value;

  rotationY.value += deltaX * 0.5;
  rotationX.value -= deltaY * 0.5;
  rotationX.value = Math.max(-60, Math.min(60, rotationX.value));

  lastMouseX.value = touch.clientX;
  lastMouseY.value = touch.clientY;
}

function handleTouchEnd() {
  stopDragging();
  window.removeEventListener("touchmove", handleTouchMove);
  window.removeEventListener("touchend", handleTouchEnd);
}

// Common drag functions
function startDragging(x: number, y: number) {
  isDragging.value = true;
  lastMouseX.value = x;
  lastMouseY.value = y;

  // Calculate current rotation from animation
  if (cubeRef.value) {
    const computedStyle = getComputedStyle(cubeRef.value);
    const transform = computedStyle.transform;
    if (transform && transform !== "none") {
      // Extract rotation from transform matrix (approximate)
      const matrix = new DOMMatrix(transform);
      rotationY.value = Math.atan2(matrix.m13, matrix.m33) * (180 / Math.PI);
      // Keep X rotation relatively stable
      rotationX.value = -20;
    }
  }
  animationPausedAt = Date.now();
}

function stopDragging() {
  if (!isDragging.value) return;

  // Calculate offset so animation continues from current position
  autoRotateOffset.value = rotationY.value;
  isDragging.value = false;
}

onMounted(() => {
  // Check for reduced motion preference
  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  prefersReducedMotion.value = mediaQuery.matches;

  const handleChange = (e: MediaQueryListEvent) => {
    prefersReducedMotion.value = e.matches;
  };

  mediaQuery.addEventListener("change", handleChange);

  onUnmounted(() => {
    mediaQuery.removeEventListener("change", handleChange);
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
    window.removeEventListener("touchmove", handleTouchMove);
    window.removeEventListener("touchend", handleTouchEnd);
  });
});
</script>

<style scoped>
.cube-container {
  --cube-size: 120px;
  position: relative;
  width: var(--cube-size);
  height: var(--cube-size);
  perspective: 600px;
  perspective-origin: 50% 50%;
}

.cube-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
}

.cube {
  position: absolute;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  animation: rotateCube 12s linear infinite;
  animation-delay: calc(var(--rotation-offset, 0deg) / 30 * -1s);
  will-change: transform;
  cursor: grab;
}

.cube.reduce-motion {
  animation: rotateCubeSlow 30s linear infinite;
}

.cube.is-dragging {
  animation: none !important;
  cursor: grabbing;
}

@keyframes rotateCube {
  0% {
    transform: rotateX(-20deg) rotateY(0deg);
  }
  100% {
    transform: rotateX(-20deg) rotateY(360deg);
  }
}

@keyframes rotateCubeSlow {
  0% {
    transform: rotateX(-20deg) rotateY(0deg);
  }
  100% {
    transform: rotateX(-20deg) rotateY(360deg);
  }
}

.cube-face {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  backface-visibility: visible;
  border: 1px solid rgba(139, 92, 246, 0.3);
}

.face-content {
  width: 50%;
  height: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.face-content svg {
  width: 100%;
  height: 100%;
  opacity: 0.9;
}

/* Face gradients */
.cube-face.front {
  background: linear-gradient(
    135deg,
    rgba(99, 102, 241, 0.4) 0%,
    rgba(139, 92, 246, 0.6) 100%
  );
  transform: translateZ(calc(var(--cube-size) / 2));
  color: rgba(255, 255, 255, 0.9);
}

.cube-face.back {
  background: linear-gradient(
    135deg,
    rgba(139, 92, 246, 0.4) 0%,
    rgba(168, 85, 247, 0.6) 100%
  );
  transform: translateZ(calc(var(--cube-size) / -2)) rotateY(180deg);
  color: rgba(255, 255, 255, 0.9);
}

.cube-face.right {
  background: linear-gradient(
    135deg,
    rgba(124, 58, 237, 0.4) 0%,
    rgba(99, 102, 241, 0.6) 100%
  );
  transform: rotateY(90deg) translateZ(calc(var(--cube-size) / 2));
  color: rgba(255, 255, 255, 0.9);
}

.cube-face.left {
  background: linear-gradient(
    135deg,
    rgba(168, 85, 247, 0.4) 0%,
    rgba(124, 58, 237, 0.6) 100%
  );
  transform: rotateY(-90deg) translateZ(calc(var(--cube-size) / 2));
  color: rgba(255, 255, 255, 0.9);
}

.cube-face.top {
  background: linear-gradient(
    135deg,
    rgba(79, 70, 229, 0.5) 0%,
    rgba(99, 102, 241, 0.7) 100%
  );
  transform: rotateX(90deg) translateZ(calc(var(--cube-size) / 2));
  color: rgba(255, 255, 255, 0.95);
}

.cube-face.bottom {
  background: linear-gradient(
    135deg,
    rgba(139, 92, 246, 0.3) 0%,
    rgba(168, 85, 247, 0.4) 100%
  );
  transform: rotateX(-90deg) translateZ(calc(var(--cube-size) / 2));
  color: rgba(255, 255, 255, 0.8);
}

/* Shadow */
.cube-shadow {
  position: absolute;
  bottom: -30%;
  left: 50%;
  transform: translateX(-50%) rotateX(90deg);
  width: 80%;
  height: 80%;
  background: radial-gradient(
    ellipse at center,
    rgba(139, 92, 246, 0.3) 0%,
    transparent 70%
  );
  filter: blur(15px);
  animation: shadowPulse 3s ease-in-out infinite;
}

@keyframes shadowPulse {
  0%,
  100% {
    opacity: 0.5;
    transform: translateX(-50%) rotateX(90deg) scale(1);
  }
  50% {
    opacity: 0.8;
    transform: translateX(-50%) rotateX(90deg) scale(1.1);
  }
}

/* Glow effect */
.cube-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 150%;
  height: 150%;
  background: radial-gradient(
    ellipse at center,
    rgba(139, 92, 246, 0.15) 0%,
    transparent 60%
  );
  pointer-events: none;
  animation: glowPulse 4s ease-in-out infinite;
}

@keyframes glowPulse {
  0%,
  100% {
    opacity: 0.6;
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1.15);
  }
}

/* Reduced motion - less animations */
@media (prefers-reduced-motion: reduce) {
  .cube {
    animation-duration: 30s;
  }

  .cube-shadow {
    animation: none;
    opacity: 0.5;
  }

  .cube-glow {
    animation: none;
    opacity: 0.6;
  }
}

/* Performance optimization for low-end devices */
@media (max-width: 768px) {
  .cube {
    animation-duration: 16s;
  }

  .cube-face {
    border-radius: 8px;
  }

  .cube-shadow {
    display: none;
  }
}
</style>
