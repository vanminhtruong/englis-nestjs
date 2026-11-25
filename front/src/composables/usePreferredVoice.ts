import { useAuthStore } from '../stores/auth.store'
import { useToast } from './useToast'

let sequence = 0
let active: SpeechSynthesisUtterance | null = null
let finishActive: (() => void) | undefined
let selection: { token: string | null; key: string } | null = null

export function getPreferredVoiceKey(): string {
  const auth = useAuthStore()
  if (selection && selection.token === auth.token) return selection.key
  return auth.user?.preferredVoiceKey ?? ''
}

export function setPreferredVoiceKey(key: string) {
  const auth = useAuthStore()
  selection = { token: auth.token, key }
  if (auth.user?.id) auth.updateUser({ preferredVoiceKey: key })
  stopSpeech()
}

export function stopSpeech() {
  sequence++
  const finish = finishActive
  finishActive = undefined
  active = null
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel()
  finish?.()
}

function unavailableMessage() {
  const locale = localStorage.getItem('locale') || document.documentElement.lang || 'en'
  if (locale.startsWith('vi')) return 'Giọng đọc đã chọn chưa sẵn sàng. Hãy thử lại hoặc chọn giọng khác trong cài đặt.'
  if (locale.startsWith('ko')) return '선택한 음성을 사용할 수 없습니다. 다시 시도하거나 다른 음성을 선택하세요.'
  if (locale.startsWith('zh')) return '所选语音暂不可用，请重试或在设置中选择其他语音。'
  return 'The selected voice is not available. Try again or choose another voice in settings.'
}

function getVoice(voices: SpeechSynthesisVoice[], key: string, lang: string) {
  if (key) return voices.find(voice => voice.voiceURI === key)
  return voices.find(voice => voice.lang === lang && voice.default)
    ?? voices.find(voice => voice.lang === lang)
    ?? voices.find(voice => voice.lang.split('-')[0] === lang.split('-')[0])
    ?? voices.find(voice => voice.default)
    ?? voices[0]
}

interface SpeakOptions {
  voiceKey?: string
  lang?: string
  rate?: number
  onDone?: () => void
}

/** Every word and preview goes through one queue. Never fall back to another
 * voice when an explicit selection is temporarily absent from getVoices(). */
export async function speakPreferred(text: string, options: SpeakOptions = {}): Promise<void> {
  if (!text.trim() || typeof window === 'undefined' || !('speechSynthesis' in window)) {
    options.onDone?.()
    return
  }
  stopSpeech()
  const request = sequence
  finishActive = options.onDone
  const synth = window.speechSynthesis
  const auth = useAuthStore()
  const token = auth.token
  const lang = options.lang ?? 'en-US'
  const deadline = Date.now() + 2500
  let voice: SpeechSynthesisVoice | undefined
  let key = options.voiceKey ?? getPreferredVoiceKey()
  do {
    if (request !== sequence) return
    if (token !== auth.token) { stopSpeech(); return }
    // On refresh, wait until the account profile has supplied the saved preference.
    if (options.voiceKey !== undefined || !auth.isAuthenticated || auth.user?.id || (selection && selection.token === token)) {
      key = options.voiceKey ?? getPreferredVoiceKey()
      voice = getVoice(synth.getVoices(), key, lang)
      if (voice) break
    }
    await new Promise(resolve => setTimeout(resolve, 80))
  } while (Date.now() < deadline)

  if (request !== sequence) return
    if (token !== auth.token) { stopSpeech(); return }
  if (!voice) {
    useToast().showWarning(unavailableMessage())
    finishActive = undefined
    options.onDone?.()
    return
  }

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.voice = voice
  utterance.lang = voice.lang
  utterance.rate = options.rate ?? 0.8
  active = utterance
  finishActive = options.onDone
  const done = () => {
    if (active !== utterance) return
    active = null
    finishActive = undefined
    options.onDone?.()
  }
  utterance.onend = done
  utterance.onerror = event => {
    if (active === utterance && event.error !== 'canceled' && event.error !== 'interrupted') {
      useToast().showWarning(unavailableMessage())
    }
    done()
  }
  try {
    synth.speak(utterance)
  } catch {
    done()
    useToast().showWarning(unavailableMessage())
  }
}
