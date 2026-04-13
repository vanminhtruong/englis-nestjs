import { ref, onMounted, onUnmounted } from 'vue'

export function useIntersectionObserver(controlsRef: any) {
  const showStickyAddButton = ref(false)
  let observer: IntersectionObserver | null = null

  onMounted(() => {
    observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return
        showStickyAddButton.value =
          !entry.isIntersecting && entry.boundingClientRect.top < 0
      },
      {
        threshold: 0,
        rootMargin: '-20px 0px 0px 0px',
      }
    )

    if (controlsRef.value) {
      observer.observe(controlsRef.value)
    }
  })

  onUnmounted(() => {
    if (observer) {
      observer.disconnect()
    }
  })

  return {
    showStickyAddButton,
  }
}
