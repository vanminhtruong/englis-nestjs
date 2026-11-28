<template>
  <div
    ref="stage"
    class="seasonal-footer-animation"
    :class="['scene--' + eventId, 'motion--' + scene.motion]"
    :data-footer-animation="eventId"
    :data-christmas-gifts="eventId === 'christmas' ? '' : undefined"
    :data-motion-paused="motionPaused ? 'true' : undefined"
    aria-hidden="true"
  >
    <template v-if="eventId === 'christmas'">
      <img class="gift-group gift-group--left" :src="leftArt" alt="" width="120" height="84" loading="eager" decoding="async" draggable="false" />
      <img class="gift-group gift-group--right" :src="rightArt" alt="" width="120" height="73" loading="eager" decoding="async" draggable="false" />
      <div class="gift-center">
        <img class="gift-layer gift-box-back" :src="boxArt" alt="" width="120" height="120" loading="eager" decoding="async" draggable="false" />
        <div class="gift-interior">
          <img class="gift-layer gift-stocking moving" :src="stockingArt" alt="" width="120" height="120" loading="eager" decoding="async" draggable="false" />
        </div>
        <img class="gift-layer gift-box-front" :src="boxArt" alt="" width="120" height="120" loading="eager" decoding="async" draggable="false" />
        <img class="gift-layer gift-lid moving" :src="lidArt" alt="" width="120" height="120" loading="eager" decoding="async" draggable="false" />
      </div>
    </template>
    <template v-else>
      <div v-for="(index, slot) in scene.objects" :key="slot"
        :class="['scene-object', 'scene-object--' + slot, slot === 2 ? 'scene-reveal moving' : '', slot === 3 ? 'scene-companion moving' : '']">
        <img v-if="motifArt" :src="motifArt" :style="{ objectPosition: index * 100 / (motifCount - 1) + '% center' }"
          alt="" :width="96 * motifCount" height="96" loading="eager" decoding="async" draggable="false" />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { seasonalDecor, seasonalMotifArtwork } from '../../utils/seasonalDecor'
import type { SeasonalEvent } from '../../utils/seasonalCalendar'
import leftArt from '../../assets/seasonal/christmas-gifts/left.webp'
import rightArt from '../../assets/seasonal/christmas-gifts/right.webp'
import lidArt from '../../assets/seasonal/christmas-gifts/cohesive-lid.webp'
import boxArt from '../../assets/seasonal/christmas-gifts/cohesive-box.webp'
import stockingArt from '../../assets/seasonal/christmas-gifts/cohesive-stocking.webp'

const props = defineProps<{ eventId: SeasonalEvent['id'] }>()
// Reuse each event's original generated photographic motif artwork.
// Two stationary foreground objects anchor a larger animated reveal and companion.
const scenes = {
  christmas: { objects: [], motion: 'gift' },
  newYear: { objects: [2, 5, 0, 3], motion: 'burst' },
  tet: { objects: [1, 4, 0, 2], motion: 'rise' },
  womensDay: { objects: [0, 6, 2, 4], motion: 'bloom' },
  hungKings: { objects: [1, 2, 0, 4], motion: 'tribute' },
  aprilMay: { objects: [0, 4, 1, 2], motion: 'flight' },
  nationalDay: { objects: [0, 3, 4, 2], motion: 'celebrate' },
  midAutumn: { objects: [0, 3, 1, 2], motion: 'moonrise' },
  vietnamWomensDay: { objects: [0, 4, 3, 5], motion: 'bloom' },
  halloween: { objects: [0, 6, 1, 2], motion: 'haunt' },
  teachersDay: { objects: [0, 2, 6, 3], motion: 'write' },
} satisfies Record<SeasonalEvent['id'], { objects: number[]; motion: string }>
const scene = computed(() => scenes[props.eventId])
const motifArt = computed(() => seasonalMotifArtwork(props.eventId))
const motifCount = computed(() => seasonalDecor[props.eventId].motifs.length)
const stage = ref<HTMLElement | null>(null)
const motionPaused = ref(true)
let observer: IntersectionObserver | undefined
let inView = false
function syncMotion() {
  motionPaused.value = !inView || document.hidden
}
onMounted(() => {
  if (stage.value && typeof IntersectionObserver !== 'undefined') {
    observer = new IntersectionObserver(([entry]) => {
      inView = !!entry?.isIntersecting && entry.intersectionRatio >= 0.1
      syncMotion()
    }, { threshold: 0.1 })
    observer.observe(stage.value)
  } else {
    inView = true
  }
  document.addEventListener('visibilitychange', syncMotion)
  syncMotion()
})
onBeforeUnmount(() => {
  observer?.disconnect()
  document.removeEventListener('visibilitychange', syncMotion)
})
</script>

<style scoped>
.seasonal-footer-animation {
  position: relative;
  isolation: isolate;
  width: min(100%, 28rem);
  aspect-ratio: 320 / 144;
  min-width: 0;
  pointer-events: none;
  --cycle: 7s;
  --ease: cubic-bezier(.42, 0, .25, 1);
}
.gift-group { display: block; position: absolute; bottom: 0; width: 39%; height: auto; object-fit: contain; }
.gift-group--left { left: 0; }
.gift-group--right { right: 0; }
.gift-center { position: absolute; bottom: 2%; left: 34.5%; width: 31%; aspect-ratio: 1; isolation: isolate; }
.scene--christmas::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 30%;
  width: 40%;
  height: 11%;
  background: radial-gradient(ellipse, color-mix(in srgb, var(--seasonal-snow) 70%, transparent), transparent 72%);
  pointer-events: none;
}
.gift-layer { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; }
/* The photographic box is composited in depth order: interior, stocking,
   front wall, lid. The stocking cannot pass through the sides or base. */
