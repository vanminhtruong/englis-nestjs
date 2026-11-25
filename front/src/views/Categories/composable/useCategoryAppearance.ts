import { computed, type MaybeRefOrGetter } from 'vue'
import { useAccentAppearance } from '../../../composables/useAccentAppearance'

export function useCategoryAppearance(color: MaybeRefOrGetter<string | undefined>) {
  const { accent, ink } = useAccentAppearance(color)
  const style = computed(() => ({ '--category-accent': accent.value, '--category-ink': ink.value }))
  return { accent, ink, style }
}
