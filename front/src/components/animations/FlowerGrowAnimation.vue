<template>
  <div class="animated-flower-bg">
    <!-- Background gradient - Night sky -->
    <div class="bg-layer"></div>

    <!-- Twinkling Stars -->
    <div class="stars-layer">
      <div
        v-for="i in 50"
        :key="'star-' + i"
        class="star"
        :style="getStarStyle(i)"
      ></div>
    </div>

    <!-- Shooting stars -->
    <div class="shooting-stars">
      <div class="shooting-star ss-1"></div>
      <div class="shooting-star ss-2"></div>
      <div class="shooting-star ss-3"></div>
    </div>

    <!-- Moon glow -->
    <div class="moon">
      <div class="moon-glow"></div>
      <div class="moon-surface"></div>
    </div>

    <!-- Ground -->
    <div class="ground"></div>

    <!-- Flowers container -->
    <div class="flowers-wrapper">
      <!-- Flower 1 - Rose (Pink) -->
      <div class="flower-group flower-1">
        <div class="stem-container">
          <svg class="stem" viewBox="0 0 20 120" preserveAspectRatio="none">
            <path
              class="stem-path"
              d="M10 120 Q8 90 12 60 Q8 30 10 0"
              fill="none"
              stroke="url(#stemGradient)"
              stroke-width="3"
            />
            <defs>
              <linearGradient
                id="stemGradient"
                x1="0%"
                y1="100%"
                x2="0%"
                y2="0%"
              >
                <stop offset="0%" stop-color="#1a5a1a" />
                <stop offset="100%" stop-color="#2d8a2d" />
              </linearGradient>
            </defs>
          </svg>
          <!-- Leaves -->
          <svg class="leaf leaf-left" viewBox="0 0 40 25">
            <path
              d="M0 12 Q10 0 25 5 Q40 8 35 15 Q25 25 10 20 Q0 18 0 12"
              fill="url(#leafGradient)"
            />
            <path
              d="M5 13 Q15 10 30 12"
              fill="none"
              stroke="#1a5a1a"
              stroke-width="0.5"
              opacity="0.5"
            />
          </svg>
          <svg class="leaf leaf-right" viewBox="0 0 40 25">
            <path
              d="M40 12 Q30 0 15 5 Q0 8 5 15 Q15 25 30 20 Q40 18 40 12"
              fill="url(#leafGradient)"
            />
            <path
              d="M35 13 Q25 10 10 12"
              fill="none"
              stroke="#1a5a1a"
              stroke-width="0.5"
              opacity="0.5"
            />
          </svg>
        </div>
        <!-- Rose flower -->
        <div class="rose-bloom">
          <svg class="rose" viewBox="0 0 80 80">
            <defs>
              <radialGradient id="roseGradient1" cx="50%" cy="50%">
                <stop offset="0%" stop-color="#ff69b4" />
                <stop offset="50%" stop-color="#ff1493" />
                <stop offset="100%" stop-color="#c71585" />
              </radialGradient>
              <radialGradient id="roseCenterGradient">
                <stop offset="0%" stop-color="#ffb6c1" />
                <stop offset="100%" stop-color="#ff69b4" />
              </radialGradient>
              <linearGradient
                id="leafGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stop-color="#228b22" />
                <stop offset="100%" stop-color="#32cd32" />
              </linearGradient>
            </defs>
            <!-- Outer petals -->
            <g class="outer-petals">
              <ellipse
                cx="40"
                cy="20"
                rx="18"
                ry="22"
                fill="url(#roseGradient1)"
                class="petal p1"
              />
              <ellipse
                cx="60"
                cy="35"
                rx="18"
                ry="22"
                fill="url(#roseGradient1)"
                class="petal p2"
                transform="rotate(72 40 40)"
              />
              <ellipse
                cx="55"
                cy="58"
                rx="18"
                ry="22"
                fill="url(#roseGradient1)"
                class="petal p3"
                transform="rotate(144 40 40)"
              />
              <ellipse
                cx="25"
                cy="58"
                rx="18"
                ry="22"
                fill="url(#roseGradient1)"
                class="petal p4"
                transform="rotate(216 40 40)"
              />
              <ellipse
                cx="20"
                cy="35"
                rx="18"
                ry="22"
                fill="url(#roseGradient1)"
                class="petal p5"
                transform="rotate(288 40 40)"
              />
            </g>
            <!-- Inner petals -->
            <g class="inner-petals">
              <ellipse
                cx="40"
                cy="28"
                rx="12"
                ry="15"
                fill="#ff69b4"
                class="petal ip1"
              />
              <ellipse
                cx="52"
                cy="38"
                rx="12"
                ry="15"
                fill="#ff69b4"
                class="petal ip2"
                transform="rotate(72 40 40)"
              />
              <ellipse
                cx="48"
                cy="52"
                rx="12"
                ry="15"
                fill="#ff69b4"
                class="petal ip3"
                transform="rotate(144 40 40)"
              />
              <ellipse
                cx="32"
                cy="52"
                rx="12"
                ry="15"
                fill="#ff69b4"
                class="petal ip4"
                transform="rotate(216 40 40)"
              />
              <ellipse
                cx="28"
                cy="38"
                rx="12"
                ry="15"
                fill="#ff69b4"
                class="petal ip5"
                transform="rotate(288 40 40)"
              />
            </g>
            <!-- Center spiral -->
            <circle
              cx="40"
              cy="40"
              r="10"
              fill="url(#roseCenterGradient)"
              class="center"
            />
            <path
              d="M40 35 Q45 38 40 43 Q35 40 38 36"
              fill="#c71585"
              opacity="0.6"
              class="center-detail"
            />
          </svg>
        </div>
      </div>

      <!-- Flower 2 - Sunflower (Yellow) -->
      <div class="flower-group flower-2">
        <div class="stem-container">
          <svg class="stem" viewBox="0 0 20 100" preserveAspectRatio="none">
            <path
              class="stem-path"
              d="M10 100 Q12 70 8 40 Q12 10 10 0"
              fill="none"
              stroke="url(#stemGradient2)"
              stroke-width="4"
            />
            <defs>
              <linearGradient
                id="stemGradient2"
                x1="0%"
                y1="100%"
                x2="0%"
                y2="0%"
              >
                <stop offset="0%" stop-color="#2d5a27" />
                <stop offset="100%" stop-color="#4a7c42" />
              </linearGradient>
            </defs>
          </svg>
          <svg class="leaf leaf-left sunflower-leaf" viewBox="0 0 50 30">
            <path
              d="M0 15 Q15 0 35 8 Q50 12 45 20 Q30 30 10 25 Q0 22 0 15"
              fill="url(#leafGradient)"
            />
          </svg>
          <svg class="leaf leaf-right sunflower-leaf" viewBox="0 0 50 30">
            <path
              d="M50 15 Q35 0 15 8 Q0 12 5 20 Q20 30 40 25 Q50 22 50 15"
              fill="url(#leafGradient)"
            />
          </svg>
        </div>
        <!-- Sunflower -->
        <div class="sunflower-bloom">
          <svg class="sunflower" viewBox="0 0 100 100">
            <defs>
              <radialGradient id="sunflowerPetal">
                <stop offset="0%" stop-color="#ffd700" />
                <stop offset="100%" stop-color="#ff8c00" />
              </radialGradient>
              <radialGradient id="sunflowerCenter">
                <stop offset="0%" stop-color="#654321" />
                <stop offset="60%" stop-color="#4a3520" />
                <stop offset="100%" stop-color="#3d2914" />
              </radialGradient>
            </defs>
            <!-- Petals layer 1 -->
            <g class="sunflower-petals-1">
              <ellipse
                v-for="i in 12"
                :key="'sp1-' + i"
                cx="50"
                cy="18"
                rx="8"
                ry="20"
                fill="url(#sunflowerPetal)"
                :transform="`rotate(${i * 30} 50 50)`"
                class="sunflower-petal"
              />
            </g>
            <!-- Petals layer 2 -->
            <g class="sunflower-petals-2">
              <ellipse
                v-for="i in 12"
                :key="'sp2-' + i"
                cx="50"
                cy="22"
                rx="7"
                ry="16"
                fill="#ffb700"
                :transform="`rotate(${i * 30 + 15} 50 50)`"
                class="sunflower-petal"
              />
            </g>
            <!-- Center -->
            <circle
              cx="50"
              cy="50"
              r="22"
              fill="url(#sunflowerCenter)"
              class="sunflower-center"
            />
            <!-- Seeds pattern -->
            <g class="seeds">
              <circle
                v-for="i in 20"
                :key="'seed-' + i"
                :cx="50 + Math.cos(i * 0.618 * Math.PI * 2) * (i * 0.8)"
                :cy="50 + Math.sin(i * 0.618 * Math.PI * 2) * (i * 0.8)"
                r="2"
                fill="#2d1f14"
                opacity="0.7"
              />
            </g>
          </svg>
        </div>
      </div>

      <!-- Flower 3 - Tulip (Purple) -->
      <div class="flower-group flower-3">
        <div class="stem-container">
          <svg
            class="stem tulip-stem"
            viewBox="0 0 20 90"
            preserveAspectRatio="none"
          >
            <path
              class="stem-path"
              d="M10 90 Q8 60 10 30 Q12 10 10 0"
              fill="none"
              stroke="url(#stemGradient3)"
              stroke-width="3"
            />
            <defs>
              <linearGradient
                id="stemGradient3"
                x1="0%"
                y1="100%"
                x2="0%"
                y2="0%"
              >
                <stop offset="0%" stop-color="#1a4a1a" />
                <stop offset="100%" stop-color="#2d7a2d" />
              </linearGradient>
            </defs>
          </svg>
          <svg class="leaf tulip-leaf-left" viewBox="0 0 30 60">
            <path
              d="M15 60 Q0 40 5 20 Q10 0 15 0 Q20 0 25 20 Q30 40 15 60"
              fill="url(#leafGradient)"
            />
          </svg>
          <svg class="leaf tulip-leaf-right" viewBox="0 0 30 60">
            <path
              d="M15 60 Q0 40 5 20 Q10 0 15 0 Q20 0 25 20 Q30 40 15 60"
              fill="url(#leafGradient)"
            />
          </svg>
        </div>
        <!-- Tulip -->
        <div class="tulip-bloom">
          <svg class="tulip" viewBox="0 0 60 70">
            <defs>
              <linearGradient
                id="tulipGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stop-color="#9b59b6" />
                <stop offset="50%" stop-color="#8e44ad" />
                <stop offset="100%" stop-color="#6c3483" />
              </linearGradient>
            </defs>
            <!-- Tulip petals -->
            <path
              class="tulip-petal tp1"
              d="M30 70 Q15 50 10 30 Q8 15 20 5 Q30 0 30 0 Q30 0 30 5 Q30 20 30 70"
              fill="url(#tulipGradient)"
            />
            <path
              class="tulip-petal tp2"
              d="M30 70 Q45 50 50 30 Q52 15 40 5 Q30 0 30 0 Q30 0 30 5 Q30 20 30 70"
              fill="url(#tulipGradient)"
            />
            <path
              class="tulip-petal tp3"
              d="M30 70 Q20 55 18 35 Q16 20 25 8 Q30 3 30 3 Q30 10 30 70"
              fill="#a569bd"
              opacity="0.8"
            />
            <path
              class="tulip-petal tp4"
              d="M30 70 Q40 55 42 35 Q44 20 35 8 Q30 3 30 3 Q30 10 30 70"
              fill="#a569bd"
              opacity="0.8"
            />
            <!-- Highlight -->
            <ellipse cx="25" cy="25" rx="3" ry="8" fill="white" opacity="0.2" />
          </svg>
        </div>
      </div>
    </div>

    <!-- Floating particles -->
    <div class="particles">
      <div
        v-for="i in 15"
        :key="'particle-' + i"
        class="particle"
        :style="getParticleStyle(i)"
      ></div>
    </div>

    <!-- Fireflies -->
    <div class="fireflies">
      <div
        v-for="i in 8"
        :key="'firefly-' + i"
        class="firefly"
        :style="getFireflyStyle(i)"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
