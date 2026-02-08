import { ref, onMounted, onUnmounted, type Ref } from 'vue'

export function useStickyButtonObserver(targetRef: Ref<HTMLElement | null>) {
    const showStickyButton = ref(false)
    let observer: IntersectionObserver | null = null

    function initObserver() {
        observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0]
                if (entry) {
                    showStickyButton.value =
                        !entry.isIntersecting && entry.boundingClientRect.top < 0
                }
            },
            {
                threshold: 0,
                rootMargin: '-20px 0px 0px 0px',
            }
        )

        if (targetRef.value) {
            observer.observe(targetRef.value)
        }
    }

    function destroyObserver() {
        if (observer) {
            observer.disconnect()
            observer = null
        }
    }

    onMounted(() => {
        initObserver()
    })

    onUnmounted(() => {
        destroyObserver()
    })

    return {
        showStickyButton,
    }
}
