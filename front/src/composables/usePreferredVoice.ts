export function getPreferredVoice(fallbackLang = 'en-US'): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return null
  }

  const voices = window.speechSynthesis.getVoices()
  if (!voices.length) return null

  const preferredUri = (() => {
    try {
      return localStorage.getItem('preferredVoiceURI')
    } catch {
      return null
    }
  })()

  if (preferredUri) {
    const byUri = voices.find((v) => v.voiceURI === preferredUri)
    if (byUri) return byUri
  }

  const byLang = voices.find((v) => v.lang === fallbackLang)
  if (byLang) return byLang

  const byLangPrefix = voices.find((v) => v.lang.startsWith(fallbackLang.split('-')[0]))
  if (byLangPrefix) return byLangPrefix

  return voices[0] ?? null
}


