import type { Directive } from 'vue'

type State = {
  observed: boolean
  outside: boolean
  animation?: Animation
  paint: boolean
  focus: () => void
  blur: (event: FocusEvent) => void
}
const states = new WeakMap<HTMLElement, State>()
let observer: IntersectionObserver | undefined
let count = 0
const distance = 112
const duration = 900
const stagger = 180
const maxDelay = 780
let lastStart = -Infinity
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
const outsideViewport = (rect: DOMRectReadOnly) =>
  rect.bottom <= 0 || rect.top >= document.documentElement.clientHeight ||
  rect.right <= 0 || rect.left >= document.documentElement.clientWidth

function hide(el: HTMLElement, state: State, rect: DOMRectReadOnly) {
  if (state.outside) return
  state.animation?.cancel()
  state.animation = undefined
  if (state.paint && rect.height > 0) {
    const style = getComputedStyle(el)
    const insets = [style.paddingTop, style.paddingBottom, style.borderTopWidth, style.borderBottomWidth]
      .reduce((sum, value) => sum + (parseFloat(value) || 0), 0)
    el.style.setProperty('--reveal-intrinsic-block', Math.max(0, rect.height - insets) + 'px')
    el.dataset.revealPaint = ''
  }
  state.outside = true
  el.dataset.scrollReveal = 'outside'
}

function show(el: HTMLElement, state: State, animate: boolean, delay = 0) {
  const wasOutside = state.outside
  const firstEntry = !state.observed
  if (!wasOutside && state.observed && animate) return
  state.outside = false
  state.animation?.cancel()
  state.animation = undefined
  if (!animate || (!wasOutside && !firstEntry) || reduced() || typeof el.animate !== 'function') {
    el.dataset.scrollReveal = 'visible'
    return
  }
  // Disable existing CSS transitions only during entry. Individual translate
  // composes with the component's own transform (e.g. hover effects).
  el.dataset.scrollReveal = 'entering'
  const animation = el.animate([
    { opacity: 0, translate: '0 ' + distance + 'px' },
    { opacity: 1, translate: '0 0px' },
  ], { duration, delay, easing: 'cubic-bezier(.25,.32,.38,1)', fill: 'both' })
  state.animation = animation
  animation.onfinish = () => {
    if (states.get(el) !== state || state.animation !== animation) return
    state.animation = undefined
    el.dataset.scrollReveal = 'visible'
    animation.cancel()
    // Translation can briefly move a newly intersecting element below the
    // viewport. Recheck the resting geometry, not the animated position.
    const rect = el.getBoundingClientRect()
    if (!el.contains(document.activeElement) && outsideViewport(rect)) hide(el, state, rect)
  }
}

function sharedObserver() {
  observer ??= new IntersectionObserver(entries => {
    const entering: { el: HTMLElement; state: State; rect: DOMRectReadOnly }[] = []
    const motionEnabled = !reduced()
    for (const entry of entries) {
      const el = entry.target as HTMLElement
      const state = states.get(el)
      if (!state) continue
      const focused = el.contains(document.activeElement)
      if (entry.isIntersecting || focused) {
        if (!focused && motionEnabled && (state.outside || !state.observed) && typeof el.animate === 'function') {
          entering.push({ el, state, rect: entry.boundingClientRect })
          continue
        }
        // Keep an already running reveal intact on observer callbacks caused
        // by its own movement. Focus must always reveal the control instantly.
        show(el, state, !focused)
      } else if (!state.animation) {
        hide(el, state, entry.boundingClientRect)
      } else {
        const r = entry.boundingClientRect
        const h = entry.rootBounds?.height ?? document.documentElement.clientHeight
        if (r.bottom < -distance - 16 || r.top > h + distance + 16) hide(el, state, r)
      }
      state.observed = true
    }
    // One shared stagger for each batch of entering blocks. Sort by visual
    // row, then left-to-right. A bounded queue prevents slow reveals when
    // rapidly scrolling a large grid or navigating to another page.
    entering.sort((a, b) => {
      const row = Math.round(a.rect.top / 12) - Math.round(b.rect.top / 12)
      return row || a.rect.left - b.rect.left || a.rect.top - b.rect.top
    })
    if (entering.length) {
      const now = performance.now()
      const firstDelay = Math.min(260, Math.max(0, lastStart + stagger - now))
      const step = Math.min(stagger, (maxDelay - firstDelay) / Math.max(1, entering.length - 1))
      entering.forEach(({ el, state }, index) => {
        const delay = firstDelay + index * step
        show(el, state, true, delay)
        state.observed = true
        lastStart = now + delay
      })
    }
  }, { rootMargin: '0px', threshold: 0 })
  return observer
}

export const vScrollReveal: Directive<HTMLElement> = {
  mounted(el, binding) {
    if (typeof IntersectionObserver === 'undefined') return
    const state: State = {
      observed: false, outside: false, paint: !!binding.modifiers.paint,
      focus: () => show(el, state, false),
      blur: (event) => {
        if (!(event.relatedTarget instanceof Node) || !el.contains(event.relatedTarget)) {
          const rect = el.getBoundingClientRect()
          if (outsideViewport(rect)) hide(el, state, rect)
        }
      },
    }
    states.set(el, state)
    el.dataset.scrollReveal = 'pending'
    el.addEventListener('focusin', state.focus)
    el.addEventListener('focusout', state.blur)
    count++
    sharedObserver().observe(el)
  },
  beforeUnmount(el) {
    const state = states.get(el)
    if (!state) return
    state.animation?.cancel()
    el.removeEventListener('focusin', state.focus)
    el.removeEventListener('focusout', state.blur)
    observer?.unobserve(el)
    states.delete(el)
    delete el.dataset.scrollReveal
    delete el.dataset.revealPaint
    el.style.removeProperty('--reveal-intrinsic-block')
    if (--count === 0) {
      observer?.disconnect()
      observer = undefined
      lastStart = -Infinity
    }
  },
}
