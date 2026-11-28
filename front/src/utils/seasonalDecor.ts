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
  actions?: string
  languageSelection?: { src: string; position: string }
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

const actionArtwork = import.meta.glob('../assets/seasonal/actions/*-actions.webp', {
  eager: true,
  import: 'default',
  query: '?url',
}) as Record<string, string>

// Choose a distinct silhouette from each event's existing motif strip.
const languageSelectionMotif = {
  newYear: 0, // Fireworks
  tet: 0, // Red envelope
  womensDay: 0, // Bouquet
  hungKings: 0, // Drum
  aprilMay: 1, // Dove
  nationalDay: 0, // Flag
  midAutumn: 0, // Lantern
  vietnamWomensDay: 0, // Lotus
  halloween: 0, // Pumpkin
  teachersDay: 0, // Books
  christmas: 1, // Fir tree
} satisfies Record<SeasonalEvent['id'], number>

export function seasonalUiArtwork(id: SeasonalEvent['id']): SeasonalUiArtwork {
  const motif = seasonalMotifArtwork(id)
  const position = languageSelectionMotif[id] * 100 / Math.max(1, seasonalDecor[id].motifs.length - 1)
  return {
    navigation: headerIcons[`../assets/seasonal/header/${id}-header.webp`],
    menu: headerIcons[`../assets/seasonal/header/${id}-menu.webp`],
    brand: brandArtwork[`../assets/seasonal/brand/${id}-brand.webp`],
    actions: actionArtwork[`../assets/seasonal/actions/${id}-actions.webp`],
    languageSelection: motif ? { src: motif, position: `${position}% center` } : undefined,
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

const hangingArtwork = import.meta.glob('../assets/seasonal/hanging/*.webp', {
  eager: true,
  import: 'default',
  query: '?url',
}) as Record<string, string>

export function seasonalHangingArtwork(id: SeasonalEvent['id']): string | undefined {
  return hangingArtwork[`../assets/seasonal/hanging/${id}.webp`]
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
