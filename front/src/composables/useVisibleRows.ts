import { ref, toValue, watchEffect, type MaybeRefOrGetter } from 'vue'

/** Limit a scroll container to its first N rendered rows, including their gaps.
 * Measure actual row heights instead of assuming a fixed height for translated
 * labels, wrapped words, or responsive form controls. */
export function useVisibleRows(
  element: MaybeRefOrGetter<HTMLElement | null>,
  count: MaybeRefOrGetter<number>,
  limit: MaybeRefOrGetter<number | undefined>,
) {
  const maxHeight = ref<string | undefined>()

  watchEffect((onCleanup) => {
    const list = toValue(element)
    const size = toValue(count)
    const rows = toValue(limit)
    if (!list || !rows || rows < 1 || size <= rows) {
      maxHeight.value = undefined
      return
    }

    const measure = () => {
      const last = list.children.item(rows - 1)
      if (!(last instanceof HTMLElement)) return
      const height = Math.ceil(last.getBoundingClientRect().bottom - list.getBoundingClientRect().top + list.scrollTop - list.clientTop)
      if (height > 0) maxHeight.value = height + 'px'
    }

    const observer = new ResizeObserver(measure)
    observer.observe(list)
    for (const child of Array.from(list.children).slice(0, rows)) observer.observe(child)
    measure()
    onCleanup(() => observer.disconnect())
  }, { flush: 'post' })

  return maxHeight
}
