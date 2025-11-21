<template>
  <div ref="containerRef" class="cube-container">
    <div class="cube" :style="cubeStyle">
      <!-- Outer Cube Faces -->
      <div class="face front">
        <div class="face-content"></div>
      </div>
      <div class="face back">
        <div class="face-content"></div>
      </div>
      <div class="face right">
        <div class="face-content"></div>
      </div>
      <div class="face left">
        <div class="face-content"></div>
      </div>
      <div class="face top">
        <div class="face-content"></div>
      </div>
      <div class="face bottom">
        <div class="face-content"></div>
      </div>

      <!-- Inner Glowing Core -->
      <div class="inner-core"></div>
    </div>

    <!-- Floating Particles/Glow -->
    <div class="glow-effect"></div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useCubeAnimation } from "../composables/useCubeAnimation";

const containerRef = ref<HTMLElement | null>(null);
const { cubeStyle } = useCubeAnimation(containerRef);
</script>

<style scoped>
.cube-container {
  width: 200px;
  height: 200px;
  perspective: 1000px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: pointer;
}

.cube {
  width: 100px;
  height: 100px;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.1s ease-out;
}

.face {
  position: absolute;
  width: 100px;
  height: 100px;
  border: 2px solid rgba(139, 92, 246, 0.5); /* Primary/Purple tint */
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(2px);
  box-shadow: 0 0 15px rgba(139, 92, 246, 0.2);
}

.face-content {
  width: 80%;
  height: 80%;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: linear-gradient(
    135deg,
    rgba(139, 92, 246, 0.1),
    rgba(236, 72, 153, 0.1)
  );
}

/* Face Transforms */
.front {
  transform: rotateY(0deg) translateZ(50px);
}
.back {
  transform: rotateY(180deg) translateZ(50px);
}
.right {
  transform: rotateY(90deg) translateZ(50px);
}
.left {
  transform: rotateY(-90deg) translateZ(50px);
}
.top {
  transform: rotateX(90deg) translateZ(50px);
}
.bottom {
  transform: rotateX(-90deg) translateZ(50px);
}

/* Inner Core */
.inner-core {
  position: absolute;
  width: 40px;
  height: 40px;
  background: radial-gradient(
    circle,
    rgba(139, 92, 246, 1) 0%,
    rgba(236, 72, 153, 0.8) 100%
  );
  border-radius: 50%;
  top: 30px;
  left: 30px;
  transform-style: preserve-3d;
  box-shadow: 0 0 30px 10px rgba(139, 92, 246, 0.4);
  animation: pulse 2s infinite alternate;
}

@keyframes pulse {
  0% {
    transform: scale(0.8);
    opacity: 0.7;
  }
  100% {
    transform: scale(1.2);
    opacity: 1;
  }
}

/* Dark mode adjustments */
:global(.dark) .face {
  border-color: rgba(167, 139, 250, 0.4);
  background: rgba(0, 0, 0, 0.2);
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.3);
}

:global(.dark) .face-content {
  background: linear-gradient(
    135deg,
    rgba(139, 92, 246, 0.2),
    rgba(236, 72, 153, 0.2)
  );
}

/* Glow Effect under the cube */
.glow-effect {
  position: absolute;
  width: 100%;
  height: 100%;
  background: radial-gradient(
    circle,
    rgba(139, 92, 246, 0.1) 0%,
    transparent 70%
  );
  transform: translateZ(-100px);
  pointer-events: none;
}
</style>