const getParticleStyle = (index: number) => {
  const left = 10 + Math.random() * 80;
  const delay = Math.random() * 10;
  const duration = 12 + Math.random() * 8;
  const size = 3 + Math.random() * 5;

  return {
    left: `${left}%`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`,
    width: `${size}px`,
    height: `${size}px`,
  };
};

const getFireflyStyle = (index: number) => {
  const left = 5 + Math.random() * 90;
  const top = 10 + Math.random() * 60;
  const delay = Math.random() * 5;
  const duration = 3 + Math.random() * 4;

  return {
    left: `${left}%`,
    top: `${top}%`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`,
  };
};

const getStarStyle = (index: number) => {
  const left = Math.random() * 100;
  const top = Math.random() * 60; // Upper 60% of screen
  const delay = Math.random() * 5;
  const duration = 1.5 + Math.random() * 3;
  const size = 1 + Math.random() * 3;
  const brightness = 0.5 + Math.random() * 0.5;

  return {
    left: `${left}%`,
    top: `${top}%`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`,
    width: `${size}px`,
    height: `${size}px`,
    opacity: brightness,
  };
};
</script>

<style scoped>
.animated-flower-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
  border-radius: inherit;
}

.bg-layer {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    #000000 0%,
    #0a0a15 20%,
    #0d0d1a 40%,
    #101020 60%,
    #0a1015 100%
  );
}

/* Twinkling Stars */
.stars-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.star {
  position: absolute;
  background: #ffffff;
  border-radius: 50%;
  box-shadow: 0 0 6px 2px rgba(255, 255, 255, 0.6),
    0 0 12px 4px rgba(200, 220, 255, 0.3);
  animation: twinkle var(--duration, 2s) ease-in-out infinite;
}

@keyframes twinkle {
  0%,
  100% {
    opacity: var(--base-opacity, 0.5);
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.3);
  }
}

/* Shooting Stars */
.shooting-stars {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.shooting-star {
  position: absolute;
  width: 100px;
  height: 2px;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.8) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  border-radius: 100%;
  opacity: 0;
  transform: rotate(-45deg);
}

.ss-1 {
  top: 10%;
  left: 20%;
  animation: shoot 4s ease-in-out infinite;
  animation-delay: 0s;
}

.ss-2 {
  top: 25%;
  left: 60%;
  animation: shoot 4s ease-in-out infinite;
  animation-delay: 2s;
}

.ss-3 {
  top: 15%;
  left: 80%;
  animation: shoot 4s ease-in-out infinite;
  animation-delay: 3.5s;
}

@keyframes shoot {
  0% {
    opacity: 0;
    transform: translateX(0) translateY(0) rotate(-45deg);
  }
  5% {
    opacity: 1;
  }
  20% {
    opacity: 0;
    transform: translateX(150px) translateY(150px) rotate(-45deg);
  }
  100% {
    opacity: 0;
    transform: translateX(150px) translateY(150px) rotate(-45deg);
  }
}

/* Moon */
.moon {
  position: absolute;
  top: 8%;
  right: 12%;
  width: 40px;
  height: 40px;
}

.moon-glow {
  position: absolute;
  inset: -15px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(255, 255, 200, 0.3) 0%,
    transparent 70%
  );
  animation: moon-pulse 4s ease-in-out infinite;
}

.moon-surface {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: radial-gradient(
    circle at 30% 30%,
    #fffacd 0%,
    #f0e68c 50%,
    #daa520 100%
  );
  box-shadow: 0 0 20px 5px rgba(255, 250, 205, 0.4),
    inset -5px -5px 15px rgba(0, 0, 0, 0.2);
}

@keyframes moon-pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.1);
    opacity: 1;
  }
}

.ground {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 15%;
  background: linear-gradient(180deg, #0a1a0a 0%, #050f05 100%);
  border-radius: 50% 50% 0 0 / 20% 20% 0 0;
}

/* Flowers wrapper */
.flowers-wrapper {
  position: absolute;
  bottom: 10%;
  left: 0;
  right: 0;
  height: 70%;
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  padding: 0 8%;
}

.flower-group {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  transform-origin: bottom center;
  opacity: 0;
  transform: scaleY(0);
}

.flower-1 {
  animation: grow-flower 3s ease-out 0.5s forwards;
}

.flower-2 {
  animation: grow-flower 3s ease-out 1.2s forwards;
}

.flower-3 {
  animation: grow-flower 3s ease-out 1.8s forwards;
}

/* Stems */
.stem-container {
  position: relative;
  width: 20px;
}

.stem {
  width: 20px;
  height: 80px;
}

.flower-1 .stem {
  height: 90px;
}
.flower-2 .stem {
  height: 75px;
}
.flower-3 .stem {
  height: 70px;
}

.stem-path {
  stroke-dasharray: 200;
  stroke-dashoffset: 200;
  animation: draw-stem 2s ease-out forwards;
}

.flower-1 .stem-path {
  animation-delay: 0.5s;
}
.flower-2 .stem-path {
  animation-delay: 1.2s;
}
.flower-3 .stem-path {
  animation-delay: 1.8s;
}

/* Leaves */
.leaf {
  position: absolute;
  width: 35px;
  height: 20px;
  opacity: 0;
  animation: leaf-appear 0.8s ease-out forwards;
}

.leaf-left {
  left: -30px;
  top: 45%;
  transform: rotate(-20deg);
}

.leaf-right {
  right: -30px;
  top: 55%;
  transform: rotate(20deg) scaleX(-1);
}

.flower-1 .leaf {
  animation-delay: 1.5s;
}
.flower-2 .leaf {
  animation-delay: 2.2s;
}
.flower-3 .leaf {
  animation-delay: 2.8s;
}

.sunflower-leaf {
  width: 45px;
  height: 25px;
}

.tulip-leaf-left,
.tulip-leaf-right {
  width: 25px;
  height: 50px;
  top: 30%;
}

.tulip-leaf-left {
  left: -20px;
  transform: rotate(-15deg);
}

.tulip-leaf-right {
  right: -20px;
  transform: rotate(15deg);
}

/* Rose bloom */
.rose-bloom {
  position: absolute;
  top: -50px;
  left: 50%;
  transform: translateX(-50%);
}

.rose {
  width: 60px;
  height: 60px;
  opacity: 0;
  transform: scale(0);
  animation: bloom-flower 1.5s ease-out forwards;
}

.flower-1 .rose {
  animation-delay: 2s;
}

.rose .petal {
  opacity: 0;
  transform-origin: center;
  animation: petal-unfold 0.8s ease-out forwards;
}

.rose .p1 {
  animation-delay: 2.2s;
}
.rose .p2 {
  animation-delay: 2.4s;
}
.rose .p3 {
  animation-delay: 2.6s;
}
.rose .p4 {
  animation-delay: 2.8s;
}
.rose .p5 {
  animation-delay: 3s;
}
.rose .ip1 {
  animation-delay: 3.2s;
}
.rose .ip2 {
  animation-delay: 3.3s;
}
.rose .ip3 {
  animation-delay: 3.4s;
}
.rose .ip4 {
  animation-delay: 3.5s;
}
.rose .ip5 {
  animation-delay: 3.6s;
}

.rose .center {
  opacity: 0;
  animation: center-appear 0.5s ease-out 3.8s forwards;
}

/* Sunflower bloom */
.sunflower-bloom {
  position: absolute;
  top: -60px;
  left: 50%;
  transform: translateX(-50%);
}

.sunflower {
  width: 70px;
  height: 70px;
  opacity: 0;
  transform: scale(0);
  animation: bloom-flower 1.5s ease-out forwards;
}

.flower-2 .sunflower {
  animation-delay: 2.5s;
}

.sunflower-petal {
  opacity: 0;
  transform-origin: 50px 50px;
  animation: sunflower-petal-bloom 0.5s ease-out forwards;
}

.sunflower-petals-1 .sunflower-petal {
  animation-delay: calc(2.8s + var(--i, 0) * 0.05s);
}

.sunflower-petals-2 .sunflower-petal {
  animation-delay: calc(3.2s + var(--i, 0) * 0.05s);
}

.sunflower-center {
  opacity: 0;
  animation: center-appear 0.6s ease-out 3.5s forwards;
}

.seeds circle {
  opacity: 0;
  animation: seed-appear 0.3s ease-out forwards;
  animation-delay: calc(3.7s + var(--i, 0) * 0.02s);
}

/* Tulip bloom */
.tulip-bloom {
  position: absolute;
  top: -45px;
  left: 50%;
  transform: translateX(-50%);
}

.tulip {
  width: 45px;
  height: 55px;
  opacity: 0;
  transform: scale(0);
  animation: bloom-flower 1.5s ease-out forwards;
}

.flower-3 .tulip {
  animation-delay: 3s;
}

.tulip-petal {
  opacity: 0;
  transform-origin: 30px 70px;
  animation: tulip-petal-open 1s ease-out forwards;
}

.tp1 {
  animation-delay: 3.3s;
}
.tp2 {
  animation-delay: 3.5s;
}
.tp3 {
  animation-delay: 3.7s;
}
.tp4 {
  animation-delay: 3.9s;
}

/* Particles */
.particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.particle {
  position: absolute;
  bottom: -10px;
  background: radial-gradient(
    circle,
    rgba(255, 215, 0, 0.9) 0%,
    rgba(255, 165, 0, 0) 70%
  );
  border-radius: 50%;
  animation: float-up 15s ease-in-out infinite;
}

/* Fireflies */
.fireflies {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.firefly {
  position: absolute;
  width: 4px;
  height: 4px;
  background: #ffd700;
  border-radius: 50%;
  box-shadow: 0 0 10px 3px rgba(255, 215, 0, 0.6),
    0 0 20px 6px rgba(255, 165, 0, 0.3);
  animation: firefly-glow 4s ease-in-out infinite;
}

/* Animations */
@keyframes grow-flower {
  0% {
    opacity: 0;
    transform: scaleY(0);
  }
  50% {
    opacity: 1;
  }
  70% {
    transform: scaleY(1.05);
  }
  100% {
    opacity: 1;
    transform: scaleY(1);
  }
}

@keyframes draw-stem {
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes leaf-appear {
  0% {
    opacity: 0;
    transform: scale(0) rotate(-20deg);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotate(-20deg);
  }
}

@keyframes bloom-flower {
  0% {
    opacity: 0;
    transform: scale(0) translateX(-50%);
  }
  60% {
    opacity: 1;
    transform: scale(1.1) translateX(-50%);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateX(-50%);
  }
}

@keyframes petal-unfold {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes sunflower-petal-bloom {
  0% {
    opacity: 0;
    transform: scale(0);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes tulip-petal-open {
  0% {
    opacity: 0;
    transform: scaleY(0.3);
  }
  100% {
    opacity: 1;
    transform: scaleY(1);
  }
}

@keyframes center-appear {
  0% {
    opacity: 0;
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes seed-appear {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 0.7;
  }
}

@keyframes float-up {
  0% {
    transform: translateY(0) translateX(0);
    opacity: 0;
  }
  10% {
    opacity: 0.8;
  }
  90% {
    opacity: 0.6;
  }
  100% {
    transform: translateY(-100vh) translateX(30px);
    opacity: 0;
  }
}

@keyframes firefly-glow {
  0%,
  100% {
    opacity: 0.3;
    transform: scale(0.8);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}

/* Continuous sway animation after bloom */
.flower-group {
  animation-fill-mode: forwards;
}

.flower-1.grown,
.flower-2.grown,
.flower-3.grown {
  animation: sway 4s ease-in-out infinite;
}

@keyframes sway {
  0%,
  100% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(2deg);
  }
  75% {
    transform: rotate(-2deg);
  }
}
</style>
