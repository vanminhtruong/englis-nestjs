import { ref, onMounted, onBeforeUnmount, watch, type Ref } from 'vue'

// Track the original create action, not the entire (potentially tall) filter
// panel. The sticky header obscures content before it leaves the viewport.
export function useStickyButtonObserver(targetRef: Ref<HTMLElement | null>) {
  const showStickyAddButton = ref(false)
  const controlsAbove = ref(false)
  let frame = 0
  let observer: ResizeObserver | undefined
  let header: HTMLElement | null = null

  function update() {
    frame = 0
    const controls = targetRef.value
    if (!controls) {
      showStickyAddButton.value = false
      controlsAbove.value = false
      return
    }
    const nextHeader = document.querySelector<HTMLElement>('.seasonal-header')
    if (nextHeader !== header) {
      if (header) observer?.unobserve(header)
      header = nextHeader
      if (header) observer?.observe(header)
    }
    const top = Math.max(0, header?.getBoundingClientRect().bottom ?? 0, window.visualViewport?.offsetTop ?? 0)
    const action = controls.querySelector<HTMLElement>('[data-sticky-source]') ?? controls
    const controlRect = controls.getBoundingClientRect()
    const actionRect = action === controls ? controlRect : action.getBoundingClientRect()
    controlsAbove.value = controlRect.bottom <= top
    const mobile = window.innerWidth < 768
    const viewportBottom = (window.visualViewport?.offsetTop ?? 0) + (window.visualViewport?.height ?? window.innerHeight)
    const distance = window.scrollY
    const actionHidden = actionRect.bottom <= top || (mobile && actionRect.top >= viewportBottom)
    // If the original button is outside the usable viewport, show the
    // replacement promptly after a short mobile scroll.
    showStickyAddButton.value = distance > (mobile ? 24 : 0) && actionRect.height > 0 && actionHidden
  }

  function queue() {
    if (!frame) frame = requestAnimationFrame(update)
  }
  watch(targetRef, (next, previous) => {
    if (previous) observer?.unobserve(previous)
    if (next) observer?.observe(next)
    queue()
  }, { flush: 'post' })
  onMounted(() => {
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(queue)
      if (targetRef.value) observer.observe(targetRef.value)
      observer.observe(document.body)
    }
    window.addEventListener('scroll', queue, { passive: true })
    window.addEventListener('resize', queue, { passive: true })
    window.visualViewport?.addEventListener('resize', queue)
    window.visualViewport?.addEventListener('scroll', queue)
    queue()
  })
  onBeforeUnmount(() => {
    window.removeEventListener('scroll', queue)
    window.removeEventListener('resize', queue)
    window.visualViewport?.removeEventListener('resize', queue)
    window.visualViewport?.removeEventListener('scroll', queue)
    observer?.disconnect()
    if (frame) cancelAnimationFrame(frame)
  })
  return { showStickyAddButton, controlsAbove }
}
