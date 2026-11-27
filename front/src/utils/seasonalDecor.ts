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

interface SeasonalHeaderArtwork {
  navigation?: string
  menu?: string
}

export const seasonalHeaderIconsKey: InjectionKey<ComputedRef<SeasonalHeaderArtwork | undefined>> =
  Symbol('seasonal header icons')

const headerIcons = import.meta.glob('../assets/seasonal/header/*.webp', {
  eager: true,
  import: 'default',
  query: '?url',
}) as Record<string, string>

export function seasonalHeaderIcons(id: SeasonalEvent['id']): SeasonalHeaderArtwork {
  return {
    navigation: headerIcons[`../assets/seasonal/header/${id}-header.webp`],
    menu: headerIcons[`../assets/seasonal/header/${id}-menu.webp`],
  }
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