.gift-box-back { z-index: 0; }
.gift-interior { position: absolute; inset: 0; z-index: 1; clip-path: inset(-32% 14% 43% 15%); }
.gift-box-front { z-index: 2; clip-path: polygon(0 40%, 15% 44%, 38% 51.5%, 88% 45.6%, 100% 49%, 100% 100%, 0 100%); }
.gift-stocking { animation: stocking-rise var(--cycle) infinite var(--ease); }
.gift-lid { z-index: 3; transform-origin: 48% 48%; animation: lid-open var(--cycle) infinite var(--ease); }
@keyframes lid-open {
  0%, 17%, 94%, 100% { transform: translate(0, 0) rotate(0); z-index: 3; }
  25% { transform: translate(-2%, -9%) rotate(-5deg); z-index: 3; }
  35%, 79% { transform: translate(-16%, -25%) rotate(-18deg); z-index: 0; }
  87% { transform: translate(-3%, -10%) rotate(-6deg); z-index: 3; }
}
@keyframes stocking-rise {
  0%, 35%, 79%, 100% { transform: translateY(54.1667%); }
  44% { transform: translateY(35%); }
  50% { transform: translateY(19%); }
  57% { transform: translateY(-23.3333%); }
  64% { transform: translateY(-21.6667%); }
  72% { transform: translateY(19%); }
}
.scene-object { position: absolute; width: 34%; aspect-ratio: 1; }
.scene-object img { display: block; width: 100%; height: 100%; object-fit: cover; }
.scene-object--0 { left: 2%; bottom: -1%; z-index: 3; }
.scene-object--1 { right: 2%; bottom: -1%; z-index: 3; }
.scene-object--2 { width: 33%; left: 33.5%; bottom: 2%; z-index: 2; }
.scene-object--3 { width: 22%; right: 22%; bottom: 0; z-index: 4; }
.scene-reveal { animation: scene-rise var(--cycle) infinite var(--ease); }
.scene-companion { animation: companion-sway var(--cycle) infinite var(--ease); transform-origin: center bottom; }
.motion--burst .scene-reveal, .motion--celebrate .scene-reveal { animation-name: scene-burst; }
.motion--bloom .scene-reveal { animation-name: scene-bloom; transform-origin: center bottom; }
.motion--tribute .scene-reveal { animation-name: scene-tribute; }
.motion--flight .scene-reveal { animation-name: scene-flight; }
.motion--moonrise .scene-reveal { animation-name: scene-moon; }
.motion--haunt .scene-reveal { animation-name: scene-haunt; }
.motion--write .scene-reveal { animation-name: scene-write; transform-origin: center 80%; }
.motion--haunt .scene-companion { animation-name: scene-flight; }
.motion--moonrise .scene-companion { animation-name: companion-hop; }
@keyframes scene-rise {
  0%, 15%, 100% { transform: translateY(14%) scale(.82); opacity: .65; }
  45%, 65% { transform: translateY(-20%) scale(1.07); opacity: 1; }
}
@keyframes scene-burst {
  0%, 20%, 100% { transform: translateY(12%) scale(.65); opacity: .45; }
  44% { transform: translateY(-15%) scale(1.17); opacity: 1; }
  62% { transform: translateY(-13%) scale(1); opacity: 1; }
  85% { transform: translateY(3%) scale(.86); opacity: .8; }
}
@keyframes scene-bloom {
  0%, 100% { transform: translateY(7%) rotate(-5deg) scale(.87); }
  42%, 62% { transform: translateY(-12%) rotate(4deg) scale(1.07); }
}
@keyframes scene-tribute {
  0%, 100% { transform: translateY(1%) scale(.95); }
  45%, 65% { transform: translateY(-6%) scale(1.04); }
}
@keyframes scene-flight {
  0%, 100% { transform: translate(-10%, 5%) rotate(-6deg); opacity: .85; }
  47%, 60% { transform: translate(11%, -20%) rotate(5deg); opacity: 1; }
}
@keyframes scene-moon {
  0%, 15%, 100% { transform: translateY(15%) scale(.82); opacity: .7; }
  45%, 68% { transform: translateY(-28%) scale(1.02); opacity: 1; }
}
@keyframes scene-haunt {
  0%, 100% { transform: translate(-7%, 10%) rotate(-7deg); opacity: .72; }
  35% { transform: translate(7%, -18%) rotate(7deg); opacity: 1; }
  65% { transform: translate(-3%, -12%) rotate(-4deg); opacity: .92; }
}
@keyframes scene-write {
  0%, 100% { transform: translate(-6%, 8%) rotate(-12deg); }
  35% { transform: translate(7%, -15%) rotate(8deg); }
  58% { transform: translate(-3%, -9%) rotate(-5deg); }
  75% { transform: translate(5%, -11%) rotate(3deg); }
}
@keyframes companion-sway {
  0%, 100% { transform: rotate(-5deg) translateY(0); }
  50% { transform: rotate(5deg) translateY(-7%); }
}
@keyframes companion-hop {
  0%, 100% { transform: translateY(0); }
  40%, 65% { transform: translateY(-14%) rotate(-5deg); }
}
[data-motion-paused='true'] .moving { animation-play-state: paused; }
[data-motion-paused]:not([data-motion-paused='true']) .moving,
.seasonal-footer-animation:not([data-motion-paused]) .moving { will-change: transform, opacity; }
@media (prefers-reduced-motion: reduce) {
  .moving { animation: none; will-change: auto; }
  .gift-lid { transform: translate(-16%, -25%) rotate(-18deg); z-index: 0; }
  .gift-stocking { transform: translateY(-23.3333%); }
}
</style>
