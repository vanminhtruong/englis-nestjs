import type { ComputedRef, InjectionKey } from 'vue'
import type { SeasonalEvent } from './seasonalCalendar'

type Motion = 'snow' | 'spark' | 'petal' | 'float' | 'confetti' | 'bat'

interface SeasonalDecor {
  action: string
  ornament: string
  particles: Motion
  glyphs: readonly string[]
  motifs: readonly string[]
}

export const seasonalDecor = {
  newYear: { action: '🎆', ornament: '✦', particles: 'confetti', glyphs: ['✦', '▰', '✧'], motifs: ["🎆","🎇","🥂","🎉","🎊","🕛","✨"] },
  tet: { action: '🧧', ornament: '🏮', particles: 'float', glyphs: ['🏮', '✿', '◇'], motifs: ["🧧","🏮","🌸","🌼","🍊","🐉","🧨"] },
  womensDay: { action: '🌷', ornament: '🌸', particles: 'petal', glyphs: ['✿', '❀', '✦'], motifs: ["💐","🌷","🌹","🎀","🦋","🌸","💝"] },
  hungKings: { action: '◈', ornament: '❋', particles: 'float', glyphs: ['◇', '✧', '❋'], motifs: ["🥁","⛰️","🌾","🏛️","🪷","🕊️","🌿"] },
  aprilMay: { action: '★', ornament: '🪷', particles: 'confetti', glyphs: ['★', '▰', '✦'], motifs: ["🇻🇳","🕊️","⭐","🪷","🌾","🎊","🌿"] },
  nationalDay: { action: '🇻🇳', ornament: '✦', particles: 'spark', glyphs: ['★', '✧', '✦'], motifs: ["🇻🇳","⭐","🕊️","🎈","🎆","🪷","🎊"] },
  midAutumn: { action: '🏮', ornament: '🌙', particles: 'float', glyphs: ['✧', '☾', '★'], motifs: ["🏮","🌕","🐇","🥮","⭐","🐉","☁️"] },
  vietnamWomensDay: { action: '🪷', ornament: '🌸', particles: 'petal', glyphs: ['❀', '✿', '◇'], motifs: ["🪷","🌷","🌸","💐","🎁","🦋","🎀"] },
  halloween: { action: '🎃', ornament: '🦇', particles: 'bat', glyphs: ['🦇', '✧', '✦'], motifs: ["🎃","👻","🦇","🕸️","🕷️","🧙","🍬"] },
  teachersDay: { action: '📚', ornament: '✎', particles: 'float', glyphs: ['◇', '✦', '✎'], motifs: ["📚","✏️","💐","🍎","🎓","📖","🖋️"] },
  christmas: { action: '🎅', ornament: '🎄', particles: 'snow', glyphs: ['❄', '•', '❅'], motifs: ["🎅","🎄","🎁","🦌","🧦","🔔","⛄","🛷","🍭","❄️"] },
} as const satisfies Record<SeasonalEvent['id'], SeasonalDecor>

const illustrations = import.meta.glob('../assets/seasonal/*.webp', {
  eager: true,
  import: 'default',
  query: '?url',
}) as Record<string, string>

export function seasonalIllustration(id: SeasonalEvent['id']): string | undefined {
  return illustrations[`../assets/seasonal/${id}.webp`]
}

interface SeasonalUiArtwork {
  navigation?: string
  menu?: string
  brand?: string
}

export const seasonalUiArtworkKey: InjectionKey<ComputedRef<SeasonalUiArtwork | undefined>> =
  Symbol('seasonal UI artwork')

const headerIcons = import.meta.glob('../assets/seasonal/header/*.webp', {
  eager: true,
  import: 'default',
  query: '?url',
}) as Record<string, string>

const brandArtwork = import.meta.glob('../assets/seasonal/brand/*-brand.webp', {
  eager: true,
  import: 'default',
  query: '?url',
}) as Record<string, string>

export function seasonalUiArtwork(id: SeasonalEvent['id']): SeasonalUiArtwork {
  return {
    navigation: headerIcons[`../assets/seasonal/header/${id}-header.webp`],
    menu: headerIcons[`../assets/seasonal/header/${id}-menu.webp`],
    brand: brandArtwork[`../assets/seasonal/brand/${id}-brand.webp`],
  }
}

const motifArtwork = import.meta.glob('../assets/seasonal/motifs/*-motifs.webp', {
  eager: true,
  import: 'default',
  query: '?url',
}) as Record<string, string>

export function seasonalMotifArtwork(id: SeasonalEvent['id']): string | undefined {
  return motifArtwork[`../assets/seasonal/motifs/${id}-motifs.webp`]
}

const frames = import.meta.glob('../assets/seasonal/*-frame.svg', {
  eager: true,
  import: 'default',
  query: '?url',
}) as Record<string, string>

export function seasonalFrame(id: SeasonalEvent['id']): string | undefined {
  return frames[`../assets/seasonal/${id}-frame.svg`]
}

export function seasonalScene(id: SeasonalEvent['id']): string | undefined {
  return illustrations[`../assets/seasonal/${id}-scene.webp`]
}
