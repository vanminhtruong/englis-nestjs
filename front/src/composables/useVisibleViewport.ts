import { onMounted, onBeforeUnmount, type Ref } from 'vue'

// Keep the frame and floating actions in the same visible viewport.
// Mobile browser chrome and the keyboard can change the visual viewport
// independently of the layout viewport. No reactive render on scroll.
export function useVisibleViewport(shell: Ref<HTMLElement | null>) {
  let frame = 0
  let previous = ''
  let viewport: VisualViewport | null = null

  function update() {
    frame = 0
    const root = shell.value
    if (!root) return
    const x = viewport?.offsetLeft ?? 0
    const y = viewport?.offsetTop ?? 0
    const width = viewport?.width ?? document.documentElement.clientWidth
    const height = viewport?.height ?? window.innerHeight
    if (width <= 0 || height <= 0) return
    const values = [x, y, width, height].map(n => Math.round(n * 100) / 100)
    const signature = values.join(',')
    if (signature === previous) return
    previous = signature
    const keys = ['left', 'top', 'width', 'height']
    keys.forEach((key, i) => root.style.setProperty('--app-visible-' + key, values[i] + 'px'))
  }
  function queue() {
    if (!frame) frame = requestAnimationFrame(update)
  }
  onMounted(() => {
    viewport = window.visualViewport ?? null
    update()
    viewport?.addEventListener('resize', queue, { passive: true })
    viewport?.addEventListener('scroll', queue, { passive: true })
    window.addEventListener('resize', queue, { passive: true })
    window.addEventListener('orientationchange', queue, { passive: true })
    window.addEventListener('pageshow', queue)
    document.addEventListener('visibilitychange', queue)
  })
  onBeforeUnmount(() => {
    viewport?.removeEventListener('resize', queue)
    viewport?.removeEventListener('scroll', queue)
    window.removeEventListener('resize', queue)
    window.removeEventListener('orientationchange', queue)
    window.removeEventListener('pageshow', queue)
    document.removeEventListener('visibilitychange', queue)
    if (frame) cancelAnimationFrame(frame)
  })
}
