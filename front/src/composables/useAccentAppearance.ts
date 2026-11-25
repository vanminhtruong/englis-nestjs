import { computed, type MaybeRefOrGetter, toValue } from 'vue'

export function useAccentAppearance(color: MaybeRefOrGetter<string | undefined>, fallback = '#667eea') {
  const accent = computed(() => {
    const value = toValue(color)
    return value && /^#[0-9a-f]{6}$/i.test(value) ? value : fallback
  })
  const ink = computed(() => {
    const channels = [1, 3, 5].map(i => parseInt(accent.value.slice(i, i + 2), 16) / 255)
    const [r, g, b] = channels.map(v => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
    const luminance = 0.2126 * r! + 0.7152 * g! + 0.0722 * b!
    return luminance > 0.179 ? '#000000' : '#ffffff'
  })
  const style = computed(() => ({ '--accent-color': accent.value, '--accent-ink': ink.value }))
  return { accent, ink, style }
}
   17
