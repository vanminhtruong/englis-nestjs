import { ref, onMounted, onUnmounted, type Ref } from 'vue'

export function useStickyButtonObserver(targetRef: Ref<HTMLElement | null>) {
    const showStickyAddButton = ref(false)
    let observer: IntersectionObserver | null = null

    function setupObserver() {
        if (!targetRef.value) return

        observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0]
                if (entry) {
                    showStickyAddButton.value =
                        !entry.isIntersecting && entry.boundingClientRect.top < 0
                }
            },
            {
                threshold: 0,
                rootMargin: '-20px 0px 0px 0px',
            }
        )

        observer.observe(targetRef.value)
    }

    function cleanupObserver() {
        if (observer) {
            observer.disconnect()
            observer = null
        }
    }

    onMounted(() => {
        setupObserver()
    })

    onUnmounted(() => {
        cleanupObserver()
    })

    return {
        showStickyAddButton,
        setupObserver,
        cleanupObserver,
    }
}
