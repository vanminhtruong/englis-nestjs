import type { Ref } from 'vue'
import { useStickyButtonObserver as useSharedObserver } from '../../../../composables/useStickyButtonObserver'

export function useStickyButtonObserver(targetRef: Ref<HTMLElement | null>) {
  const { showStickyAddButton } = useSharedObserver(targetRef)
  return { showStickyButton: showStickyAddButton }
}
