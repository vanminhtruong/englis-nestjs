<template>
  <Transition
    enter-active-class="transition-all duration-500 ease-out"
    enter-from-class="opacity-0 translate-y-10 scale-50"
    enter-to-class="opacity-100 translate-y-0 scale-100"
    leave-active-class="transition-all duration-300 ease-in"
    leave-from-class="opacity-100 translate-y-0 scale-100"
    leave-to-class="opacity-0 translate-y-10 scale-50"
  >
    <button
      v-if="isVisible"
      type="button"
      class="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-40 inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-500 text-white shadow-xl shadow-primary-500/20 hover:shadow-2xl hover:shadow-primary-500/40 hover:-translate-y-1 hover:scale-110 active:scale-95 transition-all duration-300 focus:outline-none group"
      @click="scrollToTop"
    >
      <!-- Pulse Effect Ring -->
      <span
        class="absolute inset-0 rounded-full bg-primary-400 animate-ping opacity-20 group-hover:opacity-40"
      ></span>

      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="relative transform group-hover:-translate-y-0.5 transition-transform"
      >
        <polyline points="18 15 12 9 6 15" />
      </svg>
    </button>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

const isVisible = ref(false);

const handleScroll = () => {
  isVisible.value = window.scrollY > 300;
};

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};

onMounted(() => {
  window.addEventListener("scroll", handleScroll, {
    passive: true,
  } as AddEventListenerOptions);
  handleScroll();
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});
</script>
